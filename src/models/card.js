const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const dataSchema = require('./dataSchema');
const hideSchema = require('./hideSchema');
const headSchema = require('./headSchema');
const incomeSchema = require('./incomeSchema');
const selectSchema = require('./selectSchema');
const noticeSchema = require('./noticeSchema');

const cardSchema = new Schema({
	address: {
		type: String,
		required: true,
	},
	head: headSchema,
	data: dataSchema,
	hide: hideSchema,
	list: [incomeSchema],
	conf: {
		select: [selectSchema],
		notice: [noticeSchema],
	},
	
});

const Card = mongoose.model('Card', cardSchema);
module.exports = Card;
