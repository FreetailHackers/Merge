var http = require("http");
const APP_PORT = 8080;
const app = http.createServer();

app.listen(APP_PORT);
console.log(`🖥 HTTP Server running at ${APP_PORT}`);
// SOCKET.IO CHAT EVENT HANDLING

const io = require("socket.io")(app, {
  path: "/socket.io",
});

io.attach(app, {
  // includes local domain to avoid CORS error locally
  // configure it accordingly for production
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
    transports: ["websocket", "polling"],
  },
  allowEIO3: true,
});

let userSockets = {}; // maps a user ID to a list of socket IDs
let socketUser = {}; // maps a socket ID to a user ID

io.on("connection", (socket) => {
  // handles new connection
  socket.on("new-connection", (data) => newConnection(data, socket));

  // handles message posted by client
  socket.on("new-message", (data) => newMessage(data, socket));

  socket.on("join-room", (data) => joinRoom(data, socket));

  socket.on("create-room", (data) => createRoom(data, socket));

  socket.on("add-user", (data) => addUser(data, socket));

  socket.on("rename-chat", (data) => renameChat(data, socket));

  socket.on("disconnect", () => disconnect(socket));
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

function newConnection(data, socket) {
  errHandler(data, socket);
  if (data && socket) {
    userSockets[data.userID] = userSockets[data.userID]
      ? [...userSockets[data.userID], socket.id]
      : [socket.id];
    socketUser[socket.id] = data.userID;
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

function createRoom(data, socket) {
  errHandler(data, socket);
  if (data && socket) {
    socket.join(data._id);
    const users = [...data.otherUsers, socketUser[socket.id]];
    users.forEach((userID) => {
      // last bit avoids sending to the socket who created
      const sockets = userSockets[userID]
        ? userSockets[userID].filter((e) => e !== socket.id)
        : null;
      if (!sockets) {
        console.error("No sockets found for selected users");
      } else {
        sockets.forEach((socketID) => {
          socket.to(socketID).emit("added-to-room", data.chat);
        });
      }
    });
  }
}

function addUser(data, socket) {
  errHandler(data, socket);
  if (data && socket) {
    const newUserSockets = userSockets[data.userID]
      ? userSockets[data.userID].filter((e) => e !== socket.id)
      : null;
    if (!newUserSockets) {
      console.error("Added users do not have sockets");
    } else {
      newUserSockets.forEach((socketID) => {
        socket.to(socketID).emit("added-to-room", data.chat);
      });
    }
    const bystanders = data.chat.users.filter((user) => user !== data.userID);
    bystanders.forEach((userID) => {
      const sockets = userSockets[userID]
        ? userSockets[userID].filter((e) => e !== socket.id)
        : null;
      if (!sockets) {
        console.error("No sockets found for selected users");
      } else {
        sockets.forEach((socketID) => {
          socket.to(socketID).emit("new-user-added", data.chat);
        });
      }
    });
  }
}

function renameChat(data, socket) {
  errHandler(data, socket);
  if (data && socket) {
    socket.to(data.chatID).emit("chat-renamed", data);
  }
}

function disconnect(socket) {
  if (!socket) {
    console.error("No socket provided");
    return;
  } else {
    if (userSockets[socketUser[socket.id]]) {
      userSockets[socketUser[socket.id]] = userSockets[
        socketUser[socket.id]
      ].filter((e) => e !== socket.id);
      if (userSockets[socketUser[socket.id]].length === 0) {
        delete userSockets[socketUser[socket.id]];
      }
    }
    delete socketUser[socket.id];
  }
}
