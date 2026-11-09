import { useMemo, useState } from "react";
import {
  STATUS_TONES,
  capitalize,
  formatCredits,
  formatDate,
} from "../../../components/AiCredits/aiCredits";
import { usePagedRows } from "../../../components/AiCredits/usePagedRows";
import Badge from "../../../components/ui/Badge";
import Card from "../../../components/ui/Card";
import DataTable from "../../../components/ui/DataTable";
import SelectMenu from "../../../components/ui/SelectMenu";
import TablePagination from "../../../components/ui/TablePagination";

const columns = [
  { key: "date", header: "Date", render: (row) => formatDate(row.date), className: "whitespace-nowrap" },
  { key: "service", header: "AI Service", className: "whitespace-nowrap font-medium" },
  { key: "description", header: "Description", className: "text-app-text-muted!" },
  {
    key: "creditsUsed",
    header: "Credits Used",
    render: (row) => formatCredits(row.creditsUsed),
    className: "text-right tabular-nums",
  },
  {
    key: "status",
    header: "Status",
    render: (row) => <Badge tone={STATUS_TONES[row.status]}>{capitalize(row.status)}</Badge>,
  },
];

const UsageBreakdown = ({ usage }) => {
  const [service, setService] = useState("all");

  const services = useMemo(
    () => [
      { value: "all", label: "All services" },
      ...[...new Set(usage.map((row) => row.service))].map((name) => ({ value: name, label: name })),
    ],
    [usage],
  );
  const rows = useMemo(
    () => (service === "all" ? usage : usage.filter((row) => row.service === service)),
    [usage, service],
  );
  const { pageRows, pagination } = usePagedRows(rows);

  return (
    <Card
      title="AI usage breakdown"
      description="Every AI action that used credits"
      actions={
        <SelectMenu
          label="Filter by service"
          options={services}
          value={service}
          onChange={setService}
          className="w-52"
        />
      }
    >
      <div className="space-y-3">
        <DataTable
          columns={columns}
          rows={pageRows}
          rowKey={(row) => row.id}
          emptyMessage="No AI usage yet"
        />
        <TablePagination {...pagination} itemLabel="entries" />
      </div>
    </Card>
  );
};

export default UsageBreakdown;
