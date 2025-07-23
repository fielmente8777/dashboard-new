import axios from "axios";

export const verify = (token) => {
  return axios.post(
    "http://127.0.0.1:5000/user/googleauth",
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
};
