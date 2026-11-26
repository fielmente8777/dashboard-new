import { useRef } from "react";
import { useToast } from "../../../context/ToastContext";
import { useUploadKnowledgeBaseMediaMutation } from "../../../redux/api/knowledgeBaseApi";
import { KB_MEDIA_ACCEPT, kbUploadErrorMessage, validateKbMedia } from "../utils/kbMediaLimits";

const ERROR_TOAST_MS = 6000;

// File picker that uploads the chosen image / video / PDF and hands its URL
// to `onUploaded`. Render `input` anywhere in the component and call `open()`
// from a button. Files over the KB limits are refused here, before any upload;
// on any failure `onUploaded` is not called, so the current media stays.
export const useMediaPicker = (onUploaded) => {
  const inputRef = useRef(null);
  const { showToast } = useToast();
  const [uploadMedia, { isLoading }] = useUploadKnowledgeBaseMediaMutation();

  const showError = (message) => showToast({ message, type: "error", duration: ERROR_TOAST_MS });

  const handleChange = async (e) => {
    const file = e.target.files?.[0];
    // reset now so the same file can be picked again after a fix
    e.target.value = "";
    if (!file) return;

    const check = validateKbMedia(file);
    if (!check.ok) {
      showError(check.message);
      return;
    }

    let uploaded;
    try {
      uploaded = await uploadMedia(file).unwrap();
    } catch (err) {
      showError(kbUploadErrorMessage(err));
      return;
    }

    if (uploaded?.url) {
      onUploaded(uploaded.url);
    } else {
      showError("Upload succeeded but no URL was returned");
    }
  };

  const input = (
    <input
      ref={inputRef}
      type="file"
      accept={KB_MEDIA_ACCEPT}
      className="hidden"
      onChange={handleChange}
    />
  );

  return { input, open: () => inputRef.current?.click(), uploading: isLoading };
};
