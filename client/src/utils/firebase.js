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
  onChildChanged,
  // set,
  off,
  limitToLast,
} from "firebase/database";

// Initialize Firebase
const firebaseConfig = {
  // Your Firebase config goes here
  apiKey: "AIzaSyCC3yEIJ8Vt4bxFU8Bw59CMt6PPI_LAcEI",
  authDomain: "merge-integ.firebaseapp.com",
  databaseURL: "https://merge-integ-default-rtdb.firebaseio.com",
  projectId: "merge-integ",
  storageBucket: "merge-integ.appspot.com",
  messagingSenderId: "984268791583",
  appId: "1:984268791583:web:3da2a7008a8a73089b1a2a",
};
initializeApp(firebaseConfig);
setLogLevel("silent");
const db = getDatabase();

// TODO: Figure out why only the last message is shown
// TODO: Correctly detach the listeners

// #1:
// TODO: Rename a chat
// TODO: Listen for a chat being renamed

// #2:
// TODO: Add a user to a chat
// TODO: Listen for a user being added to a chat

// #3:
// TODO: Remove a user from a chat
// TODO: Listen for a user being removed from a chat

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

// Functions to interact with the Firebase Realtime Database
const createRoom = (data) => {
  data.created = serverTimestamp();
  data.users = data.users.reduce((result, userId) => {
    return { ...result, [userId]: true };
  }, {});
  data.readBy = data.users;
  push(ref(db, `chats/`), data);
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

    console.log(results);
    callback(results);
  });
  return () => off(roomsRef, "child_added");
};

const newMessage = (id, data) => {
  const updates = {};
  for (let recipient of data.recipients) {
    data.recipients[recipient] = true;
    updates[`chats/${id}/readBy/${recipient}`] = false;
  }
  updates[`chats/${id}/readBy/${data.author}`] = true;
  push(ref(db, `messages/${id}`), data);
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

const readMessage = (messageId, userId) => {
  const readBy = {};
  readBy[userId] = true;
  update(ref(db, `chats/${messageId}/readBy/`), readBy);
};

const addUser = (data) => {
  const newUser = {};
  newUser[data.userId] = true;
  update(ref(db, `chats/${data.roomId}/users/`), newUser);
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
  onChildChanged(chatRef, (snapshot) => {
    callback(snapshot.key);
  });
  return () => off(chatRef, "value");
};

const leaveRoom = (data) => {
  remove(ref(db, `chats/${data.roomId}/users`), data.userId);
};

const removeUsers = (roomId, userIds) => {
  userIds.forEach((userId) => {
    db.ref(`chats/${roomId}/users`).child(userId).remove();
  });
};

const deleteRoom = (roomId) => {
  remove(ref(db, `chats/${roomId}`));
};

const listenForRoomDeletions = (userId, callback) => {
  const roomsRef = query(
    ref(db, "chats"),
    orderByChild("users/" + userId),
    equalTo(true)
  );
  onChildRemoved(roomsRef, (snapshot) => {
    callback(snapshot.val());
  });
  return () => off(roomsRef, "child_added");
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
  listenForRoomDeletions,
};
