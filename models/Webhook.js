const mongoose = require('mongoose');

// Create Schema
const webhookSchema = new mongoose.Schema({
	test: {
		type: String,
        default: ''
	},
	createdAt: {
        type: Date,
        default: Date.now
    }
});

const Webhook = mongoose.model('webhook', webhookSchema);

module.exports = Webhook;