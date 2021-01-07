const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const mongoose = require("mongoose");
const User = mongoose.model("users");
const keys = require("./keys");

const opts = {
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey: keys.secret
};

module.exports = passport => {
	passport.use(
		new JwtStrategy(opts, (payload, done) => {
			User.findById(payload.id)
				.then(user => {
					if (!user) {
						done(null, false);
					} else {
						done(null, user);
					}
				})
				.catch(err => console.log(err));
		})
	);
};
