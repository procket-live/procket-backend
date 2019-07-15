const express = require('express');
const router = express.Router();

const OffersController = require('../controllers/offers.controller')
const checkAuth = require('../middlewares/check-auth');
const checkAdmin = require('../middlewares/admin-check');

router.get('/', checkAuth, OffersController.get_offers);
router.post('/', checkAuth, checkAdmin, OffersController.set_offers);

module.exports = router;