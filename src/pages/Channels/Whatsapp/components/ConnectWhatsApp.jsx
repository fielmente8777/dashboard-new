import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import Button from "../../../../components/ui/Button";
import { useToast } from "../../../../context/ToastContext";
import { connectWhatsapp } from "../../../../services/api/Integration";

// Shown until a WhatsApp Business account is connected. Meta's signup opens
// in a new tab; `onRecheck` reloads the status once the user is back.
const ConnectWhatsApp = ({ onRecheck, rechecking }) => {
  const { showToast } = useToast();
  const [opening, setOpening] = useState(false);
  const [opened, setOpened] = useState(false);

  const connect = async () => {
    setOpening(true);
    try {
      const response = await connectWhatsapp();
      const url = response?.result?.docs?.signupUrl;
      if (!response?.success || !url) throw new Error(response?.responseMessage);
      window.open(url, "_blank", "noopener");
      setOpened(true);
    } catch (error) {
      showToast({
        message: error?.message || "Could not start the WhatsApp connection.",
        type: "error",
      });
    } finally {
      setOpening(false);
    }
  };

  return (
    <div className="flex items-center justify-center px-3 py-10">
      <div className="w-full max-w-md rounded-2xl border border-app-border! bg-app-surface p-6 text-center sm:p-8">
        <span className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-green-500/10">
          <FaWhatsapp className="size-7 text-green-600 dark:text-green-400" />
        </span>

        <h2 className="text-xl font-semibold text-app-text">Connect WhatsApp Business</h2>
        <p className="mt-2 text-sm text-app-text-muted">
          Send messages, reply to guests, automate notifications and run campaigns from
          your dashboard.
        </p>

        <Button
          size="lg"
          onClick={connect}
          loading={opening}
          className="mt-6 w-full bg-green-600! hover:bg-green-700!"
        >
          Connect WhatsApp Business
        </Button>

        {opened && (
          <Button
            variant="secondary"
            icon={RefreshCw}
            onClick={onRecheck}
            loading={rechecking}
            className="mt-2 w-full"
          >
            I've finished connecting
          </Button>
        )}

        <p className="mt-4 text-xs text-app-text-faint">
          Secure Meta sign-in · Official WhatsApp Cloud API
        </p>
      </div>
    </div>
  );
};

export default ConnectWhatsApp;
