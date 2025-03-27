const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();

const redis = require('./src/config/RedisClient');
const { stringify } = require("querystring");
// app
const app = express();

// middleware
app.use(cors());

// create server
const server = http.createServer(app);


const io = new Server(server, {
    cors: {
        origin: [
            "http://localhost:3000",
        ],
        methods: ["GET", "POST"],
        credentials: true,
    },
});

io.on("connection", (socket) => {
    console.log("Người dùng kết nối: " + socket.id);

    socket.on('login', async (userId) => {
        console.log("Người dùng đăng nhập: " + userId);
        const loginTime = Date.now();

        // Lưu thông tin kết nối với userId và socketId vào Redis
        await redis.set(`socket:${userId}`, JSON.stringify({
            socketId: socket.id,
            userId: userId,
            loginTime
        }));

        const userIds = await getUserOnline();
        console.log(`Danh sách user online: ${userIds}`);

        io.emit('users-online', { userIds });
    });

    const getUserOnline = async () => {
        const usersOnline = await redis.keys('socket:*');
        const userIds = await Promise.all(usersOnline.map(async key => {
            const user = await redis.get(key);
            return JSON.parse(user).userId;
        }));

        return userIds;

    }
    socket.on('logout', async (userId) => {
        console.log("Người dùng ngắt kết nối: " + userId);

        // Tìm userId từ Redis dựa trên socketId
        const user = await redis.get(`socket:${userId}`);
        if (user) {
            const { userId } = JSON.parse(user);
            // Xóa thông tin người dùng khỏi Redis
            await redis.del(`socket:${userId}`);

            const userIds = await getUserOnline();

            // Gửi danh sách user online cho tất cả client
            console.log(`Danh sách user online: ${userIds}`);

            io.emit('users-online', { userIds });
        }
    });

    socket.on("join_conversation", async (conversationId) => {
        socket.join(conversationId);
        console.log(`Người dùng ${socket.id} đã tham gia vào phòng ${conversationId}`);

        const userIds = await getUserOnline();
        io.emit('users-online', { userIds });
    });

    socket.on("leave_conversation", async (conversationId) => {
        socket.leave(conversationId);
        console.log(`Người dùng ${socket.id} đã rời khỏi phòng ${conversationId}`);

        const userIds = await getUserOnline();
        io.emit('users-online', { userIds });

    });

    socket.on('send-message', ({ conversation, message }) => {
        console.log(`Người dùng ${socket.id} đã gửi tin nhắn: ${message} trong phòng ${conversation.id}`);

        // Gửi yêu cầu cập nhật tin nhắn cuối cùng trong conversation
        handleUpdateLastMessage(conversation, message);

        socket.to(conversation.id).emit('receive-message', message);
    });

    const findSocketIdByUserId = async (userId) => {
        const user = await redis.get(`socket:${userId}`);
        if (user) {
            console.log(`User: ${user}`);
            return JSON.parse(user).socketId;

        }
        return null;
    }

    const handleUpdateLastMessage = async (conversation, message) => {
        const members = conversation.memberUserIds;
        for (let i = 0; i < members.length; i++) {
            const userId = members[i];
            const socketId = await findSocketIdByUserId(userId);
            console.log(`User: ${userId} - ${socketId}`);
            if (socketId) {
                console.log("Gửi yêu cầu cập nhật tin nhắn cuối cùng cho user: " + userId);
                io.to(socketId).emit('update-last-message', conversation.id, message);
            }
        }
    }

});



server.listen(process.env.SERVER_PORT, () => {
    console.log(`Server running at http://localhost:${process.env.SERVER_PORT}`);
});
