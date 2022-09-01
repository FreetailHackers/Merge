import React from "react";
import howLongAgo from "../utils/howLongAgo";
import PropTypes from "prop-types";

const ChatPreview = ({
  users,
  lastMessage,
  lastMessageDate,
  profilePicture,
  seen,
  onClick,
  active,
  chatRequest,
}) => (
  <div
    className={
      "chatPreview" +
      (chatRequest
        ? " chatrequest"
        : (!seen ? " unread" : "") + (active ? " active" : ""))
    }
    onClick={onClick}
  >
    <div
      style={{ backgroundImage: `url(${profilePicture})` }}
      className="chatPicture"
    />
    <div className="text">
      <h4>{users.join(", ")}</h4>
      {chatRequest ? (
        <p>
          <span className="messagePreview"> incoming chat request! </span>
        </p>
      ) : (
        <p>
          <span className="messagePreview">{lastMessage}</span>{" "}
          <span className="smallDivider" /> {howLongAgo(lastMessageDate)}
        </p>
      )}
    </div>
    {!seen ? <span className="unreadBubble" /> : null}
  </div>
);

ChatPreview.propTypes = {
  users: PropTypes.array.isRequired,
  lastMessage: PropTypes.string.isRequired,
  lastMessageDate: PropTypes.object.isRequired,
  profilePicture: PropTypes.string.isRequired,
  seen: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  active: PropTypes.bool.isRequired,
  chatRequest: PropTypes.bool.isRequired,
};

export default ChatPreview;
