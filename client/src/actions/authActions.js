import axios from "axios";
import setAxiosHeaderAuthToken from "../utils/setAxiosHeaderAuthToken";
import jwt_decode from "jwt-decode";

import { GET_ERRORS, SET_CURRENT_USER, USER_LOADING } from "./types";

// Login - get user token
export const loginUser = userData => dispatch => {
  axios
    .post("http://localhost:3000/auth/login", userData)
    .then(res => {
      console.log(res)
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
      const decoded = jwt_decode(token);
      // Set current user
      dispatch(setCurrentUser(decoded));
    })
    .catch(err =>
      {
        // console.log(err.name + ": " + err.message);
        if(err.name === "Error") {
          return dispatch({
            type: GET_ERRORS,
            payload: {"status" : err.message}
          })
        }
        return dispatch({
            type: GET_ERRORS,
            payload: err.response.data
          })
        }
      );
};

// Set logged in user
export const setCurrentUser = decoded => {
  return {
    type: SET_CURRENT_USER,
    payload: decoded
  };
};

// User loading
export const setUserLoading = () => {
  return {
    type: USER_LOADING
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
