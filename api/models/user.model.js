const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    email: {
        type: String,
        require: true,
        unique: true,
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    },
    password: { type: String, required: true },
    mobile: {
        type: String
    },
    is_mobile_verified: { type: Boolean, default: false },
    game_profiles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Profile', require: true }],
    wallet: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet', require: true },
    tournaments_joined: { type: Number, default: 0 },
    firebase_token: String,
})

module.exports = mongoose.model('User', userSchema);