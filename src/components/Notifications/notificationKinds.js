import { Bell, ConciergeBell, MessageCircle, Users } from "lucide-react";

// How each kind of notification is drawn. Unknown kinds use `general`.
export const NOTIFICATION_KINDS = {
  visitor: {
    icon: MessageCircle,
    tile: "bg-violet-500/12 text-violet-600 dark:text-violet-400",
  },
  lead: {
    icon: Users,
    tile: "bg-blue-500/12 text-blue-600 dark:text-blue-400",
  },
  request: {
    icon: ConciergeBell,
    tile: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  },
  general: {
    icon: Bell,
    tile: "bg-app-surface-secondary text-app-text-muted",
  },
};

export const getNotificationKind = (kind) =>
  NOTIFICATION_KINDS[kind] || NOTIFICATION_KINDS.general;
