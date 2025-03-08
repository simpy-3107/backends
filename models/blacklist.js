const mongoose = require('mongoose');

const blacklistSchema = new mongoose.Schema({
    token:{
        type: String,
        required: [true, 'Token is required'],
        unique: true,
    },
    },{timestamps: true});

    blacklistSchema.index( {token:1},{ unique: true });

        const blacklist = mongoose.model('Blacklist', blacklistSchema);
        module.exports = blacklist;
        