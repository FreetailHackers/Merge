/** Chat API
 *
 * This API is provided to communicate with the backend database to
 * persistently store chats data. It should be used in conjunction with
 * WebSockets to handle real-time bidirectional communication across
 * clients.
 *
 * All endpoints are secured with JWT authentication. The token must
 * have a field named id set with the ObjectId of the logged-in User,
 * passed through the x-access-token header. All endpoints will return
 * 403 Forbidden if the User should not reasonably have permission to
 * complete the requested operation (e.g., reading the Messages of a
 * Chat the User is not a member of).
 *
 * Unless otherwise specified, a 400 return code signifies an improperly
 * formatted parameter (e.g., an ObjectId with an incorrect number of
 * characters).
 */

const express = require("express");
const router = express.Router();
const Chat = require("../../models/Chat");
const Message = require("../../models/Message");
const User = require("../../models/User");
const authenticateToken = require("../helpers/authentication");
router.use(authenticateToken);

const addProfiles = require("../helpers/addProfiles");

router.get("/", async (req, res) => get_default_function(req, res));
router.get("/:chat/messages", async (req, res) =>
  get_messages_function(req, res)
);
router.post("/:chat/messages", async (req, res) =>
  post_messages_function(req, res)
);
router.post("/:chat/add", async (req, res) => post_add_function(req, res));
router.post("/:chat/remove", async (req, res) =>
  post_remove_function(req, res)
);
router.post("/:chat/leave", async (req, res) => post_leave_function(req, res));
router.post("/:chat/rename", async (req, res) =>
  post_rename_function(req, res)
);
router.post("/new", async (req, res) => post_new_function(req, res));
router.post("/:chat/delete", async (req, res) =>
  post_delete_function(req, res)
);
router.post("/:chat/read", async (req, res) => post_read_function(req, res));

/**
 * Find all chats that the logged-in user is a member of.
 *
 * PARAMETERS: none needed, API will use User ObjectId in JWT
 *
 * RETURNS an Array of Chat Objects
 */
async function get_default_function(req, res) {
  try {
    const chats = await Chat.find({ users: req.user }).exec();
    const result = [];
    // Retrieve last message for each chat
    for (let chat of chats) {
      chat = chat.toObject();
      chat.lastMessage = await Message.findOne({ chat: chat })
        .sort({ _id: -1 })
        .exec();
      await addProfiles(chat);
      chat.seen = chat.readBy.map((e) => String(e)).includes(req.user);
      result.push(chat);
    }
    // Sort chats in reverse chronological order; i.e., most recent on top
    result.sort((a, b) => {
      if (!a.lastMessage && !b.lastMessage) {
        return b.created - a.created;
      }
      if (!a.lastMessage) {
        return b.lastMessage.timestamp - a.created;
      }
      if (!b.lastMessage) {
        return b.created - a.lastMessage.timestamp;
      }
      return b.lastMessage.timestamp - a.lastMessage.timestamp;
    });
    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
}

/**
 * Gets all messages in a chat and marks them as read by the logged-in user.
 *
 * PATH PARAMETER chat: ObjectId of Chat
 *
 * RETURNS an Array of Message Objects
 */
async function get_messages_function(req, res) {
  try {
    const chat = await Chat.findOne({ _id: req.params.chat }).exec();
    if (!chat.users.includes(req.user)) {
      console.error("User not in chat");
      return res.sendStatus(403);
    }
    if (!chat.readBy.includes(req.user)) {
      chat.readBy.push(req.user);
      await chat.save();
    }
    const messages = await Message.find({ chat: req.params.chat }).exec();
    return res.json(messages);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
}

/**
 * Send a message from the logged-in user to a chat.
 *
 * PATH PARAMETER chat: ObjectId of Chat
 * BODY PARAMETER contents: String of message contents
 *
 * RETURNS the sent Message Object
 */
async function post_messages_function(req, res) {
  try {
    const chat = await Chat.findOne({ _id: req.params.chat }).exec();
    if (!chat.users.includes(req.user)) {
      console.error("User not in chat");
      return res.sendStatus(403);
    }
    chat.readBy = [req.user];
    await chat.save();
    const message = new Message({
      author: req.user,
      contents: req.body.contents,
      chat: req.params.chat,
    });
    const saved = await message.save();
    return res.json(saved);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
}

/**
 * Add users to a chat, if the the chat is not full.
 *
 * PATH PARAMETER chat: ObjectId of Chat
 * BODY PARAMETER users: ObjectIds of Users
 *
 * RETURNS the modified Chat Object
 * RETURNS 400 if any User was already a member of the Chat or if the Chat was full
 * RETURNS 403 if the calling user was blocked by any User
 */

async function post_add_function(req, res) {
  try {
    const chat = await Chat.findOne({ _id: req.params.chat }).exec();
    if (!req.body.users || req.body.users.length === 0) {
      console.error("No users provided");
      return res.sendStatus(400);
    }

    if (!chat.users.includes(req.user)) {
      console.error("User attempting add not in chat");
      return res.sendStatus(403);
    }

    for (const userID of req.body.users) {
      if (chat.users.includes(userID)) {
        console.error("User already in chat");
        return res.sendStatus(400);
      }

      const user = await User.findOne({ _id: userID });
      if (user.blockList.includes(req.user)) {
        console.error("User attempting to add someone who blocked them");
        res.sendStatus(403);
      }
      chat.users.push(userID);
    }
    const saved = await chat.save();

    let chatObj = saved.toObject();
    await addProfiles(chatObj);
    return res.json(chatObj);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
}

/**
 * Remove user from a chat.
 * Can only be called by the owner of a chat.
 *
 * PATH PARAMETER chat: ObjectId of Chat
 * BODY PARAMETER users: ObjectIds of Users
 *
 * RETURNS the modified Chat Object
 * RETURNS 400 if the User was not a member of the Chat
 */
async function post_remove_function(req, res) {
  try {
    const chat = await Chat.findOne({ _id: req.params.chat }).exec();
    if (!req.body.users) {
      console.error("No users provided");
      return res.sendStatus(400);
    }
    if (
      !chat.users.includes(req.user) ||
      chat.owner.toString() !== req.user.toString()
    ) {
      console.error(
        "User attempting to remove not in chat or not owner of chat"
      );
      return res.sendStatus(403);
    }
    if (!req.body.users.every((user) => chat.users.includes(user))) {
      console.error("At least one user not in chat");
      return res.sendStatus(400);
    }
    chat.users = chat.users.filter(
      (user) => !req.body.users.includes(user.toString())
    );
    const saved = await chat.save();
    return res.json(saved);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
}

/**
 * Leave a chat.
 *
 * PATH PARAMETER chat: ObjectId of Chat
 *
 * RETURNS the modified Chat Object
 * RETURNS 400 if the User was not a member of the Chat
 */
async function post_leave_function(req, res) {
  try {
    const chat = await Chat.findOne({ _id: req.params.chat }).exec();
    if (!req.user) {
      console.error("User does not exist");
      return res.sendStatus(400);
    }
    if (!chat.users.includes(req.user)) {
      console.error("User not in chat or undefined");
      return res.sendStatus(403);
    }
    chat.users = chat.users.filter((user) => user.toString() !== req.user);
    const saved = await chat.save();
    return res.json(saved);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
}

/**
 * Rename a chat.
 *
 * PATH PARAMETER chat: ObjectId of Chat
 * BODY PARAMETER name: String of new name
 *
 * RETURNS the modified Chat Object
 */
async function post_rename_function(req, res) {
  try {
    const chat = await Chat.findOne({ _id: req.params.chat }).exec();
    if (!req.body.name && req.body.name !== "") {
      console.error("Name does not exist");
      return res.sendStatus(400);
    }
    if (!chat.users.includes(req.user)) {
      console.error("User attempting to rename not in chat");
      return res.sendStatus(403);
    }
    chat.name = req.body.name;
    const saved = await chat.save();
    return res.json(saved);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
}

/**
 * Create a new chat with the logged-in user.
 *
 * BODY PARAMETER name: name of Chat
 *
 * RETURNS the newly created Chat Object
 */
async function post_new_function(req, res) {
  try {
    let chat = new Chat({
      users: [req.user],
      name: req.body && req.body.name ? req.body.name : "",
      owner: req.user,
    });
    const otherUsers = req.body.otherUsers
      ? req.body.otherUsers.filter((e) => e !== req.user)
      : [];
    for (const userID of otherUsers) {
      const user = await User.findOne({ _id: userID });
      if (user.blockList.includes(req.user)) {
        console.error(
          "User attempting to create chat with someone who blocked them"
        );
        res.sendStatus(403);
      }
      chat.users.push(userID);
    }
    const saved = await chat.save();
    let chatObj = saved.toObject();
    await addProfiles(chatObj);
    return res.json(chatObj);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
}

/**
 * Delete a chat.
 *
 * PATH PARAMETER chat: ObjectId of Chat
 *
 * RETURNS the deleted Chat Object
 */
async function post_delete_function(req, res) {
  try {
    const chat = await Chat.findOne({ _id: req.params.chat });
    if (req.user !== chat.owner.toString()) {
      console.error("User attempting to delete not owner");
      return res.sendStatus(403);
    }
    await Chat.deleteOne({ _id: req.params.chat });
    return res.json(chat);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
}

/**
 * Mark a chat as read for the logged-in user.
 *
 * PATH PARAMETER chat: ObjectId of Chat
 *
 * RETURNS the modified Chat Object
 */
async function post_read_function(req, res) {
  try {
    const chat = await Chat.findOne({ _id: req.params.chat }).exec();
    if (!chat.users.includes(req.user)) {
      console.error("User not in chat");
      return res.sendStatus(403);
    }
    if (!chat.readBy.includes(req.user)) {
      chat.readBy.push(req.user);
    }
    const saved = await chat.save();
    return res.json(saved);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
}

/**
 * Get the name and profile picture of all users you could chat with.
 *
 * PATH PARAMETER user: ObjectId of User
 *
 * RETURNS an Array of Objects
 */

router.get("/reachableUsers", (req, res) => {
  if (!req.user) {
    return res.sendStatus(403);
  }
  User.find({}, (err, users) => {
    if (err) {
      return res.sendStatus(400);
    }
    if (!users) {
      return res.sendStatus(404);
    }
    const you = users[users.findIndex((e) => String(e._id) === req.user)];
    const filtered = [
      ...users.filter(
        (e) =>
          String(e._id) !== req.user &&
          !e.blockList.includes(req.user) &&
          !you.blockList.includes(e._id)
      ),
    ];
    return res.json([
      ...filtered.map((user) => ({
        _id: user._id,
        name: user.name,
        profilePictureUrl: user.profile?.profilePictureUrl,
      })),
    ]);
  });
});

module.exports = {
  router,
  get_default_function,
  get_messages_function,
  post_messages_function,
  post_add_function,
  post_remove_function,
  post_rename_function,
  post_new_function,
  post_delete_function,
  post_read_function,
};
