import { BASE_URL } from "../../data/constant";
import axios from "axios";
export const getBookingsData = async (token, hId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/booking/bookings/${token}/${hId}`
    );

    console.log("jkhjlhjhljhjk", response?.data);
    return response?.data;
  } catch (error) {
    console.error("Error fetching booking data:", error);
    throw error;
  }
};

export const filterBookingData = async (filterData) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/booking/filter/bookingid`,
      filterData,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );
    return response?.data;
  } catch (error) {
    console.error("Error fetching booking data:", error);
    throw error;
  }
};

export const filterBookingDates = async (filterData) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/booking/filter/dates`,
      filterData,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );
    return response?.data;
  } catch (error) {
    console.error("Error fetching booking data:", error);
    throw error;
  }
};

export const filterBookingWithId = async (filterData) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/booking/filter/bookingid`,
      filterData,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );
    return response?.data;
  } catch (error) {
    console.error("Error fetching booking data:", error);
    throw error;
  }
};
