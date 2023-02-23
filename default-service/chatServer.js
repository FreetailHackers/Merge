require("dotenv").config();
const express = require("express");
const http = require("http");

const app = express();
const server = http.createServer(app);
app.get("/", (req, res) => {
  res.send(`Status Ok: ${new Date()}`);
});

const io = require("socket.io")(server, {
  cors: {
    origin: [process.env.CORS_ORIGIN_URL],
    credentials: true,
  },
});
const { createClient } = require("redis");
const redisAdapter = require("@socket.io/redis-adapter");

const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();
io.adapter(redisAdapter(pubClient, subClient));

const jwt = require("jsonwebtoken");

io.use((socket, next) => {
  if (socket.handshake.query && socket.handshake.query.token) {
    const authHeader = socket.handshake.query.token;
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      next(new Error("Token not in correct format"));
    }
    next(
      jwt.verify(token, process.env.SECRETORKEY, (err, decoded) => {
        if (err) {
          return new Error(err.mesage);
        }
        socket.request.user = decoded.id;
      })
    );
  } else {
    next(new Error("invalid"));
  }
});

io.on("connection", (socket) => {
  // handles new connection
  socket.on("new-connection", (data) => newConnection(data, socket));

  // handles message posted by client
  socket.on("new-message", (data) => newMessage(data, socket));

  socket.on("join-room", (data) => joinRoom(data, socket));

  socket.on("create-room", (data) => createRoom(data, socket));

  socket.on("add-user", (data) => addUser(data, socket));

  socket.on("block-users", (data) => blockUsers(data, socket));

  socket.on("unblock-users", (data) => unblockUsers(data, socket));

  socket.on("rename-chat", (data) => renameChat(data, socket));

  socket.on("leave-chat", (data) => leaveChat(data, socket));

  socket.on("delete-chat", (data) => deleteChat(data, socket));
});

// error handler function
function errHandler(data, socket) {
  if (!data) {
    console.error("No data provided");
  } else if (!socket) {
    console.error("No socket provided");
  }
  return;
}

async function newConnection(data, socket) {
  errHandler(data, socket);
  if (data && socket) {
    socket.data.mongoID = data.userID;
  }
}

function newMessage(data, socket) {
  errHandler(data, socket);
  if (data && socket) {
    socket.to(data.chat).emit("broadcast-message", data);
  }
}

function joinRoom(data, socket) {
  errHandler(data, socket);
  if (data && socket) {
    socket.join(data.id);
  }
}

async function createRoom(data, socket) {
  errHandler(data, socket);
  if (data && socket) {
    socket.join(data._id);
    const fetched = await io.fetchSockets();
    let foundSocket = false;
    for (let fetchedSocket of fetched) {
      if (data.otherUsers.includes(fetchedSocket.data.mongoID)) {
        socket.to(fetchedSocket.id).emit("added-to-room", data.chat);
        foundSocket = true;
      }
    }
    if (!foundSocket) {
      console.error("No sockets found for selected users");
    }
  }
}

async function addUser(data, socket) {
  errHandler(data, socket);
  if (data && socket) {
    const fetched = await io.fetchSockets();
    let foundSocket = false;
    for (let fetchedSocket of fetched) {
      if (data.userID === fetchedSocket.data.mongoID) {
        foundSocket = true;
        socket.to(fetchedSocket.id).emit("added-to-room", data.chat);
      } else if (
        data.chat.users.includes(fetchedSocket.data.mongoID) &&
        data.userID != fetchedSocket.data.mongoID &&
        socket.id != fetchedSocket.id
      ) {
        socket.to(fetchedSocket.id).emit("new-user-added", data.chat);
        foundSocket = true;
      }
    }
    if (!foundSocket) {
      console.error("Added users do not have sockets");
    }
  }
}

async function blockUsers(data, socket) {
  errHandler(data, socket);
  if (data && socket) {
    const fetched = await io.fetchSockets();
    for (let fetchedSocket of fetched) {
      if (data.users.includes(fetchedSocket.data.mongoID)) {
        socket
          .to(fetchedSocket.id)
          .emit("blocked-by", { userID: socket.data.mongoID });
      }
    }
  }
}

async function unblockUsers(data, socket) {
  errHandler(data, socket);
  if (data && socket) {
    const fetched = await io.fetchSockets();
    for (let fetchedSocket of fetched) {
      if (data.users.includes(fetchedSocket.data.mongoID)) {
        socket
          .to(fetchedSocket.id)
          .emit("unblocked-by", { userID: socket.data.mongoID });
      }
    }
  }
}

function renameChat(data, socket) {
  errHandler(data, socket);
  if (data && socket) {
    socket.to(data.chatID).emit("chat-renamed", data);
  }
}

function deleteChat(data, socket) {
  errHandler(data, socket);
  if (data && socket) {
    socket.to(data._id).emit("chat-deleted", data);
  }
}

function leaveChat(data, socket) {
  errHandler(data, socket);
  if (data && socket) {
    socket.to(data.chatID).emit("user-left", data);
  }
  socket.leave(data.chatID);
}

const port = process.env.CHAT_PORT || 5000;

server.listen(port, () =>
  console.log(`CHAT server up and running on port ${port} !`)
);
