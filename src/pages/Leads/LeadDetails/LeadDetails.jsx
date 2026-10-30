import {
  ArrowLeft,
  BedDouble,
  ChevronLeft,
  ChevronRight,
  Inbox,
  MessageSquareQuote,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import CallLeadDialog from "../../../components/CallLeadDialog";
import FollowUpDialog from "../../../components/FollowUpDialog";
import QuickResponsePopup from "../../../components/Popup/QuickResponsePopup";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Detail from "../../../components/ui/Detail";
import Icon from "../../../components/ui/Icon";
import IconButton from "../../../components/ui/IconButton";
import PageShell from "../../../components/ui/PageShell";
import { EmptyState, ErrorState, Skeleton } from "../../../components/ui/States";
import { useApiAction } from "../../../hooks/useApiAction";
import { useTenant } from "../../../hooks/useTenant";
import {
  useGetCallConnectionQuery,
  useGetTeamUsersQuery,
  useMakeCallMutation,
} from "../../../redux/api/callsApi";
import {
  useGetLeadAtPositionQuery,
  useGetLeadQuery,
  useUpdateLeadMutation,
} from "../../../redux/api/leadsApi";
import NotesCard from "../../Enquiry/ViewAndManageLead/NotesCard";
import { useAssigneeChatSync } from "../hooks/useAssigneeChatSync";
import { useLeadWhatsApp } from "../hooks/useLeadWhatsApp";
import {
  cleanValue,
  getStayDetails,
  parseMessageFields,
  toLabel,
} from "../leadUtils";
import ConvertToBookingDialog from "./ConvertToBookingDialog";
import LeadHeader from "./LeadHeader";
import LeadInfoCard from "./LeadInfoCard";
import LeadManageCard from "./LeadManageCard";
import LeadSourceCard from "./LeadSourceCard";
import LeadStageTrack from "./LeadStageTrack";
import { toInputValue } from "./leadDetailsUtils";

// Placeholder in the shape of the page below
const LeadDetailsLoading = () => (
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
    <Skeleton className="h-24 w-full rounded-xl" />
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="space-y-5 lg:col-span-2">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
      <div className="space-y-5">
        <Skeleton className="h-72 w-full rounded-xl" />
        <Skeleton className="h-56 w-full rounded-xl" />
      </div>
    </div>
  </div>
);

const StayFact = ({ label, value }) => (
  <div className="rounded-lg bg-app-surface-secondary/60 px-3 py-2.5">
    <p className="text-xs text-app-text-muted">{label}</p>
    <p className="mt-0.5 text-sm font-semibold text-app-text">{value || "—"}</p>
  </div>
);

// One lead, with its details, notes and follow-up date.
// Opened from a leads list, the URL carries `lead` (the position of the lead
// in that list) and the list's filters, and Prev / Next step through the
// list. Opened from the global search there is no position, so the lead is
// looked up by its id.
const LeadDetails = () => {
  const navigate = useNavigate();
  const run = useApiAction();
  const { hid } = useTenant();
  const { leadId } = useParams();
  const [searchParams] = useSearchParams();
  const startPosition = Number(searchParams.get("lead")) || null;

  const [position, setPosition] = useState(startPosition);
  const isSingleLead = !startPosition;

  const single = useGetLeadQuery(
    { hid: searchParams.get("hid") || hid, leadId },
    { skip: !isSingleLead || !hid, refetchOnMountOrArgChange: true },
  );
  const paged = useGetLeadAtPositionQuery(
    {
      hid,
      position,
      createdFrom: searchParams.get("created_from") || "",
      search: searchParams.get("search") || "",
      stage: searchParams.get("stage") || "",
      source: (searchParams.get("source") || "").split(",").filter(Boolean),
      from: searchParams.get("startDate") || "",
      to: searchParams.get("endDate") || "",
    },
    { skip: isSingleLead || !hid, refetchOnMountOrArgChange: true },
  );
  const result = isSingleLead ? single : paged;
  const loadedLead = (isSingleLead ? single.data : paged.data?.lead) || null;
  const total = paged.data?.total || 0;

  // NotesCard edits the lead in place, so it needs its own copy
  const [lead, setLead] = useState(null);
  // one piece of state per dialog
  const [dialog, setDialog] = useState(null); // "call" | "stageFollowUp" | "convert"

  const users = useGetTeamUsersQuery();
  const callConnection = useGetCallConnectionQuery();
  const whatsApp = useLeadWhatsApp(hid);
  const syncAssignee = useAssigneeChatSync(hid);
  const [updateLead, { isLoading: isSaving }] = useUpdateLeadMutation();
  const [makeCall, { isLoading: isCalling }] = useMakeCallMutation();

  useEffect(() => {
    setLead(loadedLead);
  }, [loadedLead]);

  const savedFollowUp = toInputValue(lead?.followUpDate || lead?.followUp);

  const handleUpdate = async (changes, success = "Lead updated") => {
    const saved = await run(
      updateLead({
        hid: lead.hId,
        leadId: lead._id,
        ...(lead.conversationId && { conversationId: lead.conversationId }),
        ...changes,
      }),
      { success, error: "Could not update the lead." },
    );
    if (saved) setLead((current) => ({ ...current, ...changes }));
    return saved;
  };

  const saveFollowUp = (value) =>
    handleUpdate(
      {
        status: "Follow Up",
        followUpDate: value ? new Date(value).toISOString() : null,
      },
      value ? "Follow-up saved" : "Follow-up removed",
    );

  const handleStageChange = (stage) => {
    // a follow up also needs a date, which the dialog asks for
    if (stage === "Follow Up") setDialog("stageFollowUp");
    else handleUpdate({ status: stage, followUpDate: null });
  };

  const handleCallClick = () => {
    // without the calling provider, hand the number to the device instead
    if (callConnection.data === true) setDialog("call");
    else window.location.assign(`tel:${lead.Contact}`);
  };

  const handleCall = async (fromNumber, toNumber) => {
    const started = await run(makeCall({ hid, fromNumber, toNumber }), {
      success: "Call started. The team member's phone will ring first.",
      error: "Could not start the call.",
    });
    if (started) setDialog(null);
  };

  const backButton = (
    <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate(-1)}>
      Back
    </Button>
  );

  if (result.isLoading || result.isUninitialized) {
    return <LeadDetailsLoading />;
  }

  if (result.isError || !lead) {
    return (
      <PageShell title="Lead Details" actions={backButton}>
        {result.isError ? (
          <ErrorState
            message="Could not load the lead."
            onRetry={result.refetch}
          />
        ) : (
          <EmptyState icon={Inbox} title="No lead found" />
        )}
      </PageShell>
    );
  }

  const otherDetails = Object.entries(lead.other_details || {}).filter(
    ([, value]) => typeof value === "object" || cleanValue(value),
  );
  const stay = getStayDetails(lead);
  const hasStay = Boolean(stay.checkIn || stay.checkOut || stay.guests);
  const message = cleanValue(lead.Message);
  // a form message ("check-in: ..., guests: ...") reads better as fields
  const messageFields = parseMessageFields(message);

  return (
    <div className="min-h-full p-4 sm:p-6">
      <div className="anim-stagger mx-auto space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {backButton}
          {!isSingleLead && (
            <div className="flex items-center gap-1 rounded-lg border border-app-border! bg-app-surface p-1">
              <IconButton
                icon={ChevronLeft}
                label="Previous lead"
                disabled={position <= 1 || result.isFetching}
                onClick={() => setPosition(position - 1)}
              />
              <span className="px-2 text-sm tabular-nums text-app-text-muted">
                Lead{" "}
                <span className="font-semibold text-app-text">{position}</span>{" "}
                of {total.toLocaleString()}
              </span>
              <IconButton
                icon={ChevronRight}
                label="Next lead"
                disabled={position >= total || result.isFetching}
                onClick={() => setPosition(position + 1)}
              />
            </div>
          )}
        </div>

        <div className={`space-y-5 transition-opacity ${result.isFetching ? "opacity-60" : ""}`}>
          <LeadHeader
            lead={lead}
            checkingWhatsApp={whatsApp.checkingId === lead._id}
            onWhatsApp={() => whatsApp.openWhatsApp(lead)}
            onCall={handleCallClick}
            onConvert={() => setDialog("convert")}
          />

          <LeadStageTrack
            stage={lead.status}
            disabled={isSaving}
            onStageChange={handleStageChange}
          />

          {/* Phone and tablet: contact, manage, then the details, with the
              source & tracking card last. Desktop: details on the left,
              manage and contact on the right. */}
          <div className="flex flex-col gap-5 lg:grid lg:grid-cols-3 lg:items-start">
            <div className="order-2 min-w-0 space-y-5 lg:order-none lg:col-span-2">
              {hasStay && (
                <Card
                  title="Stay request"
                  actions={<Icon icon={BedDouble} tone="faint" size="lg" />}
                >
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <StayFact label="Check in" value={stay.checkIn} />
                    <StayFact label="Check out" value={stay.checkOut} />
                    <StayFact
                      label="Nights"
                      value={stay.nights ? String(stay.nights) : ""}
                    />
                    <StayFact label="Guests" value={stay.guests} />
                  </div>
                </Card>
              )}

              {message && (
                <Card
                  title="Message"
                  actions={
                    <Icon icon={MessageSquareQuote} tone="faint" size="lg" />
                  }
                >
                  {messageFields.length > 0 ? (
                    <dl className="grid gap-3 sm:grid-cols-2">
                      {messageFields.map((field, index) => (
                        <div
                          key={`${field.label}-${index}`}
                          className="rounded-lg bg-app-surface-secondary/60 px-3 py-2.5"
                        >
                          <dt className="text-xs text-app-text-muted">
                            {field.label}
                          </dt>
                          <dd className="mt-0.5 break-words text-sm font-medium text-app-text">
                            {field.value || "—"}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  ) : (
                    <p className="whitespace-pre-wrap break-words rounded-lg border-l-4 border-l-blue-500! bg-app-surface-secondary/60 px-4 py-3 text-sm leading-relaxed text-app-text">
                      {message}
                    </p>
                  )}
                </Card>
              )}

              <NotesCard lead={lead} setLead={setLead} />

              {otherDetails.length > 0 && (
                <Card
                  title="Form answers"
                  description="Everything the lead filled in"
                >
                  <dl className="grid gap-4 sm:grid-cols-2">
                    {otherDetails.map(([key, value]) => (
                      <Detail key={key} label={toLabel(key)}>
                        {typeof value === "object"
                          ? JSON.stringify(value)
                          : String(value)}
                      </Detail>
                    ))}
                  </dl>
                </Card>
              )}

              <LeadSourceCard lead={lead} />
            </div>

            <div className="order-1 flex min-w-0 flex-col gap-5 lg:order-none">
              <LeadManageCard
                key={`${lead._id}-${savedFollowUp}`}
                lead={lead}
                users={users.data || []}
                savedFollowUp={savedFollowUp}
                saving={isSaving}
                onSaveFollowUp={saveFollowUp}
                onStageChange={handleStageChange}
                onTurnAway={(turnAwayCode) =>
                  handleUpdate({
                    status: "Turn Away",
                    followUpDate: null,
                    turnAwayCode,
                  })
                }
                onAssign={async (user) => {
                  const fields = {
                    assignee: user.userName,
                    assigneeNumber: user.phone || null,
                    assigneeEmail: user.emailId || null,
                  };
                  // the guest's WhatsApp chat gets the same assignee
                  if (await handleUpdate(fields)) syncAssignee(lead, fields);
                }}
              />
              <div className="order-first lg:order-none">
                <LeadInfoCard lead={lead} />
              </div>
            </div>
          </div>
        </div>
        {/* room for the floating assistant button below the last card */}
        <div className="h-14" aria-hidden="true" />
      </div>

      <FollowUpDialog
        open={dialog === "stageFollowUp"}
        description="Pick the date and time to follow up with this lead."
        onClose={() => setDialog(null)}
        onSave={(date) => {
          handleUpdate({
            status: "Follow Up",
            followUpDate: date.toISOString(),
          });
          setDialog(null);
        }}
      />

      <CallLeadDialog
        open={dialog === "call"}
        lead={lead}
        users={users.data || []}
        calling={isCalling}
        onCall={handleCall}
        onClose={() => setDialog(null)}
      />

      <QuickResponsePopup {...whatsApp.popupProps} />

      <ConvertToBookingDialog
        open={dialog === "convert"}
        lead={lead}
        onClose={() => setDialog(null)}
      />
    </div>
  );
};

export default LeadDetails;
