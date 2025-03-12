const express = require('express');

const router = express.Router();
const authController = require('../controllers/auth/auth.controller');

router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/register', authController.register);

module.exports = router;