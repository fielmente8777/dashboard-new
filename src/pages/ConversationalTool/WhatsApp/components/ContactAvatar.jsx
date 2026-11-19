import { User } from "lucide-react";
import Icon from "../../../../components/ui/Icon";
import { getAvatarColor } from "../chatUtils";

const SIZES = {
  md: { box: "size-10 text-sm", icon: "lg" },
  lg: { box: "size-16 text-xl", icon: "2xl" },
};

// The guest's initial, or a person icon when there is no real name (no name,
// or the "name" is just the phone number).
const ContactAvatar = ({ name, size = "md", className = "" }) => {
  const initial = String(name || "").trim().charAt(0);
  const hasLetter = /\p{L}/u.test(initial);
  const { box, icon } = SIZES[size] || SIZES.md;

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${box} ${getAvatarColor(hasLetter ? name : "")} ${className}`}
    >
      {hasLetter ? initial.toUpperCase() : <Icon icon={User} size={icon} />}
    </span>
  );
};

export default ContactAvatar;
