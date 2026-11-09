import { Construction } from "lucide-react";
import Icon from "../ui/Icon";

// Top of the AI credit pages while they run on demo data. `message` says
// what is demo on the page; `children` adds controls on the right (e.g. a
// state preview).
const InProgressNotice = ({
  message = "It shows demo data, and changes are not saved or charged yet.",
  children,
}) => (
  <div className="flex flex-wrap items-center gap-3 rounded-xl border border-amber-500/30! bg-amber-500/5 px-4 py-3 text-sm">
    <Icon icon={Construction} className="text-amber-600 dark:text-amber-400" />
    <p className="min-w-0 flex-1 text-app-text">
      <span className="font-semibold">This page is in progress.</span>{" "}
      <span className="text-app-text-muted">{message}</span>
    </p>
    {children}
  </div>
);

export default InProgressNotice;
