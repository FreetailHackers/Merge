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

import "./Theme.css";
import "./App.css";

function NavLayout(props) {
  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <Navbar
        auth={props.auth}
        user={props.auth.user}
        logoutUser={props.logoutUser}
      />
      <Outlet />
    </div>
  );
}

NavLayout.propTypes = {
  auth: PropTypes.object.isRequired,
  logoutUser: PropTypes.func,
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
  const [swipedUser, setSwipedUser] = useState(null);

  useEffect(() => {
    if (!auth.user.status?.admitted && auth.loading) {
      initializeAuthIfLoggedIn(auth, setAuth);
    }
  }, [auth]);

  const login = (
    <Login
      auth={auth}
      errors={errors}
      isLoading={auth.loading}
      loginUser={(userData) => loginUser(userData, auth, setAuth, setErrors)}
      registerUser={(userData) =>
        registerUser(userData, auth, setAuth, setErrors)
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
              errors={errors}
              registerUser={(userData) =>
                registerUser(userData, auth, setAuth, setErrors)
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
                logoutUser={() => logoutUser(auth, setAuth)}
              />
            }
          >
            <Route
              path="dashboard"
              element={
                <Dashboard
                  auth={auth}
                  user={auth.user}
                  logoutUser={() => logoutUser(auth, setAuth)}
                />
              }
            />
            <Route
              path="swipe"
              element={
                <Swipe
                  auth={auth}
                  user={auth.user}
                  setSwipedUser={setSwipedUser}
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
                    setCurrentUser(userID, auth, setAuth, newUser)
                  }
                />
              }
            />
            <Route
              path="chat"
              element={
                <Chat
                  userID={auth.userID && auth.userID.id}
                  swipedUser={swipedUser}
                  setSwipedUser={setSwipedUser}
                />
              }
            />
            <Route path="about" element={<About />} />
          </Route>
        )}
      </Routes>
    </BrowserRouter>
  );
}
