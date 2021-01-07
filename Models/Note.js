const mongoose = require("mongoose");

const NoteSchema = mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "users"
	},
	head: {
		type: String,
		required: true,
		max: 20
	},
	body: {
		type: String,
		required: true
	},
	date: {
		type: Date,
		default: Date.now
	}
});

module.exports = Note = mongoose.model("notes", NoteSchema);
