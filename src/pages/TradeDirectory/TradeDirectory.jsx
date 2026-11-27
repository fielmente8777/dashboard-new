import { BookUser, Clock, Lock, Send, ShieldCheck, Users } from "lucide-react";
import { useState } from "react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { Field, Textarea } from "../../components/ui/Field";
import Notice from "../../components/ui/Notice";
import PageShell from "../../components/ui/PageShell";
import { ErrorState, LoadingState } from "../../components/ui/States";
import Tabs from "../../components/ui/Tabs";
import { useToast } from "../../context/ToastContext";
import {
  tradeError,
  useGetTradeAccessQuery,
  useRequestTradeAccessMutation,
} from "../../redux/api/tradeDirectoryApi";
import DirectoryBrowser from "./DirectoryBrowser";

// The Trade Directory page: Eazotel's list of travel agents, MICE and wedding planners (contacts
// shown masked) and the hotel's own contacts (imported or added by hand). Emails and WhatsApp
// to them go from the hotel's own email and number (gian), and show in Email / WhatsApp marketing.
const TradeDirectory = () => {
  const [tab, setTab] = useState("directory");
  const access = useGetTradeAccessQuery();

  return (
    <PageShell
      title="Trade Directory"
      description="Travel agents, MICE and wedding planners across India. Email or WhatsApp them from your own email and WhatsApp number."
    >
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "directory", label: "Eazotel directory" },
          { value: "mine", label: "My contacts" },
        ]}
      />

      {tab === "directory" &&
        (access.isLoading ? (
          <LoadingState />
        ) : access.error ? (
          <ErrorState message={tradeError(access.error, "Couldn't load the directory.")} onRetry={access.refetch} />
        ) : access.data?.status === "approved" ? (
          <DirectoryBrowser pool="directory" />
        ) : (
          <AccessGate access={access.data} />
        ))}

      {tab === "mine" && <DirectoryBrowser pool="mine" />}
    </PageShell>
  );
};

/** Before access is approved: what the directory is, and the request button. */
const AccessGate = ({ access }) => {
  const { showToast } = useToast();
  const [note, setNote] = useState("");
  const [request, { isLoading }] = useRequestTradeAccessMutation();
  const status = access?.status || "none";

  const send = async () => {
    try {
      const result = await request({ note: note.trim() || undefined }).unwrap();
      showToast({
        message: result.status === "approved" ? "Access granted. Welcome to the Trade Directory." : "Request sent. We'll let you know.",
        type: "success",
      });
    } catch (error) {
      showToast({ message: tradeError(error), type: "error" });
    }
  };

  return (
    <Card>
      <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-app-accent-soft text-app-accent-text">
              <BookUser className="size-5" aria-hidden />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-app-text">Thousands of travel trade partners, ready to reach</h2>
              <p className="text-sm text-app-text-muted">Travel agents, MICE & corporate, wedding planners, yoga and wellness.</p>
            </div>
          </div>
          <ul className="space-y-2 text-sm text-app-text">
            {[
              [Users, "Browse by category, state and city, and see who is on WhatsApp or email."],
              [Send, "Send your rates, offers or a FAM trip invite to the agents you pick."],
              [Lock, "Their numbers and emails are not shown in the list. Email or WhatsApp them from your own email and number."],
              [ShieldCheck, "Every partner gets at most a couple of hotel messages a week, so they keep listening."],
            ].map(([Icon, text]) => (
              <li key={text} className="flex gap-2">
                <Icon className="mt-0.5 size-4 shrink-0 text-app-accent-text" aria-hidden />
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3 rounded-xl border border-app-border bg-app-surface-secondary p-4">
          {status === "pending" ? (
            <Notice tone="info" icon={Clock} title="Request sent">
              Our team is reviewing it. You can already add and import your own contacts under &quot;My contacts&quot;.
            </Notice>
          ) : status === "rejected" || status === "revoked" ? (
            <Notice tone="warning" title={status === "rejected" ? "Request not approved" : "Access was turned off"}>
              Talk to your Eazotel account manager, or send a new request with a note.
            </Notice>
          ) : null}
          {status !== "pending" && (
            <>
              <Field label="Anything we should know? (optional)">
                <Textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. We want to reach wedding planners in Delhi and Jaipur"
                  maxLength={500}
                />
              </Field>
              <Button icon={Send} loading={isLoading} onClick={send} className="w-full">
                Request access
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};

export default TradeDirectory;
