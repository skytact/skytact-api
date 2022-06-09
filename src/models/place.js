const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const placeSchema = new Schema(
	{
		id: ObjectId,
		invite: {
			type: String,
			required: true 
		},
		upcode: {
			type: String,
			required: false
		},
		parent: {
			type: String,
			required: false
		},
		limit: {
			type: Number,
			min: 0,
			default: 1
		},
		date: {
			type: Date,
			default: Date.now
		}
	},
	{
		timestamps: true
	}
);
const Place = mongoose.model('Place', placeSchema);
module.exports = Place;
