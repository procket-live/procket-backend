const express = require('express');
const router = express.Router();

const AdminController = require('../controllers/admin.controller');
const checkAuth = require('../middlewares/check-auth');
const checkAdmin = require('../middlewares/admin-check');

router.post('/', checkAuth, AdminController.set_admin);
router.get('/', checkAuth, AdminController.get_admins);
router.get('/isAdmin', checkAuth, checkAdmin, AdminController.check_admin);

module.exports = router;