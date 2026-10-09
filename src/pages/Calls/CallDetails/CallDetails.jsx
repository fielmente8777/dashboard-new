import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  PhoneOff,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LeadDetailsSkeleton } from "../../../components/Skeltons/LeadDetailsSkelton";
import Button from "../../../components/ui/Button";
import PageShell from "../../../components/ui/PageShell";
import { EmptyState, ErrorState } from "../../../components/ui/States";
import { useApiAction } from "../../../hooks/useApiAction";
import {
  useGetCallsQuery,
  useUpdateCallMutation,
} from "../../../redux/api/callsApi";
import { selectHid } from "../../../redux/slice/UserSlice";
import NotesCard from "../../Enquiry/ViewAndManageLead/NotesCard";
import CallInfoCard from "./CallInfoCard";
import Icon from "../../../components/ui/Icon";
import DatePicker from "../../../components/ui/DatePicker";

// Date -> "YYYY-MM-DDTHH:mm" in local time, the value the date picker uses
const toInputValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
};

// One call, with its notes and follow-up date.
// Opened from the calls table, the URL carries `call`: the position of the
// call in that list, which Prev / Next step through. Opened from the global
// search there is no position, so the call is looked up by its `sid`.
const CallDetails = () => {
  const navigate = useNavigate();
  const run = useApiAction();
  const hid = useSelector(selectHid);
  const [searchParams] = useSearchParams();
  const sid = searchParams.get("sid");
  const listSearch = searchParams.get("search") || "";
  const startPosition = Number(searchParams.get("call")) || null;

  const [position, setPosition] = useState(startPosition);
  const isSingleCall = !startPosition;

  const result = useGetCallsQuery(
    isSingleCall
      ? { hid, page: 1, limit: 1, search: sid }
      : { hid, page: position, limit: 1, search: listSearch },
    { skip: !hid, refetchOnMountOrArgChange: true },
  );
  const loadedCall = result.data?.calls?.[0] || null;
  const total = result.data?.total || 0;

  // NotesCard edits the call in place, so it needs its own copy
  const [call, setCall] = useState(null);
  const [followUp, setFollowUp] = useState("");
  const [updateCall, { isLoading: isSaving }] = useUpdateCallMutation();

  useEffect(() => {
    setCall(loadedCall);
    setFollowUp(toInputValue(loadedCall?.followUpDate));
  }, [loadedCall]);

  const savedFollowUp = toInputValue(call?.followUpDate);

  const saveFollowUp = async (value) => {
    const followUpDate = value ? new Date(value).toISOString() : null;
    const saved = await run(
      updateCall({ hid, sid: call.sid, followUpDate, stage: "Follow Up" }),
      {
        success: value ? "Follow-up saved" : "Follow-up removed",
        error: "Could not save the follow-up.",
      },
    );
    if (saved) setCall({ ...call, followUpDate });
  };

  const backButton = (
    <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate(-1)}>
      Back
    </Button>
  );

  if (result.isLoading || result.isUninitialized) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <LeadDetailsSkeleton />
      </div>
    );
  }

  if (result.isError || !call) {
    return (
      <PageShell title="Call Details" actions={backButton}>
        {result.isError ? (
          <ErrorState
            message="Could not load the call."
            onRetry={result.refetch}
          />
        ) : (
          <EmptyState icon={PhoneOff} title="No call found" />
        )}
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Call Details"
      description={
        isSingleCall
          ? undefined
          : `Call ${position} of ${total.toLocaleString()}`
      }
      actions={
        <>
          {backButton}
          {!isSingleCall && (
            <>
              <Button
                variant="secondary"
                icon={ChevronLeft}
                disabled={position <= 1 || result.isFetching}
                onClick={() => setPosition(position - 1)}
              >
                Prev
              </Button>
              <Button
                variant="secondary"
                disabled={position >= total || result.isFetching}
                onClick={() => setPosition(position + 1)}
              >
                Next <Icon icon={ChevronRight} />
              </Button>
            </>
          )}
        </>
      }
    >
      <div className="flex flex-wrap items-end gap-2 rounded-xl border border-app-border! bg-app-surface p-4">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-app-text-muted">
            Follow up on
          </span>
          <span className="block w-64">
            <DatePicker
              mode="datetime"
              timeStep={5}
              value={followUp}
              min={toInputValue(new Date())}
              onChange={setFollowUp}
            />
          </span>
        </label>
        <Button
          loading={isSaving}
          disabled={!followUp || followUp === savedFollowUp}
          onClick={() => saveFollowUp(followUp)}
        >
          Save follow-up
        </Button>
        {savedFollowUp && (
          <Button
            variant="ghost"
            icon={X}
            disabled={isSaving}
            onClick={() => saveFollowUp(null)}
          >
            Remove
          </Button>
        )}
      </div>

      <div
        className={`grid gap-5 md:grid-cols-2 ${result.isFetching ? "opacity-60" : ""}`}
      >
        <CallInfoCard call={call} />
        <NotesCard lead={call} setLead={setCall} callManagement />
      </div>
    </PageShell>
  );
};

export default CallDetails;
