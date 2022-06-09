//get encrypt/decrypt functions
const { encryptPhrase, decryptPhrase } = require('../ciphro');
//set encoding for public key
const BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
const base = require('base-x')(BASE58);
//public key work
//userkey
const encodePublicKey = (rsaPubKeyPem) => {
	//parse key
	const pred = '-----BEGIN RSA PUBLIC KEY-----\n';
	const post = '\n-----END RSA PUBLIC KEY-----\n';
	const pkey = rsaPubKeyPem.substr(pred.length, rsaPubKeyPem.length - (pred.length + post.length));
	return base.encode(Buffer.from(pkey, 'utf8'));
}
//userkey
const decodePublicKey = (encodeKey) => {
	//decoding
	const pkey = Buffer.from(base.decode(encodeKey), 'utf8').toString();
	const pred = '-----BEGIN RSA PUBLIC KEY-----\n';
	const post = '\n-----END RSA PUBLIC KEY-----\n';
	return pred + pkey + post;
} 
//private key work
//userkey
const encryptPrivateKeyPem = (pwd, privateKey) => {
	const pred = '-----BEGIN PRIVATE KEY-----\n';
	const post = '\n-----END PRIVATE KEY-----\n';
	const pkey = privateKey.substr(pred.length, privateKey.length - (pred.length + post.length));
	return encryptPhrase(pwd, pkey).value;
}
//userkey
const decryptPrivateKeyPem = (pwd, cipherkey) => {
	const pred = '-----BEGIN PRIVATE KEY-----\n';
	const post = '\n-----END PRIVATE KEY-----\n';
	return pred+decryptPhrase(pwd, cipherkey).toString()+post;
}
//export object
module.exports = {
	encpub: encodePublicKey,
	decpub: decodePublicKey,
	enckey: encryptPrivateKeyPem,
	deckey: decryptPrivateKeyPem
}
