import { useState } from "react";
import ContactAvatar from "../../WhatsApp/components/ContactAvatar";
import { getDisplayName } from "../igUtils";

const SIZES = { md: "size-10", lg: "size-16" };

// The guest's Instagram picture; their initial when there is none (Instagram
// picture links expire after a while, so a broken one falls back too).
const IgAvatar = ({ conversation, size = "md", className = "" }) => {
  const [broken, setBroken] = useState(false);
  const name = conversation?.name || conversation?.username || "";

  if (conversation?.profile_pic && !broken) {
    return (
      <img
        src={conversation.profile_pic}
        alt={getDisplayName(conversation)}
        onError={() => setBroken(true)}
        className={`shrink-0 rounded-full object-cover ${SIZES[size] || SIZES.md} ${className}`}
      />
    );
  }

  return <ContactAvatar name={name} size={size} className={className} />;
};

export default IgAvatar;
