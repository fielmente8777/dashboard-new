import { BarChart3 } from "lucide-react";
import Card from "../../../components/ui/Card";
import Icon from "../../../components/ui/Icon";
import { Skeleton } from "../../../components/ui/States";

// A Card that shows a skeleton while its report loads and a quiet message
// when the report is empty, so the grid keeps its shape either way.
const ReportCard = ({
  loading,
  empty,
  emptyText = "No data for this period.",
  minHeight = "min-h-64",
  className = "",
  children,
  ...cardProps
}) => (
  <Card className={`flex flex-col ${className}`} {...cardProps}>
    {loading ? (
      <Skeleton className={`flex-1 ${minHeight}`} />
    ) : empty ? (
      <div
        className={`flex flex-1 flex-col items-center justify-center gap-2 text-center ${minHeight}`}
      >
        <Icon icon={BarChart3} size="2xl" tone="faint" />
        <p className="text-sm text-app-text-muted">{emptyText}</p>
      </div>
    ) : (
      children
    )}
  </Card>
);

export default ReportCard;
