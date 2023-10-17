import React from "react";
import howLongAgo from "../../utils/howLongAgo";
import PropTypes from "prop-types";
import PictureCircle from "../PictureCircle";

const ChatPreview = ({
  title,
  lastMessage,
  lastMessageDate,
  profiles,
  seen,
  onClick,
  active,
  chatRequest,
  createdByYou,
}) => (
  <div
    className={
      "chatPreview" +
      (chatRequest && !seen && !active && !createdByYou
        ? " chatrequest"
        : (!seen ? " unread" : "") + (active ? " active" : ""))
    }
    onClick={onClick}
  >
    {!seen ? <span className="unreadBubble" /> : null}

    <PictureCircle outerClass="chatPicture" profiles={profiles}/>
    <div className="text">
      <h4>{title}</h4>
      {chatRequest ? (
        <p>
          <span className="messagePreview">
            {" "}
            {createdByYou || seen
              ? "No messages yet"
              : "Incoming chat request!"}{" "}
          </span>
        </p>
      ) : (
        <p>
          <span className="messagePreview">{lastMessage}</span>{" "}
          <span className="smallDivider" /> {howLongAgo(lastMessageDate)}
        </p>
      )}
    </div>
  </div>
);

ChatPreview.propTypes = {
  users: PropTypes.array,
  lastMessage: PropTypes.string,
  lastMessageDate: PropTypes.string,
  seen: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  active: PropTypes.bool.isRequired,
  chatRequest: PropTypes.bool.isRequired,
  createdByYou: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  profiles: PropTypes.arrayOf(PropTypes.object),
};

export default ChatPreview;
