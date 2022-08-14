import axios from "axios";

const setAxiosHeaderAuthToken = (token) => {
  if (token) {
    // Apply authorization token to every request if logged in
    axios.defaults.headers.common["x-access-token"] = token;
  } else {
    // Delete auth header
    delete axios.defaults.headers.common["x-access-token"];
  }
};

export default setAxiosHeaderAuthToken;
