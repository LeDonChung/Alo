const express = require('express');
const cors = require('cors');

// Định nghĩa các route
const authRoutes = require('./routes/auth.route');
const userRoutes = require('./routes/user.route');
const friendRoutes = require('./routes/friend.route');
const messageRoutes = require('./routes/message.route');
const conversationRoutes = require('./routes/conversation.route');
const { createAllTables } = require('./services/initDB');

const app = express();

// Cấu hình CORS
const allowedOrigins = [
    'https://alo-tawny.vercel.app',  // Production
    'http://localhost:3000',         // Local development 
    'http://127.0.0.1:3000'          // Local development alternative
  ];

  const corsOptions = {
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  };

app.use(cors(corsOptions));

app.options('*', cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log(`[${req.method}] ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/friend', friendRoutes);
app.use('/api/message', messageRoutes);
app.use('/api/conversation', conversationRoutes);

// Tạo bảng nếu cần (bạn gọi khi chạy lần đầu hoặc tùy theo logic)
 // createAllTables();

module.exports = app;
