import { AlarmClock, Hourglass, MessageCircle, Search, TimerOff } from "lucide-react";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import DataTable from "../../../components/ui/DataTable";
import { Input } from "../../../components/ui/Field";
import Icon from "../../../components/ui/Icon";
import PageShell from "../../../components/ui/PageShell";
import { EmptyState, ErrorState, Skeleton } from "../../../components/ui/States";
import Tabs from "../../../components/ui/Tabs";
import { stageLabel } from "../../../data/constant";
import { useGetReplyWindowsQuery } from "../../../redux/api/whatsappApi";
import { selectHid } from "../../../redux/slice/UserSlice";
import { dashboardPath, PAGES } from "../../../routes/paths";
import { timeAgo } from "../../../utils/formateDate";
import { getStageTone } from "../../Leads/leadUtils";
import {
  CLOSING_SOON_MS,
  describeWindow,
  getWindowLeft,
  matchesSearch,
} from "./chatUtils";
import ContactAvatar from "./components/ContactAvatar";
import { useNow } from "./hooks/useNow";

const VIEWS = [
  { value: "soon", label: "Closing soon" },
  { value: "open", label: "Open" },
  { value: "closed", label: "Closed today" },
  { value: "all", label: "All" },
];

const inView = (left, view) => {
  if (view === "soon") return left > 0 && left <= CLOSING_SOON_MS;
  if (view === "open") return left > 0;
  if (view === "closed") return left <= 0;
  return true;
};

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
      })
    : "—";

// WhatsApp lets the team write freely for 24 hours after the guest's last
// message; after that only an approved template can be sent. This page lists
// the chats whose window is open or closed in the last day, closing soonest
// first, so nobody loses a guest to a closed window. gian also rings the bell
// two hours before a window closes (services/whatsappWindows/replyWindows.ts).
// The countdowns run in the browser; the list is reloaded every 5 minutes.
const ReplyWindows = () => {
  const navigate = useNavigate();
  const hid = useSelector(selectHid);
  const now = useNow();
  const [view, setView] = useState("soon");
  const [search, setSearch] = useState("");
  const windows = useGetReplyWindowsQuery(hid, {
    skip: !hid,
    pollingInterval: 5 * 60_000,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });

  const rows = useMemo(
    () =>
      (windows.data || []).map((row) => ({
        ...row,
        left: getWindowLeft(row, now),
      })),
    [windows.data, now],
  );
  const counts = useMemo(
    () =>
      Object.fromEntries(
        VIEWS.map((v) => [v.value, rows.filter((row) => inView(row.left, v.value)).length]),
      ),
    [rows],
  );
  const shown = rows.filter(
    (row) => inView(row.left, view) && matchesSearch(row, search),
  );

  const openChat = (row) =>
    navigate(
      dashboardPath(PAGES.CHAT_WHATSAPP, {
        hid,
        query: { conversationId: row._id },
      }),
    );

  const windowBadge = (row) => {
    const w = describeWindow(row.left);
    return (
      <Badge tone={w.tone} className="tabular-nums">
        {w.label}
      </Badge>
    );
  };

  const action = (row) => (
    <Button
      size="sm"
      variant={row.left > 0 ? "primary" : "secondary"}
      icon={MessageCircle}
      onClick={(e) => {
        e.stopPropagation();
        openChat(row);
      }}
    >
      {row.left > 0 ? "Reply" : "Send template"}
    </Button>
  );

  const columns = [
    {
      key: "guest",
      header: "Guest",
      render: (row) => (
        <span className="flex min-w-0 items-center gap-3">
          <ContactAvatar name={row.name} />
          <span className="min-w-0 leading-tight">
            <span className="block truncate font-medium capitalize text-app-text">
              {row.name || "Unknown guest"}
              {row.unread > 0 && (
                <span className="ml-2 rounded-full bg-emerald-500 px-1.5 text-[10px] font-semibold text-white">
                  {row.unread}
                </span>
              )}
            </span>
            <span className="text-xs tabular-nums text-app-text-muted">
              {row.phone}
            </span>
          </span>
        </span>
      ),
    },
    { key: "window", header: "Chat window", render: windowBadge },
    {
      key: "openedAt",
      header: "Guest last wrote",
      className: "whitespace-nowrap",
      render: (row) => (
        <span className="block leading-tight">
          <span className="block text-app-text">{formatDate(row.openedAt)}</span>
          <span className="text-xs text-app-text-faint">{timeAgo(row.openedAt)}</span>
        </span>
      ),
    },
    {
      key: "last",
      header: "Last message",
      render: (row) => (
        <span className="line-clamp-2 max-w-64 text-sm text-app-text-muted">
          {row.lastMessage?.sender === "me" && (
            <span className="font-medium text-app-text">You: </span>
          )}
          {row.lastMessage?.text || "—"}
        </span>
      ),
    },
    {
      key: "stage",
      header: "Stage",
      render: (row) =>
        row.status ? (
          <Badge tone={getStageTone(row.status)}>{stageLabel(row.status)}</Badge>
        ) : (
          <span className="text-app-text-faint">—</span>
        ),
    },
    {
      key: "assignee",
      header: "Assigned to",
      render: (row) => row.assignee || <span className="text-app-text-faint">No one</span>,
    },
    {
      key: "followUp",
      header: "Follow-up",
      className: "whitespace-nowrap",
      render: (row) => formatDate(row.followUpDate),
    },
    { key: "action", header: "", className: "w-px", render: action },
  ];

  const cards = [
    { view: "soon", label: `Closing within 2 hours`, icon: AlarmClock, tone: "text-amber-600 bg-amber-500/10" },
    { view: "open", label: "Open windows", icon: Hourglass, tone: "text-emerald-600 bg-emerald-500/10" },
    { view: "closed", label: "Closed in the last day", icon: TimerOff, tone: "text-red-600 bg-red-500/10" },
  ];

  return (
    <PageShell
      title="Reply windows"
      description="WhatsApp allows free replies for 24 hours after the guest's last message. Reply or follow up before a chat goes inactive."
    >
      {windows.isError ? (
        <ErrorState message="Could not load the reply windows." onRetry={windows.refetch} />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            {cards.map((card) => (
              <button
                key={card.view}
                type="button"
                onClick={() => setView(card.view)}
                className={`flex items-center gap-3 rounded-xl border bg-app-surface p-4 text-left transition hover:border-blue-500/40 ${
                  view === card.view ? "border-blue-500/60! ring-1 ring-blue-500/40" : "border-app-border!"
                }`}
              >
                <span className={`grid size-10 place-items-center rounded-lg ${card.tone}`}>
                  <Icon icon={card.icon} />
                </span>
                <span>
                  <span className="block text-2xl font-semibold tabular-nums text-app-text">
                    {windows.isLoading ? "…" : counts[card.view]}
                  </span>
                  <span className="text-xs text-app-text-muted">{card.label}</span>
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-app-border! bg-app-surface p-3">
            <Tabs
              tabs={VIEWS.map((v) => ({ ...v, label: `${v.label} (${counts[v.value] ?? 0})` }))}
              value={view}
              onChange={setView}
            />
            <div className="relative w-full sm:ml-auto sm:w-64">
              <Icon
                icon={Search}
                tone="faint"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
              />
              <Input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name or number..."
                aria-label="Search chats"
                className="pl-9!"
              />
            </div>
          </div>

          {windows.isLoading ? (
            <Skeleton className="h-80" />
          ) : shown.length === 0 ? (
            <EmptyState
              icon={Hourglass}
              title={view === "soon" ? "No chat is about to close" : "No chats here"}
              description={
                view === "soon"
                  ? "Chats whose window closes within 2 hours show up here, and the bell tells you."
                  : "Chats show here for 24 hours after the guest's last message, and for a day after the window closes."
              }
            />
          ) : (
            <>
              <div className="hidden lg:block">
                <DataTable
                  columns={columns}
                  rows={shown}
                  rowKey={(row) => row._id}
                  onRowClick={openChat}
                  emptyMessage="No chats"
                />
              </div>
              <ul className="space-y-3 lg:hidden">
                {shown.map((row) => (
                  <li
                    key={row._id}
                    className="rounded-xl border border-app-border! bg-app-surface p-4"
                  >
                    <div className="flex items-start gap-3">
                      <ContactAvatar name={row.name} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium capitalize text-app-text">
                          {row.name || "Unknown guest"}
                        </p>
                        <p className="text-xs tabular-nums text-app-text-muted">{row.phone}</p>
                      </div>
                      {windowBadge(row)}
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-app-text-muted">
                      {row.lastMessage?.sender === "me" && (
                        <span className="font-medium text-app-text">You: </span>
                      )}
                      {row.lastMessage?.text || "—"}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-app-text-muted">
                      {row.status && (
                        <Badge tone={getStageTone(row.status)}>{stageLabel(row.status)}</Badge>
                      )}
                      <span>{row.assignee || "No one assigned"}</span>
                      <span>· Guest wrote {timeAgo(row.openedAt)}</span>
                    </div>
                    <div className="mt-3">{action(row)}</div>
                  </li>
                ))}
              </ul>
            </>
          )}
          <div className="h-14" aria-hidden="true" />
        </>
      )}
    </PageShell>
  );
};

export default ReplyWindows;
