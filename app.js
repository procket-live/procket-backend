const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const Sentry = require('@sentry/node');

const userRoutes = require('./api/routes/user.route');
const gameRoutes = require('./api/routes/game.route');
const profileRoutes = require('./api/routes/profile.route');
const adminRoutes = require('./api/routes/admin.route');
const offersRoutes = require('./api/routes/offers.route');
const tournamentRoutes = require('./api/routes/tournament.route');
const otpRoutes = require('./api/routes/otp.route');
const participateRoutes = require('./api/routes/participation.route');

Sentry.init({ dsn: 'https://7948c5b141b84446947a4ac200815f79@sentry.io/1502921' });

const app = express();


mongoose.connect(
    'mongodb+srv://procket-admin:C347NNmGF5F36cPR@cluster0-gazhd.mongodb.net/test?retryWrites=true&w=majority',
    {
        useNewUrlParser: true
    }
);
mongoose.Promise = global.Promise;

app.use(Sentry.Handlers.requestHandler());
app.use(morgan('dev'))
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Request-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

app.use(Sentry.Handlers.errorHandler());

app.use('/user', userRoutes);
app.use('/game', gameRoutes);
app.use('/profile', profileRoutes);
app.use('/admin', adminRoutes);
app.use('/offers', offersRoutes);
app.use('/tournament', tournamentRoutes);
app.use('/otp', otpRoutes);
app.use('/participate', participateRoutes);

app.use((req, res, next) => {
    const error = new Error("Not found");
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        success: false,
        response: error.message
    });
});

module.exports = app;