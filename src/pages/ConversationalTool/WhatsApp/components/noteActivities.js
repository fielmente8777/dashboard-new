import {
  Mail,
  MessageCircle,
  MessageSquareText,
  NotebookPen,
  Phone,
  StickyNote,
} from "lucide-react";

// The kinds of note the team can log, with their icon and colours.
// `tone` colours the icon chip; `dot` the icon on the timeline.
export const NOTE_ACTIVITIES = [
  {
    value: "phone_call",
    label: "Phone call",
    icon: Phone,
    tone: "bg-sky-500/10 text-sky-600 dark:text-sky-300",
  },
  {
    value: "message",
    label: "Message",
    icon: MessageSquareText,
    tone: "bg-violet-500/10 text-violet-600 dark:text-violet-300",
  },
  {
    value: "note",
    label: "Note",
    icon: StickyNote,
    tone: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
  },
  {
    value: "email",
    label: "Email",
    icon: Mail,
    tone: "bg-rose-500/10 text-rose-600 dark:text-rose-300",
  },
  {
    value: "whatsapp",
    label: "WhatsApp",
    icon: MessageCircle,
    tone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
  },
];

const OTHER = {
  label: "Other",
  icon: NotebookPen,
  tone: "bg-gray-500/10 text-gray-600 dark:text-gray-300",
};

// "phone_call" -> its entry; an unknown kind gets a readable label
export const getNoteActivity = (value = "") =>
  NOTE_ACTIVITIES.find((activity) => activity.value === value) || {
    ...OTHER,
    value,
    label: value
      ? value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      : OTHER.label,
  };
