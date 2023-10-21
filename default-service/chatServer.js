require("dotenv").config();
const express = require("express");
const http = require("http");
const AWS = require("@aws-sdk/client-ses");
const CronJob = require("cron").CronJob;
const mongoose = require("mongoose");
const sendEmails = require("./sendEmails");

const app = express();
const server = http.createServer(app);
app.get("/", (req, res) => {
  res.status(200).send(`Status OK: ${new Date()}`);
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

    jwt.verify(token, process.env.SECRETORKEY, (err, decoded) => {
      if (err) {
        next(err);
      } else {
        socket.request.user = decoded.id;
        socket.data.mongoID = decoded.id;
        next();
      }
    });
  } else {
    next(new Error("invalid"));
  }
});

// error handler function
function errHandler(data, socket) {
  if (!data) {
    console.error("No data provided");
    return false;
  } else if (!socket) {
    console.error("No socket provided");
    return false;
  }
  return true;
}

function useWithErrorHandling(socket, event, callback) {
  socket.on(event, (data) => {
    if (errHandler(data, socket)) {
      callback(data, socket);
    }
  });
}

io.on("connection", (socket) => {
  socket.join(socket.data.mongoID);

  // utility functions
  useWithErrorHandling(socket, "join-room", joinRoom);
  useWithErrorHandling(socket, "join-rooms", joinRooms);
  useWithErrorHandling(socket, "join-team-room", joinTeamRoom);
  useWithErrorHandling(socket, "leave-room", leaveRoom);

  // Chats
  useWithErrorHandling(socket, "new-message", newMessage);
  socket.on("leave-chat-rooms", () => leaveChatRooms(socket));
  useWithErrorHandling(socket, "create-room", createRoom);
  useWithErrorHandling(socket, "add-users", addUsers);
  useWithErrorHandling(socket, "remove-users", removeUsers);
  useWithErrorHandling(socket, "rename-chat", renameChat);
  useWithErrorHandling(socket, "leave-chat", leaveChat);
  useWithErrorHandling(socket, "remove-users", removeUsers);
  useWithErrorHandling(socket, "delete-chat", deleteChat);

  // blocking
  useWithErrorHandling(socket, "block-users", blockUsers);
  useWithErrorHandling(socket, "unblock-users", unblockUsers);

  // Teams
  useWithErrorHandling(socket, "leave-team", leaveTeam);
  useWithErrorHandling(socket, "request-merge", requestMerge);
  useWithErrorHandling(socket, "accept-merge", acceptMerge);
  useWithErrorHandling(socket, "reject-merge", rejectMerge);
  useWithErrorHandling(socket, "cancel-request", cancelRequest);
  useWithErrorHandling(socket, "update-profile", updateProfile);
  useWithErrorHandling(socket, "update-membership", updateMembership);
  useWithErrorHandling(socket, "swipe-on-team", swipeOnTeam);
  useWithErrorHandling(socket, "clear-left-swipes", clearLeftSwipes);
});

function newMessage(data, socket) {
  socket.to(data.chat).emit("broadcast-message", data.message);
  for (const user of data.users) {
    socket.to(user).emit("chat-update");
  }
}

function joinRoom(data, socket) {
  socket.join(data.id);
}

function joinRooms(data, socket) {
  for (let i = 0; i < data.ids.length; i++) {
    socket.join(data.ids[i]);
  }
}

function joinTeamRoom(data, socket) {
  socket.join(data.id);
  socket.data.mongoTeamID = data.id;
}

function leaveRoom(data, socket) {
  socket.leave(data.id);
}

function leaveChatRooms(socket) {
  for (const room of socket.rooms) {
    if (
      room !== socket.id &&
      room !== socket.data.mongoID &&
      room !== socket.data.mongoTeamID
    ) {
      socket.leave(room);
    }
  }
}

async function createRoom(data, socket) {
  socket.join(data._id);
  for (const user of data.otherUsers) {
    socket.to(user).emit("added-to-room", data.chat);
  }
  /* socket.join(data._id);
  const fetched = await io.fetchSockets();
  for (let fetchedSocket of fetched) {
    if (data.otherUsers.includes(fetchedSocket.data.mongoID)) {
      socket.to(fetchedSocket.id).emit("added-to-room", data.chat);
    }
  }*/
}

async function addUsers(data, socket) {
  socket.to(data.chat._id).emit("new-user-added", data.chat);
  for (const user of data.userIDs) {
    socket.to(user).emit("added-to-room", data.chat);
  }
}

async function blockUsers(data, socket) {
  for (const user of data.users) {
    socket.to(user).emit("blocked-by", { userID: socket.data.mongoID });
  }
}

async function unblockUsers(data, socket) {
  for (const user of data.users) {
    socket.to(user).emit("unblocked-by", { userID: socket.data.mongoID });
  }
}

function renameChat(data, socket) {
  socket.to(data.chatID).emit("chat-renamed", data);
}

function deleteChat(data, socket) {
  socket.to(data._id).emit("chat-deleted", data);
}

function leaveChat(data, socket) {
  socket.to(data.chatID).emit("user-left", data);
  socket.leave(data.chatID);
}

async function removeUsers(data, socket) {
  for (const user of data.users) {
    socket.to(user).emit("removed-from", { chatID: data.chatID });
  }
  for (const user of data.users) {
    socket.to(data.chatID).emit("user-left", { chatID: data.chatID, user });
  }
}

async function leaveTeam(data, socket) {
  socket.to(data.teamID).emit("teammate-left", { userID: data.userID });
  socket.to(data.teamID).emit("team-update");
  socket.leave(data.teamID);
}

async function requestMerge(data, socket) {
  let requestingCopy = { ...data };
  requestingCopy.requestingTeam = { _id: data.requestingTeam._id };
  let requestedCopy = { ...data };
  requestedCopy.requestedTeam = { _id: data.requestedTeam._id };
  socket.to(data.requestingTeam._id).emit("merge-requested", requestingCopy);
  socket.to(data.requestedTeam._id).emit("merge-requested", requestedCopy);
  socket.to(data.requestedTeam._id).emit("browse-update");
}

async function acceptMerge(data, socket) {
  socket.to(data.absorbedTeamID).emit("merge-accepted", data);
  socket.to(data.newTeam._id).emit("merge-accepted", data);
}

async function rejectMerge(data, socket) {
  socket
    .to(data.requestingTeamID)
    .to(data.rejectingTeamID)
    .emit("merge-rejected", data);
}

async function cancelRequest(data, socket) {
  socket
    .to(data.cancellingTeamID)
    .to(data.requestedTeamID)
    .emit("request-cancelled", data);
}

async function updateProfile(data, socket) {
  socket.to(data.teamID).emit("profile-updated", data);
  socket.to(data.teamID).emit("team-update", data);
}

async function updateMembership(data, socket) {
  const fetched = await io.in(data.teamID).fetchSockets();
  for (const fetchedSocket of fetched) {
    socket.to(fetchedSocket.id).emit("team-update");
    const userID = fetchedSocket.data.mongoID;
    if (data.kickedUsers.includes(userID)) {
      socket
        .to(fetchedSocket.id)
        .emit("kicked-from-team", { newTeam: data.newTeams[userID] });
    } else {
      socket.to(fetchedSocket.id).emit("membership-updated", data);
    }
  }
  /*for (const user of Object.keys(data.newTeams)) {
    socket.to(user).emit("kicked-from-team", {newTeam: data.newTeams[user]})
  }
  const {newLeader, kickedUsers} = data
  socket.to(data.teamID).emit("membership-updated", {newLeader, kickedUsers});*/
}

function swipeOnTeam(data, socket) {
  socket
    .to(data.yourTeam)
    .emit("team-swiped-on", { otherTeam: data.otherTeam });
  if (data.chatID) {
    socket.to(data.otherTeam).to(data.yourTeam).emit("chat-update");
    socket
      .to(data.otherTeam)
      .to(data.yourTeam)
      .emit("new-swipe-chat", { chatID: data.chatID });
  }
}

function clearLeftSwipes(data, socket) {
  socket.to(data.teamID).emit("left-swipes-cleared");
}

const db = process.env.MONGO_URI;
mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log("MongoDB successfully connected"))
  .catch((err) => console.log(err));

const ses = new AWS.SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET,
  },
});

new CronJob(
  "00 0 */4 * * *",
  () => {
    sendEmails(ses);
  },
  null,
  true,
  "America/Chicago"
);

const port = process.env.CHAT_PORT || 5000;

server.listen(port, () =>
  console.log(`CHAT server up and running on port ${port} !`)
);
