const express = require('express');

const cors = require('cors'); // Import CORS middleware

// Định nghĩa các route
const authRoutes = require('./routes/auth.route');
const userRoutes = require('./routes/user.route');
const { createAllTables } = require('./services/initDB');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    console.log(`[${req.method}] ${req.path}`);
    next(); 
});

// Cấu hình cors
app.use(cors());

// Sử dụng các route đã định nghĩa
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// Tạo table
// createAllTables()


module.exports = app;  