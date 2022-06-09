const mongoose = require('mongoose');

const Schema = mongoose.Schema;

module.exports = new Schema({
	key: {
		type: String,
		required: true,
	},
	ref: {
		type: String,
		required: true,
	},
	val: {
		type: String,
		required: true,
	},
	pub: {
		type: String,
		required: true,
	},
	sec: {
		type: Date,
		default: Date.now(),
		required: true,
	}
});
