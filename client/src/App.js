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
import Dashboard from "./pages/Dashboard";
import Swipe from "./pages/Swipe";

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
            <PrivateRoute exact path="/dashboard" component={Dashboard} />
            <PrivateRoute exact path="/swipe" component={Swipe} />
          </div>
        </Router>
      </Provider>
    );
  }
}
export default App;
