const captcha = require('svg-captcha');
const crypto = require('crypto');
const fs = require('fs');
const md5 = require('md5');
//
require('dotenv').config();
//get CAPTCHA salt
const CAPTCHA_SALT = process.env.CAPTCHA_SALT || "";

const createCaptcha = async (size = 5) => {
	captcha.options.width = 120;
	captcha.options.height = 40;
	captcha.options.charPreset =  "abcdefhikmnorstuvwxz023456789";
	const res = captcha.create({size, color: false});
	const buf = Buffer.from(res.data);
	const base64Url = 'data:image/svg+xml;base64,' + buf.toString('base64');
	return { text: md5(res.text + CAPTCHA_SALT), svg: base64Url };
}

const verifyCaptcha = (text, hash) => {
	return md5(text + CAPTCHA_SALT) === hash;
}

module.exports = { gen: createCaptcha, ver: verifyCaptcha };
