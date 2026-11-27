import { useState } from "react";
import { useToast } from "../../../context/ToastContext";

/** the file name of a URL ("…/rooms/Magnifica.png" → "Magnifica.png") */
export const fileNameOf = (url) => {
  try {
    return decodeURIComponent(String(url).split(/[?#]/)[0].split("/").pop() || url);
  } catch {
    return String(url);
  }
};

/** copies `url` to the clipboard, with a tick for a moment and a toast */
export function useCopyUrl() {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(null);
  const copy = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(url);
      setTimeout(() => setCopied((c) => (c === url ? null : c)), 1500);
      showToast({ message: "Link copied", type: "success", duration: 1500 });
    } catch {
      showToast({ message: "Couldn't copy. Open the picture and copy the link from the address bar.", type: "error" });
    }
  };
  return { copy, copied };
}

