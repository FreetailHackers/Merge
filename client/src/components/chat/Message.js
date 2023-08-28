import React from "react";
import PropTypes from "prop-types";

const Message = ({
  fromSelf,
  content,
  image,
  name,
  timestamp,
  mergeBottom,
  mergeTop,
}) => (
  <div
    className={
      "message" +
      (fromSelf ? " rightSide" : "") +
      (mergeBottom ? " mergeBottom" : "") +
      (mergeTop ? " mergeTop" : "")
    }
  >
    {mergeBottom ? null : (
      <div
        className="messageImage"
        style={{
          backgroundImage: `url("${image}")`,
        }}
      />
    )}
    <div>
      {mergeTop ? null : <p className="messageName">{name}</p>}
      <div className="messageContent">{content}</div>
    </div>
    <div>
      <p className="messageTimestamp">{timestamp}</p>
    </div>
  </div>
);

Message.propTypes = {
  fromSelf: PropTypes.bool.isRequired,
  content: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  image: PropTypes.string,
  timestamp: PropTypes.string.isRequired,
  mergeBottom: PropTypes.bool.isRequired,
  mergeTop: PropTypes.bool.isRequired,
};

export default Message;
