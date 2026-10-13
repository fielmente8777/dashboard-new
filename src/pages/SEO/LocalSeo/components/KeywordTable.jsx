import { Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import Badge from "../../../../components/ui/Badge";
import Button from "../../../../components/ui/Button";
import Card from "../../../../components/ui/Card";
import DataTable from "../../../../components/ui/DataTable";
import { Input } from "../../../../components/ui/Field";
import Icon from "../../../../components/ui/Icon";
import IconButton from "../../../../components/ui/IconButton";
import { EmptyState } from "../../../../components/ui/States";
import { actionFor, fmt, fmtCurrency, rankBand } from "../localSeoUtils";
import DifficultyBar from "../../../../components/Seo/DifficultyBar";
import RankBadge from "../../../../components/Seo/RankBadge";

// stop a click on a row's buttons from also opening the row
const stop = (handler) => (e) => {
  e.stopPropagation();
  handler();
};

const KeywordTable = ({
  keywords,
  city,
  refreshCost,
  refreshingKeyword,
  onAdd,
  onOpen,
  onRefresh,
  onUntrack,
}) => {
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    // keywords tracked for a specific URL belong to Website SEO
    const local = keywords.filter((k) => !k.targetUrl);
    return term ? local.filter((k) => k.keyword.toLowerCase().includes(term)) : local;
  }, [keywords, search]);

  const columns = [
    {
      key: "keyword",
      header: "Keyword",
      render: (row) => (
        <span className="block max-w-64 truncate font-medium" title={row.keyword}>
          {row.keyword}
        </span>
      ),
    },
    {
      key: "liveGmbRank",
      header: "Maps rank",
      render: (row) => <RankBadge rank={row.liveGmbRank} tone={rankBand(row.liveGmbRank).tone} />,
    },
    {
      key: "searchVolume",
      header: "Monthly searches",
      className: "text-right tabular-nums",
      render: (row) => fmt(row.searchVolume),
    },
    {
      key: "cpc",
      header: "CPC",
      className: "text-right tabular-nums",
      render: (row) => (
        <span className="text-app-text-muted">{fmtCurrency(row.cpc)}</span>
      ),
    },
    {
      key: "keywordDifficulty",
      header: "Difficulty",
      render: (row) => <DifficultyBar value={row.keywordDifficulty} />,
    },
    {
      key: "actionBadge",
      header: "Next step",
      render: (row) => {
        const action = actionFor(row.actionBadge);
        return (
          <Badge tone={action.tone} className="gap-1">
            <Icon icon={action.icon} size="xs" /> {action.label}
          </Badge>
        );
      },
    },
    {
      key: "actions",
      header: "",
      className: "w-px text-right",
      render: (row) => (
        <div className="flex justify-end gap-0.5">
          <IconButton
            icon={RefreshCw}
            label={`Refresh rank (${refreshCost} credits)`}
            disabled={refreshingKeyword === row.keyword}
            className={refreshingKeyword === row.keyword ? "[&>svg]:animate-spin" : ""}
            onClick={stop(() => onRefresh(row.keyword))}
          />
          <IconButton
            icon={Trash2}
            label="Stop tracking"
            tone="danger"
            onClick={stop(() => onUntrack(row.keyword))}
          />
        </div>
      ),
    },
  ];

  const total = keywords.filter((k) => !k.targetUrl).length;

  return (
    <Card
      title="Tracked keywords"
      description={
        city
          ? `Search volume is for ${city} only. Click a keyword for its rank history.`
          : "Click a keyword for its rank history."
      }
      actions={
        total > 0 && (
          <div className="relative w-full sm:w-60">
            <Icon
              icon={Search}
              tone="faint"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search keywords"
              className="pl-9"
            />
          </div>
        )
      }
    >
      {total === 0 ? (
        <EmptyState
          icon={Search}
          title="No keywords tracked yet"
          description="Add the local searches this property should win, like “hotel near the airport”."
          action={
            <Button icon={Plus} onClick={onAdd}>
              Add keywords
            </Button>
          }
        />
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(row) => row._id || row.keyword}
          onRowClick={onOpen}
          emptyMessage="No keyword matches your search"
        />
      )}
    </Card>
  );
};

export default KeywordTable;
