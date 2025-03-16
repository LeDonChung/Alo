const express = require('express');

const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage });

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
router.post(
    '/upload-data',
    upload.single('file'),
    userController.uploadData
)
router.post(
    '/upload-avatar',
    middleware.authenticateToken,
    upload.single('file'),
    userController.uploadAvatar
)
router.post(
    '/upload-background',
    middleware.authenticateToken,
    upload.single('file'),
    userController.uploadBackground
)
router.put(
    '/update-profile',
    middleware.authenticateToken,
    userController.updateProfile
)
router.get(
    '/profile',
    middleware.authenticateToken,
    userController.getProfile
)
module.exports = router;