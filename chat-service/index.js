const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
const server = require('http').createServer(app);
const port = process.env.PORT || 5001;
const mongoose = require("mongoose");
const mongoURI = require("./config/keys.secret").mongoURI;
const sockets = require('./sockets');

mongoose.connect(mongoURI, { useNewUrlParser: true }).then(() => {
   console.log("MongoDB successfully connected")
}).catch(err => console.log(err));

sockets.configureSockets(server);

server.listen(port, () => {
   console.log(`Running on port ${port}`);
});
