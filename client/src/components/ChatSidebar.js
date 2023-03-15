import React from "react";
import ChatPreview from "./ChatPreview";
import "./ChatSidebar.css";
import PropTypes from "prop-types";
import { MultiSelect } from "@mantine/core";

const ChatSidebar = (props) => (
  <div className="chatSidebar">
    <div className="chatSidebarTop">
      <div
        className="buttonHolder"
        style={props.creatingNewChat ? { marginBottom: 10 } : {}}
      >
        {!props.wideScreen && (
          <div className="sidebarToggleHolder">
            <button
              className="toggleSidebar"
              onClick={props.flipDisplaySidebar}
            >
              ≡
            </button>
          </div>
        )}
        {
          <div className={props.wideScreen ? "" : "innerButtonHolder"}>
            {props.creatingNewChat && (
              <button
                className="newChatButton themeButton"
                onClick={() => props.setCreatingNewChat(false)}
              >
                Cancel
              </button>
            )}
            {(!props.creatingNewChat || props.newChatInput.length > 0) && (
              <button
                className="newChatButton themeButton"
                onClick={
                  props.creatingNewChat
                    ? props.createChat
                    : () => props.setCreatingNewChat(true)
                }
              >
                {props.creatingNewChat ? "Confirm" : "New Chat"}
              </button>
            )}
          </div>
        }
      </div>
      {props.creatingNewChat && (
        <MultiSelect
          value={props.newChatInput}
          onChange={(values) =>
            props.updateNewChatInput(
              values.length > 4 ? values.slice(0, 4 - values.length) : values
            )
          }
          placeholder="Search for people to add"
          searchable
          data={
            props.otherUsers &&
            props.otherUsers.map((user) => ({
              value: user._id,
              label: user.name,
              // image: user.profile && user.profile[0]?.profilePictureUrl,
            }))
          }
        />
      )}
    </div>
    {props.chats.map((chat, i) => (
      <ChatPreview
        key={i}
        active={i === props.activeChatIndex}
        title={
          chat.name
            ? chat.name
            : String(
                chat.users.map((id) => `${chat.profiles[id].name}`)
              ).replaceAll(",", ", ")
        }
        createdByYou={chat.owner === props.selfID}
        chatRequest={chat.lastMessage === null}
        lastMessage={chat.lastMessage?.contents}
        lastMessageDate={chat.lastMessage?.timestamp}
        profiles={chat.users.map((user) => chat.profiles[user])}
        seen={chat.seen}
        onClick={() => props.changeChat(i)}
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
  flipDisplaySidebar: PropTypes.func,
  wideScreen: PropTypes.bool,
  newChatInput: PropTypes.array.isRequired,
  updateNewChatInput: PropTypes.func.isRequired,
  otherUsers: PropTypes.arrayOf(PropTypes.object),
  creatingNewChat: PropTypes.bool,
  setCreatingNewChat: PropTypes.func,
  selfID: PropTypes.string.isRequired,
};

export default ChatSidebar;
