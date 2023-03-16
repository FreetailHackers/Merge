const chats = require("../routes/api/chats");
const mockingoose = require("mockingoose");
const mongoose = require("mongoose");
const Chat = require("../models/Chat");
const Message = require("../models/Message");

require("dotenv").config();

const date = new Date();
const fakeId = new mongoose.Types.ObjectId("deadbeefdeadbeefdeadbeef");
const mockChatData = {
  users: [fakeId],
  readBy: [],
  name: "fakename",
  owner: fakeId,
};
const mockMessageData = [
  {
    author: fakeId,
    contents: "fakemessage",
    timestamp: date,
    chat: fakeId,
    recipients: [fakeId],
  },
];
const res = {
  object: {},
  statusCode: 200,
  json: function (input) {
    this.statusCode = 200;
    this.object = input;
  },
  sendStatus: function (code) {
    this.statusCode = code;
  },
};

beforeEach(() => {
  res.json({});
  res.sendStatus(200);
});

describe("Get all chats", () => {
  // test getting all chats
  test("should return all chats", async () => {
    const req = {
      params: { user: fakeId },
    };
    mockingoose(Chat).toReturn([mockChatData]);
    mockingoose(Message).toReturn(mockMessageData[0], "findOne");
    await chats.get_default_function(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.object[0]).toMatchObject(mockChatData);
  });
});

describe("Get messages", () => {
  test("should return all messages", async () => {
    const req = {
      user: fakeId,
      params: { chat: fakeId },
    };

    mockingoose(Chat).toReturn(mockChatData, "findOne");
    mockingoose(Chat).toReturn({ readBy: [fakeId] }, "save");
    mockingoose(Message).toReturn(mockMessageData, "find");

    await chats.get_messages_function(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.object[0].author).toMatchObject(mockMessageData[0].author);
    expect(res.object[0].contents).toBe(mockMessageData[0].contents);
    expect(res.object[0].timestamp).toMatchObject(mockMessageData[0].timestamp);
    expect(res.object[0].chat).toMatchObject(mockMessageData[0].chat);
    expect(res.object[0].recipients[0]).toEqual(
      mockMessageData[0].recipients[0]
    );
  });
});

describe("Post messages", () => {
  test("should post message", async () => {
    const req = {
      user: fakeId,
      params: { chat: fakeId },
      body: { contents: "fakemessage" },
    };
    mockingoose(Chat).toReturn(mockChatData, "findOne");
    mockingoose(Message).toReturn(mockMessageData[0], "save");
    await chats.post_messages_function(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.object.toJSON()).toMatchObject(mockMessageData[0]);
  });
});

describe("add user to chat", () => {
  test("should not be able to add to chats user is not in", async () => {
    const req = {
      user: fakeId,
      params: { chat: fakeId },
      body: { user: fakeId },
    };
    const copy = Object.assign({}, mockChatData);
    copy.users = [];
    mockingoose(Chat).toReturn(copy, "findOne");
    mockingoose(Chat).toReturn(mockChatData, "save");
    await chats.post_add_function(req, res);
    expect(res.statusCode).toBe(403);
  });
});

describe("remove user from chat", () => {
  test("should remove user from chat", async () => {
    const req = {
      user: fakeId,
      params: { chat: fakeId },
      body: { users: [fakeId] },
    };
    mockingoose(Chat).toReturn(mockChatData, "findOne");
    const copy = Object.assign({}, mockChatData);
    copy.users = [];
    mockingoose(Chat).toReturn(copy, "save");
    await chats.post_remove_function(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.object.toJSON()).toMatchObject(copy);
  });
});

describe("rename a chat", () => {
  test("should rename a chat", async () => {
    const req = {
      user: fakeId,
      params: { chat: fakeId },
      body: { name: "newname" },
    };
    mockingoose(Chat).toReturn(mockChatData, "findOne");
    const copy = Object.assign({}, mockChatData);
    copy.name = "newname";
    mockingoose(Chat).toReturn(copy, "save");
    await chats.post_rename_function(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.object.toJSON()).toMatchObject(copy);
  });
});

describe("create new chat", () => {
  test("should create new chat", async () => {
    const req = {
      user: fakeId,
      body: { name: "fakename", id: "fakeid" },
    };
    mockingoose(Chat).toReturn(mockChatData, "save");
    await chats.post_new_function(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.object.toJSON()).toMatchObject(mockChatData);
  });
});

describe("delete a chat", () => {
  test("should delete a chat", async () => {
    const req = {
      user: fakeId.toString(),
      params: { chat: fakeId },
    };
    mockingoose(Chat).toReturn(mockChatData, "findOne");
    mockingoose(Chat).toReturn(mockChatData, "deleteOne");
    await chats.post_delete_function(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.object.toJSON()).toMatchObject(mockChatData);
  });
});

describe("mark chat as read", () => {
  test("should mark chat as read", async () => {
    const req = {
      user: fakeId,
      params: { user: fakeId },
    };
    mockingoose(Chat).toReturn(mockChatData, "findOne");
    const copy = Object.assign({}, mockChatData);
    copy.readBy.push(fakeId);
    mockingoose(Chat).toReturn(copy, "save");
    await chats.post_read_function(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.object.toJSON()).toMatchObject(copy);
  });
});
