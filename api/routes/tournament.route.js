const express = require('express');
const router = express.Router();

const TournamentController = require('../controllers/tournament.controller')
const PushNotificationController = require('../controllers/pushNotification.controller');
const checkAuth = require('../middlewares/check-auth');
const checkAdmin = require('../middlewares/admin-check');

// router.get('/', checkAuth, OffersController.get_offers);
router.post('/', checkAuth, checkAdmin, TournamentController.create_tournament);
router.get('/', checkAuth, TournamentController.get_upcoming_tournament_list);
router.get('/:id', checkAuth, TournamentController.get_tournament_detail);
router.post('/:id/finish_tournament', checkAuth, checkAdmin, TournamentController.finish_tournament);
router.post('/:id/set_credentials', checkAuth, checkAdmin, TournamentController.set_tournament_credentials);
router.post('/:id/promote', checkAuth, checkAdmin, TournamentController.attach_tournament, TournamentController.attach_tournament_participents_tokens, TournamentController.promote_tournament, PushNotificationController.send_push_notification);
router.post('/:id/sendReminder', checkAuth, checkAdmin, TournamentController.attach_tournament, TournamentController.send_reminder, PushNotificationController.send_push_notification);

module.exports = router;