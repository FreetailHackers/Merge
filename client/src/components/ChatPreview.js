import React from "react";
import howLongAgo from "../utils/howLongAgo";
import PropTypes from "prop-types";

const ChatPreview = ({
  title,
  lastMessage,
  lastMessageDate,
  profilePictures,
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
      style={{
        backgroundImage:
          profilePictures.length === 1 ? `url(${profilePictures[0]})` : "none",
      }}
      className="chatPicture"
    >
      {profilePictures?.length > 1 &&
        profilePictures.map((pic, i) => {
          const mu = Math.sqrt(
            (1 - Math.cos((2 * Math.PI) / profilePictures.length)) / 2
          );
          const theta =
            Math.PI / 2 + (2 * Math.PI * i) / profilePictures.length;
          const size = (45 * mu) / (1 + mu);
          const r = 45 / 2 / (1 + mu);
          const top = 45 / 2 - r * Math.sin(theta) - size / 2;
          const left = 45 / 2 + r * Math.cos(theta) - size / 2;
          return (
            <div
              key={i}
              style={{
                backgroundImage: `url("${pic}")`,
                position: "absolute",
                top: top,
                left: left,
                width: size,
                height: size,
                borderRadius: "50%",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          );
        })}
    </div>
    <div className="text">
      <h4>{title}</h4>
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
  users: PropTypes.array,
  lastMessage: PropTypes.string,
  lastMessageDate: PropTypes.string,
  seen: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  active: PropTypes.bool.isRequired,
  chatRequest: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  profilePictures: PropTypes.arrayOf(PropTypes.string),
};

export default ChatPreview;
