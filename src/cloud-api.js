//include necessary libs
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const { graphqlHTTP } = require('express-graphql');
const jwt = require('jsonwebtoken');
const md5 = require('md5');
const passWork = require('./components/passwd');

//include config file
require('dotenv').config();

//elements of cloud system
const db = require('./db');
const models = require('./models');
const loader = require('./loader');

//db host from .env
const DB_HOST = process.env.DB_HOST;
db.connect(DB_HOST);

//listening port
const port = 4748;

//use app
const app = express();

//enable cors
//app.use(bodyParser.json());
app.use(cors());

//enable auto access to images
app.use('/view', express.static(__dirname + "/../cloud"));

//get access for upload photo
const userValidation = async (name, upd) => {
	const card = await models.Card.findOne({"data.nick": name}, {
		"address": 1,
		"hide.server" : 1
	});
	if (!card) throw new Error('this name not exist!');
	if (await passWork.verify(upd, card.hide.server)) return card.address;
	else throw new Error('permission denied!');
}
//update photo url from db
const userUpdatePhoto = async (address, filename) => {
	try {
		await models.Card.updateOne({"address": address}, {
			"data.photo": filename,
		});
		return true;
	} catch (err) {
		throw new Error (err);
	}
}

//upload image
app.post('/load', async (req, res) => {
	let loadedImgBase64 = '';
	let destroyed = false;
	req.on('data', (data) => {
		//
		loadedImgBase64 += data;
		if (loadedImgBase64.length > 1e6) {
			destroyed = true;
			req.connection.destroy();
		}
	});
	req.on('end', async () => {
		if (destroyed) return;
		const jwtoken = req.headers.authorization;
		const name = req.headers.byuser;
		//get token
		try {
			const upd = jwtoken ? jwt.verify(jwtoken, process.env.JWT_SECRET).upd : '';
			//validate name and get address
			const address = await userValidation(name, upd);
			//get loaded file
			const filename = await loader(loadedImgBase64, address);
			//update user card
			const update = await userUpdatePhoto(address, filename);
			//send filename
			res.send({data: filename});
		} catch (err) {
			console.log(err);
			res.send({error: err});
		}
	});
});

//try  listening
module.exports = app;
