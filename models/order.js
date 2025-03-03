const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    products:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
    },
    amount:{
        type: Number,
    },
    buyer:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
 seller:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    payment :{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment',

    }} ,{timestamps: true});

module.exports = mongoose.model('Order', orderSchema);