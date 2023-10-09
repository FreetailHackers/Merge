import React, { useState } from "react";
import ChatPreview from "./ChatPreview";
import PropTypes from "prop-types";
import { MultiSelect } from "@mantine/core";
import toggleBars from "../../assets/images/toggle-bars.png";

function ChatSidebar(props) {
  const [newChatInput, setNewChatInput] = useState([]);
  const [creatingNewChat, setCreatingNewChat] = useState(false);
  const MAX_OTHERS = process.env.REACT_APP_MAX_TEAM_SIZE - 1;

  return (
    <div className="chatSidebar">
      <div className="chatSidebarTop">
        <div
          className="buttonHolder"
          style={creatingNewChat ? { marginBottom: 10 } : {}}
        >
          {!props.wideScreen && (
            <div className="sidebarToggleHolder">
              <button
                className="toggleSidebar"
                onClick={props.flipDisplaySidebar}
              >
                <img src={toggleBars} alt="toggle bars" />
              </button>
            </div>
          )}
          {
            <div className={props.wideScreen ? "" : "innerButtonHolder"}>
              {creatingNewChat && (
                <button
                  className="newChatButton themeButton"
                  onClick={() => {
                    setCreatingNewChat(false);
                    setNewChatInput([]);
                  }}
                >
                  Cancel
                </button>
              )}
              {(!creatingNewChat || newChatInput.length > 0) && (
                <button
                  className="newChatButton themeButton"
                  onClick={
                    creatingNewChat
                      ? () => {
                          props.createChat([...newChatInput]);
                          setNewChatInput([]);
                          setCreatingNewChat(false);
                        }
                      : () => setCreatingNewChat(true)
                  }
                >
                  {creatingNewChat ? "Confirm" : "New Chat"}
                </button>
              )}
            </div>
          }
        </div>
        {creatingNewChat && (
          <MultiSelect
            value={newChatInput}
            onChange={(values) =>
              setNewChatInput(
                values.length > MAX_OTHERS
                  ? values.slice(0, MAX_OTHERS - values.length)
                  : values
              )
            }
            placeholder="Search for people to add"
            searchable
            data={
              props.otherUsers &&
              props.otherUsers.map((user) => ({
                value: user._id,
                label: user.name,
              }))
            }
          />
        )}
      </div>
      {props.chats.map((chat, i) => (
        <ChatPreview
          key={i}
          active={chat._id === props.selectedChat}
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
          onClick={() => props.changeChat(chat._id)}
        />
      ))}
    </div>
  );
}

ChatSidebar.propTypes = {
  selectedChat: PropTypes.string,
  chats: PropTypes.array.isRequired,
  createChat: PropTypes.func.isRequired,
  changeChat: PropTypes.func.isRequired,
  flipDisplaySidebar: PropTypes.func,
  wideScreen: PropTypes.bool,
  otherUsers: PropTypes.arrayOf(PropTypes.object),
  selfID: PropTypes.string.isRequired,
};

export default ChatSidebar;
