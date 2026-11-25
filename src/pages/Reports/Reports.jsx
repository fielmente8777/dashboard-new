import { useState } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import PageShell from "../../components/ui/PageShell";
import Tabs from "../../components/ui/Tabs";
import { selectHid } from "../../redux/slice/UserSlice";
import CreateReportPanel from "./components/CreateReportPanel";
import EmailReportDialog from "./components/EmailReportDialog";
import MonthlySettings from "./components/MonthlySettings";
import PartsDialog from "./components/PartsDialog";
import ReportsHistory from "./components/ReportsHistory";

const TABS = [
  { value: "create", label: "Create report" },
  { value: "saved", label: "Saved reports" },
  { value: "monthly", label: "Monthly email" },
];
const TAB_VALUES = new Set(TABS.map((t) => t.value));

// Reports: the whole dashboard (leads by source and stage, calls, Meta, Google Ads, Google
// Analytics, Search Console) as one PDF or each part on its own, by email, and every month
// by email. Service pages (Meta, Google Ads, Analytics …) make their own part from here too.
const Reports = () => {
  const hid = useSelector(selectHid);
  const [searchParams, setSearchParams] = useSearchParams();
  const asked = searchParams.get("tab");
  const tab = TAB_VALUES.has(asked) ? asked : "create";
  const setTab = (next) => setSearchParams(next === "create" ? {} : { tab: next }, { replace: true });
  const [partsOf, setPartsOf] = useState(null);
  const [emailOf, setEmailOf] = useState(null);

  return (
    <PageShell
      title="Reports"
      description="One report of everything the dashboard records: where leads come from, ads, website and search. Download it, email it, or get it every month."
    >
      <Tabs tabs={TABS} value={tab} onChange={setTab} className="mb-4" />

      {tab === "create" && <CreateReportPanel hid={hid} onParts={setPartsOf} onEmail={setEmailOf} />}
      {tab === "saved" && <ReportsHistory hid={hid} onParts={setPartsOf} onEmail={setEmailOf} onCreate={() => setTab("create")} />}
      {tab === "monthly" && <MonthlySettings hid={hid} />}

      <PartsDialog report={partsOf} onClose={() => setPartsOf(null)} />
      <EmailReportDialog hid={hid} report={emailOf} onClose={() => setEmailOf(null)} />
    </PageShell>
  );
};

export default Reports;
