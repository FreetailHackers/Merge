import { initializeApp, setLogLevel } from "firebase/app";
import {
  getDatabase,
  serverTimestamp,
  ref,
  push,
  query,
  onChildAdded,
  onChildRemoved,
  equalTo,
  orderByChild,
  update,
  remove,
  onValue,
  // set,
  off,
  limitToLast,
} from "firebase/database";

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCqGLV18p4txbbVVT9jXtz9XPh_lhlySLU",
  authDomain: "mergechat-nickorlow.firebaseapp.com",
  databaseURL: "https://mergechat-nickorlow-default-rtdb.firebaseio.com",
  projectId: "mergechat-nickorlow",
  storageBucket: "mergechat-nickorlow.appspot.com",
  messagingSenderId: "675031887967",
  appId: "1:675031887967:web:f5db58898f9c10e74d6bea",
  measurementId: "G-MJRQDJR6K6"
};
 
initializeApp(firebaseConfig);
setLogLevel("silent");
const db = getDatabase();

// DONE: Figure out why only the last message is shown
// IN-PROGRESS: Correctly detach the listeners

// #1:
// DONE: Rename a chat
// DONE: Listen for a chat being renamed

// #2:
// DONE: Add a user to a chat
// DONE: Listen for a user being added to a chat

// #3:
// DONE: Remove a user from a chat
// DONE: Listen for a user being removed from a chat

// #4:
// TODO: Delete a chat
// TODO: Listen for a chat being deleted

// #5:
// TODO: Leave a chat
// TODO: Listen for a user leaving a chat

// #6:
// TODO: Block a user from a chat
// TODO: Listen for a user being blocked from a chat

// #7:
// TODO: Unblock a user from a chat
// TODO: Listen for a user being unblocked from a chat

// TODO: Ensure people can swipe and create chats

// Functions to interact with the Firebase Realtime Database
const createRoom = (data) => {
  let record = { ...data }
  record.created = serverTimestamp();
  record.users = data.users.reduce((result, userId) => {
    return { ...result, [userId]: true };
  }, {});
    record.readBy = record.users;
  push(ref(db, `chats/`), record);
};

const listenForRoomAdditions = (userId, callback) => {
  const roomsRef = query(
    ref(db, "chats"),
    orderByChild("users/" + userId),
    equalTo(true)
  );
  onChildAdded(roomsRef, (chatSnapshot) => {
    const results = {
      _id: chatSnapshot.key,
      ...chatSnapshot.val(),
    };
    results.created = new Date(results.created).toISOString();

    // change users from being keys to an array
    results.users = Object.keys(results.users);
    results.readBy = Object.keys(results.readBy);

    // get the last message
    const lastMessageRef = query(
      ref(db, `messages/${chatSnapshot.key}/`),
      orderByChild("timestamp"),
      limitToLast(1)
    );
    onChildAdded(lastMessageRef, (messageSnapshot) => {
      const message = {
        _id: messageSnapshot.key,
        ...messageSnapshot.val(),
      };
      message.author = Object.keys(message.author);
      message.timestamp = new Date(message.timestamp);
      message.chat = chatSnapshot.key;
      message.recipients = Object.keys(message.recipients);
      results.lastMessage = message;
    });

    callback(results);
  });
  return () => off(roomsRef, "child_added");
};

const newMessage = (data) => {
  const updates = {};
  for (let recipient of data.recipients) {
    data.recipients[recipient] = true;
    updates[`chats/${data.chat}/readBy/${recipient}`] = false;
  }
  updates[`chats/${data.chat}/readBy/${data.author}`] = true;
  push(ref(db, `messages/${data.chat}`), data);
  update(ref(db), updates);
};

const listenForNewMessages = (data, callback) => {
  const messagesRef = query(
    ref(db, `messages/${data.roomId}/`),
    orderByChild(`${data.userId}`),
    equalTo(null)
  );

  onChildAdded(messagesRef, (snapshot) => {
    let result = snapshot.val();
    result._id = snapshot.key;
    result.chat = data.roomId;
    result.recipients = Object.keys(result.recipients);
    result.timestamp = new Date(result.timestamp).toISOString();
    callback(result);
  });
  return () => off(messagesRef, "child_added");
};

const readMessage = (chatId, userId) => {
  const readBy = {};
  readBy[userId] = true;
  update(ref(db, `chats/${chatId}/readBy/`), readBy);
};

const addUser = (data) => {
  const newUsers = {};
  for (let user of data.users) {
    newUsers[`chats/${data.roomId}/users/${user}`] = true;
  }
  update(ref(db), newUsers);
};

const listenForUserAdditions = (roomId, callback) => {
  const usersRef = ref(db, `chats/${roomId}/users`);
  onChildAdded(usersRef, (snapshot) => {
    callback(snapshot.key);
  });
  return () => off(usersRef, "value");
};

const listenForUserRemovals = (roomId, callback) => {
  const usersRef = ref(db, `chats/${roomId}/users`);
  onChildRemoved(usersRef, (snapshot) => {
    callback(snapshot.key);
  });
  return () => off(usersRef, "value");
};

const blockUsers = (roomId, userIds) => {
  userIds.forEach((userId) => {
    db.ref(`chats/${roomId}/blockedUsers`).child(userId).set(true);
  });
};

const unblockUsers = (roomId, userIds) => {
  userIds.forEach((userId) => {
    db.ref(`chats/${roomId}/blockedUsers`).child(userId).remove();
  });
};

const renameRoom = (data) => {
  update(ref(db, `chats/${data.chatId}`), { name: data.name });
};

const listenForNameChanges = (roomId, callback) => {
  const chatRef = ref(db, `chats/${roomId}/name`);
  onValue(chatRef, (snapshot) => {
    callback(snapshot.val());
  });
  return () => off(chatRef, "value");
};

const leaveRoom = (data) => {
  remove(ref(db, `chats/${data.roomId}/users`), data.userId);
};

const removeUsers = (roomId, userIds) => {
  const updates = {};
  userIds.forEach((userId) => {
    updates[`chats/${roomId}/users/${userId}`] = null;
  });
  update(ref(db), updates);
};

const deleteRoom = (roomId) => {
  remove(ref(db, `chats/${roomId}`));
};

export {
  createRoom,
  listenForRoomAdditions,
  newMessage,
  listenForNewMessages,
  readMessage,
  addUser,
  listenForUserAdditions,
  listenForUserRemovals,
  blockUsers,
  unblockUsers,
  renameRoom,
  listenForNameChanges,
  leaveRoom,
  removeUsers,
  deleteRoom,
};

