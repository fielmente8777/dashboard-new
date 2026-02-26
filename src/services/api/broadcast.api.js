
import { NEW_BASE_URL } from "../../data/constant";


// TODO: Create campaign
export const createWhatsappCampaignService = async () => {
    const response = await fetch(
        `${NEW_BASE_URL}/api/v1/broadcast/whatsapp/create`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        },
    );

    return await response.json();
};




// TODO: GET campaign


// TODO: Edit campaign



// TODO: Delete campaign



