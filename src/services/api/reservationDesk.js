import { BASE_URL } from "../../data/constant";
import axios from "axios"
export const getBookingsData = async (token, hId) => {
  try {

    const response = await axios.get(`${BASE_URL}/booking/bookings/${token}/${hId}`)

    console.log("jkhjlhjhljhjk", response?.data)
    return response?.data

  } catch (error) {
    console.error("Error fetching booking data:", error);
    throw error;
  }
};