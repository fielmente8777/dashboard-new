import { Loader2, Play } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "../../../components/ui/Button";
import { API_URLS } from "../../../config/env";
import { getToken } from "../../../utils/session";
import Icon from "../../../components/ui/Icon";

// Plays the recording of one call. The audio is behind our API (it needs
// the login token), so it is downloaded first and played from memory.
// With `autoLoad` it starts loading straight away, otherwise on click.
const RecordingPlayer = ({ callSid, autoLoad = false }) => {
  const [started, setStarted] = useState(autoLoad);
  const [audioUrl, setAudioUrl] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!started || !callSid) return;

    const controller = new AbortController();
    let objectUrl = null;
    setAudioUrl(null);
    setFailed(false);

    fetch(`${API_URLS.node}/api/v1/call/recording/${callSid}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Unable to fetch recording");
        return response.blob();
      })
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        setAudioUrl(objectUrl);
      })
      .catch((error) => {
        if (error.name !== "AbortError") setFailed(true);
      });

    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [started, callSid]);

  if (!started) {
    return (
      <Button variant="secondary" icon={Play} onClick={() => setStarted(true)}>
        Play recording
      </Button>
    );
  }

  if (failed) {
    return (
      <p className="text-sm text-red-500">
        Could not load the recording. Please try again later.
      </p>
    );
  }

  if (!audioUrl) {
    return (
      <p className="flex items-center gap-2 py-3 text-sm text-app-text-muted">
        <Icon icon={Loader2} className="animate-spin" /> Loading recording...
      </p>
    );
  }

  return <audio controls autoPlay src={audioUrl} className="w-full" />;
};

export default RecordingPlayer;
