const crypto = require('crypto');
const buffer = require('buffer');
const md5 = require('md5');

//generate key pair
const getKeyPair = () => {
	try {
		const keypair = crypto.generateKeyPairSync('rsa', {
		 	modulusLength: 512,
		 	publicExponent: 0x10001,
		 	publicKeyEncoding: {
		 		type: 'pkcs1',
		 		format: 'pem',
		 	},
		 	privateKeyEncoding: {
		 		type: 'pkcs8',
		 		format: 'pem',
		 	}
		});
		return keypair;
	} catch (err) {
		throw new Error(err);
	}
}

const signAccount = (seckeypem, phrase, alg = "SHA256") => {
	//create keyObject
	const keyObj = crypto.createPrivateKey(seckeypem);
	//buffer type
	const data = Buffer.from(phrase);
	
	//create Sign object
	const sign = crypto.createSign(alg);
	sign.write(data);
	sign.end();
	const signature = sign.sign(keyObj, 'base64');
	//get signature
	return signature;
}

const verifyAccount = (pubkeypem, phrase, sign, alg = "SHA256") => {
	//create key object
	const keyObj = crypto.createPublicKey(pubkeypem);
	//get buffered data
	const data = Buffer.from(phrase);
	
	//create Sign object
	const verify = crypto.createVerify(alg);
	verify.write(data);
	verify.end();
	const verified = verify.verify(keyObj, sign, 'base64');
	//catch result
	return verified;
}

const checkPassword = (password, sign) => {
	//checking by logical function
	return md5(password) == sign;
}

const generateKeyByPassword = (password, salt) => {
	try {
		//
		const key = crypto.scryptSync(password, salt, 24, { N:512 });
		return key;
		
	} catch (err) {
		//
		throw new Error(err);
	}
}

const encryptPhrase = (password, phrase, encoding = 'base64', salt = '1"3$_6v*') => {
	try {
		//
		const algorithm = 'aes-192-cbc';
		const key = generateKeyByPassword(password, salt);
		const iv = Buffer.from(md5(password), 'hex');
		const cipher = crypto.createCipheriv(algorithm, key, iv);
		let value = cipher.update(phrase);
		value = Buffer.concat([value, cipher.final()]);
		//
		return {iv: iv.toString('hex'), value:value.toString(encoding)};
	} catch (err) {
		throw new Error(err);
	}
}

const decryptPhrase = (password, phrase, encoding = 'base64', salt = '1"3$_6v*') => {
	try {
		//
		const algorithm = 'aes-192-cbc';
		const key = generateKeyByPassword(password, salt);
		const iv = Buffer.from(md5(password), 'hex');
		const decipher = crypto.createDecipheriv(algorithm, key, iv);
		//get decrypted
		const decrypt = Buffer.concat([decipher.update(Buffer.from(phrase, encoding)), decipher.final()])
		//to Buffer
		return decrypt;
	} catch (err) {
		throw new Error(err);
	}
}

module.exports = {
	getKeyPair,
	signAccount,
	verifyAccount,
	checkPassword,
	generateKeyByPassword,
	encryptPhrase,
	decryptPhrase
}
