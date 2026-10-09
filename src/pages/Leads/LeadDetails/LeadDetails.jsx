import {
  ArrowLeft,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Inbox,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import FollowUpDialog from "../../../components/FollowUpDialog";
import QuickResponsePopup from "../../../components/Popup/QuickResponsePopup";
import { LeadDetailsSkeleton } from "../../../components/Skeltons/LeadDetailsSkelton";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import DatePicker from "../../../components/ui/DatePicker";
import Detail from "../../../components/ui/Detail";
import Icon from "../../../components/ui/Icon";
import PageShell from "../../../components/ui/PageShell";
import { EmptyState, ErrorState } from "../../../components/ui/States";
import { useApiAction } from "../../../hooks/useApiAction";
import { useTenant } from "../../../hooks/useTenant";
import {
  useGetCallConnectionQuery,
  useGetTeamUsersQuery,
  useGetWhatsAppTemplatesQuery,
  useMakeCallMutation,
} from "../../../redux/api/callsApi";
import {
  useGetLeadAtPositionQuery,
  useGetLeadQuery,
  useUpdateLeadMutation,
} from "../../../redux/api/leadsApi";
import { formatDateTime } from "../../../utils/formateDate";
import NotesCard from "../../Enquiry/ViewAndManageLead/NotesCard";
import {
  getLeadCreatedAt,
  getLeadName,
  getRequestDetails,
  toLabel,
} from "../leadUtils";
import CallLeadDialog from "../../../components/CallLeadDialog";
import ConvertToBookingDialog from "./ConvertToBookingDialog";
import LeadInfoCard from "./LeadInfoCard";

// Date -> "YYYY-MM-DDTHH:mm" in local time, the value the date picker uses
const toInputValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
};

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
  const [followUp, setFollowUp] = useState("");
  // one piece of state per dialog
  const [dialog, setDialog] = useState(null); // "whatsapp" | "call" | "stageFollowUp" | "convert"

  const users = useGetTeamUsersQuery();
  const callConnection = useGetCallConnectionQuery();
  // only needed once the WhatsApp popup has been opened
  const templates = useGetWhatsAppTemplatesQuery(hid, {
    skip: !hid || dialog !== "whatsapp",
  });
  const [updateLead, { isLoading: isSaving }] = useUpdateLeadMutation();
  const [makeCall, { isLoading: isCalling }] = useMakeCallMutation();

  useEffect(() => {
    setLead(loadedLead);
    setFollowUp(toInputValue(loadedLead?.followUpDate || loadedLead?.followUp));
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
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <LeadDetailsSkeleton />
      </div>
    );
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

  const requestDetails = getRequestDetails(lead);
  const otherDetails = Object.entries(lead.other_details || {});

  return (
    <PageShell
      title={getLeadName(lead)}
      description={[
        formatDateTime(getLeadCreatedAt(lead)),
        !isSingleLead && `Lead ${position} of ${total.toLocaleString()}`,
      ]
        .filter(Boolean)
        .join(" · ")}
      actions={
        <>
          {backButton}
          {!isSingleLead && (
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
          <Button icon={CalendarCheck} onClick={() => setDialog("convert")}>
            Convert to booking
          </Button>
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
        className={`grid items-start gap-5 md:grid-cols-2 ${result.isFetching ? "opacity-60" : ""}`}
      >
        <div className="space-y-5">
          <LeadInfoCard
            lead={lead}
            users={users.data || []}
            onWhatsApp={() => setDialog("whatsapp")}
            onCall={handleCallClick}
            onStageChange={handleStageChange}
            onTurnAway={(turnAwayCode) =>
              handleUpdate({
                status: "Turn Away",
                followUpDate: null,
                turnAwayCode,
              })
            }
            onAssign={(user) =>
              handleUpdate({
                assignee: user.userName,
                assigneeNumber: user.phone || null,
                assigneeEmail: user.emailId || null,
              })
            }
          />

          {otherDetails.length > 0 && (
            <Card title="Other details">
              <dl className="grid gap-4 sm:grid-cols-2">
                {otherDetails.map(([key, value]) => (
                  <Detail key={key} label={toLabel(key)}>
                    {String(value ?? "")}
                  </Detail>
                ))}
              </dl>
            </Card>
          )}
        </div>

        <div className="min-w-0 space-y-5">
          {lead.Message && (
            <Card title="Message">
              <p className="whitespace-pre-wrap break-words text-sm text-app-text-muted">
                {lead.Message}
              </p>
            </Card>
          )}

          <NotesCard lead={lead} setLead={setLead} />

          {requestDetails.length > 0 && (
            <Card title="Request details">
              <dl className="grid gap-4 sm:grid-cols-2">
                {requestDetails.map((detail) => (
                  <Detail key={detail.label} label={detail.label}>
                    {detail.value}
                  </Detail>
                ))}
              </dl>
            </Card>
          )}
        </div>
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

      <QuickResponsePopup
        open={dialog === "whatsapp"}
        setOpen={() => setDialog(null)}
        lead={lead}
        templates={templates.data || []}
      />

      <ConvertToBookingDialog
        open={dialog === "convert"}
        lead={lead}
        onClose={() => setDialog(null)}
      />
    </PageShell>
  );
};

export default LeadDetails;
