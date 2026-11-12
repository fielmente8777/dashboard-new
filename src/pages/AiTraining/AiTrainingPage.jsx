import { useState } from "react";
import PageShell from "../../components/ui/PageShell";
import Tabs from "../../components/ui/Tabs";
import { hasTenant, useTenant } from "../../hooks/useTenant";
import { useGetFlaggedRepliesQuery } from "../../redux/api/aiTrainingApi";
import CustomRulesTab from "./components/CustomRulesTab";
import FlaggedRepliesTab from "./components/FlaggedRepliesTab";
import VoiceAiTab from "./components/VoiceAiTab";

const AiTrainingPage = () => { 
  const tenant = useTenant();
  const [tab, setTab] = useState("rules");
  // loaded here, not in the tab, so the badge shows the count straight away
  const flagged = useGetFlaggedRepliesQuery(tenant, {
    skip: !hasTenant(tenant),
    refetchOnMountOrArgChange: true,
  });

  return (
    <PageShell
      title="Train Your AI"
      description="Set rules for how your AI behaves on chat and on calls, and review corrections flagged from real conversations."
    >
      <Tabs
        value={tab}
        onChange={setTab}
        className="border-b border-app-border! pb-2"
        tabs={[
          { value: "rules", label: "Chat rules" },
          {
            value: "feedback",
            label: "Flagged replies",
            count: flagged.data?.length || 0,
          },
          { value: "voice", label: "Voice AI" },
        ]}
      />

      {tab === "rules" && <CustomRulesTab tenant={tenant} />}
      {tab === "feedback" && <FlaggedRepliesTab tenant={tenant} flagged={flagged} />}
      {tab === "voice" && <VoiceAiTab tenant={tenant} />}
    </PageShell>
  );
};

export default AiTrainingPage;
