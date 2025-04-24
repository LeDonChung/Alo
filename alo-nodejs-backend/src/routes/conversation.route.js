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

router.post('/:conversationId/update-profile-group',
    middleware.authenticateToken,
    upload,
    conversationController.updateProfileGroup);

router.post('/:conversationId/add-member',
    middleware.authenticateToken,
    conversationController.addMember);

router.post('/:conversationId/remove-member/:memberUserId',
    middleware.authenticateToken,
    conversationController.removeMember);

router.post('/:conversationId/add-vice-leader/:memberUserId',
    middleware.authenticateToken,
    conversationController.addViceLeader);
router.post('/:conversationId/remove-vice-leader/:memberUserId',
    middleware.authenticateToken,
    conversationController.removeViceLeader);
router.post('/:conversationId/change-leader/:newLeaderId',
    middleware.authenticateToken,
    conversationController.changeLeader);

router.post('/:conversationId/block/:blockMember',
    middleware.authenticateToken,
    conversationController.blockMember);

router.post('/:conversationId/unblock/:memberUserId',
    middleware.authenticateToken,
    conversationController.unblockMember);

router.post('/:conversationId/allow-update-profile-group',
    middleware.authenticateToken,
    conversationController.updateAllowUpdateGroupInfo);

router.post('/:conversationId/allow-pin-message',
    middleware.authenticateToken,
    conversationController.updateAllowPinMessage);

router.post('/:conversationId/allow-send-message',
    middleware.authenticateToken,
    conversationController.updateAllowSendMessage);

router.post('/:conversationId/remove-all-history-messages',
    middleware.authenticateToken,
    conversationController.removeAllHistoryMessages);

router.post('/:conversationId/leave-group',
    middleware.authenticateToken,
    conversationController.leaveGroup);

router.delete('/:conversationId/disband-group',
    middleware.authenticateToken,
    conversationController.disbandGroup);
module.exports = router;