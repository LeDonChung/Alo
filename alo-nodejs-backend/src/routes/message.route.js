const express = require('express');

const multer = require('multer');

const storage = multer.memoryStorage({
    destination: function (req, file, cb) {
        cb(null, "/")
    }
})

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 30
    },
}).single('file');

const router = express.Router();
const messageController = require('../controllers/message/message.controller');
const middleware = require('../controllers/auth/auth.middleware');

router.post(
    '/create-message',
    upload,
    middleware.authenticateToken,
    messageController.createMessage
);
router.get(
    '/get-messages/:conversationId',
    middleware.authenticateToken,
    messageController.getMessagesByConversationId
);
module.exports = router;