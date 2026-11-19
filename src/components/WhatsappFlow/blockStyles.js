import {
  CircleHelp,
  GalleryHorizontalEnd,
  ListChecks,
  MessageSquareText,
  MousePointerClick,
  Workflow,
} from "lucide-react";

// How each block type looks everywhere in the chatbot builder: the palette,
// the node on the canvas, the "add a block" menu, the settings drawer and the
// minimap. `tile` colours the icon square, `minimap` the dot in the minimap.
export const BLOCK_STYLES = {
  sendMessage: {
    label: "Send message",
    description: "Text, images, video, audio or a document",
    icon: MessageSquareText,
    tile: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    minimap: "#10b981",
  },
  button: {
    label: "Buttons",
    description: "Up to 3 quick reply buttons",
    icon: MousePointerClick,
    tile: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
    minimap: "#f97316",
  },
  list: {
    label: "List",
    description: "A menu of options in sections",
    icon: ListChecks,
    tile: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
    minimap: "#8b5cf6",
  },
  question: {
    label: "Question",
    description: "Ask and save the answer in a variable",
    icon: CircleHelp,
    tile: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    minimap: "#f59e0b",
  },
  flow: {
    label: "Flow",
    description: "Open one of your WhatsApp forms",
    icon: Workflow,
    tile: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
    minimap: "#0ea5e9",
  },
  carousel: {
    label: "Carousel",
    description: "Swipeable cards with images",
    icon: GalleryHorizontalEnd,
    tile: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    minimap: "#3b82f6",
  },
};

// "12 / 60" under a settings field
export const charHint = (value, max) => `${(value || "").length} / ${max}`;

export const blockStyle = (type) =>
  BLOCK_STYLES[type] ?? {
    label: type,
    description: "",
    icon: MessageSquareText,
    tile: "bg-gray-500/15 text-app-text-muted",
    minimap: "#94a3b8",
  };
