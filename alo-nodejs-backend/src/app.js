const express = require('express');
const cors = require('cors'); // Import CORS middleware

// Định nghĩa các route
const authRoutes = require('./routes/auth.route');
const userRoutes = require('./routes/user.route');
const friendRoutes = require('./routes/friend.route');
const messageRoutes = require('./routes/message.route');
const conversationRoutes = require('./routes/conversation.route');
const { createAllTables } = require('./services/initDB');

const app = express();

const allowedOrigins = [
  'https://alo-tawny.vercel.app',
  'http://localhost:3000'
];
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log(`[${req.method}] ${req.path}`);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/friend', friendRoutes);
app.use('/api/message', messageRoutes);
app.use('/api/conversation', conversationRoutes);

// Tạo table
// createAllTables()

module.exports = app;