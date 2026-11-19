import { useEffect, useState } from "react";
import Button from "../../../components/ui/Button";
import Dialog from "../../../components/ui/Dialog";
import { Field, Input } from "../../../components/ui/Field";
import { useApiAction } from "../../../hooks/useApiAction";
import { useSaveGatewayMutation } from "../../../redux/api/paymentApi";

const KEY_MAX_LENGTH = 60;
const EMPTY_KEYS = { apiKey: "", secretKey: "" };

// Asks for the API keys of `gateway` and saves them. Closed when `gateway` is null.
const GatewayKeysDialog = ({ gateway, onClose }) => {
  const run = useApiAction();
  const [saveGateway, { isLoading }] = useSaveGatewayMutation();
  const [keys, setKeys] = useState(EMPTY_KEYS);

  // never keep keys typed for a previous gateway
  useEffect(() => setKeys(EMPTY_KEYS), [gateway]);

  const apiKey = keys.apiKey.trim();
  const secretKey = keys.secretKey.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const saved = await run(
      saveGateway({ type: gateway.id, apiKey, secretKey }),
      {
        success: `${gateway.name} connected`,
        error: `Could not connect ${gateway.name}. Check the keys and try again.`,
      },
    );
    if (saved) onClose();
  };

  return (
    <Dialog
      open={Boolean(gateway)}
      onClose={onClose}
      title={`Connect ${gateway?.name || ""}`}
      description="Paste the API keys from your gateway dashboard."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="API key">
          <Input
            autoFocus
            autoComplete="off"
            maxLength={KEY_MAX_LENGTH}
            value={keys.apiKey}
            onChange={(e) => setKeys({ ...keys, apiKey: e.target.value })}
            placeholder="rzp_live_..."
          />
        </Field>
        <Field label="Secret key">
          <Input
            type="password"
            autoComplete="off"
            maxLength={KEY_MAX_LENGTH}
            value={keys.secretKey}
            onChange={(e) => setKeys({ ...keys, secretKey: e.target.value })}
            placeholder="Secret key"
          />
        </Field>

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            loading={isLoading}
            disabled={!apiKey || !secretKey}
          >
            Connect
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

export default GatewayKeysDialog;
