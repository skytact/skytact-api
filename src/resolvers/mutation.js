const md5 = require('md5');
const BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
const base = require('base-x')(BASE58);
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const request = require('superagent');
const crypto = require('crypto');
const keyPem = require('../components/keywork');
const skyaddr = require('../components/skyaddress');
const passWork = require('../components/passwd');
const  {
	getKeyPair,
	signAccount,
	verifyAccount,
	checkPassword,
	generateKeyByPassword,
	encryptPhrase,
	decryptPhrase
} = require('../components/ciphro');

require('dotenv').config();

//constants value
//bytes from invite code
const INVITE_BYTES = 32;
//bytes from update code
const UPDATE_BYTES = 12;
//limit for inherit place
const UP_LIMIT = 4;
//live time for token (sec)
const LIVE_TIME = 90;
//network unique number
const NETWORK_MARK = '1d';

//places
const checkFreePlace = async (upcode, models) => {
	//search upcode
	const places = await models.Place.find({upcode});
	const number = places.length || 0;
	const place = await models.Place.findOne({invite:upcode});
	//checking for out of range
	if(!place || (place.limit < number && number)) return false;
	return place;
}
//places
const inheritPlace = async (upcode, models) => {
	//check free place for exist
	const freeplace = await checkFreePlace(upcode, models);
	if (!freeplace) throw new Error("invalid upcode!!!");
	//create new place
	const invite = crypto.randomBytes(INVITE_BYTES).toString('hex');
	const place = await models.Place.create({
		invite,
		upcode,
		limit: UP_LIMIT,
		date: Date.now()
	});
	//return new place
	return place;
}
//
const incrementPass = (pass) => {
	const size = pass.length;
	let copy = "";
	let arrc = [];
	let f = 1;
	const abc = "0123456789";
	for (let i = 0; i < size; i-=-1) {
		const code = (pass[size - i - 1].charCodeAt(0) - 48)%10;
		const char = abc[(code+f)%10];
		if (char != "0") {
			f = 0;
		}
		copy = char + copy;
	}
	return copy;
}
//
const compareCode = (prefix_code, prefix_prev) => {
	//get object
	const obj_json = JSON.parse(Buffer.from(prefix_code, 'base64').toString('utf8'));
	const pass = obj_json.pass;
	//get prev object
	const prev_json = JSON.parse(Buffer.from(prefix_prev, 'base64').toString('utf8'));
	const prev_pass = prev_json.pass;
	//compare meta data
	if (obj_json.addr != prev_json.addr) return false;
	if (obj_json.send != prev_json.send) return false;
	//check pass string
	for (let i = 0; i < 16; ++i) {
		if(prev_pass.charCodeAt(i) > pass.charCodeAt(i))
			return false;
		if(prev_pass.charCodeAt(i) < pass.charCodeAt(i))
			return true;
	}
	return false;
}
//
const verifyCode = (pubkpem, code) => {
	const [prefix, signature] = code.split('.');
	//
	const verf = verifyAccount(pubkpem, prefix, signature);
	console.log(verf);
	return verf;
}
//
const updateKnot = (knot, code, ref = false) => {
	//deconstruct
	const [prefix, sign] = code.split('.');
	const [prefix_prev, prev_sign] = knot.val.split('.');
	//
	const verf = verifyAccount(knot.pub, prefix, sign);
	if (verifyAccount(knot.pub, prefix, sign) && compareCode(prefix, prefix_prev)) {
		return {
			key: knot.key,
			ref: ref || knot.ref,
			val: code,
			pub: knot.pub,
			sec: knot.sec,
		}
	} else {
		//error
		throw new Error ('incorrect data!');
	}
}
//
const createCode = (pkeypem, {addr, send, pass}) => {
	const obj_bs64 = Buffer.from(JSON.stringify({addr, send, pass}), 'utf8').toString('base64');
	const signature = signAccount(pkeypem, obj_bs64);
	const code = obj_bs64 + '.' + signature;
	return code;
}
//
const createKnot = (addr, pubk, link, code) => {
	//
	try {
		//parse code
		const [prefix, sign] = code.split('.');
		//check data
		if (verifyAccount(pubk, prefix, sign) ) {
			return {
				key: addr,
				ref: link,
				val: code,
				pub: pubk,
				sec: `${Date.now()}`
			}
		}
		else throw new Error('incorrect signature!');
	} catch (err) {
		throw new Error (err);
	}
}
//
const parseLink = (link) => {
	const alink = link.split('/');
	let host = process.env.HOST;
	let name = alink[0];
	if (alink.length == 2) {
		host = alink[0];
		name = alink[1];
	}
	return [host, name];
}
//
const putServerSignal = (...opts) => 
	[...opts];
//
const addNote = (notes, order) => 
	notes.push(order);
//
const getNotes = (notes, access = false) => 
	notes.filter(note => (!note.lock|access));
//
const lockNote = (notes, item) => {
	return notes.map(note => {
		if (note.item == item) {
			const new_note = {
				item: note.item,
				line: note.line,
				icon: note.icon,
				text: note.text,
				lock: !note.lock
			};
			return new_note;
		}
		return note;
	})
}
//
const upNote = (notes, item) => {
	//
	let select = 0;
	notes.forEach((note, index) => {
		if (note.item == item && index) {
			select = index;
		} 
	});
	//
	if (select) {
		const rItem = notes[select - 1].item;
		notes[select - 1].item = item;
		notes[select].item  = rItem;
		notes.sort((a,b) => a.item - b.item);
		return notes;
	} else return false;
}
//
const downNote = (notes, item) => {
	//
	let select = 0;
	const size = notes.length;
	notes.forEach((note, index) => {
		if (note.item == item && index) {
			select = index;
		} 
	});
	//
	if (select < size - 1) {
		const rItem = notes[select + 1].item;
		notes[select + 1].item = notes[select].item;
		notes[select].item = rItem;
		notes.sort((a,b) => a.item - b.item);
		return notes;
	} else return false;
}
//
const rmvNote = (notes, item) => 
	notes.filter(note => note.item != item);
//get updcode 
const generateNewUpdCode = bytes => 
	crypto.randomBytes(bytes).toString('hex');
//
const confContact = (contact, id, conf = true) => 
	contact.map(v => { v.conf = (v.cardID === id) ? conf : v.conf; return v;});
const rmvContact = (contact, id) => 
	contact.filter(v => v.cardID != id);
//studio
const genKeyP = () => {
	const keypair = getKeyPair();
	return {pubkey: keypair.publicKey, privkey: keypair.privateKey};
};
//studio
const dataStringify = (data) => {
	data.notes.sort((a, b) => a.item - b.item);
	data.style.sort();
	const notesStr = md5(JSON.stringify(data.notes));
	const styleStr = md5(JSON.stringify(data.style));
	const dataStr = 
		md5(data.nick) +
		md5(data.photo) +
		md5(data.fname) +
		md5(data.intro) +
		notesStr +
		styleStr;
	return dataStr;
}
//studio
const genData = (opts) => {
	const patternNick = /^[a-zA-Z]{1}[_0-9a-zA-Z]{0,31}$/;
	if (!patternNick.test(opts.nick)) throw new Error ('incorrect Name!');
	return {
		nick: opts.nick,
		fname: opts.fname || "__default",
		photo: opts.photo || "__default",
		intro: opts.intro || "__default",
		notes: opts.notes || [],
		style: opts.style || [], 
	}
};
//studio
const genHead = (opts) => {
	const dataStr = dataStringify(opts.data);
	const signature = signAccount(opts.privkey, dataStr);
	return {
		host: opts.host || "127.0.0.1",
		pubk: opts.pubkey,
		sign: signature,
		hash: md5(dataStr),
		pass: "00000001",
		views: 0,
		nonce: 0,
		party: 0,
	}
};
//studio
const genHide = (opts) => {
	return {
		access: opts.hash_pwd,
		server: opts.hash_upd,
		string: opts.ciph_pwd,
		double: opts.ciph_upd,
		upcode: opts.up,
	}
};
//studio
const genList = () => {
	return [];
};
//
const passwdGuard = (pwd) => {
	const easy = "a-zA-Z0-9";
	const medium = "\\?_!@\\$#-+=";
	const hard = "\\.\\,\\&\\^\\%\\*";
	const regexp = new RegExp(`^[${easy}${medium}${hard}]*$`);
	if (!regexp.test(pwd)) return false;
	return true;
}
//timer
const calcPeriod = (seconds) => {
	const sec = (seconds*1);
	const now = Date.now()*1;
	return Math.floor((now - sec)/1000); //diff in seconds
} 
//
module.exports = {
	genesis: async({passwd}, {models}) => { // ok
		if (md5(passwd) === "d127bb3f46f10f366d3721953b5b5597") {
			const invite = await crypto.randomBytes(INVITE_BYTES).toString('hex');
			const place = await models.Place.create({
				invite: invite.toString(),
				upcode: "root",
				limit: 128,
				date: null
			});
			return place.invite;
		} else return '';
	},
	inherit: async({upcode}, {models}) => { // ok
		//get place by upcode
		const inherit = await inheritPlace(upcode, models);
		return inherit.invite;
	},
	addcard: async({name, pwd, code, text = false, hash = false}, {models, captcha}) => {
		//check captcha
		if (!text || !hash) throw new Error ("wrong data");
		if (!captcha.ver(text, hash)) throw new Error ("wrong captcha");
		//
		//const host = process.env.THIS_HOST;
		const keyp = genKeyP();
		//create address
		const address = skyaddr.generate(keyp.pubkey, NETWORK_MARK);
		//create data
		const data = genData({nick: name});
		//create head
		const head = genHead({data, privkey: keyp.privkey, pubkey: keyp.pubkey});
		//create access code
		const upd = crypto.randomBytes(8).toString('hex');
		//create hide
		//ciphered data
		const ciphPwd = keyPem.enckey(pwd, keyp.privkey);
		const ciphUpd = keyPem.enckey(upd, keyp.privkey);
		const hashPwd = await passWork.enter(pwd);
		const hashUpd = await passWork.enter(upd);
		//check by free place for registration
		//get place by upcode
		const inherit = await inheritPlace(code, models);
		if(!inherit) throw new Error('wrong upcode!!!');
		//check collusion
		const identify = md5(inherit.invite);
		const collusion_invt = await models.Card.findOne({address: identify});
		const collusion_name = await models.Card.findOne({"data.nick": name});
		if(collusion_invt || collusion_name) throw new Error ('collusion!!! name or upcode is exist!!!');
		//create hide partition
		const hide = genHide({
			hash_pwd: hashPwd, 
			hash_upd: hashUpd, 
			ciph_pwd: ciphPwd,
			ciph_upd: ciphUpd, 
			up: inherit.invite
		});
		//create list
		const list = genList();
		const card = {
			address,
			head,
			data,
			hide,
			list,
			conf: {
				notice: [{
					kind: "server",
					text: "Welcome to Skytacts",
					date: `${Date.now()}`,
					view: false,
				}],
				select: []
			}
		};
		try {
			//create card
			await models.Card.create(card);
		} catch (err) {
			throw new Error (err);
		}
		//create server message
		const jwtoken = jwt.sign({upd}, process.env.JWT_SECRET);
		const pack = putServerSignal("owner", true, jwtoken, 3, 4);
		//
		card.pack = pack;
		return card;
	},
	getcard: async({name, pubk = false, code = false, accs = false}, {models}) => {
		//get card
		const addr = pubk ? skyaddr.generate(keyPem.decpub(pubk), NETWORK_MARK) : false;
		const card = await models.Card.findOne({"data.nick": name}, {
			"_id": 0, 
		});
		if (!card) throw new Error ('name not exist!');
		//set permission
		let permission = (addr == card.address) ? "owner" : "guest";
		const friend = accs && verifyCode(card.head.pubk, accs);
		let trust = false;
		let list = card.list;
		//verified acces
		if (permission == "guest") {
			//update list
			list = (addr) 
				? card.list.map(v => {
					if (v.key == addr) {
						//set permission
						permission = "added";
						if (code && friend) {
							//
							let val = false;
							try { val = updateKnot(v, code); v = val; }
							catch (err) { val = false };
							trust = val ? true : false;
							return v;
						}
					}
					return v;
				})
				: card.list;		
		}
		//incrementing views
		const views = permission == "guest" ? ++card.head.views : card.head.views;
		try {
			//update views
			await models.Card.updateOne({ address: card.address }, {
				"head.views": views,
				"list": list,
			});
		} catch (err) {
			//error
			throw new Error (err);
		}
		//get notes
		const notes = getNotes(card.data.notes, trust);
		//create server signal
		const pack = putServerSignal(permission, false, 2, 3, card.hide.upcode);
		//set places of hypercard
		card.list = list;
		card.hide = {};
		card.data.notes = notes;
		card.pack = pack;
		return card;
	},
	athcard: async({name, pwd}, {models}) => {
		const card = await models.Card.findOne({"data.nick": name}, {"_id": 0, "conf": 0});
		if (!card) throw new Error ('name not exist!!!');
		//check password md5 or argon2
		await passWork.detect(pwd, card.hide.access);
		
		//check data
		const dataStr = dataStringify(card.data);
		const { sign, pubk } = card.head;
		//generate new update code
		const upd = generateNewUpdCode(UPDATE_BYTES);
		//update card
		const privateKey = keyPem.deckey(pwd, card.hide.string);
		card.hide.double = keyPem.enckey(upd, privateKey);
		//hashing by argon2
		const hashUpd = await passWork.enter(upd);
		//create argon2 hash
		try {
			await models.Card.updateOne({address: card.address}, {
				"hide.server": hashUpd,
				"hide.double": card.hide.double
			});
		} catch (err) {
			throw new Error (err);
		}
		//serevr side
		const jwtoken = jwt.sign({upd}, process.env.JWT_SECRET);
		//create server message
		const phrase = dataStr;
		const verf = verifyAccount(pubk, phrase, sign);
		const pack = putServerSignal("owner", verf, jwtoken, 3, 4);
		//put server message
		card.pack = pack;
		return card;
	},
	rmvcard: async({name, pwd}, {models, upd}) => {
		//get card
		const card = await models.Card.findOne({"data.nick": name});
		if (!card) throw new Error ('name not exist!!!');
		//check password for correct
		await passWork.detect(pwd, card.hide.access);
		await passWork.detect(upd, card.hide.server);
		//delete card
		try {
			//delerte one card
			const res = await models.Card.deleteOne({address: card.address});
			if (res) return card;
			else throw new Error ('check address!!!');
		}
		catch (err) {
			//error with delete
			console.log(err); 
		}
	},
	contact: async({name, pubk, link, code}, {models}) => {
		const publicKey = keyPem.decpub(pubk);
		//
		const card = await models.Card.findOne({"data.nick" : name}, {
			"_id": 0
		});
		if (!card) throw new Error ("this name not exist!");
		//add note from list
		const [host, nick] = parseLink(link);
		const addr = skyaddr.generate(publicKey, NETWORK_MARK);
		const knot = createKnot(addr, publicKey, host + '/' + nick, code);
		const size = card.list.length || 0;
		let isExist = false;
		let list = card.list.map(v => {
			if (v.key == knot.key) {
				isExist= true;
				return knot;
			} 
			return v;
		});
		if (isExist == false) {
			//set new knot
			list.unshift(knot);
			//push notice
			card.conf.notice.unshift({
				kind: "server",
				text: `#${nick} отметился на странице!`,
				view: false,
				date: `${Date.now()}`,
			});
		}
		//update data
		try {
			//
			const party = !isExist ? ++card.head.party : card.head.party;
			await models.Card.updateOne({address: card.address}, {
				"head.party": party,
				"list": list,
			});
		} catch (err) {
			//
			console.log(err);
			throw new Error (err);
		}
		//
		return true;
	},
	usecard: async({name}, {models, upd}) => {
		//
		const card = await models.Card.findOne({"data.nick": name}, {
			"_id": 0, 
			"conf": 0,
		});
		if (!card) throw new Error ('name not exist!!!');
		//check password
		const answ = await passWork.detect(upd, card.hide.server);
		if (!answ || !card.hide.server) 
			throw new Error ('incorrect passowrd!!!');
		//
		const dataStr = dataStringify(card.data);
		//serevr side
		const jwtoken = jwt.sign({upd}, process.env.JWT_SECRET);
		//create server message
		const pubk = card.head.pubk;
		const sign = card.head.sign;
		const phrase = dataStr;
		const verf = verifyAccount(pubk, phrase, sign);
		const pack = putServerSignal("owner", verf, jwtoken, 3, 4);
		//put server message
		card.pack = pack;
		return card;
	},
	outcode: async({name}, {models, upd}) => {
		//
		const card = await models.Card.findOne({"data.nick": name}, {
			"address": 1,
			"hide.server": 1,
			"hide.double": 1,
		});
		if (! card) throw new Error ('card not exist!!!');
		const answ = await passWork.verify(upd, card.hide.server);
		if (!answ || !card.hide.server) throw new Error ('permission denied!');
		try {
			await models.Card.updateOne({address: card.address}, {
				"hide.server": "",
				"hide.double": ""
			})
		} catch (err) {
			throw new Error (err);
		}
		return true;
	},
	updcode: async({name}, {models, upd}) => {
		//
		const card = await models.Card.findOne({"data.nick": name}, {
			"address": 1,
			"hide.server": 1,
			"hide.double": 1,
		});
		if (! card) throw new Error ('card not exist!!!');
		//check upd access
		if (!card.hide.server) 
			throw new Error ('permission denied!');
		//check password
		await passWork.detect(upd, card.hide.server);
		//update access
		const new_upd = generateNewUpdCode(UPDATE_BYTES);
		const pkeypem = keyPem.deckey(upd, card.hide.double);
		const ndouble = keyPem.enckey(new_upd, pkeypem);
		const servers = passWork.enter(new_upd);
		try {
			//update card
			await models.Card.updateOne({address: card.address}, {
				"hide.server": servers,
				"hide.double": ndouble
			})
		} catch (err) {
			throw new Error (err);
		}
		const jwtoken = jwt.sign({upd: new_upd}, process.env.JWT_SECRET);
		return jwtoken;
	},
	updcard: async({name, param, data}, {models, upd}) => {
		//
		const card = await models.Card.findOne({"data.nick": name}, {
			"address" : 1,
			"head": 1,
			"hide.server": 1,
			"hide.double": 1,
			"data": 1
		});
		//check permission
		if (!card) throw new Error ('card not exist!!!');
		if (!card.hide.server) throw new Error ('permission denied!');
		await passWork.detect(upd, card.hide.server);
		//update card local
		const info = card.data;
		if (param in info) {
			info[param] = data;
		} else {
			throw new Error ('this key not exist from the object.')
		}
		const dataStr = dataStringify(info);
		const pkeypem = keyPem.deckey(upd, card.hide.double);
		const signature = signAccount(pkeypem, dataStr);
		try {
			//update db
			await models.Card.updateOne({address: card.address}, {
				"head.sign": signature,
				"head.hash": md5(dataStr),
				"data": info,
			});
		} catch (err) {
			throw new Error (err);
		}
		return true;
	},
	addnote: async({name, input}, {models, upd}) => {
		//
		const card = await models.Card.findOne({"data.nick": name}, {
			"address" : 1,
			"head": 1,
			"hide.server": 1,
			"hide.double": 1,
			"data": 1
		});
		//check permission
		if (!card) throw new Error ('card not exist!!!');
		if (!card.hide.server) throw new Error ('permission denied!');
		await passWork.detect(upd, card.hide.server);
		//update card local
		const notes = card.data.notes;
		if (notes.length > 37) throw new Error ('Error: max number of notes!')
		notes.push({
			item: ++card.head.nonce,
			icon: input.icon,
			line: input.line,
			text: input.text,
			lock: input.lock
		});
		const data = card.data;
		data.notes = notes;
		const dataStr = dataStringify(data);
		const pkeypem = keyPem.deckey(upd, card.hide.double);
		const signature = signAccount(pkeypem, dataStr);
		try {
			//update db
			await models.Card.updateOne({address: card.address}, {
				"head.sign": signature,
				"head.nonce": card.head.nonce,
				"head.hash": md5(dataStr),
				"data": data,
			});
		} catch (err) {
			throw new Error (err);
		}
		return card.head.nonce;
	},
	updnote: async({name, item, act}, {models, upd}) => {
		//
		const card = await models.Card.findOne({"data.nick": name}, {
			"address" : 1,
			"head": 1,
			"hide.server": 1,
			"hide.double": 1,
			"data": 1
		});
		//check permission
		if (!card) throw new Error ('card not exist!!!');
		if (!card.hide.server) throw new Error ('permission denied!');
		await passWork.detect(upd, card.hide.server);
		//update card
		let notes = false;
		switch (act) {
			case "lock": 
			notes = lockNote(card.data.notes, item);
			break;
			case "up": 
			notes = upNote(card.data.notes, item);
			break;
			case "down": 
			notes = downNote(card.data.notes, item);
			break;
			case "remove": 
			notes = rmvNote(card.data.notes, item);
			break;
		}
		if (!notes) throw new Error ("get incorrect action!");
		const data = card.data;
		data.notes = notes;
		const dataStr = dataStringify(data);
		const pkeypem = keyPem.deckey(upd, card.hide.double);
		const signature = signAccount(pkeypem, dataStr);
		try {
			await models.Card.updateOne({address: card.address}, {
				"head.sign": signature,
				"head.hash": md5(dataStr),
				"data": data,
			});
		} catch (err) {
			throw new Error (err);
		}
		return notes;
	},
	updsign: async({name, address}, {models, upd}) => {
		//
		const card = await models.Card.findOne({"data.nick": name}, {
			"address" : 1,
			"head": 1,
			"hide.server": 1,
			"hide.double": 1,
			"conf.select": 1
		});
		//encode pubkey for sending
		const pubkey = keyPem.encpub(card.head.pubk);
		if (card.address == address) return [pubkey, ""];
		if (!card) throw new Error ('card not exist!!!');
		//
		if (!card.hide.server || ! await passWork.verify(upd, card.hide.server)) return [pubkey, ""];
		//
		if (card.head.pass == undefined) return ["", ""];
		if (card.hide.double == undefined) return ["", ""];
		//
		const pass = incrementPass(card.head.pass);
		const pkeypem = keyPem.deckey(upd, card.hide.double);
		const code = createCode(pkeypem, {addr: card.address, send: address, pass});
		//
		try {
			await models.Card.updateOne({address: card.address}, {
				"head.pass": pass,
			});
		} catch (err) {
			throw new Error (err);
		}
		//
		return [pubkey, code];
	},
	updpass: async({name, pwd, updpwd}, {models, upd}) => {
		//
		if (updpwd.length < 8 || !passwdGuard(updpwd) || updpwd.length > 256) 
			throw new Error ("new password have incorrect symbols!");
		//
		const card = await models.Card.findOne({"data.nick": name}, {
			"address": 1,
			"head": 1,
			"hide": 1,
		});
		//check exist
		if (!card) throw new Error ("card not exist!");
		//check permission
		if (!card.hide.server || ! await passWork.verify(upd, card.hide.server)) throw new Error ('permission denied!');
		if (!pwd) throw new Error ('permission denied!');
		await passWork.detect(pwd, card.hide.access);
		//update card
		const privateKey = keyPem.deckey(pwd, card.hide.string);
		card.hide.string = keyPem.enckey(updpwd, privateKey);
		const hashAccess = await passWork.enter(updpwd);
		//
		try {
			await models.Card.updateOne({"address" : card.address}, {
				"hide.access": hashAccess,
				"hide.string": card.hide.string
			});
		} catch (err) {
			throw new Error (err);
		}
		return true;
	},
	deliver: async({name, mail}, {models, deliver}) => {
		//
		console.log(name, mail);
		const card = await models.Card.findOne({"data.nick": name}, {
			"address": 1,
			"hide": 1,
		});
		//
		if (!card) throw new Error ("card not exist!");
		//send code to mail
		try {
			const code = await deliver(mail);
			const ciph_code = await passWork.enter(code);
			await models.Card.updateOne({"address": card.address}, {
				"hide.letter": ciph_code, //set code
				"hide.period": `${Date.now()}`, //set timer
			});
		} catch (err) {
			throw new Error(err);
		}
		return true;
	},
	updmail: async({name, mail, code}, {models, upd}) => {
		//
		const card = await models.Card.findOne({"data.nick": name}, {
			"address": 1,
			"hide": 1,
		});
		//
		if (! card) throw new Error ("card not exist!");
		// check updcode
		const verifyUpd = await passWork.verify(upd, card.hide.server);
		if (! verifyUpd) throw new Error("permission denied!");
		// check code
		const verifyLetter = await passWork.verify(code, card.hide.letter);
		if (!verifyLetter || calcPeriod(card.hide.period) > 161) throw new Error ("code is not available now!");
		// registrate new mail address
		const pkeypem = keyPem.deckey(upd, card.hide.double);
		const protect = Buffer.from(mail + (process.env.PROTECT_SALT), 'utf8');
		const ciphText = keyPem.enckey(protect, pkeypem);
		// hashing
		const emailHash = await passWork.enter(mail);
		try {
			await models.Card.updateOne({"address": card.address}, {
				"hide.reciev": emailHash,
				"hide.impart": ciphText,
				"hide.letter": ""
			})
		} catch (err) {
			throw new Error (err);
		}
		//
		return mail;
	},
	recover: async({name, mail, code, npwd}, {models}) => {
		// check pwd
		if (npwd.length < 8 || !passwdGuard(npwd) || npwd.length > 256) throw new Error ("wrong password!");
		//
		console.log(name);
		const card = await models.Card.findOne({"data.nick": name}, {
			"address": 1,
			"hide": 1,
		});
		// name not exist
		if (!card) throw new Error ("card not exist!");
		// code is invalid
		const verifyLetter = await passWork.verify(code, card.hide.letter);
		const verifyEmail = await passWork.verify(mail, card.hide.reciev);
		if (!verifyLetter || calcPeriod(card.hide.period) > 161) throw new Error ("code is not available now!");
		if (!verifyEmail) throw new Error ('permission denied');
		// change code
		try {
			// decipher
			const protect = Buffer.from(mail + (process.env.PROTECT_SALT), 'utf8');
			const pkeypem = keyPem.deckey(protect, card.hide.impart);
			const ciphText = keyPem.enckey(npwd, pkeypem);
			// hashing
			const passwd_hash = await passWork.enter(npwd);
			try {
				await models.Card.updateOne({"address": card.address}, {
					"hide.access": passwd_hash,
					"hide.string": ciphText,
					"hide.letter": ""
				});
			} catch (err) {
				// catch error
				throw new Error (err);
			}
		} catch (err) {
			return false;
		}
		return true;
	},
}
