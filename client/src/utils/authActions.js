import axios from "axios";
import jwt_decode from "jwt-decode-non-json";

const setAxiosHeaderAuthToken = (token) => {
  if (token) {
    // Apply authorization token to every request if logged in
    axios.defaults.headers.common["x-access-token"] = token;
  } else {
    // Delete auth header
    delete axios.defaults.headers.common["x-access-token"];
  }
};

// Register - create user in database and get token
export const registerUser = async (userData, setAuth, setErrors) => {
  setAuth((prev) => ({ ...prev, loading: true }));
  try {
    const res = await axios.post(
      process.env.REACT_APP_API_URL + "/api/users/register",
      userData
    );
    if (!res.data.isValid) {
      if (res.data.name) throw new Error(res.data.name);
      else if (res.data.email) throw new Error(res.data.email);
      else if (res.data.password) throw new Error(res.data.password);
      else if (res.data.password2) throw new Error(res.data.password2);
    }
    const { token, admitted } = res.data;
    if (!admitted) {
      throw new Error("User is not admitted");
    }
    // Set token to localStorage
    localStorage.setItem("jwtToken", token);
    setAxiosHeaderAuthToken(token);
    // Decode token to get user data
    const userID = jwt_decode(token);
    // Load user data into React state
    setCurrentUser(userID, setAuth, token);
  } catch (err) {
    logoutUser(setAuth);
    setErrors({ status: err.message });
  }
};

// Login - get user token
export const loginUser = async (userData, setAuth, setErrors) => {
  setAuth((prev) => ({ ...prev, loading: true }));
  try {
    const res = await axios.post(
      process.env.REACT_APP_API_URL + "/api/users/login",
      userData
    );
    if (!res.data.isValid) {
      if (res.data.email) {
        throw new Error(res.data.email);
      } else if (res.data.password) {
        throw new Error(res.data.password);
      }
    }
    // Set token to Auth header and localStorage
    const { token } = res.data;
    localStorage.setItem("jwtToken", token);
    setAxiosHeaderAuthToken(token);
    // Decode token to get user data
    const userID = jwt_decode(token);
    // Load user data into React state
    setCurrentUser(userID, setAuth, token);
  } catch (err) {
    console.log(err);
    logoutUser(setAuth);
    setErrors({ status: err.message });
  }
};

// Set logged in user
const setCurrentUser = (userID, setAuth, token = null) => {
  setAuth((prev) => ({
    ...prev,
    userID,
    loading: false,
    token,
  }));
};

// Log user out
export const logoutUser = (setAuth) => {
  // Remove token from local storage
  localStorage.removeItem("jwtToken");
  // Remove auth header for future requests
  setAxiosHeaderAuthToken(false);
  setCurrentUser(null, setAuth);
  // window.location.href = '/login';
};

function isTokenExpired(token) {
  const { exp } = jwt_decode(token);
  const timeInSeconds = Date.now() / 1000;
  return exp < timeInSeconds;
}

export async function initializeAuthIfLoggedIn(setAuth) {
  if (localStorage.jwtToken && localStorage.jwtToken !== "undefined") {
    const token = localStorage.jwtToken;
    try {
      if (isTokenExpired(token)) {
        throw new Error("Token is expired");
      }
      setAxiosHeaderAuthToken(token);
      await axios.get(process.env.REACT_APP_API_URL + "/api/users/validate");
      const userID = jwt_decode(token);
      setCurrentUser(userID, setAuth, token);
    } catch (err) {
      logoutUser(setAuth);
      window.location.href = "./login";
    }
  } else {
    setAuth((prev) => ({ ...prev, loading: false }));
    if (
      window.location.pathname !== "/login" &&
      window.location.pathname !== "/register"
    ) {
      window.location.href = "./login";
    }
  }
}
