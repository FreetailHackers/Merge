import axios from "axios";
import setAxiosHeaderAuthToken from "../utils/setAxiosHeaderAuthToken";
import jwt_decode from "jwt-decode-non-json";

import {
  GET_ERRORS,
  SET_CURRENT_USER,
  USER_LOADING,
  USER_NOT_LOADING,
} from "./types";

// Register - create user in database and get token
export const registerUser = (userData) => (dispatch) => {
  dispatch(setUserLoading());
  axios
    .post(process.env.REACT_APP_API_URL + "/api/users/register", userData)
    .then((res) => {
      if (!res.data.isValid) {
        if (res.data.name) throw new Error(res.data.name);
        else if (res.data.email) throw new Error(res.data.email);
        else if (res.data.password) throw new Error(res.data.password);
        else if (res.data.password2) throw new Error(res.data.password2);
      }
      // Set token to localStorage
      const { token, user } = res.data;

      // Am I admitted?
      if (!user.status) {
        // Get outta here!
        throw new Error("User is not admitted");
      }

      localStorage.setItem("jwtToken", token);

      // Set token to Auth header
      setAxiosHeaderAuthToken(token);

      // Decode token to get user data
      const userID = jwt_decode(token);
      // Set current user
      dispatch(setCurrentUser(userID, user, true));
    })
    .catch((err) => {
      dispatch(logoutUser());
      dispatch(setUserNotLoading());
      return dispatch({
        type: GET_ERRORS,
        payload: { status: err.message },
      });
    });
};

// Login - get user token
export const loginUser = (userData) => async (dispatch) => {
  dispatch(setUserLoading());
  await axios
    .post(process.env.REACT_APP_API_URL + "/api/users/login", userData)
    .then((res) => {
      if (!res.data.isValid) {
        if (res.data.email) {
          throw new Error(res.data.email);
        } else if (res.data.password) {
          throw new Error(res.data.password);
        }
      }
      // Set token to localStorage
      const { token } = res.data;
      localStorage.setItem("jwtToken", token);
      // Set token to Auth header
      setAxiosHeaderAuthToken(token);
      // Decode token to get user data
      const userID = jwt_decode(token);
      // Set current user
      dispatch(setCurrentUser(userID));
    })
    .catch((err) => {
      console.log(err);
      dispatch(logoutUser());
      dispatch(setUserNotLoading());
      return dispatch({
        type: GET_ERRORS,
        payload: { status: err.message },
      });
    });
};

// Set logged in user
export const setCurrentUser = (
  userID
  // user,
  // isAuth = this.props.auth.isAuthenticated
) => {
  return {
    type: SET_CURRENT_USER,
    isAuthenticated: !!userID,
    userID,
    user: {
      status: { admitted: true },
    },
  };
};

// User loading
export const setUserLoading = () => {
  return {
    type: USER_LOADING,
  };
};

// User no longer loading
export const setUserNotLoading = () => {
  return {
    type: USER_NOT_LOADING,
  };
};

// Log user out
export const logoutUser = () => (dispatch) => {
  // Remove token from local storage
  localStorage.removeItem("jwtToken");
  // Remove auth header for future requests
  setAxiosHeaderAuthToken(false);
  dispatch(setCurrentUser(null));

  // window.location.href = '/login';
};
