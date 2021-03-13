import axios from "axios";
import setAxiosHeaderAuthToken from "../utils/setAxiosHeaderAuthToken";
import jwt_decode from "jwt-decode";

import { GET_ERRORS, SET_CURRENT_USER, USER_LOADING, USER_NOT_LOADING } from "./types";

// Login - get user token
export const loginUser = userData => dispatch => {
  dispatch(setUserLoading())
  axios
    .post("http://localhost:3000/auth/login", userData)
    .then(res => {
      // console.log(res)
      // Save to localStorage

      // Set token to localStorage
      const { token, user } = res.data;
      const isAdmitted = user.status.admitted;
      // Am I admitted?
      if(!isAdmitted) {
        // Get outta here!
        throw new Error("User is not admitted")
      }

      localStorage.setItem("jwtToken", token);
      // Set token to Auth header
      setAxiosHeaderAuthToken(token);
      // Decode token to get user data
      const userID = jwt_decode(token);
      // Set current user
      dispatch(setCurrentUser(userID, user));
    })
    .catch(err =>
      {
        // console.log(err.name + ": " + err.message);
        if(err.name === "Error") {
          dispatch(setUserNotLoading())
          return dispatch({
            type: GET_ERRORS,
            payload: {"status" : err.message}
          })
        }
        else {
          dispatch(setUserNotLoading())
          return dispatch({
            type: GET_ERRORS,
            payload: err.response.data
          })
        }
      });
};

// Set logged in user
export const setCurrentUser = (userID, user) => {
  return {
    type: SET_CURRENT_USER,
    userID,
    user
  };
};

// User loading
export const setUserLoading = () => {
  return {
    type: USER_LOADING
  };
};

// User no longer loading
export const setUserNotLoading = () => {
  return {
    type: USER_NOT_LOADING
  };
};

// Log user out
export const logoutUser = () => dispatch => {
  // Remove token from local storage
  localStorage.removeItem("jwtToken");
  // Remove auth header for future requests
  setAxiosHeaderAuthToken(false);
  // Set current user to empty object {} which will set isAuthenticated to false
  dispatch(setCurrentUser({}));
};
