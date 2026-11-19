import { Search, ShieldCheck, UserPlus, Users, UserRound } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { Input } from "../../components/ui/Field";
import Icon from "../../components/ui/Icon";
import Segmented from "../../components/ui/Segmented";
import StatCard from "../../components/ui/StatCard";
import { ErrorState } from "../../components/ui/States";
import TeamTable from "./components/TeamTable";
import { useTeamMembers } from "./hooks/useTeamMembers";
import UserFormDialog from "./UserFormDialog";

const SCOPES = [
  { value: "location", label: "This location" },
  { value: "all", label: "All locations" },
];

const Usermanagement = () => {
  const authUser = useSelector((state) => state.userProfile.authUser);
  const canManage = Boolean(authUser?.isAdmin);
  const team = useTeamMembers();

  // null = closed, {} = add, { user } = edit
  const [dialog, setDialog] = useState(null);

  const addButton = (
    <Button icon={UserPlus} onClick={() => setDialog({})}>
      Add member
    </Button>
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Team size" value={team.stats.total} icon={Users} />
        <StatCard label="Admins" value={team.stats.admins} icon={ShieldCheck} />
        <StatCard label="Members" value={team.stats.members} icon={UserRound} />
      </div>

      <Card
        title="Team members"
        description="People who can sign in to this dashboard and what they can use at each location."
        actions={canManage && addButton}
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Icon
              icon={Search}
              tone="faint"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
            />
            <Input
              type="search"
              placeholder="Search name, email or phone"
              aria-label="Search team members"
              className="pl-9"
              value={team.search}
              onChange={(e) => team.setSearch(e.target.value)}
            />
          </div>
          <Segmented
            label="Show members of"
            options={SCOPES}
            value={team.scope}
            onChange={team.setScope}
          />
        </div>

        {team.users.isError ? (
          <ErrorState
            message="Could not load the team members."
            onRetry={team.users.refetch}
          />
        ) : (
          <TeamTable
            members={team.members}
            hid={team.hid}
            loading={team.users.isLoading}
            canManage={canManage}
            hasFilter={Boolean(team.search.trim())}
            onAdd={addButton}
            onEdit={(user) => setDialog({ user })}
            onRemove={team.removeUser}
          />
        )}
      </Card>

      <UserFormDialog
        open={Boolean(dialog)}
        user={dialog?.user}
        accessScope={authUser?.accessScope}
        onClose={() => setDialog(null)}
      />
    </div>
  );
};

export default Usermanagement;
