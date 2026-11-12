import Badge from "../ui/Badge";
import {
  STATUS_TONES,
  TRANSACTION_TYPES,
  capitalize,
  formatCredits,
  formatDateTime,
  formatTokens,
  providerLabel,
  serviceLabel,
} from "./aiCredits";

// Table columns shared by the tenant's AI Wallet and the admin tenant drawer.

export const usageColumns = [
  { key: "date", header: "Date", render: (row) => formatDateTime(row.date), className: "whitespace-nowrap" },
  { key: "service", header: "AI Service", render: (row) => serviceLabel(row.service), className: "whitespace-nowrap font-medium" },
  {
    key: "model",
    header: "Provider / Model",
    render: (row) => (
      <span className="whitespace-nowrap">
        {providerLabel(row.provider)} <span className="text-app-text-muted">· {row.model}</span>
      </span>
    ),
  },
  {
    key: "tokens",
    header: "Tokens",
    className: "text-right tabular-nums",
    render: (row) => (
      <span title={`${row.inputTokens} in / ${row.outputTokens} out${row.usageSource === "estimated" ? " (estimated)" : ""}`}>
        {formatTokens(row.totalTokens)}
        {row.usageSource === "estimated" && <span className="text-app-text-faint">*</span>}
      </span>
    ),
  },
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

export const transactionColumns = [
  { key: "date", header: "Date", render: (row) => formatDateTime(row.date), className: "whitespace-nowrap" },
  {
    key: "type",
    header: "Type",
    render: (row) => <Badge tone={TRANSACTION_TYPES[row.type]?.tone}>{TRANSACTION_TYPES[row.type]?.label ?? row.type}</Badge>,
  },
  {
    key: "description",
    header: "Description",
    className: "text-app-text-muted!",
    render: (row) => (row.type === "usage" && row.service ? `${row.description} · ${serviceLabel(row.service)}` : row.description),
  },
  {
    key: "credits",
    header: "Credits",
    render: (row) => (
      <span className={row.credits >= 0 ? "text-emerald-600 dark:text-emerald-400" : ""}>
        {row.credits >= 0 ? "+" : "−"}
        {formatCredits(Math.abs(row.credits))}
      </span>
    ),
    className: "text-right tabular-nums font-medium",
  },
  {
    key: "balanceAfter",
    header: "Balance After",
    render: (row) => formatCredits(row.balanceAfter),
    className: "text-right tabular-nums",
  },
  { key: "id", header: "Reference", className: "whitespace-nowrap font-mono text-xs! text-app-text-faint!" },
];
