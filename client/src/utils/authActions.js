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
export const registerUser = (userData, setAuth, setTeam, setErrors) => {
  setAuth((prev) => ({ ...prev, loading: true }));
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
      axios
        .post(process.env.REACT_APP_API_URL + "/api/teams/create", {
          user: userID.id,
        })
        .then((res2) => setTeam(res2.data));

      // Set current user
      setCurrentUser(userID, setAuth);
    })
    .catch((err) => {
      logoutUser(setAuth);
      setAuth((prev) => ({ ...prev, loading: false }));
      setErrors({ status: err.message });
    });
};

// Login - get user token
export const loginUser = async (userData, setAuth, setTeam, setErrors) => {
  setAuth((prev) => ({ ...prev, loading: true }));
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
      initializeProfiles(setAuth, setTeam, userID);
    })
    .catch((err) => {
      console.log(err);
      logoutUser(setAuth);
      setAuth((prev) => ({ ...prev, loading: false }));
      setErrors({ status: err.message });
    });
};

// Set logged in user
export const setCurrentUser = (userID, setAuth, newUser = null) => {
  setAuth((prev) => ({
    ...prev,
    isAuthenticated: !!userID,
    userID,
    user: newUser
      ? { ...newUser }
      : {
          status: { admitted: true },
        },
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

function initializeProfiles(setAuth, setTeam, userID) {
  axios
    .get(process.env.REACT_APP_API_URL + `/api/teams/userTeam/${userID.id}`)
    .then((res2) => setTeam(res2.data));
  axios
    .get(process.env.REACT_APP_API_URL + `/api/users/${userID.id}`)
    .then((res) => {
      setCurrentUser(userID, setAuth, res.data);
    });
}

export function initializeAuthIfLoggedIn(setAuth, setTeam) {
  if (localStorage.jwtToken && localStorage.jwtToken !== "undefined") {
    const token = localStorage.jwtToken;
    setAxiosHeaderAuthToken(token);
    axios
      .get(process.env.REACT_APP_API_URL + "/api/users/validate")
      .then((res) => {
        const userID = jwt_decode(token);
        initializeProfiles(setAuth, setTeam, userID);
      })
      .catch((err) => {
        logoutUser(setAuth);
        window.location.href = "./login";
      });

    if (isTokenExpired(token)) {
      logoutUser(setAuth);
      window.location.href = "./login";
    }
  } else {
    setAuth((prev) => ({ ...prev, loading: false }));
    if (
      !(
        window.location.pathname === "/login" ||
        window.location.pathname === "/register"
      )
    ) {
      window.location.href = "./login";
    }
  }
}
