const bcrypt = require("bcrypt");
const express = require("express");
const gravatar = require("gravatar");
const jwt = require("jsonwebtoken");
const passport = require("passport");

const keys = require("../config/keys");
const User = require("../Models/User");
const Note = require("../Models/Note");
const validateRegisterInput = require("../validation/register");
const validateLoginInput = require("../validation/login");
const validateNoteInput = require("../validation/note");
const dummyData = require("../dummy");

const router = express.Router();

/**
 * @route GET http:localhost:PORT/api/test
 * @desc Tests route
 * @access Public
 * @return { msg: "Route works"}
 */
router.get("/test", (req, res) =>
	// res.status(200).json({ msg: "Route works!" })
	res.send(dummyData)	
);

/**
 * @route POST api/users/register
 * @desc create new user route
 * @access Public
 */
router.post("/users/register", (req, res) => {
	const { errors, isValid } = validateRegisterInput(req.body);

	if (!isValid) return res.status(400).json(errors);

	User.findOne({ email: req.body.email }).then(user => {
		if (user) {
			errors.push("Email already exist");
			return res.status(400).json(errors);
		} else {
			const avatar = gravatar.url(req.body.email, {
				s: 200,
				r: "pg",
				d: "mm"
			});

			bcrypt.genSalt(10, (err, salt) => {
				if (err) {
					// TODO: do this yourself
				}

				bcrypt.hash(req.body.password, salt, (err, hash) => {
					if (err) throw err;

					const newUser = new User({
						name: req.body.name,
						email: req.body.email,
						password: hash,
						avatar
					});
					// newUser.password = hash;

					newUser
						.save()
						.then(user => res.json({ msg: "User created" }))
						.catch(err => console.log(err));
				});
			});
		}
	});
});

/**
 * @route POST api/users/signin
 * @desc sign in route
 * @access Public
 */
router.post("/users/signin", (req, res) => {
	const { errors, isValid } = validateLoginInput(req.body);

	if (!isValid) return res.status(400).json(errors);

	const { email, password } = req.body;

	User.findOne({ email })
		.then(user => {
			if (!user) {
				errors.push("User not found");
				return res.status(404).json(errors);
			}

			bcrypt.compare(password, user.password).then(isMatch => {
				if (!isMatch) {
					errors.push(
						"Please provide a valid email and password combination."
					);
					return res.status(400).json(errors);
				}

				const payload = {
					id: user.id,
					email: user.email,
					name: user.name
				};

				jwt.sign(
					payload,
					keys.secret,
					{ expiresIn: "3d" },
					(err, token) => {
						if (err) throw err;

						return res.status(200).json({ token });
					}
				);
			});
		})
		.catch(err => console.log(err));
});

/**
 * @route POST api/note/new
 * @desc add note route
 * @access Private
 */
router.post(
	"/notes/new",
	passport.authenticate("jwt", { session: false }),
	(req, res) => {
		const { errors, isValid } = validateNoteInput(req.body);

		if (!isValid) return res.status(400).json(errors);

		const newNote = new Note({
			user: req.user.id,
			head: req.body.head,
			body: req.body.body
		});

		newNote
			.save()
			.then(note => res.status(200).json({ msg: "Note created!" }))
			.catch(e => console.log(e));
	}
);

/**
 * @route POST api/note/edit
 * @desc edit note route
 * @access Private
 */
router.post(
	"/notes/edit/:id",
	passport.authenticate("jwt", { session: false }),
	(req, res) => {
		const { errors, isValid } = validateNoteInput(req.body);

		if (!isValid) res.status(400).json(errors);

		const { head, body } = req.body;

		const newNote = {
			head,
			body
		};

		Note.findById(req.params.id).then(data => {
			if (!data) {
				errors.push("Note not found!");
				return res.status(404).json(errors);
			}

			if (!(data.user === req.user.id)) {
				errors.push("You are unauthorized to edit this note");
				return res.status(403).json(errors);
			}

			Note.findByIdAndUpdate(req.params.id, newNote)
				.then(note => res.status(200).json({ msg: "Note Edited!" }))
				.catch(e => console.log(e));
		});
	}
);

/**
 * @route DELETE api/note/delete/:id
 * @desc delete note route
 * @access Private
 */
router.delete(
	"/notes/delete/:id",
	passport.authenticate("jwt", { session: false }),
	(req, res) => {
		Note.findById(req.params.id).then(data => {
			if (!data) {
				errors.push("Note not found!");
				return res.status(404).json(errors);
			}

			if (!(data.user === req.user.id)) {
				errors.push("You are unauthorized to delete this note");
				return res.status(403).json(errors);
			}

			Note.findByIdAndDelete(req.params.id)
				.then(note => res.status(200).json({ msg: "Note Deleted!" }))
				.catch(e => console.log(e));
		});
	}
);

/**
 * @route GET api/note/all
 * @desc get note route
 * @access Private
 */
router.get(
	"/notes/all",
	passport.authenticate("jwt", { session: false }),
	(req, res) =>
		Note.find({ user: req.user.id }).then(data => {
			if (!data) res.status(200).json({ msg: "You have no note" });

			return res.status(200).json(data);
		})
);

/**
 * @route GET api/note/:id
 * @desc get note route
 * @access Private
 */
router.get(
	"/notes/:id",
	passport.authenticate("jwt", { session: false }),
	(req, res) => {
		const errors = [];
		errors.length = 0;
		const { id } = req.params;

		if (!id) {
			errors.push("Not not found");
			return res.status(404).json(errors);
		}

		// check if id is valid
		if (!id.match(/^[0-9a-fA-F]{24}$/)) {
			errors.push("Invalid URL");
			return res.status(400).json(errors);
		}

		Note.findById(id)
			.then(note => {
				if (!note) {
					errors.push("Not not found");
					return res.status(404).json(errors);
				}
				console.log({ user: req.user.id, id: note.user });
				if (req.user.id !== String(note.user)) {
					errors.push("Auuthorized to access this ote!");
					return res.status(403).json(errors);
				}
				return res
					.status(200)
					.json({ head: note.head, body: note.body, id: note._id });
			})
			.catch(e => console.log(e));
	}
);

/**
 * @route GET api/users/current
 * @desc current user route
 * @access Private
 */
router.get(
	"/users/current",
	passport.authenticate("jwt", { session: false }),
	(req, res) => {
		const { avatar, email, name } = req.user;
		return res.status(200).json({ avatar, email, name });
	}
);

module.exports = router;
