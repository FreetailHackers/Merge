import React from "react";
import ChatPreview from "./ChatPreview";
import "./ChatSidebar.css";
import PropTypes from "prop-types";
import { MultiSelect } from "@mantine/core";

const ChatSidebar = ({
  createChat,
  creatingNewChat,
  setCreatingNewChat,
  newChatInput,
  updateNewChatInput,
  otherUsers,
  chats,
  changeChat,
  activeChatIndex,
}) => (
  <div className="chatSidebar">
    <div className="chatSidebarTop">
      <div style={creatingNewChat ? { marginBottom: 10 } : {}}>
        {creatingNewChat && (
          <button
            className="newChatButton themeButton"
            onClick={() => setCreatingNewChat(false)}
          >
            Cancel
          </button>
        )}
        {(!creatingNewChat || newChatInput.length > 0) && (
          <button
            className="newChatButton themeButton"
            onClick={
              creatingNewChat ? createChat : () => setCreatingNewChat(true)
            }
          >
            {creatingNewChat ? "Confirm" : "New Chat"}
          </button>
        )}
      </div>
      {creatingNewChat && (
        <MultiSelect
          value={newChatInput}
          onChange={(values) => updateNewChatInput(values)}
          placeholder="Search for people to add"
          searchable
          data={
            otherUsers &&
            otherUsers.map((user) => ({
              value: user._id,
              label: user.name,
              image: user.profile && user.profile[0]?.profilePictureUrl,
            }))
          }
        />
      )}
    </div>
    {chats.map((chat, i) => (
      <ChatPreview
        key={i}
        active={i === activeChatIndex}
        title={chat.name}
        chatRequest={chat.lastMessage === null}
        lastMessage={chat.lastMessage?.contents}
        lastMessageDate={chat.lastMessage?.timestamp}
        profilePictures={chat.users.map(
          (user) => chat.profiles[user].profilePicture
        )}
        seen={chat.seen}
        onClick={() => changeChat(i)}
      />
    ))}
  </div>
);

ChatSidebar.propTypes = {
  activeChatIndex: PropTypes.number.isRequired,
  setActiveChatIndex: PropTypes.func,
  chats: PropTypes.array.isRequired,
  createChat: PropTypes.func.isRequired,
  changeChat: PropTypes.func.isRequired,
  newChatInput: PropTypes.array.isRequired,
  updateNewChatInput: PropTypes.func.isRequired,
  otherUsers: PropTypes.arrayOf(PropTypes.object),
  creatingNewChat: PropTypes.bool,
  setCreatingNewChat: PropTypes.func,
};

export default ChatSidebar;
