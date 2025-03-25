const express = require('express');

const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();
const messageController = require('../controllers/message/message.controller');
const middleware = require('../controllers/auth/auth.middleware');

router.post(
    '/create-message',
    middleware.authenticateToken,
    messageController.createMessage
);
module.exports = router;