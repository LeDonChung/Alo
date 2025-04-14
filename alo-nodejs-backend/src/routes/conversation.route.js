const express = require('express');
const middleware = require('../controllers/auth/auth.middleware');

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
module.exports = router;