const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();

const redis = require('./src/config/RedisClient');

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
        socketIds.forEach(id => io.to(id).emit('receive-unfriend', data));
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

    socket.on('reject-friend-request', async (data) => {
        const socketIds = await findSocketIdsByUserId(data.friendId);
        socketIds.forEach(id => io.to(id).emit('receive-reject-friend', data));
    });

    socket.on('disconnect', async () => {
        console.log("Socket ngắt kết nối: " + socket.id);

        const keys = await redis.keys('socket:*');
        for (const key of keys) {
            const sessions = await redis.smembers(key);
            const updated = sessions.filter(session => JSON.parse(session).socketId !== socket.id);
            await redis.del(key);
            if (updated.length > 0) {
                await redis.sadd(key, ...updated);
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
    });

    socket.on('unpin-message', async (data) => {
        const members = data.conversation.memberUserIds;
        
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
        for (const userId of members) {
            const socketIds = await findSocketIdsByUserId(userId);
            const filteredSocketIds = socketIds.filter(id => id !== socket.id);
            filteredSocketIds.forEach(id => {
                console.log("Cập nhật reaction cho user:", userId);
                io.to(id).emit('receive-update-reaction', data.message);
            });
        }
    })

    socket.on('updateMessage', async (data) => {
        const message = data.message;
        const conversation = data.conversation;
        const members = conversation.memberUserIds;
        console.log(conversation.lastMessage);
        if(conversation.lastMessage.id === message.id) {
            handleUpdateLastMessage(conversation, message);
        }
        
        console.log("Cập nhật tin nhắn cho các thành viên trong cuộc trò chuyện:", members, conversation.id, message);
        for (const userId of members) {
            const socketIds = await findSocketIdsByUserId(userId);
            const filteredSocketIds = socketIds.filter(id => id !== socket.id);
            filteredSocketIds.forEach(id => {
                console.log("Cập nhật tin nhắn cho user:", userId);
                io.to(id).emit('receive-update-message', message);
            });
        }        
    })

    // =====================
    // Helper functions
    // =====================

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
        console.log(
            "Cập nhật tin nhắn cuối cho các thành viên trong cuộc trò chuyện:",
            members,
            conversation.id,
            message
        )
        for (const userId of members) {
            const socketIds = await findSocketIdsByUserId(userId);
            socketIds.forEach(id => {
                console.log("Cập nhật tin nhắn cuối cho user:", userId);
                io.to(id).emit('update-last-message', conversation.id, message);
            });
        }
    }
});

server.listen(process.env.SERVER_PORT, () => {
    console.log(`Server running at http://localhost:${process.env.SERVER_PORT}`);
});
