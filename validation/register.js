const validator = require("validator");
const isEmpty = require("./isEmpty");

module.exports = function validateRegisterInput(data) {
	const errors = [];
	errors.length = 0;

	data.name = !isEmpty(data.name) ? data.name : "";
	data.email = !isEmpty(data.email) ? data.email : "";
	data.password = !isEmpty(data.password) ? data.password : "";
	data.password2 = !isEmpty(data.password2) ? data.password2 : "";

	const { name, email, password, password2 } = data;
	if (!validator.isLength(name, { min: 5, max: 30 })) {
		errors.push("Name must be between 5 and 30 characters");
	}

	if (validator.isEmpty(name)) {
		errors.push("Name field is required");
	}

	if (validator.isEmpty(email)) {
		errors.push("Email field is required");
	}

	if (!validator.isEmail(email)) {
		errors.push("Email field is invalid");
	}

	if (validator.isEmpty(password)) {
		errors.push("Password field is required");
	}

	if (!(validator.isLength(password), { min: 6, max: 30 })) {
		errors.push("Password must be atleast 6 characters");
	}

	if (validator.isEmpty(password2)) {
		errors.push("Confirm password field is required");
	}

	if (!validator.equals(password, password2)) {
		errors.push("Password must match");
	}

	return {
		errors,
		isValid: isEmpty(errors)
	};
};
