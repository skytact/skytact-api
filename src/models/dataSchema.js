const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Vergule = '.,\/#!$%\^&\*;:{}=\-_`~()';
const Kirillic = 'аАбБвВгГдДеЕёЁжЖзЗиИйЙкКлЛмМнНоОпПрРсСтТуУфФхХцЦчЧшШщЩъЪыЫьЬэЭюЮяЯ'
const defaultTextRegExp = new RegExp(`^[a-zA-Z0-9_${Kirillic}${Vergule}]{1,128}$`);
const nickNameRegExp = new RegExp(`^[a-zA-Z]{1}[a-zA-Z0-9_]{3,31}$`);

module.exports = new Schema({
	nick: {
		type: String,
		required: true,
		match: nickNameRegExp
	},
	photo: {
		type: String,
		default: "__default",
		required: true
	},
	fname: {
		type: String,
		default: "__default",
		match: defaultTextRegExp,
		required: true,
	},
	intro: {
		type: String,
		default: "__default",
		match: defaultTextRegExp,
		
	},
	notes: [{
		item: {
			type: Number,
			required: true,
		},
		icon: {
			type: String,
			match: new RegExp("^(info|link|email|phone|crypto|locate|image)$"),
			default: "text",
			required: true,
		},
		line: {
			type: String,
			required: true,
		},
		text: {
			type: String,
			required: false,
		},
		lock: {
			type: Boolean,
			default: false,
			required: true,
		}
	}],
	style: [{
		type: String,
		required: true
	}] 
});

