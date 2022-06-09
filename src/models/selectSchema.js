const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const selectSchema = new Schema({
	address: {
		type: String,
		required: true,
	},
	link: {
		type: String,
		required: true,
	},
	accs: {
		type: String,
		required: false,
	},
	sign: {
		type: String,
		required: true,
	}
});

module.exports = selectSchema;
