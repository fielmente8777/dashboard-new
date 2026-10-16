import { useCallback } from "react";
import { useToast } from "../context/ToastContext";
import { useUploadImageMutation } from "../redux/api/uploadApi";
import { fileToBase64 } from "../utils/file";

// upload(file) resolves with the hosted image URL. When the upload fails it
// shows an error toast and resolves with null.
// uploadAll(files) does the same for a list: an array of URLs, or null as
// soon as one upload fails.
export const useImageUpload = () => {
  const { showToast } = useToast();
  const [uploadImage, { isLoading }] = useUploadImageMutation();

  const upload = useCallback(
    async (file) => {
      try {
        const image = await fileToBase64(file);
        const result = await uploadImage(image).unwrap();
        if (result?.Image) return result.Image;
      } catch {
        // reported below
      }

      showToast({
        message: "Could not upload the image. Please try again.",
        type: "error",
      });
      return null;
    },
    [uploadImage, showToast],
  );

  const uploadAll = useCallback(
    async (files) => {
      const urls = [];
      for (const file of files) {
        const url = await upload(file);
        if (!url) return null;
        urls.push(url);
      }
      return urls;
    },
    [upload],
  );

  return { upload, uploadAll, isUploading: isLoading };
};
