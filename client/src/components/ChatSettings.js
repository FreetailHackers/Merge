import React, { useState } from "react";
import PropTypes from "prop-types";
import { MultiSelect } from "@mantine/core";

function ChatSettings(props) {
  const [addingUsers, setAddingUsers] = useState(false);
  const [newUserIDs, setNewUserIDs] = useState([]);
  const [kicking, setKicking] = useState([]);
  const [reporting, setReporting] = useState([]);
  const [blocking, setBlocking] = useState([]);
  const [unblocking, setUnblocking] = useState([]);
  const [leavingDeleting, setLeavingDeleting] = useState("");

  const anyAction =
    kicking.length > 0 ||
    reporting.length > 0 ||
    blocking.length > 0 ||
    unblocking.length > 0 ||
    leavingDeleting === "confirmed";

  const chatOwner = props.chat.owner === props.selfID;

  // if elem in list, remove, else add
  const pushPop = (list, setList, elem) => {
    if (list.includes(elem)) {
      setList((prev) => [...prev.filter((e) => e !== elem)]);
    } else {
      setList((prev) => [...prev, elem]);
    }
  };

  const color = (list, elem) => (list.includes(elem) ? "#9f9" : "#ddd");

  return (
    <div id="reportFloatingWindow" className={"reportFloatingWindow"}>
      <button id="exit" className="exitButton" onClick={props.exit}>
        Back
      </button>

      <div className="reportWindowUserSelect">
        <h3>{props.title}</h3>
        <p style={{ marginTop: 15 }}>
          {props.chat.profiles[props.selfID].name} (you)
        </p>
        {props.chat &&
          props.chat.profiles &&
          Object.entries(props.chat.profiles)
            .filter((entry) => entry[0] !== props.selfID)
            .map((entry, i) => (
              <div key={i} className="userRow">
                <p>
                  {entry[1].name}{" "}
                  {!props.chat.users.includes(entry[0]) && "(not present)"}
                  {props.blockedByMe.includes(entry[0]) && "(blocked)"}
                </p>
                {props.chat.users.includes(entry[0]) && chatOwner && (
                  <button
                    className="actionButton"
                    style={{ backgroundColor: color(kicking, entry[0]) }}
                    onClick={() => pushPop(kicking, setKicking, entry[0])}
                  >
                    K
                  </button>
                )}
                <button
                  className="actionButton"
                  style={{
                    backgroundColor: color(
                      props.blockedByMe.includes(entry[0])
                        ? unblocking
                        : blocking,
                      entry[0]
                    ),
                  }}
                  onClick={
                    props.blockedByMe.includes(entry[0])
                      ? () => pushPop(unblocking, setUnblocking, entry[0])
                      : () => pushPop(blocking, setBlocking, entry[0])
                  }
                >
                  {props.blockedByMe.includes(entry[0]) ? "U" : "B"}
                </button>
                <button
                  className="actionButton"
                  style={{ backgroundColor: color(reporting, entry[0]) }}
                  onClick={() => pushPop(reporting, setReporting, entry[0])}
                >
                  R
                </button>
              </div>
            ))}
        <div
          className="userAddition"
          style={addingUsers ? { width: "40%" } : {}}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              marginBottom: addingUsers ? 5 : 0,
            }}
          >
            {addingUsers && (
              <button
                className="themeButton"
                onClick={() => {
                  setAddingUsers(false);
                  setNewUserIDs([]);
                }}
              >
                Cancel
              </button>
            )}
            {props.chat.users.length < 5 &&
              (!addingUsers || newUserIDs.length > 0) && (
                <button
                  className="themeButton"
                  onClick={() => {
                    if (addingUsers) {
                      props.addUsers(newUserIDs);
                      setNewUserIDs([]);
                      setAddingUsers(false);
                    } else {
                      setAddingUsers(true);
                    }
                  }}
                >
                  Add Users
                </button>
              )}
          </div>
          {addingUsers && (
            <MultiSelect
              style={{ width: "100%" }}
              value={newUserIDs}
              onChange={(values) =>
                setNewUserIDs(
                  values.length + props.chat.users.length > 5
                    ? values.slice(
                        0,
                        5 - values.length - props.chat.users.length
                      )
                    : values
                )
              }
              placeholder="Search for people"
              searchable
              data={
                props.otherUsers &&
                props.otherUsers.map((user) => ({
                  value: user._id,
                  label: user.name,
                  image: user.profile && user.profile[0]?.profilePictureUrl,
                }))
              }
            />
          )}
        </div>

        <div className="userRow">
          {leavingDeleting && (
            <button
              className="themeButton"
              onClick={() => setLeavingDeleting("")}
            >
              Cancel
            </button>
          )}
          {leavingDeleting === "confirmed" ? (
            <p style={{ color: "#900" }} className="redText">
              {chatOwner ? "Deleting" : "Leaving"} Chat
            </p>
          ) : (
            <button
              className="themeButton"
              type="button"
              id="delete"
              onClick={
                !leavingDeleting
                  ? () => setLeavingDeleting("pondering")
                  : () => setLeavingDeleting("confirmed")
              }
            >
              {leavingDeleting
                ? `Confirm ${chatOwner ? "Deleting" : "Leaving"}?`
                : `${chatOwner ? "Delete" : "Leave"} Chat`}
            </button>
          )}
        </div>
      </div>

      {reporting.length > 0 && (
        <textarea id="reason" placeholder="Reason for reporting" />
      )}
      {anyAction && (
        <button
          id="submit"
          className="submitButton themeButton"
          onClick={() =>
            props.submitReport(
              kicking,
              blocking,
              unblocking,
              reporting,
              leavingDeleting
            )
          }
        >
          Submit
        </button>
      )}
    </div>
  );
}

ChatSettings.propTypes = {
  exit: PropTypes.func,
  submitReport: PropTypes.func,
  chat: PropTypes.object,
  selfID: PropTypes.string,
  blockedByMe: PropTypes.array,
  otherUsers: PropTypes.array,
  addUsers: PropTypes.func,
  title: PropTypes.string,
};

export default ChatSettings;
