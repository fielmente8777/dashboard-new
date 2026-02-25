
import { NEW_BASE_URL } from "../../data/constant";


// TODO: Create campign
export const createWhatsappCampaign = async () => {
    const response = await fetch(
        `${NEW_BASE_URL}/api/v1/broadcast/whatsapp/create`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        },
    );

    return await response.json();
};




// TODO: GET campign


// TODO: Edit campign
// TODO: Delete campign



