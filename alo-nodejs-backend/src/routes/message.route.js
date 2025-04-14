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

// cập nhật trạng thái tin nhắn query params
router.put(
    '/:messageId/status',
    middleware.authenticateToken,
    messageController.updateMessageStatus
)
// cập nhật reaction
router.put(
    '/:messageId/reaction',
    middleware.authenticateToken,
    messageController.updateMessageReaction
)

// Cập nhật người đã xem tin nhắn
router.put(
    '/:messageId/seen',
    middleware.authenticateToken,
    messageController.updateSeenMessage
)


router.post(
    '/:messageId/send-continue',
    middleware.authenticateToken,
    messageController.forwardMessage
);

module.exports = router;