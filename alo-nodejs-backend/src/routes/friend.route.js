const express = require('express');
const middleware = require('../controllers/auth/auth.middleware');

const router = express.Router();
const friendController = require('../controllers/friend/friend.controller');

router.post('/send-friend-request',
    middleware.authenticateToken,
    friendController.sendFriendRequest);

router.get('/get-friend-request',
    middleware.authenticateToken,
    friendController.getFriendRequests);

router.post('/accept-friend-request',
    middleware.authenticateToken,
    friendController.acceptFriendRequest);

router.post('/reject-friend-request',
    middleware.authenticateToken,
    friendController.rejectFriendRequest);

router.get('/get-friends',
    middleware.authenticateToken,
    friendController.getFriends);

router.post('/unfriend',
    middleware.authenticateToken,
    friendController.unfriendRequest);

router.post('/block-friend',
    middleware.authenticateToken,
    friendController.blockFriendRequest);

router.get('/get-friend-by-phone-number',
    middleware.authenticateToken,
    friendController.getFriendByPhoneNumber);

router.post('/unblock-friend',
    middleware.authenticateToken,
    friendController.unblockFriendRequest);

router.post('/cancel-friend',
    middleware.authenticateToken,
    friendController.cancelFriendRequest);

module.exports = router;