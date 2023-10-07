import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import {
  loginUser,
  registerUser,
  logoutUser,
  initializeAuthIfLoggedIn,
} from "./utils/authActions";

import axios from "axios";
import io from "socket.io-client";

import Navbar from "./components/Navbar";
import NavMobile from "./components/NavMobile";

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

const initialUserState = {
  userID: null,
  user: {},
  loading: true,
  token: null,
};

export default function App() {
  const [auth, setAuth] = useState({ ...initialUserState });
  const [user, setUser] = useState(null);
  const [socket, setSocket] = useState(null);
  // const [displaySidebar, setDisplaySidebar] = useState(false);
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

  const token = auth?.token;
  useEffect(() => {
    if (token) {
      const socketVar = io(process.env.REACT_APP_CHAT_URL, {
        transports: ["websocket"],
        query: { token },
      });
      socketVar.on("connect", () => {
        setSocket(socketVar);
      });
    } else {
      setSocket((prev) => {
        if (prev?.connected) {
          prev.disconnect();
        }
        return null;
      });
    }
  }, [token]);

  const login = (
    <Login
      auth={auth}
      loginUser={(userData, setErrors) =>
        loginUser(userData, setAuth, setErrors)
      }
    />
  );

  return (
    <>
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
                <div style={{ display: "flex", flexDirection: "row" }}>
                  {wideScreen && (
                    <Navbar
                      userID={auth.userID.id}
                      logoutUser={() => logoutUser(setAuth)}
                      wideScreen={wideScreen}
                    />
                  )}
                  <Outlet context={socket} />
                  {!wideScreen && (
                    <NavMobile
                      userID={auth.userID.id}
                      logoutUser={() => logoutUser(setAuth)}
                    />
                  )}
                </div>
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
                  socket?.connected ? (
                    <MyTeam userID={auth.userID.id} wideScreen={wideScreen} />
                  ) : (
                    <div>Loading...</div>
                  )
                }
              />
              <Route
                path="chat"
                element={
                  socket?.connected ? (
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
    </>
  );
}
