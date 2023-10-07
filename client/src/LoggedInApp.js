import Navbar from "./components/Navbar";
import io from "socket.io-client";
import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import PropTypes from "prop-types";

const noUpdates = {
  chat: false,
  myteam: false,
};

function LoggedInApp(props) {
  const {
    auth,
    displaySidebar,
    setDisplaySidebar,
    wideScreen,
    setSocketConnected,
    logoutUser,
  } = props;
  const [socket, setSocket] = useState(null);
  const [updates, setUpdates] = useState({ ...noUpdates });
  const setChatUpdate = () => {
    setUpdates((prev) => ({ ...prev, chat: true }));
  };
  const setMyTeamUpdate = () =>
    setUpdates((prev) => ({ ...prev, myteam: true }));
  let location = useLocation();

  const token = auth?.token;

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

  const path = location?.pathname;
  const onChat = path?.endsWith("chat");
  const onMyTeam = path?.endsWith("myteam");

  const userID = auth.userID.id;
  useEffect(() => {
    if (socket) {
      socket.emit("join-room", { id: userID });
    }
    return () => {
      if (socket) {
        socket.emit("leave-room", { id: userID });
      }
    };
  }, [socket, userID]);

  useEffect(() => {
    if (socket) {
      if (onChat) {
        setUpdates((prev) => ({ ...prev, chat: false }));
      } else {
        socket.on("received-message", setChatUpdate);
      }

      if (onMyTeam) {
        setUpdates((prev) => ({ ...prev, myteam: false }));
      } else {
        socket.on("merge-requested", setMyTeamUpdate);
      }
    }
    return () => {
      if (socket) {
        if (!onChat) {
          socket.off("received-message", setChatUpdate);
        }
        if (!onMyTeam) {
          socket.on("merge-requested", setMyTeamUpdate);
        }
      }
    };
  }, [socket, onChat, onMyTeam]);

  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      {(displaySidebar || wideScreen) && (
        <Navbar
          userID={auth.userID.id}
          logoutUser={logoutUser}
          wideScreen={wideScreen}
          flipDisplaySidebar={() => setDisplaySidebar(false)}
          updates={updates}
          setUpdates={setUpdates}
        />
      )}
      {(!displaySidebar || wideScreen) && <Outlet context={socket} />}
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
};

export default LoggedInApp;
