const md5 = require('md5');
const mongoose = require('mongoose');
const sequenceMaker = require('sequence-maker');
const crypto = require('crypto');
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

const sequence = new sequenceMaker();

const generation = (models) => {
	
}
