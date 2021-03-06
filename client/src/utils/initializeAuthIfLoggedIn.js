import jwt_decode from "jwt-decode";

import setAxiosHeaderAuthToken from './setAxiosHeaderAuthToken';
import store from "../store";
import { setCurrentUser, logoutUser } from "../actions/authActions";

function isLoginTokenInLocalStorage () {
  return localStorage.jwtToken && localStorage.jwtToken !== "undefined";
}

function redirectToLogin () {
  window.location.href = "./login";
}

function authenticateUserInStore (token) {
  const decoded = jwt_decode(token);
  store.dispatch(setCurrentUser(decoded));
}

function logoutUserInStore () {
  store.dispatch(logoutUser());
  redirectToLogin();
}

function isTokenExpired (token) {
  const { exp } = jwt_decode(token);
  const timeInSeconds = Date.now() / 1000;
  return exp < timeInSeconds;
}

function initializeAuthIfLoggedIn () {
  if (isLoginTokenInLocalStorage()) {
    const token = localStorage.jwtToken;
    setAxiosHeaderAuthToken(token);
    authenticateUserInStore(token);
    if (isTokenExpired(token)) {
      logoutUserInStore();
    }
  }
}

export default initializeAuthIfLoggedIn;
