const mongoose = require('mongoose');
const Schema = mongoose.Schema;

transactionSchema = new mongoose.Schema({
  payer: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true },
  participant: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true },
  amount: { type: Number, 
            required: true 
        },
  description: { type: String },
  details: {
    type: String,
    required: true,
  },
  date: { type: Date, default: Date.now }
});

module.exports = new mongoose.model('settlementModel',transactionSchema);