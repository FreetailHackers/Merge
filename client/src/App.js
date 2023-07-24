import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import {
  loginUser,
  registerUser,
  logoutUser,
  setCurrentUser,
  initializeAuthIfLoggedIn,
} from "./utils/authActions";

import PropTypes from "prop-types";

import Navbar from "./components/Navbar";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Swipe from "./pages/Swipe";
import Edit from "./pages/Edit";
import Chat from "./pages/Chat";
import About from "./pages/About";
import MyTeam from "./pages/MyTeam";
import { SocketContext, socket } from "./socket.js";

import { useMediaQuery } from "@mantine/hooks";

import "./Theme.css";
import "./App.css";

function NavLayout(props) {
  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      {(props.displaySidebar || props.wideScreen) && (
        <Navbar
          auth={props.auth}
          user={props.auth.user}
          logoutUser={props.logoutUser}
          wideScreen={props.wideScreen}
          flipDisplaySidebar={props.flipDisplaySidebar}
        />
      )}
      {(!props.displaySidebar || props.wideScreen) && <Outlet />}
    </div>
  );
}

NavLayout.propTypes = {
  auth: PropTypes.object.isRequired,
  logoutUser: PropTypes.func,
  displaySidebar: PropTypes.bool,
  flipDisplaySidebar: PropTypes.func,
  wideScreen: PropTypes.bool,
};

const initialUserState = {
  isAuthenticated: false,
  userID: null,
  user: {},
  loading: true,
};

export default function App() {
  const [auth, setAuth] = useState({ ...initialUserState });
  const [errors, setErrors] = useState({});
  const [displaySidebar, setDisplaySidebar] = useState(false);
  const [team, setTeam] = useState(null);
  const wideScreen = useMediaQuery("(orientation:landscape)");

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--vh",
      `${window.innerHeight * 0.01}px`
    );
    window.addEventListener("resize", () => {
      document.documentElement.style.setProperty(
        "--vh",
        `${window.innerHeight * 0.01}px`
      );
    });
  });

  useEffect(() => {
    if (!auth.user.admitted && auth.loading && !team) {
      initializeAuthIfLoggedIn(setAuth, setTeam);
    }
  }, [auth, team]);

  const login = (
    <Login
      auth={auth}
      errors={errors}
      isLoading={auth.loading}
      loginUser={(userData) => loginUser(userData, setAuth, setTeam, setErrors)}
    />
  );

  return (
    <SocketContext.Provider value={socket}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={login} />
          <Route path="/login" element={login} />
          <Route
            path="/register"
            element={
              <Register
                auth={auth}
                errors={errors}
                registerUser={(userData) =>
                  registerUser(userData, setAuth, setTeam, setErrors)
                }
                isLoading={auth.loading}
              />
            }
          />
          {auth.userID && (
            <Route
              path="/"
              element={
                <NavLayout
                  auth={auth}
                  logoutUser={() => logoutUser(setAuth)}
                  displaySidebar={displaySidebar}
                  flipDisplaySidebar={() => setDisplaySidebar(false)}
                  wideScreen={wideScreen}
                />
              }
            >
              <Route
                path="dashboard"
                element={
                  <Dashboard
                    auth={auth}
                    user={auth.user}
                    logoutUser={() => logoutUser(setAuth)}
                    wideScreen={wideScreen}
                    flipDisplaySidebar={() => setDisplaySidebar(true)}
                  />
                }
              />
              <Route
                path="swipe"
                element={
                  <Swipe
                    userID={auth.userID.id}
                    wideScreen={wideScreen}
                    flipDisplaySidebar={() => setDisplaySidebar(true)}
                    team={team}
                    setTeam={setTeam}
                  />
                }
              />
              <Route
                path="edit"
                element={
                  <Edit
                    auth={auth}
                    user={auth.user}
                    userID={auth.userID}
                    setCurrentUser={(userID, newUser) =>
                      setCurrentUser(userID, setAuth, newUser)
                    }
                    wideScreen={wideScreen}
                    flipDisplaySidebar={() => setDisplaySidebar(true)}
                  />
                }
              />
              <Route
                path="myteam"
                element={
                  team !== null ? (
                    <MyTeam
                      userID={auth.userID.id}
                      wideScreen={wideScreen}
                      flipDisplaySidebar={() => setDisplaySidebar(true)}
                      team={team}
                      setTeam={setTeam}
                    />
                  ) : (
                    <div />
                  )
                }
              />
              <Route
                path="chat"
                element={
                  <Chat
                    userID={auth.userID && auth.userID.id}
                    wideScreen={wideScreen}
                    flipDisplaySidebar={() => setDisplaySidebar(true)}
                    blockList={auth.user?.blockList}
                  />
                }
              />
              <Route
                path="about"
                element={
                  <About
                    wideScreen={wideScreen}
                    flipDisplaySidebar={() => setDisplaySidebar(true)}
                  />
                }
              />
            </Route>
          )}
        </Routes>
      </BrowserRouter>
    </SocketContext.Provider>
  );
}
