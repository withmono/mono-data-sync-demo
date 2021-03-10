const mongoose = require('mongoose');

// Create Schema
const balanceSchema = new mongoose.Schema({
	monoId: {
		type: String,
        default: ''
	},
	institution: {
		type: String,
        default: ''
	},
    name: {
		type: String,
        default: ''
	},
	accountNumber: {
		type: String,
        default: ''
	},
    type: {
		type: String,
        default: ''
	},
	currency: {
		type: String,
        default: ''
	},
    balance: {
		type: String,
        default: ''
	},
	bvn: {
		type: String,
        default: ''
	},
},
{ timestamps: true }
);

const Balance = mongoose.model('balance', balanceSchema);

module.exports = Balance;