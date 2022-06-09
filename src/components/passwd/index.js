const crypto = require('crypto');
const md5 = require('md5');
//argon hashing libs
const argon2 = require('argon2');
//prefix for hash
const detail = '$argon2i$v=19$m=4096,t=3,p=1$';
//detect error 
const detect = async (pwd, hash) => {
	try {
		if (await argon2.verify(hash, pwd)) {
			return Promise.resolve(true);
		} else {
			throw new Error ("permission denied!!!");
		}
	} catch (err) {
		throw new Error(err);
	}
};
//verify only by argon2
const verify = async (pwd, hash) => {
	try {
		if (await argon2.verify(hash, pwd)) {
			return true;
		} else {
			return false;
		}
	} catch (err) {
		throw new Error(err);
	}
}
//get hash
const enter = async (text) => {
	try {
		const hashString = await argon2.hash(text);
		return hashString;
	} catch (err) {
		throw new Error (err);
	}
}

module.exports = {
	detect,
	verify,
	enter
};
