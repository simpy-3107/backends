const { required } = require('joi');
const mongoose = require('mongoose');


const paymentSchema = new mongoose.Schema({
    orderid:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
    },
    signature:{
            type: String,
          
    },
    currency:{
        type: String,
    },
    paymentID:{
        type: String,
        
     
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