import { useState } from "react";
import { useSelector } from "react-redux";
import { getUserNdid } from "../../redux/slice/UserSlice";
import Button from "../ui/Button";
import SupportDialog from "./SupportDialog";

// Opens the "contact Eazotel support" dialog (help, or paying another way than online).
// Renewing and upgrading online happen on the plans page (plansPath()).
export default function ContactSupportButton({ action = "upgrade", children, ...buttonProps }) {
  const [open, setOpen] = useState(false);
  const user = useSelector((state) => state.userProfile.user);
  return (
    <>
      <Button {...buttonProps} onClick={() => setOpen(true)}>
        {children}
      </Button>
      <SupportDialog
        action={open ? action : null}
        hotelName={user?.Profile?.hotelName}
        accountId={getUserNdid(user)}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
