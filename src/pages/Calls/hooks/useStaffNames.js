import { useMemo } from "react";
import { normalizePhoneWithSameFormat } from "../../../utils/normalizePhoneNumber";

// Team members by phone number, to show a name instead of their number.
// Returns staffName(number) -> the name, or the number, or "".
export const useStaffNames = (users) =>
  useMemo(() => {
    const names = new Map(
      users.map((user) => [
        normalizePhoneWithSameFormat(user.phone),
        user.userName,
      ]),
    );
    return (number) =>
      names.get(normalizePhoneWithSameFormat(number)) || number || "";
  }, [users]);
