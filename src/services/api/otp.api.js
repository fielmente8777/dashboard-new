import { NEW_BASE_URL } from "../../data/constant";

export const sendOtpService=async(ndid)=>{
      try {
        const response = await fetch(
          `${NEW_BASE_URL}/api/v1/otp/send-otp?hid=${localStorage.getItem("hid")}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`, // authMiddleware expects this
            },
          },
        );
        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Error creating user:", error);
        throw error;
      }
}

export const verifyOtpService = async (ndid, otp) => {
  try {
    const response = await fetch(
      `${NEW_BASE_URL}/api/v1/otp/verify-otp`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ ndid, otp }),
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error verifying otp:", error);
    throw error;
  }
};