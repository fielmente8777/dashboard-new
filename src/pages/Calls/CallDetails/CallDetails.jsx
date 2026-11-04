import {
  ArrowLeft,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Hourglass,
  Mic,
  PhoneOff,
  Timer,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import QuickResponsePopup from "../../../components/Popup/QuickResponsePopup";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Icon from "../../../components/ui/Icon";
import IconButton from "../../../components/ui/IconButton";
import PageShell from "../../../components/ui/PageShell";
import { EmptyState, ErrorState, Skeleton } from "../../../components/ui/States";
import { useConfirm } from "../../../context/ConfirmContext";
import { useToast } from "../../../context/ToastContext";
import { useApiAction } from "../../../hooks/useApiAction";
import {
  useGetCallsQuery,
  useMakeCallMutation,
  useUpdateCallMutation,
} from "../../../redux/api/callsApi";
import { selectHid } from "../../../redux/slice/UserSlice";
import { timeAgo } from "../../../utils/formateDate";
import NotesCard from "../../Enquiry/ViewAndManageLead/NotesCard";
import { useLeadWhatsApp } from "../../Leads/hooks/useLeadWhatsApp";
import { toInputValue } from "../../Leads/LeadDetails/leadDetailsUtils";
import {
  formatCallDuration,
  getGuestNumber,
  isOutgoing,
} from "../callUtils";
import RecordingPlayer from "../components/RecordingPlayer";
import CallHeader from "./CallHeader";
import CallInfoCard from "./CallInfoCard";
import CallJourneyCard from "./CallJourneyCard";
import CallManageCard from "./CallManageCard";

// the property field is only used by this one account (as on the calls list)
const PROPERTY_COLUMN_DOMAIN = "stayxp";

// Placeholder in the shape of the page below
const CallDetailsLoading = () => (
  <div className="min-h-full space-y-5 p-4 sm:p-6">
    <div className="flex justify-between gap-3">
      <Skeleton className="h-9 w-24" />
      <Skeleton className="h-9 w-48" />
    </div>
    <div className="flex items-center gap-4 rounded-xl border border-app-border! bg-app-surface p-5">
      <Skeleton className="size-16 rounded-2xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {Array.from({ length: 4 }, (_, index) => (
        <Skeleton key={index} className="h-20 rounded-xl" />
      ))}
    </div>
    <div className="grid gap-5 lg:grid-cols-3">
      <Skeleton className="h-72 rounded-xl lg:col-span-2" />
      <Skeleton className="h-72 rounded-xl" />
    </div>
  </div>
);

const Fact = ({ icon, label, value, tone }) => (
  <div className="flex min-w-0 items-center gap-3 rounded-xl border border-app-border! bg-app-surface p-4">
    <span
      className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${tone}`}
    >
      <Icon icon={icon} size="lg" />
    </span>
    <span className="min-w-0">
      <span className="block truncate text-xs font-medium uppercase tracking-wide text-app-text-muted">
        {label}
      </span>
      <span className="mt-0.5 block truncate text-base font-semibold tabular-nums text-app-text">
        {value || "—"}
      </span>
    </span>
  </div>
);

// One call, with what happened on it, its recording, notes and follow-up.
// Opened from the calls table, the URL carries `call`: the position of the
// call in that list, which Prev / Next step through. Opened from the global
// search there is no position, so the call is looked up by its `sid`.
const CallDetails = () => {
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const { showToast } = useToast();
  const run = useApiAction();
  const hid = useSelector(selectHid);
  const hotel = useSelector((state) => state.userProfile.user);
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
  const [updateCall, { isLoading: isSaving }] = useUpdateCallMutation();
  const [makeCall] = useMakeCallMutation();
  const whatsApp = useLeadWhatsApp(hid);

  useEffect(() => {
    setCall(loadedCall);
  }, [loadedCall]);

  const savedFollowUp = toInputValue(call?.followUpDate);

  const handleUpdate = async (changes, success = "Call updated") => {
    const saved = await run(updateCall({ hid, sid: call.sid, ...changes }), {
      success,
      error: "Could not update the call.",
    });
    if (saved) setCall((current) => ({ ...current, ...changes }));
    return saved;
  };

  // a date moves the call to "Follow Up"; removing one leaves the stage alone
  // (the card only offers it when the stage is something else)
  const saveFollowUp = (value) =>
    handleUpdate(
      value
        ? { followUpDate: new Date(value).toISOString(), stage: "Follow Up" }
        : { followUpDate: null },
      value ? "Follow-up saved" : "Follow-up removed",
    );

  const handleStageChange = (stage) => {
    // a follow up needs a date: the follow-up box below asks for it
    if (stage === "Follow Up") {
      showToast({ message: "Pick the follow-up date below and save it." });
      return;
    }
    // only a "Follow Up" call has a follow-up date
    handleUpdate({ stage, followUpDate: null });
  };

  // calls the guest back from the same team number that was on the call
  const handleCallBack = async () => {
    const guestNumber = getGuestNumber(call);
    const teamNumber = isOutgoing(call) ? call.from : call.to;
    const confirmed = await confirm(`Call ${guestNumber} now?`, {
      title: "Call back",
      confirmText: "Call",
      variant: "primary",
    });
    if (!confirmed) return;
    run(makeCall({ hid, fromNumber: teamNumber, toNumber: guestNumber }), {
      success: "Call started. Your phone will ring first.",
      error: "Could not start the call.",
    });
  };

  const backButton = (
    <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate(-1)}>
      Back
    </Button>
  );

  if (result.isLoading || result.isUninitialized) {
    return <CallDetailsLoading />;
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
    <div className="min-h-full p-4 sm:p-6">
      <div className="anim-stagger mx-auto space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {backButton}
          {!isSingleCall && (
            <div className="flex items-center gap-1 rounded-lg border border-app-border! bg-app-surface p-1">
              <IconButton
                icon={ChevronLeft}
                label="Previous call"
                disabled={position <= 1 || result.isFetching}
                onClick={() => setPosition(position - 1)}
              />
              <span className="px-2 text-sm tabular-nums text-app-text-muted">
                Call{" "}
                <span className="font-semibold text-app-text">{position}</span>{" "}
                of {total.toLocaleString()}
              </span>
              <IconButton
                icon={ChevronRight}
                label="Next call"
                disabled={position >= total || result.isFetching}
                onClick={() => setPosition(position + 1)}
              />
            </div>
          )}
        </div>

        <div
          className={`space-y-5 transition-opacity ${result.isFetching ? "opacity-60" : ""}`}
        >
          <CallHeader
            call={call}
            checkingWhatsApp={whatsApp.checkingId === call.sid}
            onWhatsApp={() =>
              whatsApp.openWhatsApp(
                {
                  _id: call.sid,
                  hId: call.hid,
                  Name: call.callerName,
                  Contact: getGuestNumber(call),
                },
                { linkLead: false },
              )
            }
            onCallBack={handleCallBack}
          />

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Fact
              icon={Timer}
              label="Talk time"
              value={formatCallDuration(call.duration)}
              tone="bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
            />
            <Fact
              icon={Hourglass}
              label="Ring + talk"
              value={formatCallDuration(call.ringDuration)}
              tone="bg-sky-500/10 text-sky-600 dark:text-sky-300"
            />
            <Fact
              icon={CalendarClock}
              label="Follow up"
              value={
                call.followUpDate ? timeAgo(call.followUpDate) : "Not set"
              }
              tone="bg-amber-500/10 text-amber-600 dark:text-amber-300"
            />
            <Fact
              icon={Mic}
              label="Recording"
              value={call.recordingUrl ? "Available" : "None"}
              tone="bg-violet-500/10 text-violet-600 dark:text-violet-300"
            />
          </div>

          <div className="grid items-start gap-5 lg:grid-cols-3">
            <div className="min-w-0 space-y-5 lg:col-span-2">
              <CallJourneyCard call={call} />

              {call.recordingUrl && (
                <Card
                  title="Recording"
                  actions={<Icon icon={Mic} tone="faint" size="lg" />}
                >
                  {/* a new player per call, so Prev / Next never plays the wrong one */}
                  <RecordingPlayer key={call.sid} callSid={call.sid} />
                </Card>
              )}

              <NotesCard lead={call} setLead={setCall} callManagement />
            </div>

            <div className="min-w-0 space-y-5">
              <CallManageCard
                key={`${call.sid}-${savedFollowUp}`}
                call={call}
                showProperty={hotel?.Profile?.domain === PROPERTY_COLUMN_DOMAIN}
                savedFollowUp={savedFollowUp}
                saving={isSaving}
                onUpdate={(changes) => handleUpdate(changes)}
                onStageChange={handleStageChange}
                onSaveFollowUp={saveFollowUp}
              />
              <CallInfoCard call={call} />
            </div>
          </div>
        </div>

        {/* room for the floating assistant button below the last card */}
        <div className="h-14" aria-hidden="true" />
      </div>

      <QuickResponsePopup {...whatsApp.popupProps} />
    </div>
  );
};

export default CallDetails;
