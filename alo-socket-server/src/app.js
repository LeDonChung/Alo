const express = require('express');

const cors = require('cors'); // Import CORS middleware

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

module.exports = app;  