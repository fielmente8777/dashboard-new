import { PhoneCall, PhoneIncoming, PhoneOff, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Pagination from "../../components/Pagination";
import QuickResponsePopup from "../../components/Popup/QuickResponsePopup";
import TablePaginationInfo from "../../components/TablePaginationInfo";
import Button from "../../components/ui/Button";
import Dialog from "../../components/ui/Dialog";
import { Input } from "../../components/ui/Field";
import PageShell from "../../components/ui/PageShell";
import { EmptyState, ErrorState, Skeleton } from "../../components/ui/States";
import Tabs from "../../components/ui/Tabs";
import { useConfirm } from "../../context/ConfirmContext";
import { useApiAction } from "../../hooks/useApiAction";
import useDebounce from "../../hooks/useDebounce";
import {
  useGetCallConnectionQuery,
  useGetCallsQuery,
  useGetTeamUsersQuery,
  useGetWhatsAppTemplatesQuery,
  useImportCallsMutation,
  useMakeCallMutation,
  useUpdateCallMutation,
} from "../../redux/api/callsApi";
import { selectHid } from "../../redux/slice/UserSlice";
import { PAGES, callViewPath, dashboardPath } from "../../routes/paths";
import CallsAnalytics from "./CallsAnalytics";
import { getGuestNumber, isOutgoing } from "./callUtils";
import CallsTable from "./components/CallsTable";
import FollowUpDialog from "../../components/FollowUpDialog";
import MakeCallDialog from "./components/MakeCallDialog";
import RecordingPlayer from "./components/RecordingPlayer";
import { useIncomingCall } from "./hooks/useIncomingCall";
import Icon from "../../components/ui/Icon";

const VIEW_TABS = [
  { value: "calls", label: "Calls" },
  { value: "analytics", label: "Analytics" },
];

// the property column is only used by this one account
const PROPERTY_COLUMN_DOMAIN = "stayxp";

const Calls = () => {
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const run = useApiAction();
  const hid = useSelector(selectHid);
  const { user: hotel, authUser } = useSelector((state) => state.userProfile);

  const [view, setView] = useState("calls");
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const search = useDebounce(searchText.trim(), 400);

  // one piece of state per dialog; each holds the call it is about
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false);
  const [recordingCall, setRecordingCall] = useState(null);
  const [followUpCall, setFollowUpCall] = useState(null);
  const [whatsAppLead, setWhatsAppLead] = useState(null);
  const [incomingCall, dismissIncomingCall] = useIncomingCall();

  const connection = useGetCallConnectionQuery();
  const isConnected = connection.data === true;
  const calls = useGetCallsQuery(
    { hid, page, limit, search },
    { skip: !hid || !isConnected, refetchOnMountOrArgChange: true },
  );
  const users = useGetTeamUsersQuery();
  // only needed once the WhatsApp popup has been opened
  const templates = useGetWhatsAppTemplatesQuery(hid, {
    skip: !hid || !whatsAppLead,
  });
  const [importCalls, { isLoading: isImporting }] = useImportCallsMutation();
  const [makeCall, { isLoading: isCalling }] = useMakeCallMutation();
  const [updateCall] = useUpdateCallMutation();

  const total = calls.data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const handleSearch = (e) => {
    setSearchText(e.target.value);
    setPage(1);
  };

  const placeCall = (fromNumber, toNumber) =>
    run(makeCall({ hid, fromNumber, toNumber }), {
      success: "Call started. Your phone will ring first.",
      error: "Could not start the call.",
    });

  const handleDialogCall = async (fromNumber, toNumber) => {
    if (await placeCall(fromNumber, toNumber)) setIsCallDialogOpen(false);
  };

  // calls the guest back from the same team number that was on the call
  const handleCallBack = async (call) => {
    const guestNumber = getGuestNumber(call);
    const teamNumber = isOutgoing(call) ? call.from : call.to;

    const confirmed = await confirm(`Call ${guestNumber} now?`, {
      title: "Call back",
      confirmText: "Call",
      variant: "primary",
    });
    if (confirmed) placeCall(teamNumber, guestNumber);
  };

  const handleUpdate = (call, changes) =>
    run(updateCall({ hid, sid: call.sid, ...changes }), {
      success: "Call updated",
      error: "Could not update the call.",
    });

  const handleOpen = (call, position) => {
    // `call` is the position in the list, used by Prev / Next on the details page
    const query = { sid: call.sid, hid: call.hid, call: position, search };
    navigate(callViewPath(call._id, { hid, query }));
  };

  return (
    <PageShell
      title="Calls Management"
      description="Every call made and received through your business number."
      actions={<Tabs tabs={VIEW_TABS} value={view} onChange={setView} />}
    >
      {view === "analytics" && <CallsAnalytics />}

      {view === "calls" && connection.isLoading && (
        <Skeleton className="h-96" />
      )}

      {view === "calls" && connection.isError && (
        <ErrorState
          message="Could not check the calling connection."
          onRetry={connection.refetch}
        />
      )}

      {view === "calls" && connection.isSuccess && !isConnected && (
        <EmptyState
          icon={PhoneOff}
          title="Calling is not connected"
          description="Connect your calling account to see and manage your calls here."
          action={
            <Link
              to={dashboardPath(PAGES.INTEGRATION)}
              className="text-sm font-medium text-blue-500 hover:underline"
            >
              Connect it in Integrations
            </Link>
          }
        />
      )}

      {view === "calls" && isConnected && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="w-72">
              <Input
                type="search"
                value={searchText}
                onChange={handleSearch}
                placeholder="Search calls..."
                aria-label="Search calls"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                icon={RefreshCw}
                loading={isImporting}
                onClick={() =>
                  run(importCalls(hid), {
                    error: "Could not refresh the calls.",
                  })
                }
              >
                Refresh
              </Button>
              <Button
                icon={PhoneCall}
                onClick={() => setIsCallDialogOpen(true)}
              >
                Call now
              </Button>
            </div>
          </div>

          {calls.isError ? (
            <ErrorState
              message="Could not load the calls."
              onRetry={calls.refetch}
            />
          ) : (
            <CallsTable
              calls={calls.data?.calls || []}
              users={users.data || []}
              loading={calls.isLoading || calls.isUninitialized}
              firstIndex={(page - 1) * limit}
              pageSize={limit}
              showProperty={hotel?.Profile?.domain === PROPERTY_COLUMN_DOMAIN}
              onOpen={handleOpen}
              onUpdate={handleUpdate}
              onFollowUp={setFollowUpCall}
              onCallBack={handleCallBack}
              onWhatsApp={(call) =>
                setWhatsAppLead({ Contact: getGuestNumber(call) })
              }
              onPlay={setRecordingCall}
            />
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              onPrev={() => setPage(page - 1)}
              onNext={() => setPage(page + 1)}
            />
            <TablePaginationInfo
              page={page}
              limit={limit}
              total={total}
              onLimitChange={(value) => {
                setLimit(value);
                setPage(1);
              }}
            />
          </div>
        </>
      )}

      <MakeCallDialog
        open={isCallDialogOpen}
        fromName={authUser?.userName}
        fromNumber={authUser?.phone}
        calling={isCalling}
        onCall={handleDialogCall}
        onClose={() => setIsCallDialogOpen(false)}
      />

      <Dialog
        open={Boolean(recordingCall)}
        onClose={() => setRecordingCall(null)}
        title="Call recording"
      >
        {recordingCall && (
          <RecordingPlayer callSid={recordingCall.sid} autoLoad />
        )}
      </Dialog>

      <FollowUpDialog
        open={Boolean(followUpCall)}
        onClose={() => setFollowUpCall(null)}
        onSave={(date) => {
          handleUpdate(followUpCall, {
            stage: "Follow Up",
            followUpDate: date,
          });
          setFollowUpCall(null);
        }}
      />

      <QuickResponsePopup
        open={Boolean(whatsAppLead)}
        setOpen={() => setWhatsAppLead(null)}
        lead={whatsAppLead}
        templates={templates.data || []}
      />

      <Dialog
        open={Boolean(incomingCall)}
        onClose={dismissIncomingCall}
        title="Incoming call"
        description="Please check your phone."
      >
        <p className="flex items-center gap-3 text-base font-semibold text-app-text">
          <span className="flex size-10 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <Icon icon={PhoneIncoming} size="lg" />
          </span>
          {incomingCall?.from}
        </p>
      </Dialog>
    </PageShell>
  );
};

export default Calls;
