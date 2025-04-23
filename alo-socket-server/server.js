const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();

const redis = require('./src/config/RedisClient');
const { updateLastLogout } = require("./src/service/user.service");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:3000"],
        methods: ["GET", "POST"],
        credentials: true,
    },
});

io.on("connection", (socket) => {
    console.log("Người dùng kết nối: " + socket.id);

    socket.on('login', async (userId) => {
        if (userId === null) return;
        console.log("Người dùng đăng nhập: " + userId);

        // Kiểm tra xem socketId đã tồn tại trong Redis chưa
        const sessions = await redis.smembers(`socket:${userId}`);
        const existingSession = sessions.find(session => JSON.parse(session).socketId === socket.id);
        if (existingSession) {
            console.log("SocketId đã tồn tại trong Redis, không cần thêm mới.");
            return;
        }
        const session = JSON.stringify({
            socketId: socket.id,
            userId,
            loginTime: Date.now()
        });

        // Thêm phiên mới vào Redis (cho phép nhiều socket cùng userId)
        await redis.sadd(`socket:${userId}`, session);

        const userIds = await getUserOnline();
        console.log("User online:", userIds);
        io.emit('users-online', { userIds });
    });

    socket.on('request-logout-changed-password', async (userId) => {
        // Tìm toàn bộ socketId của userId khác với socket.id hiện tại
        const sessions = await redis.smembers(`socket:${userId}`);
        const updated = sessions;

        // Thông báo logout cho các socketId khác
        updated.forEach(session => {
            const sessionData = JSON.parse(session);
            console.log("Đang thông báo logout cho socketId:", sessionData.socketId);
            io.to(sessionData.socketId).emit('logout-changed-password');
        });

        // Cập nhật chỉ còn lại socker.id hiện tại được lưu trong Redis
        await redis.del(`socket:${userId}`);
        if (updated.length > 0) {
            // Lưu lại session hiện tại
            await redis.sadd(`socket:${userId}`, JSON.stringify({
                socketId: socket.id,
                userId,
                loginTime: Date.now()
            }));
        }

        // Cập nhật danh sách người dùng online
        const userIds = await getUserOnline();
        console.log("User online:", userIds);
        io.emit('users-online', { userIds });
    });

    socket.on('logout', async (userId) => {
        console.log("Logout socket: " + socket.id);

        const sessions = await redis.smembers(`socket:${userId}`);
        const updated = sessions.filter(session => JSON.parse(session).socketId !== socket.id);

        await redis.del(`socket:${userId}`);
        if (updated.length > 0) {
            await redis.sadd(`socket:${userId}`, ...updated);
        }

        const userIds = await getUserOnline();
        io.emit('users-online', { userIds });
    });

    socket.on("join_conversation", async (conversationId) => {
        socket.join(conversationId);
        console.log(`📥 ${socket.id} tham gia phòng ${conversationId}`);

        const userIds = await getUserOnline();
        io.emit('users-online', { userIds });
    });

    socket.on("leave_conversation", async (conversationId) => {
        socket.leave(conversationId);
        console.log(`${socket.id} rời phòng ${conversationId}`);

        const userIds = await getUserOnline();
        io.emit('users-online', { userIds });
    });

    socket.on('send-message', ({ conversation, message }) => {
        console.log(`${socket.id} gửi tin nhắn trong phòng ${conversation.id}: ${message}`);

        handleUpdateLastMessage(conversation, message);
        socket.to(conversation.id).emit('receive-message', message);
    });


    socket.on('send-friend-request', async (data) => {
        const receiveId = data.userId === data.senderId ? data.friendId : data.userId;
        const socketIds = await findSocketIdsByUserId(receiveId);
        socketIds.forEach(id => io.to(id).emit('receive-friend-request', data));
    });

    socket.on('unfriend-request', async (data) => {
        const socketIds = await findSocketIdsByUserId(data.friendId);
        const socketIdOfUserId = await findSocketIdsByUserId(data.userId);
        // trừ socketid của người gửi
        console.log("SocketId của người gửi:", socketIdOfUserId);
        console.log("SocketId của người nhận:", socketIds);
        const filteredSocketIds = socketIdOfUserId.filter(id => id !== socket.id);
        console.log("SocketId đã lọc:", filteredSocketIds);
        filteredSocketIds.forEach(id => io.to(id).emit('receive-unfriend', data));
        socketIds.forEach(id => io.to(id).emit('receive-unfriend', data));
    });

    socket.on('reject-friend-request-for-me', async (data) => {
        console.log("Từ chối lời mời kết bạn cho tôi:", data);
        const socketIds = await findSocketIdsByUserId(data.userId);
        const filteredSocketIds = socketIds.filter(id => id !== socket.id);
        filteredSocketIds.forEach(id => io.to(id).emit('receive-reject-friend-for-me', data));
    });

    socket.on('block-request', async (data) => {
        const socketIds = await findSocketIdsByUserId(data.friendId);
        socketIds.forEach(id => io.to(id).emit('receive-block', data));
    });

    socket.on('unblock-friend', async (data) => {
        const socketIds = await findSocketIdsByUserId(data.friendId);
        socketIds.forEach(id => io.to(id).emit('receive-unblock', data));
    });

    socket.on('cancel-friend-request', async (data) => {
        const receiveId = data.friendId === data.senderId ? data.userId : data.friendId;
        const socketIds = await findSocketIdsByUserId(receiveId);
        socketIds.forEach(id => io.to(id).emit('receive-cancle-friend-request', data));
    });

    socket.on('accept-friend-request', async (data) => {
        const socketIds = await findSocketIdsByUserId(data.friendId);
        socketIds.forEach(id => io.to(id).emit('receive-accept-friend', data));
    });

    socket.on('accept-friend-request-for-me', async (data) => {
        console.log("Nhận lời mời kết bạn cho tôi:", data);
        const socketIds = await findSocketIdsByUserId(data.userId);
        const filteredSocketIds = socketIds.filter(id => id !== socket.id);
        filteredSocketIds.forEach(id => io.to(id).emit('receive-accept-friend-for-me', data));
    });

    socket.on('reject-friend-request', async (data) => {
        const socketIds = await findSocketIdsByUserId(data.friendId);
        const socketIdOfUserId = await findSocketIdsByUserId(data.userId);
        // trừ socketid của người gửi
        console.log("SocketId của người gửi:", socketIdOfUserId);
        console.log("SocketId của người nhận:", socketIds);
        const filteredSocketIds = socketIdOfUserId.filter(id => id !== socket.id);
        console.log("SocketId đã lọc:", filteredSocketIds);
        filteredSocketIds.forEach(id => io.to(id).emit('receive-reject-friend', data));
        socketIds.forEach(id => io.to(id).emit('receive-reject-friend', data));
    });

    socket.on('disconnect', async () => {
        console.log("Socket ngắt kết nối: " + socket.id);

        const keys = await redis.keys('socket:*');
        let userId = null;
        for (const key of keys) {
            const sessions = await redis.smembers(key);
            const updated = sessions.filter(session => JSON.parse(session).socketId !== socket.id);

            if (sessions.length !== updated.length) {
                // Tìm thấy socketId trong session, lấy userId
                userId = key.split(':')[1];
            }

            await redis.del(key);
            if (updated.length > 0) {
                await redis.sadd(key, ...updated);
            } else if (userId) {
                await updateLastLogout(userId);
                const socketIds = await findAllSocketId();
                socketIds.forEach(id => {
                    io.to(id).emit('user-offline', userId);
                });
            }
        }

        const userIds = await getUserOnline();
        io.emit('users-online', { userIds });
    });

    socket.on('pin-message', async (data) => {
        const members = data.conversation.memberUserIds;

        for (const userId of members) {
            const socketIds = await findSocketIdsByUserId(userId);
            const filteredSocketIds = socketIds.filter(id => id !== socket.id);
            filteredSocketIds.forEach(id => {
                console.log("Đang ghim tin nhắn cho socket id:", id);
                console.log("Ghim tin nhắn cho user:", userId);
                io.to(id).emit('receive-pin-message', data);
            });
        }

        // socket.to(data.conversation.id).emit('receive-pin-message', data);
    });

    socket.on('unpin-message', async (data) => {
        const members = data.conversation.memberUserIds;
        console.log("Xóa ghim tin nhắn cho các thành viên trong cuộc trò chuyện:", members, data.conversation.id, data.message);
        for (const userId of members) {
            const socketIds = await findSocketIdsByUserId(userId);
            const filteredSocketIds = socketIds.filter(id => id !== socket.id);
            filteredSocketIds.forEach(id => {
                io.to(id).emit('receive-unpin-message', data);
            });
        }
    })

    socket.on('update-reaction', async (data) => {
        const members = data.conversation.memberUserIds;
        console.log("Cập nhật reaction cho các thành viên trong cuộc trò chuyện:", members, data.conversation.id, data.message);
        const conversationId = data.conversation.id;
        socket.to(conversationId).emit('receive-update-reaction', data.message);
        // for (const userId of members) {
        //     const socketIds = await findSocketIdsByUserId(userId);
        //     const filteredSocketIds = socketIds.filter(id => id !== socket.id);
        //     filteredSocketIds.forEach(id => {
        //         console.log("Cập nhật reaction cho user:", userId);
        //         io.to(id).emit('receive-update-reaction', data.message);
        //     });
        // }
    })

    socket.on('updateMessage', async (data) => {
        const message = data.message;
        const conversation = data.conversation;
        const members = conversation.memberUserIds;
        for (const userId of members) {
            const socketIds = await findSocketIdsByUserId(userId);
            const filteredSocketIds = socketIds.filter(id => id !== socket.id);
            filteredSocketIds.forEach(id => {
                io.to(id).emit('receive-update-message', data);
            });

        }
    })

    socket.on('seen-message', async (data) => {
        const messages = data.messages;
        const conversation = data.conversation;
        // send to all members in conversation
        console.log(
            "Cập nhật đã xem tin nhắn cho các thành viên trong cuộc trò chuyện:",
            conversation.memberUserIds,
            conversation.id,
            messages
        )
        socket.to(conversation.id).emit('receive-seen-message', { conversation, messages });
    })

    socket.on('forward-message', async (data) => {
        const messages = data.messages;
        const conversations = data.conversations;
        for (const message of messages) {
            const conversationId = message.conversationId;
            for (const conversation of conversations) {
                if (conversation.id === conversationId) {
                    const members = conversation.memberUserIds;
                    for (const userId of members) {
                        const socketIds = await findSocketIdsByUserId(userId);
                        const filteredSocketIds = socketIds.filter(id => id !== socket.id);
                        filteredSocketIds.forEach(id => {
                            io.to(id).emit('receive-forward-message', { conversation, message });
                        });
                    }
                    io.to(socket.id).emit('receive-forward-message', { conversation, message });
                    handleUpdateLastMessage(conversation, message);
                }
            }
        }
    })


    socket.on('remove-of-me', async (data) => {
        const { messageId, userId } = data;
        const socketIds = (await findSocketIdsByUserId(userId)).filter(id => id !== socket.id);
        socketIds.forEach(id => {
            io.to(id).emit('receive-remove-of-me', { messageId, userId });
        });
    })


    socket.on('create-group', async (data) => {
        const { conversation } = data;
        const members = conversation.memberUserIds;

        for (const userId of members) {
            const socketIds = await findSocketIdsByUserId(userId);
            const filteredSocketIds = socketIds.filter(id => id !== socket.id);
            filteredSocketIds.forEach(id => {
                io.to(id).emit('receive-create-group', { conversation });
            });
        }
    })

    socket.on('update_profile_group', async (data) => {
        const { conversation } = data;
        const members = conversation.memberUserIds;

        for (const userId of members) {
            const socketIds = await findSocketIdsByUserId(userId);
            const filteredSocketIds = socketIds.filter(id => id !== socket.id);
            filteredSocketIds.forEach(id => {
                io.to(id).emit('receive_update_profile_group', { conversation });
            });
        }
    })

    socket.on('update-roles', async (data) => {
        const { conversation } = data;
        console.log("update-roles: ", conversation);
        

        const members = conversation.memberUserIds;
        for (const userId of members) {
            const socketIds = await findSocketIdsByUserId(userId);
            const filteredSocketIds = socketIds.filter(id => id !== socket.id);
            filteredSocketIds.forEach(id => {
                io.to(id).emit('receive-update-roles', { conversation });
            });
        }
    })

    // // Xử lý sự kiện xóa lịch sử trò chuyện
    // socket.on('remove-all-history-messages', async (data) => {
    //     const { conversationId } = data;
    //     // Lấy thông tin conversation từ backend để lấy danh sách thành viên
    //     const conversationService = require("./src/service/conversation.service");
    //     const conversation = await conversationService.getConversationById(conversationId);
    //     if (!conversation) return;

    //     const members = conversation.memberUserIds;
    //     for (const userId of members) {
    //         const socketIds = await findSocketIdsByUserId(userId);
    //         const filteredSocketIds = socketIds.filter(id => id !== socket.id);
    //         filteredSocketIds.forEach(id => {
    //             io.to(id).emit('receive-remove-all-history-messages', { conversationId });
    //         });
    //     }
    // });



    socket.on('add-members-to-group', async (data) => {
        console.log("Thêm thành viên vào nhóm:", data);

        const { conversation, memberSelected, memberInfo } = data;
        const members = conversation.memberUserIds;

        // gửi cho tất cả các thành viên trong nhóm
        for (const userId of members) {
            const socketIds = await findSocketIdsByUserId(userId);
            const filteredSocketIds = socketIds.filter(id => id !== socket.id);
            filteredSocketIds.forEach(id => {
                io.to(id).emit('receive-add-members-to-group', data);
            });
        }

        // gửi cho tất cả các thành viên được chọn
        for (const userId of memberSelected) {
            const socketIds = await findSocketIdsByUserId(userId);
            const filteredSocketIds = socketIds.filter(id => id !== socket.id);
            filteredSocketIds.forEach(id => {
                io.to(id).emit('receive-add-members-to-group', data);
            });
        }


    });

    socket.on('remove-member', async (data) => {
        const { conversation, memberUserId } = data;
        const members = conversation.memberUserIds;

        for(const userId of members) {
            const socketIds = await findSocketIdsByUserId(userId);
            const filteredSocketIds = socketIds.filter(id => id !== socket.id);
            filteredSocketIds.forEach(id => {
                io.to(id).emit('receive-remove-member', data);
            });
        }
    });


    // =====================
    // Helper functions
    // =====================

    const findAllSocketId = async () => {
        const keys = await redis.keys('socket:*');
        const allSocketIds = [];
        for (const key of keys) {
            const sessions = await redis.smembers(key);
            sessions.forEach(session => {
                allSocketIds.push(JSON.parse(session).socketId);
            });
        }
        return allSocketIds;
    }
    const getUserOnline = async () => {
        const keys = await redis.keys('socket:*');
        return keys.map(key => key.split(':')[1]);
    }

    const findSocketIdsByUserId = async (userId) => {
        const sessions = await redis.smembers(`socket:${userId}`);
        return sessions.map(session => JSON.parse(session).socketId);
    }

    const handleUpdateLastMessage = async (conversation, message) => {
        const members = conversation.memberUserIds;
        for (const userId of members) {
            const socketIds = await findSocketIdsByUserId(userId);
            socketIds.forEach(id => {
                io.to(id).emit('update-last-message', conversation.id, message);
            });
        }
    }

    // ##### WEB RTC #####

    // Xử lý signaling
    // Data: { roomId, data }
    socket.on('offer', (data) => {
        socket.to(data.roomId).emit('offer', data);
    });

    // Data: { roomId, data }
    socket.on('answer', (data) => {
        socket.to(data.roomId).emit('answer', data);
    });

    // Data: { roomId, data }
    socket.on('ice-candidate', (data) => {
        socket.to(data.roomId).emit('ice-candidate', data);
    });

    // incoming call
    // Data: { conversation, caller, isVoiceCall }
    socket.on('incoming-call', async (data) => {
        const members = data.conversation.memberUserIds;
        for (const userId of members) {
            const socketIds = await findSocketIdsByUserId(userId);
            const filteredSocketIds = socketIds.filter(id => id !== socket.id);
            filteredSocketIds.forEach(id => {
                io.to(id).emit('receive-incoming-call', data);
            });
        }
    });

    // Chấp nhận cuộc gọi
    socket.on('accept-call', async (data) => {
        const members = data.conversation.memberUserIds;
        for (const userId of members) {
            const socketIds = await findSocketIdsByUserId(userId);
            const filteredSocketIds = socketIds.filter(id => id !== socket.id);
            filteredSocketIds.forEach(id => {
                io.to(id).emit('receive-accept-call', data);
            });
        }
    });

    // Từ chối cuộc gọi
    socket.on('reject-call', async (data) => {
        const members = data.conversation.memberUserIds;
        for (const userId of members) {
            const socketIds = await findSocketIdsByUserId(userId);
            const filteredSocketIds = socketIds.filter(id => id !== socket.id);
            filteredSocketIds.forEach(id => {
                io.to(id).emit('receive-reject-call', data);
            });
        }
    });

    // Kết thúc cuộc gọi
    socket.on('end-call', async (data) => {
        const members = data.conversation.memberUserIds;
        for (const userId of members) {
            const socketIds = await findSocketIdsByUserId(userId);
            const filteredSocketIds = socketIds.filter(id => id !== socket.id);
            filteredSocketIds.forEach(id => {
                io.to(id).emit('receive-end-call', data);
            });
        }
    });
});

server.listen(process.env.SERVER_PORT, () => {
    console.log(`Server running at http://localhost:${process.env.SERVER_PORT}`);
});
