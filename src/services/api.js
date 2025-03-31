import axios from "axios";

const BASE_URL = "https://nexon.eazotel.com"
const LOCAL_URL = "http://127.0.0.1:5000"

export const UserLogin = async (userData) => {
    try {
        const response = await axios.post(`${BASE_URL}/eazotel/ceateuser`,
            {
                register: "false",
                emailId: userData.email,
                userName: "",
                accesskey: userData.password,
            },
            {
                headers: {
                    "Accept": "application/json, text/plain, */*",
                    "Content-Type": "application/json",
                },
            });
        return response?.data;
    } catch (error) {
        console.error("Error creating user:", error);
        throw error;
    }
};


export const getUserProfile = async (token) => {
    try {
        const response = await axios.get(`${BASE_URL}/eazotel/getuser/${token}`,
            {
                headers: {
                    "Accept": "application/json, text/plain, */*",
                    "Content-Type": "application/json",
                },
            }
        );
        console.log("api", response?.data)
        return response?.data;
    } catch (error) {
        console.error("Error getting user profile:", error);
        throw error;
    }
}


export const fetchUserManagementData = async (token) => {
    try {
        const response = await fetch(
            `${BASE_URL}/user/${token}`,
            {
                method: "GET", // Use 'GET' method
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
            }
        );
        const result = await response.json();
        console.log(result.data)
        return result.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

export const getApplicants = async (token) => {
    try {
        const response = await fetch(`${LOCAL_URL}/career/get-applications`, {
            method: "GET", // or "POST" if you're sending data
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        const result = await response.json();
        return result?.Data;
    } catch (error) {
        console.error("Error getting applicants:", error);
        throw error;
    }
}