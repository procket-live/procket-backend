const express = require('express');
const router = express.Router();

const ProfileController = require('../controllers/profile.controller')
const UserController = require('../controllers/user.contoller');
const checkAuth = require('../middlewares/check-auth');
const checkAdmin = require('../middlewares/admin-check');

router.post('/', checkAuth, ProfileController.create_profile, UserController.set_profile);
router.get('/', checkAuth, checkAdmin, ProfileController.get_profiles);

module.exports = router;
