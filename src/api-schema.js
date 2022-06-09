const { buildSchema } = require('graphql');

const schema = buildSchema(`
	type Place {
		invite: String!
		upcode: String!
		limit: Int!
		date: String!
	}

	type HEAD {
		host: String!
		sign: String!
		hash: String!
		pubk: String!
		pass: String!
		views: Int!
		nonce: Int!
		party: Int!
	}

	type Note {
		item: Int!
		icon: String!
		line: String!
		text: String
		lock: Boolean!
	}

	type DATA {
		nick: String!
		photo: String!
		fname: String!
		intro: String!
		notes: [Note!]
		style: [String!]
	}

	type Income {
		key: String!
		ref: String!
		val: String!
		pub: String!
		sec: String!
	}

	type Select {
		address: String!
		link: String! 
		accs: String
		sign: String!
	}

	type Notice {
		kind: String!
		text: String!
		date: String!
		view: Boolean!
	}

	type HIDE {
		access: String!
		server: String!
		string: String!
		double: String!
		upcode: String!
	}

	type HyperCard {
		address: String!
		head: HEAD
		data: DATA
		list: [Income!]
		pack: [String!]
	}

	input uNote {
		icon: String!
		line: String!
		text: String
		lock: Boolean!
	}

	type Captcha {
		text: String!
		svg: String!
	}

	type Query {
		connect: Int!
		places(passwd: String!): Int!
		isfree(upcode: String!): Boolean!	

		captcha: Captcha!
		overlap(name: String!): Boolean!
		getlink(address: String!): String!
		getaddr(name: String!): String!
		getaccs(name: String!, address: String!): String!
		authorized(name: String!): Boolean!
	}

	type Mutation {
		genesis(passwd: String!): String!
		inherit(upcode: String!): String!
		
		addcard(name: String!, pwd: String!, code: String!, text: String!, hash: String!): HyperCard!
		getcard(name: String!, pubk: String, code: String, accs: String): HyperCard!
		athcard(name: String!, pwd: String!): HyperCard!
		rmvcard(name: String!, pwd: String!): HyperCard!
		contact(name: String!, pubk: String!, link: String!, code: String!): Boolean!
		deliver(name: String!, mail: String!): Boolean!
		recover(name: String!, mail: String!, code: String!, npwd: String!): Boolean!
		
		usecard(name: String!): HyperCard!
		outcode(name: String!): Boolean!
		updcode(name: String!): String!
		updcard(name: String!, param: String!, data: String!): Boolean!
		updnote(name: String!, item: Int!, act: String!): [Note!]
		addnote(name: String!, input: uNote): Int!
		updsign(name: String!, address: String!): [String!]
		updpass(name: String!, pwd: String!, updpwd: String!): Boolean!
		updmail(name: String!, mail: String!, code: String!): String!
	}
`);
module.exports = schema;
