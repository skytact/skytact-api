const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = new Schema({
	size: {
		type: Number,
		required: true,
		min: 0,
		default: 0,
	},
	knot: [{
		hash: {
			type: String,
			required: true
		},
		in: {
			cardID: {
				type: String,
				required: true,
			},
			sign: {
				type: String,
				required: true,
			},
			date: {
				type: Date,
				required: true,
				default: Date.now
			}
		},
		out: {
			cardID: {
				type: String,
				required: true,
			},
			sign: {
				type: String,
				required: true,
			},
			date: {
				type: Date,
				required: true,
				default: Date.now
			}
		}
	}]
});
