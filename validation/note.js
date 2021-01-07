const validator = require("validator");
const isEmpty = require("./isEmpty");

module.exports = function validateNoteInput(data) {
	const errors = [];
	errors.length = 0;

	data.head = !isEmpty(data.head) ? data.head : "";
	data.body = !isEmpty(data.body) ? data.body : "";

	const { head, body } = data;

	if (validator.isEmpty(head)) {
		errors.push("Note heading field is required");
	}

	if (validator.isEmpty(body)) {
		errors.push("Note body field is required");
	}

	if (!validator.isLength(head, { max: 20 })) {
		errors.push("Heading is too long. Max is 20 characters");
	}

	return { errors, isValid: isEmpty(errors) };
};
