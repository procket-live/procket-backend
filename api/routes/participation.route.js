const express = require('express');
const router = express.Router();

const tournamentController = require('../controllers/tournament.controller');
const userController = require('../controllers/user.contoller');
const participationController = require('../controllers/participationRequest.controller');
const checkAuth = require('../middlewares/check-auth');

router.post('/', checkAuth, tournamentController.attach_tournament, participationController.request_participate, participationController.get_participation);
router.get('/:id', checkAuth, participationController.get_participation);
router.post('/:id', checkAuth, userController.attach_user, participationController.attach_participate, tournamentController.attach_tournament, participationController.complete_participation, tournamentController.add_participent, userController.deduct_money);

module.exports = router;