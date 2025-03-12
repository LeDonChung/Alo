const express = require('express');

const router = express.Router();
const userController = require('../controllers/user/user.controller');
const middleware = require('../controllers/auth/auth.middleware');
router.post(
    '/send-friend-request', 
    middleware.authenticateToken,
    middleware.authorizeRoles(['USER']),
    userController.sendFriendRequest
);
router.get(
    '/hello', 
    middleware.authenticateToken,
    middleware.authorizeRoles(['USER']),
    userController.getHello
);
module.exports = router;