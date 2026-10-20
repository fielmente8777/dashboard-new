import { Pencil, Trash2, Users } from "lucide-react";
import { useSelector } from "react-redux";
import Badge from "../../../components/ui/Badge";
import DataTable from "../../../components/ui/DataTable";
import IconButton from "../../../components/ui/IconButton";
import { EmptyState } from "../../../components/ui/States";
import {
  accessCount,
  formatAddedDate,
  initials,
  userLocations,
} from "../teamUtils";

const MAX_LOCATIONS = 2;

const MemberCell = ({ user, isYou }) => (
  <div className="flex min-w-0 items-center gap-3">
    <span
      className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
        user.isAdmin
          ? "bg-primary text-white dark:bg-blue-600"
          : "bg-app-surface-secondary text-app-text-muted"
      }`}
    >
      {initials(user)}
    </span>
    <div className="min-w-0">
      <p className="flex items-center gap-1.5 truncate font-medium capitalize text-app-text">
        {user.displayName || "—"}
        {isYou && <Badge tone="sky">You</Badge>}
      </p>
      <p className="truncate text-xs text-app-text-muted">{user.emailId}</p>
    </div>
  </div>
);

const LocationsCell = ({ user, hid, hotels }) => {
  if (user.isAdmin) return <span className="text-app-text-muted">All locations</span>;

  const locations = userLocations(user);
  if (locations.length === 0) return <span className="text-app-text-faint">None</span>;

  const shown = locations.slice(0, MAX_LOCATIONS);
  const hidden = locations.slice(MAX_LOCATIONS);

  return (
    <div className="flex flex-wrap items-center gap-1">
      {shown.map((location) => (
        <Badge
          key={location.hid}
          tone={String(location.hid) === String(hid) ? "blue" : "gray"}
        >
          {location.disPlayLocation || hotels?.[location.hid]?.city || location.hid}
        </Badge>
      ))}
      {hidden.length > 0 && (
        <span
          className="text-xs text-app-text-muted"
          title={hidden
            .map((l) => l.disPlayLocation || hotels?.[l.hid]?.city || l.hid)
            .join(", ")}
        >
          +{hidden.length} more
        </span>
      )}
    </div>
  );
};

// canManage - the signed-in user is an admin and may edit / remove members
const TeamTable = ({
  members,
  hid,
  loading,
  canManage,
  hasFilter,
  onAdd,
  onEdit,
  onRemove,
}) => {
  const hotels = useSelector((state) => state.userProfile.user?.Profile?.hotels);
  const myEmail = useSelector((state) => state.userProfile.authUser?.emailId);

  if (!loading && members.length === 0) {
    return hasFilter ? (
      <EmptyState
        icon={Users}
        title="No team members match"
        description="Try a different name, email or phone number."
      />
    ) : (
      <EmptyState
        icon={Users}
        title="No team members yet"
        description="Invite people to work on your property and choose what each of them can use."
        action={canManage && onAdd}
      />
    );
  }

  const columns = [
    {
      key: "member",
      header: "Member",
      render: (user) => (
        <MemberCell user={user} isYou={myEmail && user.emailId === myEmail} />
      ),
    },
    {
      key: "phone",
      header: "Phone",
      className: "whitespace-nowrap tabular-nums",
      render: (user) => user.phone || "—",
    },
    {
      key: "role",
      header: "Role",
      render: (user) =>
        // "owner" is the account holder; team members are created with
        // role "admin" too, so isAdmin is what tells an admin apart
        user.role === "owner" ? (
          <Badge tone="amber">Owner</Badge>
        ) : user.isAdmin ? (
          <Badge tone="purple">Admin</Badge>
        ) : (
          <Badge>Member</Badge>
        ),
    },
    {
      key: "locations",
      header: "Locations",
      render: (user) => <LocationsCell user={user} hid={hid} hotels={hotels} />,
    },
    {
      key: "access",
      header: "Access here",
      className: "whitespace-nowrap",
      render: (user) => {
        if (user.isAdmin) return <span className="text-app-text-muted">Full access</span>;
        const count = accessCount(user, hid);
        return count ? (
          `${count} ${count === 1 ? "area" : "areas"}`
        ) : (
          <span className="text-app-text-faint">No access</span>
        );
      },
    },
    {
      key: "createdAt",
      header: "Added",
      className: "whitespace-nowrap text-app-text-muted",
      render: (user) => formatAddedDate(user.createdAt),
    },
  ];

  if (canManage) {
    columns.push({
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      className: "w-px",
      render: (user) =>
        user.isAdmin ? null : (
          <div className="flex justify-end gap-1">
            <IconButton icon={Pencil} label="Edit member" onClick={() => onEdit(user)} />
            <IconButton
              icon={Trash2}
              label="Remove member"
              tone="danger"
              onClick={() => onRemove(user)}
            />
          </div>
        ),
    });
  }

  return (
    <DataTable
      columns={columns}
      rows={members}
      rowKey={(user) => user.emailId}
      loading={loading}
    />
  );
};

export default TeamTable;
