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
    
module.exports = router;