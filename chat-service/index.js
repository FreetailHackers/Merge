const express = require('express');
const app = express();
const server = require('http').createServer(app);
const cors = require('cors');
app.use(cors());
const port = process.env.PORT || 5001;
const sockets = require('./sockets');
const { isUndefined } = require('util');

sockets.configureSockets(server);

server.listen(port, () => {
   console.log(`Running on port ${port}`);
});
