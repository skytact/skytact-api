const {
	checkPassword,
	decryptPhrase,
	encryptPhrase,
	signAccount
} = require('../components/ciphro');
const md5 = require('md5');
const keyPem = require('../components/keywork');
const passWork = require('../components/passwd');

module.exports = {
	connect: async (params, {models}) => {
		try {
			await models.Place.findOne({});
			await models.Card.findOne({});
			return 200;
		} catch (err) {
			throw new Error(err);
		}
	},
	places: async ({passwd}, {models}) => {
		//check admin password
		if(!checkPassword(passwd, process.env.ADMIN)) {
			return -1;
		}
		const places = await models.Place.find({});
		return places ? places.length : 0;
		
	},
	isfree: async ({upcode}, {models}) => {
		//find clones
		const clones = await models.Place.find({upcode});
		const length = clones ? clones.length : 0;
		const invite = await models.Place.findOne({invite:upcode});
		if (invite && invite.limit > length) {
			return true;
		} else {
			return false;
		}
	},
	captcha: async ({}, {captcha}) => {
		const caps = await captcha.gen(5);
		return caps;	
	},
	overlap: async ({name}, {models}) => {
		//find card by name
		const card = await models.Card.findOne({"data.nick": name}, {"address": 1, "_id": 0});
		return card ? true : false;
	},
	getlink: async ({address}, {models}) => {
		//find card by address
		const card = await models.Card.findOne({address}, {"data.nick": 1});
		return card.data.nick;
	},
	getaddr: async ({name}, {models}) => {
		const card = await models.Card.findOne({"data.nick": name}, {"address": 1});
		if (!card) throw new Error ('card not exist!!!');
		return card.address;
	},
	getaccs: async ({name, address}, {models}) => {
		//find selected card
		const card = await models.Card.findOne({
			"data.nick": name, 
			"list.key": address,
		}, {
			"list.$": 1,
		});
		//catch error
		if (!card) return "";
		//inject from array
		return card.list.length ? card.list[0].val : "";
	},
	/// -- owner side --
	authorized: async({name}, {models, upd}) => {
		const card = await models.Card.findOne({"data.nick": name}, {
			"hide.server": 1
		});
		if (!card) return false;
		return card.hide.server && await passWork.verify(upd, card.hide.server)
			? true
			: false;
	},
}
