import axios from "axios";

const BASE_URL = "https://nexon.eazotel.com";
// const BASE_URL = "http://127.0.0.1:5000"

export const UserLogin = async (userData) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/eazotel/ceateuser`,
      {
        register: "false",
        emailId: userData.email,
        userName: "",
        accesskey: userData.password,
      },
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

export const getUserProfile = async (token) => {
  try {
    const response = await axios.get(`${BASE_URL}/eazotel/getuser/${token}`, {
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
    });

    return response?.data;
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};

export const fetchUserManagementData = async (token) => {
  try {
    const response = await fetch(`${BASE_URL}/user/${token}`, {
      method: "GET", // Use 'GET' method
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const getApplicants = async (token) => {
  try {
    const response = await fetch(`${BASE_URL}/career/get-applications`, {
      method: "GET", // or "POST" if you're sending data
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const result = await response.json();
    return result?.Data;
  } catch (error) {
    console.error("Error getting applicants:", error);
    throw error;
  }
};

export const getAllClientEnquires = async (
  token,
  name = null,
  status = null
) => {
  try {
    let queryParams = [];
    if (name) {
      queryParams.push(`name=${encodeURIComponent(name)}`);
    }

    if (status) {
      queryParams.push(`status=${encodeURIComponent(status)}`);
    }

    const queryString =
      queryParams.length > 0 ? `?${queryParams.join("&")}` : "";
    const link = `${BASE_URL}/eazotel/get-all-contact-queries${queryString}`;
    const response = await fetch(link, {
      method: "GET", // or "POST" if you're sending data
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const result = await response.json();
    return result?.Data;
  } catch (error) {
    console.error("Error getting applicants:", error);
    throw error;
  }
};

export const GetwebsiteDetails = async (token) => {
  try {
    // const link = `${BASE_URL}/cms/get/website/sparvhospitality`;
    // const response = await fetch(link, {
    //     method: "GET", // or "POST" if you're sending data
    //     headers: {
    //         "Content-Type": "application/json",
    //         "Authorization": `Bearer ${token}`
    //     }
    // });
    const response = await fetch(`${BASE_URL}/cms/get/navbar?id=${token}`, {
      method: "GET",
      headers: {
        Accept: "application/json, text/plain, /",
        "Content-Type": "application/json",
      },
    });
    const result = await response.json();
    return result?.WebsiteData || result?.Details;
  } catch (error) {
    console.error("Error getting applicants:", error);
    throw error;
  }
};

export const DeleteImage = async (selectedCategory, Image, token) => {
  try {
    const response = await fetch(`${BASE_URL}/cms/edit/Gallery/image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: token,
        operation: "delete",
        category: selectedCategory,
        imageurl: Image,
      }),
    });
    const result = await response.json();

    return result?.WebsiteData;
  } catch (error) {
    console.error("Error getting applicants:", error);
    throw error;
  }
};

export const UploadingImageS3 = async (base64String) => {
  try {
    const response = await fetch(
      `https://nexon.eazotel.com/upload/file/image`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: window.localStorage.getItem("token"),
          image: base64String,
        }),
      }
    );

    const result = await response.json();

    return result?.Image || null;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
  // Replace 'YOUR_BACKEND_API_URL' with the actual URL of your backend API
};

// export const addUserInUsermanagement = async (token) => {
//     try {
//         const response = await fetch(`${BASE_URL}/eazotel/get-all-contact-queries`, {
//             method: "GET", // or "POST" if you're sending data
//             headers: {
//                 "Content-Type": "application/json",
//                 "Authorization": `Bearer ${token}`
//             }
//         });
//         const result = await response.json();
//         return result?.Data;
//     } catch (error) {
//         console.error("Error getting applicants:", error);
//         throw error;
//     }
// }
