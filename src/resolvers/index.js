const Query = require('./query.js');
const Mutation = require('./mutation.js');
const root = Object.assign({}, Query, Mutation);
module.exports = root;
