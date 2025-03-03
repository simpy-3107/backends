const { required } = require('joi');
const mongoose = require('mongoose');


const paymentSchema = new mongoose.Schema({
    orderid:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
    },
    signature:{
            type: String,
            required: [true, 'Signature is required'],
    },
    currency:{
        type: String,
        required: [true, 'Currency is required'],
    },
    paymentID:{
        type: String,
        required: [true, 'Payment ID is required'],
        unique: true,
    },
    amount:{
        type: Number,
    },
    status:{
        type: String,
        enum: ['pending', 'success', 'failed'],
    },

    
    },{timestamps: true});
module.exports = mongoose.model('Payment', paymentSchema);