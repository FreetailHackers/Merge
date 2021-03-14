import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import { Provider } from "react-redux";
import store from "./store";

import { createMockServerIfNotProduction } from './server';
import initializeAuthIfLoggedIn from "./utils/initializeAuthIfLoggedIn";

import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";

import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";

import "./App.css";

createMockServerIfNotProduction();
initializeAuthIfLoggedIn();

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <Router>
          <div className="App">
            <Navbar />
            <Route exact path="/" component={Landing} />
            <Route exact path="/register" component={Register} />
            <Route exact path="/login" component={Login} />
            <Switch>
              <PrivateRoute exact path="/dashboard" component={Home} />
            </Switch>
          </div>
        </Router>
      </Provider>
    );
  }
}
export default App;
