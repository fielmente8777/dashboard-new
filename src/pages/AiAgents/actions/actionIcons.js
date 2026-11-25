import { BedDouble, Bell, CreditCard, LifeBuoy, MessageSquare, Settings2, UserRoundPlus, Zap } from "lucide-react";

// One icon per action category (notify_team gets a bell)
export const CATEGORY_ICONS = {
  booking: BedDouble,
  leads: UserRoundPlus,
  messaging: MessageSquare,
  payments: CreditCard,
  support: LifeBuoy,
  operations: Settings2,
  other: Zap,
};
export const iconFor = (action) => (action?.key === "notify_team" ? Bell : CATEGORY_ICONS[action?.draft?.category] || Zap);
