const express = require('express');
const router = express.Router();

const UserController = require('../controllers/user.contoller');
const WalletController = require('../controllers/wallet.controller');
const checkAuth = require('../middlewares/check-auth');

router.get('/', checkAuth, UserController.get_user);
router.post('/signup', WalletController.create_wallet, UserController.user_signup);
router.post('/login', UserController.user_signin);
router.post('/setProfile', checkAuth, UserController.set_profile);
router.get('/leaderboard', checkAuth, UserController.get_leaderboard);
router.get('/gameProfiles', checkAuth, UserController.get_game_profiles);
router.get('/wallet', checkAuth, UserController.get_wallet);
router.post('/addAmount', checkAuth, UserController.attach_user, WalletController.create_wallet_transaction, UserController.generate_checksum);
router.post('/verifyPayment', checkAuth, UserController.attach_user, WalletController.attach_wallet_transaction, UserController.verify_checksum, WalletController.verify_transaction);
router.get('/transactions', checkAuth, WalletController.get_transactions);
router.post('/setFirebaseToken', checkAuth, UserController.set_firebase_token);

module.exports = router;