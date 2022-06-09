const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const assert = require('assert').strict;
const supertest = require('supertest');
const md5 = require('md5');
const {
	verifyAccount
} = require('../src/components/ciphro');

require('dotenv').config();
//prepare data to sign
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

const testPlace = {
	invite: "0123456789abcdef",
	upcode: "__none",
	limit: 2,
	date: Date.now(),
}

//card for tests
const testCard = {
	address: 'aaaa1111bbbb2222',
	head: {
		host: '127.0.0.1',
		sign: 'XJQoeujUrYZE+K/ke9npQ1I5XkgJeGNodiMbjqAUkqdwwy6MDEdC3eDLkJta57yuKfqPi1S/L0CKicc7f9EqRQ==',
		hash: '62317e7aa6d2d932c7eed59f8fc4e830',
		pubk: '-----BEGIN RSA PUBLIC KEY-----\nMEgCQQDAuYoW/71Kr5qrZH8RfK5fycMHajN1JsO6EdKV3hE5w/0rMU8uBVkQVydM5QCq/fwPi+IBdLg5TjAu/myEIRAtAgMBAAE=\n-----END RSA PUBLIC KEY-----',
		views: 0,	
	},
	data: {
		nick: "justtest",
		photo: "__default",
		fname: "__default",
		intro: "__default",
		notes: [
			{
				item: 1,
				icon: "text",
				line: "this is my first note!!!",
				text: "add me, please(((",
				lock: false,
			},
			{
				item: 2,
				icon: "phone",
				line: "+79605293132",
				text: "это мой номер телфона, запомни его!",
				lock: true,
			}
		],
		style: [
			"background-color:#f0f0f2", 
			"text-color:#541f12", 
			"title-color:#ff1166"
		],
	},
	hide: {
		access: '345b1c8cd362280c5b575cc2e504ca35',
		server: '4ac7d0ff3b45f8df716e54c64104bd2e',
		string: 'IcnAIli/Norvht9sHPxir5l1yqD/S9NpDIYOzMDKl+79wAhiVGza2oGQDF7TjhJpWk7+6SNQb7i9ac3Z89NbmSv6tdQSiKweVE8ZWKrYKIHxv/JfSeKblaMX0YysS3Cv2BfC+lfxJoFzCK7CGKfYFEYBYZIO2KrTf90qShr/qfE4zswsl0o3rmiJ85diJbezELlMShJ/sD7V0nETSL78tbP2nCm98i/HN2T0QivzGw3bXEU1kQQl0UvKFglyShysUAxQSthV1D1mMXd0JVT5vu38WZ5qbg3Edq3a85n9SLFdfptXF0UHmlJyczpJIfXtAqkPYaG7sxmmEInyuj3gS15NjylO6OEXomSHUCC0kjT8j2CjjgKIIjfiInACQnpOOrz5rIao+AlhKggibyMHhi9g48ETScBhh8SmRvX7h56OMeTR2lRKoftcpw0iacRcfdnIpbYcw45KCndbB/GW0gg7BU5seOWbep4sEy9p9YjpHRqpVfI+5xwGp2tj9N6Re6dw3Nusfg8GWLktllMkKddmHlfqFlSZxTI/4Yv5AINWfGZJ4XRciIZx591z3Af/I6eI9Eflr2/O6J9wDqb8ZnG+JHNOUgr8hpoPMoaOmt1BFOpY9IJqA2VIl3oo/ML1',
		double: 'fSQdP6/mwhCmIb0kpdIjXfw6OKfedZPMQJIQ5CaWBCI4oTdJpI9JSB0JrX6YSL1vNXG8NT6qxXMpb6iWLYcdFSu/BV+AdHcYdThXoyS862u4iwfoCSnzDOTM96HL/QPpBOI5jlGrnWG8674srHTkknzkWvtOOxv2WiIeC0EM7R/lVziivJba5ZCZ09bULYvmxwIBQoB59DN6AXleESNgauKcrTt0rr3VkRfMSKsVRBYn2ZdvXajwzn4Rf/5jqWdBRtx5Yd9P4ZYsJJQRcBaMSph2kC4R/10mks5WATaoAAKoTj7J0CS383cTSJ2z9rblcGQvoKHmAVcvkwHNEYCbQBaucxmrMisW+2GKAdeiku/TXjCHyX7SvLBC8Ve4s4QKGh51ICmhnXpdWbSIAh7EGqHPDrdHrdoq26UreudSxhxdwhdl4UFgiNzWHsbNzluuuaA30ijw75eBADOKQ3iVg/t5AJi65H4VCUWzxwCqXtOLywGBJXLb3pG/iOioeFiqepLiriAjhaHHWCEXjedb4Fs0u4xeGktUZF5sjBPjJjVaVyBc0LDfGgTZLyQKn+LfPyWhf3NjPPTfckg+xZIOU5f81VoCd0FQNenL5DiLnEAowQlPY/P45AD0eJ5sO1Wv',
		upcode: '0123456789abcdef',
	},
	list: [{
		sender: "asas1234asas1234",
		reciev: "aaaa1111bbbb2222",
		link: '1.1.1.1/turbocard',
		hash: md5('{turbocard,__default,__default,__default}'),
		sign: '12213b12312321f3g12fg21f3rg23gr12dgr213fg123g123g21c3g',
		date: Date.now(),
	}],
	conf: {
		select: [{
			address: 'asas1234asas1234',
			link: '1.1.1.1/turbocard',
			hash: md5('{turbocard,__default,__default,__default}'),
			accs: 'qwerty123',
			sign: 'XJQoeujUrYZE+K/ke9npQ1I5XkgJeGNodiMbjqAUkqdwwy6MDEdC3eDLkJta57yuKfqPi1S/L0CKicc7f9EqRQ==',
		}, {
			address: 'qwerty12qwerty12',
			link: '127.0.0.1/kucard',
			hash: md5('{kucard,__default,__default,__default}'),
			accs: '18925533',
			sign: '12eddwadaedwdwadascawdwadsqweacsefijisrjvisjcemjcbayd',
		}],
		notice: [{
			kind: "server",
			text: "Welcome here",
			date: Date.now(),
			view: false,
		}],
	}
}
//


//query group
describe('Query tests', function () {
	//create 
	const db = require('./db-test');
	const schema = require('../src/api-schema');
	const models = require('../src/models');
	const root = require('../src/resolvers');

	//init app
	let app;
	//init server token
	let token;

	//before testing start server and connect to db
	before(async () => {
		//set connection
		const DB_HOST_TEST = process.env.DB_HOST_TEST;
		await db.connect(DB_HOST_TEST);
		//activating server
		app = express();
		app.use('/api-test', graphqlHTTP((req, res) => {
			token = req.headers.authorization;
			const upd = 'ce7928ab9ad71155';
			return {
				schema,
				rootValue: root,
				graphiql: false,
				context: { models, upd }
			}
		}));
		
		//
		const card = await models.Card.create(testCard);
		const place = await models.Place.create(testPlace);
	});

	//after testing clear db and exit from process
	after(async () => {
		await models.Place.deleteMany({});
		await models.Card.deleteMany({});
		//close connection
		await db.close();
		//exit from process
		process.exit;
	});

	//first test
	it('connect', (done) => {
		const answer = 200;
		supertest(app)
			.post('/api-test')
			.send({query : "{ connect }"})
			.end(function (err, res) {
				if (err) return done(err);
				if (res.body.data.connect != 200) {
					return done('incorrect answer!');
				}
				return done();
			});
	});

	//
	it('places', (done) => {
		const passwd = process.env.ADMIN_TEST;
		query = `{ places(passwd: "${passwd}") }`;
		supertest(app)
			.post('/api-test')
			.send({query})
			.end(function (err, res) {
				if (err) return done(err);
				if (res.body.data.places == -1) {
					throw new Error ('incorrect passwd')
				}
				done();
			});
	});

	//
	it('isfree', (done) => {
		query = `{ isfree(upcode: "0123456789abcdef") }`;
		supertest(app)
			.post('/api-test')
			.send({query})
			.end(function (err, res) {
				if (err) return done(err);
				if (res.body.data == undefined) {
					throw new Error ('error')
				}
				if (res.body.data.isfree != true) {
					throw new Error ('incorrect answer!')
				}
				done();
			});
	});

	//
	it('overlap', (done) => {
		const query = `
			{
				overlap (name: "${testCard.data.nick}")
			}
		`;
		supertest(app)
			.post('/api-test')
			.send({query})
			.end((err, res) => {
				if (err) return done(err);
				if (res.body.data.overlap != true) {
					return done("name doesn't match with answer");
				}
				return done();
			});
	});

	//
	it('getlink', (done) => {
		const query = `{ getlink (address: "${testCard.address}") }`;
		const answer = "justtest";
		supertest(app)
			.post('/api-test')
			.send({ query })
			.end(function (err, res) {
				if (err) return done(err);
				if (res.body.data.getlink != answer) {
					return done("name doesn't match with answer");
				}
				return done();
			});
	});
})
