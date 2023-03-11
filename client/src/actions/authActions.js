import axios from "axios";
import setAxiosHeaderAuthToken from "../utils/setAxiosHeaderAuthToken";
import jwt_decode from "jwt-decode-non-json";

// Register - create user in database and get token
export const registerUser = (userData, auth, setAuth, setErrors) => {
  setAuth({ ...auth, loading: true });
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
      setCurrentUser(userID, auth, setAuth);
    })
    .catch((err) => {
      logoutUser(auth, setAuth);
      setAuth({ ...auth, loading: false });
      setErrors({ status: err.message });
    });
};

// Login - get user token
export const loginUser = async (userData, auth, setAuth, setErrors) => {
  setAuth({ ...auth, loading: true });
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
      setCurrentUser(userID, auth, setAuth);
    })
    .catch((err) => {
      console.log(err);
      logoutUser(auth, setAuth);
      setAuth({ ...auth, loading: false });
      setErrors({ status: err.message });
    });
};

// Set logged in user
export const setCurrentUser = (userID, auth, setAuth, newUser = null) => {
  setAuth({
    ...auth,
    isAuthenticated: !!userID,
    userID,
    user: newUser
      ? newUser
      : {
          status: { admitted: true },
        },
  });
};

// Log user out
export const logoutUser = (auth, setAuth) => {
  // Remove token from local storage
  localStorage.removeItem("jwtToken");
  // Remove auth header for future requests
  setAxiosHeaderAuthToken(false);
  setCurrentUser(null, auth, setAuth);
  // window.location.href = '/login';
};
