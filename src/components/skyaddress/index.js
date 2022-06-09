const crypto = require('crypto');
//set encodeing base58
const BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
const base = require('base-x')(BASE58);

module.exports.generate = (rsaPubKeyPem, prefix = '1d') => {
	//parse key
	const pred = '-----BEGIN RSA PUBLIC KEY-----\n';
	const post = '\n-----END RSA PUBLIC KEY-----\n';
	const pkey = rsaPubKeyPem.substr(pred.length, rsaPubKeyPem.length - (pred.length + post.length));
	const part1 = pkey.substr(0, 64);
	const part2 = pkey.substr(64);
	const part1buf = Buffer.alloc(64, part1, 'base64');
	const part2buf = Buffer.alloc(64, part2, 'base64');
	//generate hash
	const hash_rmd = crypto.createHash('rmd160');
	const hash = crypto.createHash('sha256');
	hash.update(part2buf.toString('utf8'));
	hash.update(part1buf.toString('utf8'));
	hash_rmd.update('---skytacts---' + hash.copy().digest('utf8'));
	const result = base.encode(Buffer.from(prefix + hash_rmd.digest('base64'), 'utf8'));
	return result;
}
