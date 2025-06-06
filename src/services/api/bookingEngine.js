import axios from "axios";
import { BASE_URL } from "../../data/constant";
import handleLocalStorage from "../../utils/handleLocalStorage";

// handle auth api for login and register both**
export const getAllRomms = async (token, hid) => {
  try {
    const response = await axios.get(`${BASE_URL}/room/${token}/${hid}`);
    return response?.data;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};
export const addRoom = async (formData, hid) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/room/create/${handleLocalStorage("token")}`,
      formData,
      {
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      }
    );
    return response?.data;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

export const getPriceAndInventory = async (token, hid) => {
  try {
    const res = await axios.get(
      `${BASE_URL}/inventory/getinventory/all/${token}/${hid}`
    );
    const result = res.data;
    return result;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

export const inventoryManage = async (token, hid) => {
  try {
    const res = await axios.get(
      `${BASE_URL}/inventory/getinventory/all/${token}/${hid}`
    );
    const result = res.data;
    return result;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

export const priceManage = async (token, hid) => {
  try {
    const res = await axios.get(
      `${BASE_URL}/price/getprice/all/${token}/${hid}`
    );
    const result = res.data;
    return result;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

export const bulkUpdateInventory = async (data) => {
  try {
    const res = await axios.post(
      `${BASE_URL}/inventory/update/bulk/inventory`,
      data,
      {
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      }
    );
    const result = res.data;
    return result;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

export const bulkUpdatePrice = async (data) => {
  try {
    const res = await axios.post(`${BASE_URL}/price/update/bulkprice`, data, {
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
    });
    const result = res.data;
    return result;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

export const dateRangeInventory = async (token, hid, data) => {
  try {
    const res = await axios.post(
      `${BASE_URL}/inventory/getinventory/all/nextprev/${token}/${hid}`,
      data,
      {
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      }
    );
    const result = res.data;
    return result;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

export const dateRangePrice = async (token, data) => {
  try {
    const res = await axios.post(
      `${BASE_URL}/price/getprice/all/nextprev/${token}`,
      data,
      {
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      }
    );
    const result = res.data;
    return result;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};
