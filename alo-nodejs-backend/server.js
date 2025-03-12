require('dotenv').config();
const express = require('express');

const app = require('./src/app');

const PORT = 5000;

const http = require('http');

const server = http.createServer(app);

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
