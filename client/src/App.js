import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import { Provider } from "react-redux";
import store from "./store";

import initializeAuthIfLoggedIn from "./utils/initializeAuthIfLoggedIn";

import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Database from "./pages/Database";
import Dashboard from "./pages/Dashboard";
import Swipe from "./pages/Swipe";
import Edit from "./pages/Edit";
import Chat from "./pages/Chat";

import "./Theme.css";
import "./App.css";

// createMockServerIfNotProduction();
initializeAuthIfLoggedIn();

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <Router>
          <div className="App">
            <Switch>
              {" "}
              {/* this will render the login page WITHOUT the navbar on routes / and /login */}
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
            <PrivateRoute exact path="/database" component={Database} />
            <Route exact path="/dashboard" component={Dashboard} />
            <PrivateRoute exact path="/swipe" component={Swipe} />
            <PrivateRoute exact path="/edit" component={Edit} />
            <Route exact path="/chat" component={Chat} />
          </div>
        </Router>
      </Provider>
    );
  }
}
export default App;
