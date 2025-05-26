import { BASE_URL } from "../../data/constant";
import handleLocalStorage from "../../utils/handleLocalStorage";

// handle api for uploading image to s3 bucket**
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
          token: handleLocalStorage("token"),
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

// handle api for delete image from s3 bucket**
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
