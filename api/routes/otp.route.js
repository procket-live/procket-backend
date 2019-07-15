const express = require('express');
const router = express.Router();

const otpController = require('../controllers/otp.controller')
const userController = require('../controllers/user.contoller');
const checkAuth = require('../middlewares/check-auth');

router.post('/generate', checkAuth, otpController.generate_top);
router.post('/verify', checkAuth, otpController.verify_otp, userController.mark_mobile_as_verified);

module.exports = router;