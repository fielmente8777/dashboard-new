import { useState } from "react";
import { transactionColumns } from "../../../components/AiCredits/columns";
import Card from "../../../components/ui/Card";
import DataTable from "../../../components/ui/DataTable";
import { ErrorState } from "../../../components/ui/States";
import TablePagination from "../../../components/ui/TablePagination";
import Tabs from "../../../components/ui/Tabs";
import { getApiErrorMessage } from "../../../redux/api/baseApi";
import { useGetAiTransactionsQuery } from "../../../redux/api/aiCreditsApi";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "purchase", label: "Purchases" },
  { value: "usage", label: "Usage" },
  { value: "adjustment", label: "Adjustments" },
];


// Every change to the AI wallet balance: recharges, usage and adjustments.
const TransactionHistory = () => {
  const [type, setType] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data, isLoading, isFetching, error, refetch } = useGetAiTransactionsQuery({ type, page, limit });

  return (
    <Card title="Transaction history" description="Recharges, usage and adjustments to your wallet">
      <div className="space-y-3">
        <div className="-mx-1 overflow-x-auto px-1">
          <Tabs
            tabs={FILTERS}
            value={type}
            onChange={(value) => {
              setType(value);
              setPage(1);
            }}
            className="flex-nowrap"
          />
        </div>
        {error ? (
          <ErrorState message={getApiErrorMessage(error, "Couldn't load transactions.")} onRetry={refetch} />
        ) : (
          <>
            <DataTable
              columns={transactionColumns}
              rows={data?.items ?? []}
              rowKey={(row) => row.id}
              loading={isLoading || isFetching}
              emptyMessage={type === "all" ? "No transactions yet" : "No transactions of this type"}
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
              itemLabel="transactions"
            />
          </>
        )}
      </div>
    </Card>
  );
};

export default TransactionHistory;
