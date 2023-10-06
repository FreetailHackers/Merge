import React from "react";
import howLongAgo from "../../utils/howLongAgo";
import PropTypes from "prop-types";

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

    <div
      style={
        profiles.length === 1 && profiles[0].profilePicture
          ? {
              backgroundImage: `url(${profiles[0].profilePicture})`,
            }
          : {}
      }
      className="chatPicture"
    >
      {profiles?.length > 1 &&
        profiles.map((prof, i) => {
          const mu = Math.sqrt(
            (1 - Math.cos((2 * Math.PI) / profiles.length)) / 2,
          );
          const theta = Math.PI / 2 + (2 * Math.PI * i) / profiles.length;
          const size = (45 * mu) / (1 + mu);
          const r = 45 / 2 / (1 + mu);
          const top = 45 / 2 - r * Math.sin(theta) - size / 2;
          const left = 45 / 2 + r * Math.cos(theta) - size / 2;
          return (
            <div
              key={i}
              style={{
                backgroundImage: `url("${prof.profilePicture}")`,
                position: "absolute",
                top: top,
                left: left,
                width: size,
                height: size,
                borderRadius: "50%",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {!prof.profilePicture && (
                <svg height="100%" width="100%" viewBox="0 0 45 45 ">
                  <circle
                    r={22.5}
                    cx={22.5}
                    cy={22.5}
                    fill="#ddd"
                    border="none"
                  />
                  {prof.name && (
                    <text
                      fontSize="22"
                      x="50%"
                      y="50%"
                      dominantBaseline="middle"
                      textAnchor="middle"
                      fill="black"
                    >
                      {prof.name
                        .split(" ")
                        .map((s) => s[0])
                        .join("")
                        .toUpperCase()}
                    </text>
                  )}
                </svg>
              )}
            </div>
          );
        })}
    </div>
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
    <div id="mobile-nav-space" style={{ height: "17vw" }} />
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
