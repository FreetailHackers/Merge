import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";

import { Provider } from "react-redux";
import store from "./store";

import  {createMockServerIfNotProduction}  from "./server/index"
import initializeAuthIfLoggedIn from "./utils/initializeAuthIfLoggedIn";

import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Database from "./pages/Database";
import Admin from "./pages/Admin";
import Dashboard from "./pages/Dashboard";
import Swipe from "./pages/Swipe";
import Edit from "./pages/Edit";

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
            <div>using {process.env.REACT_APP_API_URL} as API Url</div>
            <Route exact path="/" component={Landing} />
            <Route exact path="/login" component={Login} />
            <PrivateRoute exact path="/admin" component={Admin} />
            <PrivateRoute exact path="/database" component={Database} />
            <PrivateRoute exact path="/dashboard" component={Dashboard} />
            <PrivateRoute exact path="/swipe" component={Swipe} />
            <PrivateRoute exact path="/edit" component={Edit} />
          </div>
        </Router>
      </Provider>
    );
  }
}
export default App;
