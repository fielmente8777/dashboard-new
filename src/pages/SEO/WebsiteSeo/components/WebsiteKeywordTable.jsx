import { Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import DifficultyBar from "../../../../components/Seo/DifficultyBar";
import RankBadge from "../../../../components/Seo/RankBadge";
import { fmt, fmtCurrency } from "../../../../components/Seo/seoUtils";
import Button from "../../../../components/ui/Button";
import Card from "../../../../components/ui/Card";
import DataTable from "../../../../components/ui/DataTable";
import { Input } from "../../../../components/ui/Field";
import Icon from "../../../../components/ui/Icon";
import IconButton from "../../../../components/ui/IconButton";
import { EmptyState } from "../../../../components/ui/States";
import { organicBand } from "../websiteSeoUtils";

// best position first, unranked last
const byRank = (a, b) => (a.liveOrganicRank ?? Infinity) - (b.liveOrganicRank ?? Infinity);

const WebsiteKeywordTable = ({
  keywords,
  refreshCost,
  refreshingKeyword,
  onAdd,
  onRefresh,
  onUntrack,
}) => {
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = term ? keywords.filter((k) => k.keyword.toLowerCase().includes(term)) : keywords;
    return [...list].sort(byRank);
  }, [keywords, search]);

  const columns = [
    {
      key: "keyword",
      header: "Keyword",
      render: (row) => (
        <span className="block max-w-72 truncate font-medium" title={row.keyword}>
          {row.keyword}
        </span>
      ),
    },
    {
      key: "liveOrganicRank",
      header: "Google position",
      render: (row) => (
        <RankBadge
          rank={row.liveOrganicRank}
          tone={organicBand(row.liveOrganicRank).tone}
          icon={Search}
        />
      ),
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
      render: (row) => <span className="text-app-text-muted">{fmtCurrency(row.cpc)}</span>,
    },
    {
      key: "keywordDifficulty",
      header: "Difficulty",
      render: (row) => <DifficultyBar value={row.keywordDifficulty} />,
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
            onClick={() => onRefresh(row.keyword)}
          />
          <IconButton
            icon={Trash2}
            label="Stop tracking"
            tone="danger"
            onClick={() => onUntrack(row.keyword)}
          />
        </div>
      ),
    },
  ];

  return (
    <Card
      title="Tracked keywords"
      description="Best position first"
      actions={
        keywords.length > 0 && (
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
      {keywords.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No keywords tracked yet"
          description="Add the searches you want your website to show up for, like “boutique hotel in Jaipur”."
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
          emptyMessage="No keyword matches your search"
        />
      )}
    </Card>
  );
};

export default WebsiteKeywordTable;
