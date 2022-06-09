const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = new Schema({
	access: {
		type: String,
		required: true,
	},
	server: {
		type: String,
		required: true,
	},
	reciev: {
		type: String,
		required: false,
	},
	string: {
		type: String,
		required: true,
	},
	double: {
		type: String,
		required: false,
	},
	impart: {
		type: String,
		required: false,
	},
	upcode: {
		type: String,
		required: true,
	},
	letter: {
		type: String,
		required: false,
	},
	period: {
		type: String,
		required: true,
		default: Date.now()
	},
});
