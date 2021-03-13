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

function authenticateUserInStore (token) {
  const userID = jwt_decode(token);
  // console.log(userID)
  axios.get("http://localhost:3000/api/users/" + userID).then(
    (res) => {
      if(res.data) {
        const user = res.data;
        // console.log(user)
        if(user.status.admitted) {
          // console.log('user store')
          store.dispatch(setCurrentUser(userID, user));
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
