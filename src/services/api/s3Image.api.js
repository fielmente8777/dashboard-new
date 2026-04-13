import { BASE_URL, NEW_BASE_URL } from "../../data/constant";
import handleLocalStorage from "../../utils/handleLocalStorage";

export const uploadImageToServer = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${NEW_BASE_URL}/api/v1/image/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

export const deleteImageFromServer = async (imageUrl) => {
  try {
    const res = await fetch(`${NEW_BASE_URL}/api/v1/image/delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imageUrl }),
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
};

export const UploadingImageS3 = async (base64String) => {
  try {
    // console.log("aaya");
    const response = await fetch(`${BASE_URL}/upload/file/image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: handleLocalStorage("token"),
        image: base64String,
      }),
    });

    const result = await response.json();
    // console.log(result);

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
