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
const authenticateToken = require("../helpers/authentication");

const MAX_CHAT_SIZE = 5;

router.use(authenticateToken);

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
      result.push(chat);
      // Sort chats in reverse chronological order; i.e., most recent on top
      result.sort((a, b) => {
        if (!a.lastMessage && !b.lastMessage) return 0;
        // Put chat requests on top
        if (!a.lastMessage) return -1;
        if (!b.lastMessage) return 1;
        return b.lastMessage.timestamp - a.lastMessage.timestamp;
      });
    }
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
      recipients: chat.users,
    });
    const saved = await message.save();
    return res.json(saved);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
}

/**
 * Add a user to a chat, if the the chat is not full.
 *
 * PATH PARAMETER chat: ObjectId of Chat
 * BODY PARAMETER user: ObjectId of User
 *
 * RETURNS the modified Chat Object
 * RETURNS 400 if the User was already a member of the Chat or if the Chat was full
 */
async function post_add_function(req, res) {
  try {
    const chat = await Chat.findOne({ _id: req.params.chat }).exec();
    if (!req.body.user) {
      console.error("User does not exist");
      return res.sendStatus(400);
    }
    if (chat.users.includes(req.body.user)) {
      console.error("User already in chat");
      return res.sendStatus(400);
    }
    if (chat.users.length >= MAX_CHAT_SIZE) {
      console.error("Chat is full");
      return res.sendStatus(400);
    }
    if (!chat.users.includes(req.user)) {
      console.error("User attempting add not in chat");
      return res.sendStatus(403);
    }
    chat.users.push(req.body.user);
    const saved = await chat.save();
    return res.json(saved);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
}

/**
 * Remove a user from a chat.
 *
 * PATH PARAMETER chat: ObjectId of Chat
 * BODY PARAMETER user: ObjectId of User
 *
 * RETURNS the modified Chat Object
 * RETURNS 400 if the User was not a member of the Chat
 */
async function post_remove_function(req, res) {
  try {
    const chat = await Chat.findOne({ _id: req.params.chat }).exec();
    if (!req.body.user) {
      console.error("User does not exist");
      return res.sendStatus(400);
    }
    if (!chat.users.includes(req.body.user)) {
      console.error("User not in chat or undefined");
      return res.sendStatus(400);
    }
    if (!chat.users.includes(req.user)) {
      console.error("User attempting to remove not in chat");
      return res.sendStatus(403);
    }
    chat.users = chat.users.filter((user) => user.toString() !== req.body.user);
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
    if (!req.body.name) {
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
      name: req.body.name,
      owner: req.user,
    });
    const saved = await chat.save();
    return res.json(saved);
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
