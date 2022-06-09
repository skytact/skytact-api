const mongoose = require('mongoose');

const Schema = mongoose.Schema;

module.exports = new Schema({
	kind: {
		type: String,
		match: new RegExp("\\b(server|income|secure)\\b"),
		required: true,
	},
	text: {
		type: String,
		match: /^[a-zA-Z0-9 _]{1,128}$/,
		required: true,
	},
	date: {
		type: Date,
		default: Date.now(),
		required: true,
	},
	view: {
		type: Boolean,
		default: false,
		required: true
	},
});
