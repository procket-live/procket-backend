const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const PaytmConfig = require('../class/paytm/paytm_config').paytm_config;
const PaytmChecksum = require('../class/paytm/checksum');

const User = require('../models/user.model');
const Wallet = require('../models/wallet.model');

exports.user_signup = (req, res, next) => {
    User.find({ $or: [{ 'email': req.body.email }, { 'mobile': req.body.mobile }] })
        .exec()
        .then((user) => {
            console.log('user', user);
            if (user.length > 0) {
                return res.status(200).json({
                    success: false,
                    response: "Email address or mobile already exists"
                })
            } else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(200).json({
                            success: false,
                            response: err
                        })
                    } else {
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            name: req.body.name,
                            email: req.body.email,
                            password: hash,
                            mobile: req.body.mobile,
                            wallet: req.wallet
                        });

                        user
                            .save()
                            .then(result => {
                                console.log(result);
                                res.status(201).json({
                                    success: true,
                                    response: "Account created successfully ! Login using email and password"
                                })
                            })
                            .catch((err) => {
                                console.log(err);
                                res.status(200).json({
                                    success: false,
                                    response: err
                                })
                            })
                    }
                })
            }
        })
}

exports.get_user = (req, res, next) => {
    User.find({ _id: req.userData.userId })
        .select("-password")
        .populate({
            path: 'game_profiles',
            populate: {
                path: 'game'
            }
        })
        .exec()
        .then((user) => {
            if (user.length == 0) {
                return res.status(201).json({
                    success: false,
                    response: 'something went wrong'
                })
            }

            return res.status(201).json({
                success: true,
                response: user[0]
            })
        }).catch((err) => {
            return res.status(201).json({
                success: false,
                response: err
            })
        })
};

exports.attach_user = (req, res, next) => {
    User.find({ _id: req.userData.userId })
        .select("-password")
        .populate({
            path: 'game_profiles wallet',
            populate: {
                path: 'game'
            }
        })
        .exec()
        .then((user) => {
            req.user = user[0];
            next();
        })
        .catch((err) => {
            return res.status(201).json({
                success: false,
                response: err
            })
        })
}

exports.get_leaderboard = (req, res, next) => {
    User.find()
        .select("name")
        .limit(10)
        .exec()
        .then((user) => {
            return res.status(200).json({
                success: true,
                response: user
            })
        })
}

exports.mark_mobile_as_verified = (req, res, next) => {
    const userId = req.userData.userId;
    const mobile = req.mobileNumber;
    User.update({ _id: userId }, { $set: { "is_mobile_verified": true, "mobile": mobile } })
        .exec()
        .then(() => {
            return res.status(201).json({
                success: true,
                response: 'Mobile number verified'
            })
        })
        .catch((err) => {
            return res.status(200).json({
                success: false,
                response: err
            })
        })
}

exports.set_firebase_token = (req, res, next) => {
    const userId = req.userData.userId;
    const firebaseToken = req.body.firebase_token;

    User.update({ _id: userId }, { $set: { "firebase_token": firebaseToken } })
        .exec()
        .then(() => {
            return res.status(201).json({
                success: true,
            })
        })
        .catch((err) => {
            return res.status(200).json({
                success: false,
                response: err
            })
        })
}

exports.set_profile = (req, res, next) => {
    const userId = req.userData.userId;
    const profileId = req.profileId

    User.update({ _id: userId }, { $push: { "game_profiles": profileId } })
        .exec()
        .then((response) => {
            return res.status(201).json({
                success: true,
                response: response
            })
        })
        .catch((err) => {
            return res.status(200).json({
                success: false,
                response: err
            })
        })
}

exports.get_game_profiles = (req, res, next) => {
    const userId = req.userData.userId;
    const gameId = req.query.game_id;
    const match = {};
    const query = {
        _id: userId
    };

    if (gameId) {
        match['game'] = { $elemMatch: { _id: { $eq: gameId } } };
    }


    User.find(query)
        .select('game_profiles')
        .populate({
            path: 'game_profiles',
            populate: {
                path: 'game',
                model: 'Game',
                select: 'name image_url',
            }
        })
        .exec()
        .then((response) => {
            return res.status(200).json({
                success: true,
                response: response[0].game_profiles
            })
        })
        .catch((err) => {
            return res.status(200).json({
                success: false,
                response: err
            })
        })
}

exports.get_wallet = (req, res, next) => {
    const userId = req.userData.userId;

    User.find({ _id: userId })
        .select('wallet')
        .populate('wallet')
        .exec()
        .then((users) => {
            return res.status(200).json({
                success: true,
                response: users[0].wallet
            })
        })
        .catch((err) => {
            return res.status(200).json({
                success: false,
                response: err
            })
        })
}

exports.deduct_money = (req, res, next) => {
    const walletId = req.user.wallet;
    const tournamentJoined = req.user.tournaments_joined;
    const updatedWallet = req.updatedWallet;

    Wallet.update({ _id: walletId }, { $set: { "cash_balance": updatedWallet, "tournaments_joined": tournamentJoined + 1 } })
        .exec()
        .then(() => {
            return res.status(200).json({
                success: true,
                response: 'Successfully participated'
            })
        })
        .catch((err) => {
            return res.status(200).json({
                success: false,
                response: err
            })
        })
}

exports.generate_checksum = (req, res, next) => {
    const user = req.user;
    const walletTransactionId = req.walletTransaction._id;

    // return res.status(200).json({
    //     success: true,
    //     response: req.walletTransaction
    // })

    const paramarray = {};

    paramarray['MID'] = PaytmConfig.MID; //Provided by Paytm
    paramarray['ORDER_ID'] = String(walletTransactionId); //unique OrderId for every request
    paramarray['CUST_ID'] = String(req.user._id);  // unique customer identifier 
    paramarray['INDUSTRY_TYPE_ID'] = String(PaytmConfig.INDUSTRY_TYPE_ID); //Provided by Paytm
    paramarray['CHANNEL_ID'] = String(PaytmConfig.CHANNEL_ID); //Provided by Paytm
    paramarray['TXN_AMOUNT'] = String(req.walletTransaction.amount); // transaction amount
    paramarray['WEBSITE'] = String(PaytmConfig.WEBSITE); //Provided by Paytm
    paramarray['CALLBACK_URL'] = `https://securegw-stage.paytm.in/theia/paytmCallback?ORDER_ID=${walletTransactionId}`; //Provided by Paytm
    paramarray['EMAIL'] = String(user.email); // customer email id
    paramarray['MOBILE_NO'] = String(user.mobile); // customer 10 digit mobile no.
    console.log('paramarray', paramarray);
    PaytmChecksum.genchecksum(paramarray, PaytmConfig.MERCHANT_KEY, (err, checksum) => {
        if (err) {
            return res.status(200).json({
                success: false,
                response: err
            })
        }

        console.log('generated checksum', checksum);
        return res.status(200).json({
            success: true,
            response: {
                order_id: walletTransactionId,
                checksum: checksum
            }
        })
    })
}

exports.verify_checksum = (req, res, next) => {
    const walletTransaction = req.walletTransaction;
    const user = req.user;
    const checksum = req.body.checksum;

    const paramarray = {};
    paramarray['MID'] = PaytmConfig.MID; //Provided by Paytm
    paramarray['ORDER_ID'] = String(walletTransaction._id); //unique OrderId for every request
    paramarray['CUST_ID'] = String(req.user._id);  // unique customer identifier 
    paramarray['INDUSTRY_TYPE_ID'] = String(PaytmConfig.INDUSTRY_TYPE_ID); //Provided by Paytm
    paramarray['CHANNEL_ID'] = String(PaytmConfig.CHANNEL_ID); //Provided by Paytm
    paramarray['TXN_AMOUNT'] = String(walletTransaction.amount); // transaction amount
    paramarray['WEBSITE'] = String(PaytmConfig.WEBSITE); //Provided by Paytm
    paramarray['CALLBACK_URL'] = `https://securegw-stage.paytm.in/theia/paytmCallback?ORDER_ID=${walletTransaction._id}`; //Provided by Paytm
    paramarray['EMAIL'] = String(user.email); // customer email id
    paramarray['MOBILE_NO'] = String(user.mobile); // customer 10 digit mobile no.


    const matched = PaytmChecksum.verifychecksum(paramarray, PaytmConfig.MERCHANT_KEY, checksum);

    if (!matched) {
        req.VERIFY_PARAMS = {
            'MID': PaytmConfig.MID,
            'ORDERID': String(walletTransaction._id),
            'CHECKSUMHASH': checksum
        }
        next();
    } else {
        return res.status(200).json({
            success: false,
            response: 'Checksum verification error'
        })
    }
}


exports.user_signin = (req, res, next) => {
    User.find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length < 1) {
                return res.status(200).json({
                    success: false,
                    response: 'Unable to login'
                })
            }

            bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                if (err) {
                    return res.status(200).json({
                        success: false,
                        response: 'Unable to login'
                    })
                }

                if (result) {
                    const token = jwt.sign(
                        {
                            email: user[0].email,
                            userId: user[0]._id
                        },
                        'tyyyyrrrorororo',
                        {
                            expiresIn: "50h"
                        }
                    );

                    console.log('tokkken', token);

                    const returnUser = Object.assign(user[0], { password: undefined, });

                    return res.status(200).json({
                        success: true,
                        response: returnUser,
                        token
                    })
                }

                res.status(200).json({
                    success: false,
                    response: 'Unable to login'
                })
            })
        }).catch(err => {
            res.status(200).json({
                success: false,
                response: err
            })
        })
}