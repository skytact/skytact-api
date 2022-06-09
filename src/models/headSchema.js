const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = new Schema({
	host: {
		type: String,
		default: '127.0.0.1',
		required: true,
	},
	sign: {
		type: String,
		required: true,
	},
	hash: {
		type: String,
		required: true,
	},
	pubk: {
		type: String,
		required: true,
	},
	pass: {
		type: String,
		required: true,	
	},
	views: {
		type: Number,
		min: 0,
		default: 0,
		required: true,
	},
	nonce: {
		type: Number,
		min: 0,
		default: 0,
		required: true,
	},
	party: {
		type:Number,
		min: 0,
		default: 0,
		required: true,
	}
})
