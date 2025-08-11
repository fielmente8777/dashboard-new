import axios from "axios";
import { BASE_URL } from "../data/constant";

export const verify = (token) => {
  return axios.post(
    `${BASE_URL}/user/googleauth`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
};
