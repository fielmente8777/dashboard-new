import { Pencil } from "lucide-react";
import {
  STATUS_TONES,
  capitalize,
  formatCredits,
  pricingTypeLabel,
} from "../../../components/AiCredits/aiCredits";
import Badge from "../../../components/ui/Badge";
import Card from "../../../components/ui/Card";
import DataTable from "../../../components/ui/DataTable";
import IconButton from "../../../components/ui/IconButton";

// What each AI service costs in credits; onEdit(service) opens the editor.
const PricingTable = ({ pricing, onEdit }) => {
  const columns = [
    { key: "name", header: "Service Name", className: "whitespace-nowrap font-medium" },
    {
      key: "creditsPerUsage",
      header: "Credits Per Usage",
      className: "tabular-nums",
      render: (row) => `${formatCredits(row.creditsPerUsage)} credits`,
    },
    { key: "pricingType", header: "Pricing Type", render: (row) => pricingTypeLabel(row.pricingType) },
    {
      key: "status",
      header: "Status",
      render: (row) => <Badge tone={STATUS_TONES[row.status]}>{capitalize(row.status)}</Badge>,
    },
    {
      key: "edit",
      header: <span className="sr-only">Edit</span>,
      className: "text-right",
      render: (row) => <IconButton icon={Pencil} label={`Edit ${row.name} pricing`} onClick={() => onEdit(row)} />,
    },
  ];

  return (
    <Card title="AI pricing" description="Credits charged each time a tenant uses an AI service">
      <DataTable columns={columns} rows={pricing} rowKey={(row) => row.id} emptyMessage="No AI services yet" />
    </Card>
  );
};

export default PricingTable;
