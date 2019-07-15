const express = require('express');
const router = express.Router();

const GameController = require('../controllers/game.controller')
const checkAuth = require('../middlewares/check-auth');
const checkAdmin = require('../middlewares/admin-check');

router.post('/', checkAuth, checkAdmin, GameController.create_game);
router.get('/', checkAuth, GameController.get_games);
router.get('/:id', checkAuth, GameController.get_game);

module.exports = router;
