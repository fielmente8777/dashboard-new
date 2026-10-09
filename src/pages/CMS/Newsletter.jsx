import { Copy, Mail } from "lucide-react";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import Button from "../../components/ui/Button";
import DataTable from "../../components/ui/DataTable";
import { Input } from "../../components/ui/Field";
import PageShell from "../../components/ui/PageShell";
import { useToast } from "../../context/ToastContext";
import Icon from "../../components/ui/Icon";

const COLUMNS = [
  { key: "index", header: "#", className: "w-14", render: (_, i) => i + 1 },
  { key: "email", header: "Email" },
  {
    key: "action",
    header: "Action",
    className: "w-28",
    render: (subscriber) => (
      <a
        href={`mailto:${subscriber.email}`}
        className="inline-flex items-center gap-1.5 text-blue-500 hover:underline"
      >
        <Icon icon={Mail} /> Email
      </a>
    ),
  },
];

const Newsletter = () => {
  const { showToast } = useToast();
  const { newsletterData, loading } = useSelector(
    (state) => state.hotelsWebsiteData,
  );
  const [search, setSearch] = useState("");

  const subscribers = useMemo(() => {
    const term = search.trim().toLowerCase();
    const all = (newsletterData || []).filter((s) => s?.email);
    return term
      ? all.filter((s) => s.email.toLowerCase().includes(term))
      : all;
  }, [newsletterData, search]);

  const copyEmails = async () => {
    try {
      await navigator.clipboard.writeText(
        subscribers.map((s) => s.email).join(", "),
      );
      showToast({ message: `${subscribers.length} emails copied` });
    } catch {
      showToast({ message: "Could not copy the emails.", type: "error" });
    }
  };

  return (
    <PageShell
      title="Newsletter"
      description="People who subscribed to the newsletter on your website."
      actions={
        <>
          <div className="w-56">
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search email"
              aria-label="Search email"
            />
          </div>
          <Button
            variant="secondary"
            icon={Copy}
            disabled={subscribers.length === 0}
            onClick={copyEmails}
          >
            Copy emails
          </Button>
        </>
      }
    >
      <DataTable
        columns={COLUMNS}
        rows={subscribers}
        rowKey={(subscriber, index) => subscriber._id || `${subscriber.email}-${index}`}
        loading={loading && !newsletterData}
        emptyMessage={search ? "No subscriber matches your search." : "No subscribers yet."}
      />
    </PageShell>
  );
};

export default Newsletter;
