import { useState } from "react";
import { SERVICE_LABELS } from "../../../components/AiCredits/aiCredits";
import { usageColumns } from "../../../components/AiCredits/columns";
import Card from "../../../components/ui/Card";
import DataTable from "../../../components/ui/DataTable";
import SelectMenu from "../../../components/ui/SelectMenu";
import { ErrorState } from "../../../components/ui/States";
import TablePagination from "../../../components/ui/TablePagination";
import { getApiErrorMessage } from "../../../redux/api/baseApi";
import { useGetAiUsageQuery } from "../../../redux/api/aiCreditsApi";

const SERVICES = [
  { value: "all", label: "All services" },
  ...Object.entries(SERVICE_LABELS).map(([value, label]) => ({ value, label })),
];


// Every AI operation that used credits, newest first.
const UsageBreakdown = () => {
  const [service, setService] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data, isLoading, isFetching, error, refetch } = useGetAiUsageQuery({ service, page, limit });

  return (
    <Card
      title="AI usage breakdown"
      description="Each AI request: the provider and model it used, its tokens and its credits"
      actions={
        <SelectMenu
          label="Filter by service"
          options={SERVICES}
          value={service}
          onChange={(value) => {
            setService(value);
            setPage(1);
          }}
          className="w-52"
        />
      }
    >
      {error ? (
        <ErrorState message={getApiErrorMessage(error, "Couldn't load AI usage.")} onRetry={refetch} />
      ) : (
        <div className="space-y-3">
          <DataTable
            columns={usageColumns}
            rows={data?.items ?? []}
            rowKey={(row) => row.id}
            loading={isLoading || isFetching}
            emptyMessage="No AI usage yet"
          />
          <TablePagination
            page={page}
            limit={limit}
            total={data?.pagination?.total ?? 0}
            totalPages={data?.pagination?.totalPages}
            onPageChange={setPage}
            onLimitChange={(value) => {
              setLimit(value);
              setPage(1);
            }}
            itemLabel="entries"
          />
          <p className="text-xs text-app-text-faint">
            Each request is rounded up to a whole credit. * Estimated: the provider did not report token usage.
          </p>
        </div>
      )}
    </Card>
  );
};

export default UsageBreakdown;
