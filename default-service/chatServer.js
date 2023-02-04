require("dotenv").config();
const io = require("socket.io")(process.env.CHAT_PORT, {
  cors: {
    origin: ["http://localhost:3000", "https://merge.freetailhackers.com"],
    credentials: true,
  },
});
const { createClient } = require("redis");
const redisAdapter = require("@socket.io/redis-adapter");

const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();
io.adapter(redisAdapter(pubClient, subClient));

io.on("connection", (socket) => {
  // handles new connection
  socket.on("new-connection", (data) => newConnection(data, socket));

  // handles message posted by client
  socket.on("new-message", (data) => newMessage(data, socket));

  socket.on("join-room", (data) => joinRoom(data, socket));

  socket.on("create-room", (data) => createRoom(data, socket));

  socket.on("add-user", (data) => addUser(data, socket));

  socket.on("rename-chat", (data) => renameChat(data, socket));
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
    let fetched = await io.fetchSockets();
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
    let fetched = await io.fetchSockets();
    let foundSocket = false;
    for (let fetchedSocket of fetched) {
      if (data.userID == fetchedSocket.data.mongoID) {
        foundSocket = true;
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

function renameChat(data, socket) {
  errHandler(data, socket);
  if (data && socket) {
    socket.to(data.chatID).emit("chat-renamed", data);
  }
}
