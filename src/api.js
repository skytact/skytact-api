
//include necessary libs
const express = require('express');
const path = require('path');
const cors = require('cors');
const { graphqlHTTP } = require('express-graphql');
const jwt = require('jsonwebtoken');

//include config file
require('dotenv').config();

//
const db = require('./db');
const models = require('./models');
const schema = require('./api-schema');
const root = require('./resolvers');
const mailer = require('./mailer');
const captcha = require('./captcha');

//
const DB_HOST = process.env.DB_HOST;
db.connect(DB_HOST);

//
const port = process.env.PORT || 4747;

//use app
const app = express();

//enable cors
app.use(cors());

//it has being verify token
const getUser = token => {
	if (token) {
		try {
			//
			return jwt.verify(token, process.env.JWT_SECRET);
		} catch (err) {
			//
			throw new Error('Session invalid');
		}
	}
}


//api testing
app.use('/api', graphqlHTTP((req, res) => {
	const jwtoken = req.headers.authorization;
	const upd = jwtoken ? jwt.verify(jwtoken, process.env.JWT_SECRET).upd : '';
	//console.log(req.headers);
	const deliver = mailer || (f=>f);
	return {
		schema,
		rootValue: root,
		graphiql: true,
		context: { models, upd, deliver, captcha},
	}
}));

//try  listening
module.exports = app;
