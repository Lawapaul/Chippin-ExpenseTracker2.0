const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    settlement: [{
        type: mongoose.Types.ObjectId,
        ref: "settlementModel",
    }],
    expenses: [{type: mongoose.Types.ObjectId, ref: "Expense"}],
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User',userSchema);