import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
  loginUser,
  registerUser,
  logoutUser,
  initializeAuthIfLoggedIn,
} from "./utils/authActions";

import axios from "axios";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Swipe from "./pages/Swipe";
import Edit from "./pages/Edit";
import Chat from "./pages/Chat";
import About from "./pages/About";
import MyTeam from "./pages/MyTeam";

import { useMediaQuery } from "@mantine/hooks";

import "./App.css";
import LoggedInApp from "./LoggedInApp";

const initialUserState = {
  userID: null,
  user: {},
  loading: true,
  token: null,
};

export default function App() {
  const [auth, setAuth] = useState({ ...initialUserState });
  const [user, setUser] = useState(null);
  const [socketConnected, setSocketConnected] = useState(null);
  const [displaySidebar, setDisplaySidebar] = useState(false);
  const wideScreen = useMediaQuery("(orientation:landscape)");

  useEffect(() => {
    const resizeFunc = () => {
      document.documentElement.style.setProperty(
        "--vh",
        `${window.innerHeight * 0.01}px`
      );
    };
    resizeFunc();
    window.addEventListener("resize", resizeFunc);
    return () => {
      window.removeEventListener("resize", resizeFunc);
    };
  });

  useEffect(() => {
    if (!auth.userID && auth.loading) {
      initializeAuthIfLoggedIn(setAuth);
    }
  }, [auth]);

  const userID = auth?.userID;
  useEffect(() => {
    if (userID) {
      axios
        .get(process.env.REACT_APP_API_URL + `/api/users/${userID.id}`)
        .then((res) => {
          setUser(res.data);
        });
    } else {
      setUser(null);
    }
  }, [userID]);

  const teamID = user?.team;
  const setTeamID = (newID) => {
    setUser((prev) => {
      if (prev) {
        return { ...prev, team: newID };
      } else {
        return prev;
      }
    });
  };

  const login = (
    <Login
      auth={auth}
      loginUser={(userData, setErrors) =>
        loginUser(userData, setAuth, setErrors)
      }
    />
  );

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={login} />
        <Route path="/login" element={login} />
        <Route
          path="/register"
          element={
            <Register
              auth={auth}
              registerUser={(userData, setErrors) =>
                registerUser(userData, setAuth, setErrors)
              }
            />
          }
        />
        {auth.userID && (
          <Route
            path="/"
            element={
              <LoggedInApp
                auth={auth}
                logoutUser={() => logoutUser(setAuth)}
                displaySidebar={displaySidebar}
                wideScreen={wideScreen}
                setSocketConnected={setSocketConnected}
                setDisplaySidebar={setDisplaySidebar}
                teamID={teamID}
                setTeamID={setTeamID}
              />
            }
          >
            <Route
              path="dashboard"
              element={<Dashboard user={user} wideScreen={wideScreen} />}
            />
            <Route
              path="swipe"
              element={
                <Swipe userID={auth.userID.id} wideScreen={wideScreen} />
              }
            />
            <Route
              path="edit"
              element={
                user ? (
                  <Edit
                    user={user}
                    userID={auth.userID.id}
                    setUser={setUser}
                    wideScreen={wideScreen}
                  />
                ) : (
                  <div>Loading...</div>
                )
              }
            />
            <Route
              path="myteam"
              element={
                socketConnected && teamID ? (
                  <MyTeam
                    userID={auth.userID.id}
                    wideScreen={wideScreen}
                    teamID={teamID}
                    setTeamID={setTeamID}
                  />
                ) : (
                  <div>Loading...</div>
                )
              }
            />
            <Route
              path="chat"
              element={
                socketConnected ? (
                  <Chat
                    userID={auth.userID.id}
                    wideScreen={wideScreen}
                    blockList={user?.blockList}
                  />
                ) : (
                  <div>Loading...</div>
                )
              }
            />
            <Route path="about" element={<About wideScreen={wideScreen} />} />
          </Route>
        )}
      </Routes>
    </BrowserRouter>
  );
}
