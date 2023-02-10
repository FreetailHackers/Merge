import React from "react";
import ChatPreview from "./ChatPreview";
import "./ChatSidebar.css";
import PropTypes from "prop-types";
import { MultiSelect } from "@mantine/core";

const ChatSidebar = ({
  createChat,
  newChatInput,
  updateNewChatInput,
  otherUsers,
  chats,
  changeChat,
  activeChatIndex,
}) => (
  <div className="chatSidebar">
    <div className="chatSidebarTop">
      <button className="newChatButton" onClick={createChat}>
        New Chat
      </button>
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
            image:
              user.profile &&
              user.profile[0] &&
              user.profile[0].profilePictureUrl &&
              user.profile[0].profilePictureUrl,
          }))
        }
      />
    </div>
    {chats.map((chat, i) => (
      <ChatPreview
        key={i}
        active={i === activeChatIndex}
        title={chat.name}
        chatRequest={chat.lastMessage === null}
        lastMessage={chat.lastMessage?.contents}
        lastMessageDate={chat.lastMessage?.timestamp}
        profilePictures={Object.entries(chat.profiles).map(
          (profile) => profile[1].profilePicture
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
};

export default ChatSidebar;
