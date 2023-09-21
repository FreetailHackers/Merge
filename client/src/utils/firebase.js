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
  //limitToLast,
} from "firebase/database";

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,  
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
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
// Delete a chat
// Listen for a chat being deleted

// #5:
// Leave a chat
// Listen for a user leaving a chat

// #6:
// Block a user from a chat
// Listen for a user being blocked from a chat

// #7:
// Unblock a user from a chat
// Listen for a user being unblocked from a chat

// TODO: Ensure people can swipe and create chats
// Not sure what this meant?

// Functions to interact with the Firebase Realtime Database
const createRoom = (data) => {
  let record = { ...data };
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
  onChildAdded(roomsRef, async (chatSnapshot) => {
    const results = {
      _id: chatSnapshot.key,
      ...chatSnapshot.val(),
    };
    results.created = new Date(results.created).toISOString();

    // change users from being keys to an array
    results.users = Object.keys(results.users);
    results.readBy = Object.keys(results.readBy).map((x) => {
      return results.readBy[x] ? x : "";
    });
    const resp = await (
      await fetch(
        firebaseConfig.databaseURL + "/messages/" +
          chatSnapshot.key +
          ".json?limitToLast=1&orderBy=%22timestamp%22"
      )
    ).json();
    if (resp !== null) {
      const key = Object.keys(resp)[0];
      const message = { _id: key, ...resp[key] };
      message.author = Object.keys(message.author);
      message.timestamp = new Date(message.timestamp);
      message.chat = chatSnapshot.key;
      message.recipients = Object.keys(message.recipients);
      results.lastMessage = message;
      results.seen = results.readBy.indexOf(userId) != -1;
    }
    console.log(results);
    callback(results);
  });
  return () => off(roomsRef, "child_added");
};

const listenForRoomDeletions = (userId, callback) => {
  const roomsRef = query(
    ref(db, "chats"),
    orderByChild("users/" + userId),
    equalTo(true)
  );
  onChildRemoved(roomsRef, (chatSnapshot) => {
    const results = {
      _id: chatSnapshot.key,
      ...chatSnapshot.val(),
    };

    callback(results);
  });
  return () => off(roomsRef, "child_removed");
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

const listenForRoomRename = (data, callback) => {
  const messagesRef = query(ref(db, `chats/${data.roomId}/name`));
  onValue(messagesRef, (snapshot) => {
    callback({ newName: snapshot.val(), chatID: data.roomId });
  });
  return () => off(messagesRef, "value");
};

const listenForNewMessages = (data, callback) => {
  const messagesRef = query(
    ref(db, `messages/${data.roomId}/`),
    //orderByChild(`${data.userId}`),
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
  console.log(userIds);
  userIds.forEach((userId) => {
    const blocked = {};
    blocked[userId] = true;
    update(ref(db, `chats/${roomId}/blockedUsers`), blocked);
  });
};

const unblockUsers = (roomId, userIds) => {
  userIds.forEach((userId) => {
    remove(ref(db, `chats/${roomId}/blockedUsers/${userId}`));
  });
};

const listenForBlockAndUnblock = (roomId, callback) => {
  const chatRef = ref(db, `chats/${roomId}/name/blockedUsers`);
  onChildAdded(chatRef, (snapshot) => {
    callback({ userID: snapshot.val(), type: "block" });
  });
  onChildRemoved(chatRef, (snapshot) => {
    callback({ userID: snapshot.val(), type: "unblock" });
  });
  return () => {
    off(chatRef, "child_added");
    off(chatRef, "child_removed");
  };
};

const renameRoom = (data) => {
  update(ref(db, `chats/${data.chatId}`), { name: data.name });
};

const leaveRoom = (data) => {
  remove(ref(db, `chats/${data._id}/users/${data.userId}`));
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
  listenForRoomDeletions,
  listenForRoomRename,
  newMessage,
  listenForNewMessages,
  readMessage,
  addUser,
  listenForUserAdditions,
  listenForUserRemovals,
  blockUsers,
  unblockUsers,
  listenForBlockAndUnblock,
  renameRoom,
  leaveRoom,
  removeUsers,
  deleteRoom,
};
