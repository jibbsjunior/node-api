const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const passport = require("passport");
const keys = require("./config/keys");

const route = require("./routes");

const app = express();
const corsOptions = {
	allowHeaders: ["Content-Type", "Accept", "Authorization"],
	allowMethods: ["GET", "PUT", "POST", "OPTIONS"],
	origin: "*"
};
// middlewares
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// protecting route
app.use(passport.initialize());
require("./config/passport")(passport);

app.use("/api", route);


const PORT = 5000;

mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
// connect to mongoDB
mongoose
	.connect(keys.mongoURI, {
		useNewUrlParser: true,
		// autoReconnect: true,
		useUnifiedTopology: true
	})
	.then(() => console.log("MongoDB connected"))
	.catch(err => console.log(err));

// start server
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
