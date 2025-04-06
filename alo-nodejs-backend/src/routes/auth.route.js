const express = require('express');

const router = express.Router();
const authController = require('../controllers/auth/auth.controller');
const middleware = require('../controllers/auth/auth.middleware');

router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/register', authController.register);
router.post('/logout', authController.logout);
router.post('/generate-otp', authController.generateOtp);
router.post('/verify-otp', authController.verifyOtp);
router.post('/change-password', middleware.authenticateToken, authController.changePassword);
router.post('/reset-password', authController.forgotPassword);

module.exports = router;