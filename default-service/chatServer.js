require("dotenv").config();
const express = require("express");
const http = require("http");
const AWS = require("aws-sdk");
const CronJob = require("cron").CronJob;
const mongoose = require("mongoose");
const User = require("./models/User");
const Chat = require("./models/Chat");

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

function useWithErrorHandling(socket, event, callback) {
  socket.on(event, (data) => {
    if (errHandler(data, socket)) {
      callback(data, socket);
    }
  });
}

io.on("connection", (socket) => {
  // handles message posted by client
  useWithErrorHandling(socket, "new-message", newMessage);

  useWithErrorHandling(socket, "join-room", joinRoom);

  useWithErrorHandling(socket, "leave-room", leaveRoom);

  socket.on("leave-chat-rooms", () => leaveChatRooms(socket));

  useWithErrorHandling(socket, "create-room", createRoom);

  useWithErrorHandling(socket, "add-users", addUsers);

  useWithErrorHandling(socket, "block-users", blockUsers);

  useWithErrorHandling(socket, "unblock-users", unblockUsers);

  useWithErrorHandling(socket, "rename-chat", renameChat);

  useWithErrorHandling(socket, "leave-chat", leaveChat);

  useWithErrorHandling(socket, "remove-users", removeUsers);

  useWithErrorHandling(socket, "delete-chat", deleteChat);

  useWithErrorHandling(socket, "leave-team", leaveTeam);

  useWithErrorHandling(socket, "request-merge", requestMerge);

  useWithErrorHandling(socket, "accept-merge", acceptMerge);

  useWithErrorHandling(socket, "reject-merge", rejectMerge);

  useWithErrorHandling(socket, "cancel-request", cancelRequest);

  useWithErrorHandling(socket, "update-profile", updateProfile);

  useWithErrorHandling(socket, "update-membership", updateMembership);
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

function newMessage(data, socket) {
  socket.to(data.chat).emit("broadcast-message", data);
}

function joinRoom(data, socket) {
  socket.join(data.id);
}

function leaveRoom(data, socket) {
  socket.leave(data.id);
}

function leaveChatRooms(socket) {
  for (const room of socket.rooms) {
    if (room != socket.id) {
      socket.leave(room);
    }
  }
}

async function createRoom(data, socket) {
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

async function addUsers(data, socket) {
  const fetched = await io.fetchSockets();
  for (let fetchedSocket of fetched) {
    if (data.userIDs.includes(fetchedSocket.data.mongoID)) {
      socket.to(fetchedSocket.id).emit("added-to-room", data.chat);
    } else if (
      data.chat.users.includes(fetchedSocket.data.mongoID) &&
      !data.userIDs.includes(fetchedSocket.data.mongoID) &&
      socket.id != fetchedSocket.id
    ) {
      socket.to(fetchedSocket.id).emit("new-user-added", data.chat);
    }
  }
}

async function blockUsers(data, socket) {
  const fetched = await io.fetchSockets();
  for (let fetchedSocket of fetched) {
    if (data.users.includes(fetchedSocket.data.mongoID)) {
      socket
        .to(fetchedSocket.id)
        .emit("blocked-by", { userID: socket.data.mongoID });
    }
  }
}

async function unblockUsers(data, socket) {
  const fetched = await io.fetchSockets();
  for (let fetchedSocket of fetched) {
    if (data.users.includes(fetchedSocket.data.mongoID)) {
      socket
        .to(fetchedSocket.id)
        .emit("unblocked-by", { userID: socket.data.mongoID });
    }
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
  const fetched = await io.in(data.chatID).fetchSockets();
  for (const fetchedSocket of fetched) {
    if (data.users.includes(fetchedSocket.data.mongoID)) {
      socket.to(fetchedSocket.id).emit("removed-from", { chatID: data.chatID });
    } else {
      for (const user of data.users) {
        socket
          .to(fetchedSocket.id)
          .emit("user-left", { chatID: data.chatID, user: user });
      }
    }
  }
}

async function leaveTeam(data, socket) {
  socket.to(data.teamID).emit("teammate-left", { userID: data.userID });
}

async function requestMerge(data, socket) {
  let requestingCopy = { ...data };
  requestingCopy.requestingTeam = { _id: data.requestingTeam._id };
  let requestedCopy = { ...data };
  requestedCopy.requestedTeam = { _id: data.requestedTeam._id };
  socket.to(data.requestingTeam._id).emit("merge-requested", requestingCopy);
  socket.to(data.requestedTeam._id).emit("merge-requested", requestedCopy);
}

async function acceptMerge(data, socket) {
  socket.to(data.absorbedTeamID).emit("merge-accepted", data);
  socket.to(data.newTeam._id).emit("merge-accepted", data);
}

async function rejectMerge(data, socket) {
  socket.to(data.requestingTeamID).emit("merge-rejected", data);
  socket.to(data.rejectingTeamID).emit("merge-rejected", data);
}

async function cancelRequest(data, socket) {
  socket.to(data.cancellingTeamID).emit("request-cancelled", data);
  socket.to(data.requestedTeamID).emit("request-cancelled", data);
}

async function updateProfile(data, socket) {
  socket.to(data.teamID).emit("profile-updated", data);
}

async function updateMembership(data, socket) {
  socket.to(data.teamID).emit("membership-updated");
}

AWS.config.update({
  accessKeyId: process.env.AWS_ID,
  secretAccessKey: process.env.AWS_SECRET,
  region: process.env.AWS_REGION,
});

const db = process.env.MONGO_URI;
mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log("MongoDB successfully connected"))
  .catch((err) => console.log(err));

const ses = new AWS.SES();

async function sendEmails() {
  const chats = await Chat.find();
  const users = await User.find();
  let promises = [];

  for (let user of users) {
    const unreadChats = chats.filter((chat) => !chat.readBy.includes(user._id));
    if (unreadChats.length > 0 && user.email && user.name) {
      const to = user?.email;
      const subject = "Merge: You have unread messages - Freetail Hackers";
      const message = `
            <html>
              <head>
                <style>
                  body {
                    font-family: Arial, sans-serif;
                    font-size: 16px;
                    color: #333;
                  }
                  h1 {
                    color: #F90;
                  }
                  p {
                    margin-bottom: 10px;
                  }
                </style>
              </head>
              <body>
                Hey ${user.name},
                <p>
                  Greetings from the Merge team at Freetail Hackers! We hope you're doing well. We noticed that you have unread messages in the following chats:
                </p>
                <ol>
                  ${unreadChats
                    .map((chat) => `<li>${chat.name || "Untitled Chat"}</li>`)
                    .join("")}
                </ol>
                Please <a href="https://merge.freetailhackers.com">log in</a> to your account to read them.
                <br>
                <br>
                <p>
                  If you have any questions, you may email us at <a href="mailto:tech@freetailhackers.com">tech@freetailhackers.com</a>.
                </p>
                <br>
                Thanks,
                <br>
                The Merge Team at Freetail Hackers
              </body>
            </html>
          `;

      const params = {
        Destination: {
          ToAddresses: [to],
        },
        Message: {
          Body: {
            Html: {
              Data: message,
            },
          },
          Subject: {
            Data: subject,
          },
        },
        Source: "tech@freetailhackers.com",
      };

      promises.push(
        new Promise(() => {
          ses.sendEmail(params, (err, data) => {
            if (err) {
              console.log(err);
            } else {
              console.log("Email sent:", data);
            }
          });
        })
      );
    }
  }

  await Promise.all(promises);
}

new CronJob(
  "00 0 */4 * * *",
  () => {
    sendEmails();
  },
  null,
  true,
  "America/Chicago"
);

const port = process.env.CHAT_PORT || 5000;

server.listen(port, () =>
  console.log(`CHAT server up and running on port ${port} !`)
);
