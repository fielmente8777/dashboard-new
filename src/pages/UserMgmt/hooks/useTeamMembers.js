import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useConfirm } from "../../../context/ConfirmContext";
import { useApiAction } from "../../../hooks/useApiAction";
import {
  useDeleteUserMutation,
  useGetTeamUsersQuery,
} from "../../../redux/api/usersApi";
import { selectHid } from "../../../redux/slice/UserSlice";
import { matchesSearch, worksAt } from "../teamUtils";

// The team list with its search / scope filters and the delete action.
// scope: "location" = admins + people assigned to the current location,
//        "all"      = everyone on the account
export const useTeamMembers = () => {
  const run = useApiAction();
  const { confirm } = useConfirm();
  const hid = useSelector(selectHid);
  const users = useGetTeamUsersQuery();
  const [deleteUser] = useDeleteUserMutation();

  const [search, setSearch] = useState("");
  const [scope, setScope] = useState("location");

  const inScope = useMemo(() => {
    const all = users.data || [];
    return scope === "all"
      ? all
      : all.filter((user) => user?.isAdmin || worksAt(user, hid));
  }, [users.data, scope, hid]);

  const members = useMemo(
    () =>
      inScope
        .filter((user) => matchesSearch(user, search))
        // admins first, then by name
        .sort(
          (a, b) =>
            Number(Boolean(b.isAdmin)) - Number(Boolean(a.isAdmin)) ||
            String(a.displayName || "").localeCompare(String(b.displayName || "")),
        ),
    [inScope, search],
  );

  const stats = useMemo(() => {
    const admins = inScope.filter((user) => user?.isAdmin).length;
    return { total: inScope.length, admins, members: inScope.length - admins };
  }, [inScope]);

  const removeUser = async (user) => {
    const confirmed = await confirm(
      `Remove ${user.displayName || user.emailId} from the team? They will no longer be able to sign in. This cannot be undone.`,
      { title: "Remove team member", confirmText: "Remove" },
    );
    if (!confirmed) return;

    await run(deleteUser(user.emailId), {
      success: "Team member removed",
      error: "Could not remove the team member.",
    });
  };

  return {
    hid,
    users,
    members,
    stats,
    search,
    setSearch,
    scope,
    setScope,
    removeUser,
  };
};
