const mongoose = require('mongoose');

const Tournament = require('../models/tournament.model');

exports.create_tournament = (req, res, next) => {
    const userId = req.userData.userId;

    const tournament = new Tournament({
        _id: new mongoose.Types.ObjectId(),
        created_at: Date.now(),
        created_by: userId,
        game: req.body.game_id,
        game_meta: req.body.game_meta,
        start_time: req.body.start_time,
        closing_time: req.body.closing_time,
        max_people: req.body.max_people,
        min_people: req.body.min_people,
        participents: [],
        price_detail: req.body.price_detail,
        tournament_description: req.body.tournament_description,
        terms_and_condition: req.body.terms_and_condition
    });


    tournament
        .save()
        .then((result) => {
            return res.status(201).json({
                success: true,
                response: result,
            })
        })
        .catch(() => {
            return res.status(500).json({
                success: false,
                response: err
            });
        })
}

exports.get_upcoming_tournament_list = (req, res, next) => {
    const myUserId = req.userData.userId;
    const gameId = req.query.game_id;
    const completed = req.query.completed;
    const query = {};

    if (gameId) {
        query.game = gameId;
    }

    if (completed == 1) {
        query.completed = true;
    }

    console.log('query', query)
    Tournament.find(query)
        .select('game completed game_meta start_time max_people participents')
        .populate('game', 'name wallpaper_url')
        .populate('participents.participation', 'user')
        .exec()
        .then((tournaments) => {
            console.log('tournaments', tournaments);
            const newTournaments = [];
            for (let i = 0; i < tournaments.length; i++) {
                const tournament = tournaments[i];
                const participents = tournament.participents;
                let participated = false;
                let participatedId;
                participents.forEach((item) => {
                    if (item.participation.user.equals(myUserId)) {
                        participated = true;
                        participatedId = item.participation._id;
                    }
                })

                newTournaments.push(Object.assign(tournament, { participents: undefined, is_participated: participated, user_participation_id: participatedId }));
            }

            console.log('newTournaments', newTournaments);

            return res.status(201).json({
                success: true,
                response: newTournaments
            })
        })
        .catch((err) => {
            return res.status(201).json({
                success: false,
                response: err
            })
        })
}

exports.get_tournament_detail = (req, res, next) => {
    Tournament.find({ _id: req.params.id })
        .populate('game')
        .exec()
        .then((tournaments) => {
            return res.status(201).json({
                success: true,
                response: tournaments[0]
            })
        })
        .catch((err) => {
            return res.status(201).json({
                success: false,
                response: err
            })
        })
}

exports.attach_tournament = (req, res, next) => {
    Tournament.find({ _id: req.body.tournament_id || req.tournament_id || req.params.id })
        .populate('game')
        .populate({
            path: 'participents.participation',
            populate: { path: 'user', select: 'firebase_token' }
        })
        .exec()
        .then((tournaments) => {
            req.tournament = tournaments[0];
            next();
        })
        .catch((err) => {
            return res.status(201).json({
                success: false,
                response: err
            })
        })
}

exports.add_participent = (req, res, next) => {
    const tournamentId = req.tournament_id;
    const participationId = req.participate._id;

    Tournament.update({ _id: tournamentId }, { $push: { "participents": { participation: participationId } } })
        .exec()
        .then(() => {
            next();
        })
        .catch((error) => {
            return res.status(200).json({
                success: false,
                response: error
            });
        })
}

exports.finish_tournament = (req, res, next) => {
    const tournamentId = req.params.id;
    Tournament.update({ _id: tournamentId }, { $set: { "completed": true } })
        .exec()
        .then((response) => {
            return res.status(200).json({
                success: false,
                response: response
            });
        })
        .catch((error) => {
            return res.status(200).json({
                success: false,
                response: error
            });
        })
}

exports.set_tournament_credentials = (req, res, next) => {
    const tournamentId = req.params.id;
    const tournamentCredentials = {
        room_id: req.body.room_id,
        room_password: req.body.room_password
    };

    Tournament.update({ _id: tournamentId }, { $set: { "tournament_credentials": tournamentCredentials } })
        .exec()
        .then((response) => {
            return res.status(200).json({
                success: false,
                response: response
            });
        })
        .catch((error) => {
            return res.status(200).json({
                success: false,
                response: error
            });
        })
}

exports.attach_tournament_participents_tokens = (req, res, next) => {
    const tokens = [];
    const tournament = req.tournament;
    const participents = tournament.participents;
    participents.forEach((participent) => {
        if (participent.participation.user.firebase_token) {
            tokens.push(participent.participation.user.firebase_token);
        }
    })
    req.tokens = tokens;
    next();
}

exports.promote_tournament = (req, res, next) => {
    const tournament = req.tournament;
    req.title = tournament.game.name || 'pubg match';
    req.message = `Match about to start .... join now`;
    next();
}

exports.send_reminder = (req, res, next) => {
    const tournament = req.tournament;
    req.title = tournament.game.name || 'pubg match';
    req.message = `Match about to start .... join now`;
    next();
}

