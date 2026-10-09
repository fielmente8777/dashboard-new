import { useRef } from "react";
import { useToast } from "../../../context/ToastContext";
import { useApiAction } from "../../../hooks/useApiAction";
import { useUploadKnowledgeBaseMediaMutation } from "../../../redux/api/knowledgeBaseApi";
import { MEDIA_ACCEPT } from "../utils/kbHelpers";

// File picker that uploads the chosen image / video / PDF and hands its URL
// to `onUploaded`. Render `input` anywhere in the component and call `open()`
// from a button.
export const useMediaPicker = (onUploaded) => {
  const inputRef = useRef(null);
  const run = useApiAction();
  const { showToast } = useToast();
  const [uploadMedia, { isLoading }] = useUploadKnowledgeBaseMediaMutation();

  const handleChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const uploaded = await run(uploadMedia(file), { error: "Upload failed" });
    if (!uploaded) return;

    if (uploaded.url) {
      onUploaded(uploaded.url);
    } else {
      showToast({
        message: "Upload succeeded but no URL was returned",
        type: "error",
      });
    }
  };

  const input = (
    <input
      ref={inputRef}
      type="file"
      accept={MEDIA_ACCEPT}
      className="hidden"
      onChange={handleChange}
    />
  );

  return { input, open: () => inputRef.current?.click(), uploading: isLoading };
};
