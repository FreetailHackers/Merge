const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");

const users = require("./routes/api/users");
const chats = require("./routes/api/chats");

const dotenv = require("dotenv");
dotenv.config();

const app = express();

// Bodyparser middleware
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(bodyParser.json());

// DB Config
const db = process.env.MONGO_URI;

// Connect to MongoDB
mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log("MongoDB successfully connected"))
  .catch((err) => console.log(err));

// Passport middleware
app.use(passport.initialize());

// Passport config
require("./config/passport")(passport);

// Routes
app.use("/api/users", users.router);
app.use("/api/chats", chats.router);

app.get("/api/", (req, res) => {
  res.status(200).send(`Status OK: ${new Date()}`);
});

if (process.env.LOCAL_SERVER) {
  const port = process.env.PORT || 5000;

  app.listen(port, () =>
    console.log(`Server up and running on port ${port} !`)
  );
}

module.exports = app;
