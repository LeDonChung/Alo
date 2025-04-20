const express = require('express');
const middleware = require('../controllers/auth/auth.middleware');
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
const conversationController = require('../controllers/conversation/conversation.controller');

router.get('/get-conversation',
    middleware.authenticateToken,
    conversationController.getConversationsByUserId);

router.get('/get-conversation/:id',
    middleware.authenticateToken,
    conversationController.getConversationById);

router.post('/:conversationId/pin/:messageId',
    middleware.authenticateToken,
    conversationController.createPin);
router.delete('/:conversationId/pin/:messageId',
    middleware.authenticateToken,
    conversationController.deletePin);

// group
router.post('/create-group',
    middleware.authenticateToken,
    upload,
    conversationController.createGroupConversation);
module.exports = router;