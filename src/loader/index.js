const crypto = require('crypto');
const fs = require('fs');
//
const friteToFile = (base, name) => new Promise ((resolve, reject) => {
	//
	const base64Data = base.replace(/^data:(image\/png|image\/jpeg|image\/jpg|image\/svg\+xml);base64,/, "");
	const path = __dirname + "/../../cloud/" + name;
    fs.writeFile(path, base64Data, 'base64', function(err) {
        if(err){
           reject(err);
         } else {
         	resolve(name);
         }
    });
});
//
const detectFormat = (base) => {
	const formatDetect = new RegExp("data:(image\\/png|image\\/jpeg|image\\/jpg|image\\/svg\\+xml);base64,");
	try {
		const format = base.match(formatDetect)[1];
		let post = false;
		switch (format){
			case "image/png": return ".png"
			break;
			case "image/jpeg": return ".jpeg"
			break;
			case "image/jpg": return ".jpg"
			break;
			case "image/svg+xml": return ".svg"
		}
		throw new Error ("incorrect type");
	} catch (err) {
		return false;
	}
}
//
const loader = async (base, name = false) => {
	const format = detectFormat(base);
	if (!format) return Promise.reject("type of file may be only: png, jpeg/jpg, svg!");
	const filename = (name || crypto.randomBytes(4).toString('hex') + '_' + Date.now()) + format;
	//
	try {
		const result = await friteToFile(base, filename);
		return result;
	} catch (err) {
		return Promise.reject(err);
	}
}
//
module.exports = loader;
