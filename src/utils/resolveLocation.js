// Hotel ids the signed-in user may open: every hotel for admins,
// only the assigned ones for team members.
export const getAllowedHids = (hotels, authUser) => {
  if (authUser?.isAdmin) return Object.keys(hotels ?? {});
  return (authUser?.assigned_location ?? [])
    .map((location) => location?.hid)
    .filter(Boolean)
    .map(String);
};

// Which hotel to open once the profile has loaded: the one selected last time
// if the user can still open it, otherwise the default one.
export const resolveHid = ({ hotels, authUser, storedHid }) => {
  const allowed = getAllowedHids(hotels, authUser);
  if (storedHid != null && allowed.includes(String(storedHid))) {
    return String(storedHid);
  }
  return (authUser?.isAdmin ? allowed[allowed.length - 1] : allowed[0]) ?? null;
};
