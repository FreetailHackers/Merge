import jwt_decode from "jwt-decode-non-json";
import setAxiosHeaderAuthToken from "./setAxiosHeaderAuthToken";

import { setCurrentUser, logoutUser } from "../actions/authActions";
import axios from "axios";

function isLoginTokenInLocalStorage() {
  return localStorage.jwtToken && localStorage.jwtToken !== "undefined";
}

function redirectToLogin() {
  window.location.href = "./login";
}

function authenticateUserInState(token, auth, setAuth) {
  axios
    .get(process.env.REACT_APP_API_URL + "/api/users/validate")
    .then((res) => {
      setCurrentUser(jwt_decode(token), auth, setAuth);
    })
    .catch((err) => logoutUserInState(auth, setAuth));
}

function logoutUserInState(auth, setAuth) {
  logoutUser(auth, setAuth);
  redirectToLogin();
}

function isTokenExpired(token) {
  const { exp } = jwt_decode(token);
  const timeInSeconds = Date.now() / 1000;
  return exp < timeInSeconds;
}

function initializeAuthIfLoggedIn(auth, setAuth) {
  setAuth({ ...auth, loading: true });
  if (isLoginTokenInLocalStorage()) {
    const token = localStorage.jwtToken;
    setAxiosHeaderAuthToken(token);
    authenticateUserInState(token, auth, setAuth);
    if (isTokenExpired(token)) {
      logoutUserInState(auth, setAuth);
    }
  } else {
    setAuth({ ...auth, loading: false });
  }
}

export default initializeAuthIfLoggedIn;
