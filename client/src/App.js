import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import { Provider } from "react-redux";
import store from "./store";

import  {createMockServerIfNotProduction}  from "./server/index"
import initializeAuthIfLoggedIn from "./utils/initializeAuthIfLoggedIn";

import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";

import Login from "./pages/Login";
import Database from "./pages/Database";
import Admin from "./pages/Admin";
import Dashboard from "./pages/Dashboard";
import Swipe from "./pages/Swipe";
import Edit from "./pages/Edit";

import "./Theme.css";
import "./App.css";

createMockServerIfNotProduction();
initializeAuthIfLoggedIn();

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <Router>
          <div className="App">
            <Switch> {/* this will render the login page WITHOUT the navbar on routes / and /login */}
              <Route exact path="/" component={Login} />
              <Route exact path="/login" component={Login} />
              <Route path="/:anything" component={Navbar} /> 
            </Switch>
            <Route exact path="/admin" component={Admin} />
            <Route exact path="/database" component={Database} /> {/* REMIND ME TO CHANGE THIS BACK TO PRIVATE */}
            <Route exact path="/dashboard" component={Dashboard} />
            <Route exact path="/swipe" component={Swipe} />
            <Route exact path="/edit" component={Edit} />
          </div>
        </Router>
      </Provider>
    );
  }
}
export default App;
