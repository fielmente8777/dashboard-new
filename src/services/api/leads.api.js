import axios from "axios";
import { NEW_BASE_URL } from "../../data/constant";

// handle api for getting user's profile details
export const getLeads = async (query) => {
  try {
    const response = await axios.get(`${NEW_BASE_URL}/api/v1/leads/${localStorage.getItem("ndid")}/?${query}&hId=${localStorage.getItem("hid")}`, {
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
    });
    return response?.data?.data;
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};


export const UpdateLeadStatus = async (lead, status) => {
    // if (status === "Reserved") {
    //   setReserveData(lead);
    //   return;
    // }
    try {
      const response = await axios.post(
        "https://nexon.eazotel.com/eazotel/edit-contact-query",
        {
          token: localStorage.getItem("token"),
          Contact: lead.Contact,
          Email: lead.Email,
          Message: lead.Email,
          Name: lead.Name,
          Remark: lead.Remark,
          Subject: lead.Subject,
          id: lead._id,
          converted_by: lead.converted_by,
          created_from: lead.created_from,
          is_convertable: true,
          is_converted: false,
          ndid: lead.ndid,
          status: status,
        },
      );

      return response;

    } catch (error) {
      throw error;
    }
  };