import Navbar from "./components/Navbar";
import io from "socket.io-client";
import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import axios from "axios";
import NavMobile from "./components/NavMobile";
import { useNavigate } from "react-router-dom";

const noUpdates = {
  chat: false,
  browse: false,
  profile: false,
};

function LoggedInApp(props) {
  const {
    auth,
    displaySidebar,
    setDisplaySidebar,
    wideScreen,
    setSocketConnected,
    logoutUser,
    teamID,
    setTeamID,
    setTeam,
  } = props;
  const [socket, setSocket] = useState(null);
  const [updates, setUpdates] = useState({ ...noUpdates });
  let location = useLocation();

  const token = auth?.token;
  const userID = auth.userID.id;
  const navigate = useNavigate();

  useEffect(() => {
    async function checkForUpdates() {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/users/checkForUpdates/${userID}`
      );
      setUpdates(res.data);
    }
    if (userID) checkForUpdates();
  }, [userID]);

  useEffect(() => {
    if (token) {
      const socketVar = io(process.env.REACT_APP_CHAT_URL, {
        transports: ["websocket"],
        query: { token },
      });
      socketVar.on("connect", () => {
        setSocket(socketVar);
        setSocketConnected(true);
      });
    } else {
      setSocket((prev) => {
        if (prev?.connected) {
          prev.disconnect();
        }
        return null;
      });
    }
  }, [token, setSocketConnected]);

  useEffect(() => {
    function membershipUpdatedWS(data) {
      if (data.kickedUsers.includes(userID)) {
        setTeamID(data.newTeams[userID]);
      } else {
        setTeam((prev) => {
          let newTeam = { ...prev };
          newTeam.users = [
            ...newTeam.users.filter((e) => !data.kickedUsers.includes(e)),
          ];
          for (const user of data.kickedUsers) {
            delete newTeam.profiles[user];
          }
          if (data.newLeader) {
            newTeam.leader = data.newLeader;
          }
          return newTeam;
        });
      }
    }

    function teammateLeftWS(data) {
      setTeam((prev) => {
        let newTeam = { ...prev };
        delete newTeam.profiles[data.userID];
        newTeam.users = [...newTeam.users.filter((e) => e !== data.userID)];
        return newTeam;
      });
    }

    if (socket) {
      socket.on("membership-updated", membershipUpdatedWS);
      socket.on("kicked-from-team", (data) => setTeamID(data.newTeam));
      socket.on("merge-accepted", (data) => {
        if (teamID === data.newTeam._id) {
          setTeam(data.newTeam);
        }
        setTeamID(data.newTeam._id);
        navigate("/edit");
      });
      socket.on("teammate-left", teammateLeftWS);
    }
    return () => {
      if (socket) {
        socket.off("kicked-from-team");
        socket.off("merge-accepted");
        socket.off("membership-updated");
        socket.off("teammate-left");
      }
    };
  }, [socket, teamID, setTeamID, setTeam, userID, navigate]);

  useEffect(() => {
    if (socket && teamID) {
      socket.emit("join-team-room", { id: teamID });
    }
    return () => {
      if (socket && teamID) {
        socket.emit("leave-room", { id: teamID });
      }
    };
  }, [socket, teamID]);

  const path = location?.pathname;
  const onChat = path?.endsWith("chat");
  const onBrowse = path?.endsWith("browse");
  const onProfile = path?.endsWith("edit");

  useEffect(() => {
    if (socket) {
      if (onChat) {
        setUpdates((prev) => ({ ...prev, chat: false }));
      } else {
        socket.on("chat-update", () =>
          setUpdates((prev) => ({ ...prev, chat: true }))
        );
      }

      if (onBrowse) {
        setUpdates((prev) => ({ ...prev, browse: false }));
      } else {
        socket.on("browse-update", () =>
          setUpdates((prev) => ({ ...prev, browse: true }))
        );
      }

      if (onProfile) {
        setUpdates((prev) => ({ ...prev, profile: false }));
      } else {
        socket.on("team-update", () =>
          setUpdates((prev) => ({ ...prev, profile: true }))
        );
      }
    }
    return () => {
      if (socket) {
        if (!onChat) {
          socket.off("chat-update");
        }
        if (!onBrowse) {
          socket.off("browse-update");
        }
        if (!onProfile) {
          socket.off("team-update");
        }
      }
    };
  }, [socket, onChat, onBrowse, onProfile]);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", flexDirection: "row" }}>
        {(wideScreen || displaySidebar) && (
          <Navbar
            userID={userID}
            logoutUser={logoutUser}
            wideScreen={wideScreen}
            flipDisplaySidebar={() => setDisplaySidebar((prev) => !prev)}
            updates={updates}
            setUpdates={setUpdates}
          />
        )}
        <Outlet context={socket} className="content" />
      </div>
      {!wideScreen && (
        <NavMobile
          userID={userID}
          setDisplaySidebar={setDisplaySidebar}
          updates={updates}
        />
      )}
    </div>
  );
}

LoggedInApp.propTypes = {
  auth: PropTypes.object,
  logoutUser: PropTypes.func,
  displaySidebar: PropTypes.bool,
  setDisplaySidebar: PropTypes.func,
  wideScreen: PropTypes.bool,
  setSocketConnected: PropTypes.func,
  teamID: PropTypes.string,
  setTeamID: PropTypes.func,
  setTeam: PropTypes.func,
};

export default LoggedInApp;
