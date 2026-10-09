import { Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import PageShell from "../../../components/ui/PageShell";
import RichTextEditor from "../../../components/ui/RichTextEditor";
import { Skeleton } from "../../../components/ui/States";
import { useSavePoliciesMutation } from "../../../redux/api/cmsApi";
import { selectHid } from "../../../redux/slice/UserSlice";
import { useCmsAction } from "../hooks/useCmsAction";
import { useWebsiteData } from "../hooks/useWebsiteData";

// Editor for one of the three policy texts.
// field: "Privacy" | "Cancellation" | "TermsServices"
const PolicyEditor = ({ title, description, field }) => {
  const hid = useSelector(selectHid);
  const { data, isLoading } = useWebsiteData();
  const runCmsAction = useCmsAction();
  const [savePolicies, { isLoading: isSaving }] = useSavePoliciesMutation();
  // null until the user edits the text
  const [draft, setDraft] = useState(null);

  // stored as [{ Privacy }, { Cancellation }, { TermsServices }]
  const policies = useMemo(
    () => Object.assign({}, ...(data?.TermsConditions || [])),
    [data],
  );
  const savedText = policies[field] || "";
  const hasChanges = draft !== null && draft !== savedText;

  // an unsaved draft belongs to the location it was typed for
  useEffect(() => setDraft(null), [hid]);

  const handleSave = async () => {
    // the endpoint replaces all three texts, so the other two are sent back as they are
    const saved = await runCmsAction(
      savePolicies({
        Privacy: policies.Privacy,
        Cancellation: policies.Cancellation,
        TermsServices: policies.TermsServices,
        [field]: draft,
      }),
      { success: `${title} updated` },
    );
    if (saved) setDraft(null);
  };

  return (
    <PageShell
      title={title}
      description={description}
      actions={
        <Button
          icon={Save}
          loading={isSaving}
          disabled={!hasChanges}
          onClick={handleSave}
        >
          Save changes
        </Button>
      }
    >
      <Card>
        {isLoading ? (
          <Skeleton className="h-96" />
        ) : (
          <RichTextEditor
            key={hid}
            value={savedText}
            onChange={setDraft}
            height={520}
          />
        )}
      </Card>
    </PageShell>
  );
};

export default PolicyEditor;
