import jwt_decode from "jwt-decode";

import setAxiosHeaderAuthToken from './setAxiosHeaderAuthToken';
import store from "../store";
import { setCurrentUser, logoutUser, setUserLoading, setUserNotLoading } from "../actions/authActions";
import axios from "axios";

function isLoginTokenInLocalStorage () {
  return localStorage.jwtToken && localStorage.jwtToken !== "undefined";
}

function redirectToLogin () {
  window.location.href = "./login";
}

function authenticateUserInStore(token) {
  const decoded = jwt_decode(token);
  axios.get(process.env.REACT_APP_API_URL + "/api/users/" + decoded).then(
    (res) => {
      if(res.data) {
        const user = res.data;
        if(user.status.admitted) {
          store.dispatch(setCurrentUser(decoded, user));
          return;
        }
      }

      logoutUserInStore()
    }).catch(err => logoutUserInStore())
  // Didn't pass auth test, get me outta here


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
  store.dispatch(setUserLoading())
  if (isLoginTokenInLocalStorage()) {
    const token = localStorage.jwtToken;
    setAxiosHeaderAuthToken(token);
    authenticateUserInStore(token);
    if (isTokenExpired(token)) {
      logoutUserInStore();
    }
  }
  else {
    store.dispatch(setUserNotLoading())
  }

}

export default initializeAuthIfLoggedIn;
