import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import {
  loginUser,
  registerUser,
  logoutUser,
  setCurrentUser,
} from "./actions/authActions";
import PropTypes from "prop-types";

import initializeAuthIfLoggedIn from "./utils/initializeAuthIfLoggedIn";

import Navbar from "./components/Navbar";
//import PrivateRoute from "./components/PrivateRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
//import Database from "./pages/Database";
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
    initializeAuthIfLoggedIn(auth, setAuth);
  }, []);

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
                userID={auth.userID}
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
                userID={auth.userID}
                swipedUser={swipedUser}
                setSwipedUser={setSwipedUser}
              />
            }
          />
          <Route path="about" element={<About />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
  /* <RouterProvider router={router}/>
  <Provider store={store}>
      <Router>
        <div className="App">
          <Switch>
            {" "}
            {/* this will render the login page WITHOUT the navbar on routes / and /login //}
            <Route exact path="/" component={Login} />
            <Route exact path="/login" component={Login} />
            <Route exact path="/register" component={Register} />
            <Route path="/:anything" component={Navbar} />
          </Switch>
          <PrivateRoute
            exact
            path="/admin"
            component={Database}
            childProps={{ title: "Admin", admin: true }}
          />
          {/*<PrivateRoute exact path="/database" component={Database}/> //}
          <Route exact path="/dashboard" component={Dashboard} />
          <PrivateRoute exact path="/swipe" component={Swipe} />
          <PrivateRoute exact path="/edit" component={Edit} />
          <PrivateRoute exact path="/chat" component={Chat} />
          <Route exact path="/about" component={About} />
        </div>
      </Router>
    </Provider> */
}
