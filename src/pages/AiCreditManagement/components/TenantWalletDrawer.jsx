import { useEffect, useState } from "react";
import {
  STATUS_TONES,
  capitalize,
  creditState,
  formatCredits,
  formatDate,
  formatPrice,
} from "../../../components/AiCredits/aiCredits";
import LowCreditBanner from "../../../components/AiCredits/LowCreditBanner";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import DataTable from "../../../components/ui/DataTable";
import Detail from "../../../components/ui/Detail";
import Drawer from "../../../components/ui/Drawer";
import { Field, Textarea } from "../../../components/ui/Field";
import { ErrorState, Skeleton } from "../../../components/ui/States";
import TablePagination from "../../../components/ui/TablePagination";
import Tabs from "../../../components/ui/Tabs";
import { useToast } from "../../../context/ToastContext";
import { getApiErrorMessage } from "../../../redux/api/baseApi";
import {
  useGetAdminAiTenantQuery,
  useGetAdminAiTenantTransactionsQuery,
  useGetAdminAiTenantUsageQuery,
  useSetAiWalletStatusMutation,
} from "../../../redux/api/aiCreditsApi";
import { transactionColumns, usageColumns } from "../../../components/AiCredits/columns";

const TABS = [
  { value: "wallet", label: "Wallet" },
  { value: "transactions", label: "Transactions" },
  { value: "usage", label: "Usage" },
];

// admins also see what each request cost Eazotel at the provider
const adminUsageColumns = [
  ...usageColumns.slice(0, -1),
  {
    key: "actualCost",
    header: "Provider cost",
    className: "text-right tabular-nums text-app-text-muted!",
    render: (row) => (row.priced === false ? "Unpriced" : formatPrice(row.actualCost, row.costCurrency)),
  },
  usageColumns[usageColumns.length - 1],
];

const PagedTable = ({ query, columns, page, setPage, itemLabel, emptyMessage }) =>
  query.error ? (
    <ErrorState message={getApiErrorMessage(query.error, "Couldn't load this list.")} onRetry={query.refetch} />
  ) : (
    <div className="space-y-3">
      <DataTable
        columns={columns}
        rows={query.data?.items ?? []}
        rowKey={(row) => row.id}
        loading={query.isLoading || query.isFetching}
        emptyMessage={emptyMessage}
      />
      <TablePagination
        page={page}
        limit={10}
        total={query.data?.pagination?.total ?? 0}
        totalPages={query.data?.pagination?.totalPages}
        onPageChange={setPage}
        itemLabel={itemLabel}
      />
    </div>
  );

const StatusControl = ({ tenant }) => {
  const [reason, setReason] = useState("");
  const [setStatus, { isLoading }] = useSetAiWalletStatusMutation();
  const { showToast } = useToast();
  const suspend = tenant.walletStatus !== "suspended";

  const submit = async () => {
    try {
      await setStatus({ tenantId: tenant.tenantId, status: suspend ? "suspended" : "active", reason: reason.trim() }).unwrap();
      setReason("");
      showToast({ type: "success", message: suspend ? "Wallet suspended" : "Wallet reactivated" });
    } catch (err) {
      showToast({ type: "error", message: getApiErrorMessage(err, "Couldn't change the wallet status") });
    }
  };

  return (
    <div className="space-y-3 rounded-xl border border-app-border! bg-app-surface p-4">
      <div>
        <p className="text-sm font-medium text-app-text">{suspend ? "Suspend wallet" : "Reactivate wallet"}</p>
        <p className="text-xs text-app-text-muted">
          {suspend ? "Stops this tenant's AI services and recharges until reactivated." : "Turns AI services and recharges back on."}
        </p>
      </div>
      <Field label="Reason" hint="Kept in the admin audit log">
        <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} />
      </Field>
      <Button variant={suspend ? "danger" : "primary"} size="sm" disabled={!reason.trim() || isLoading} onClick={submit}>
        {isLoading ? "Saving…" : suspend ? "Suspend wallet" : "Reactivate wallet"}
      </Button>
    </div>
  );
};

// One tenant's wallet, its full transaction history and AI usage.
const TenantWalletDrawer = ({ tenantId, tab, onTabChange, thresholds, onClose }) => {
  const [txPage, setTxPage] = useState(1);
  const [usagePage, setUsagePage] = useState(1);
  useEffect(() => {
    setTxPage(1);
    setUsagePage(1);
  }, [tenantId]);

  const tenantQuery = useGetAdminAiTenantQuery(tenantId, { skip: !tenantId });
  const txQuery = useGetAdminAiTenantTransactionsQuery({ tenantId, page: txPage, limit: 10 }, { skip: !tenantId || tab !== "transactions" });
  const usageQuery = useGetAdminAiTenantUsageQuery({ tenantId, page: usagePage, limit: 10 }, { skip: !tenantId || tab !== "usage" });

  if (!tenantId) return null;
  const tenant = tenantQuery.data;

  return (
    <Drawer
      open
      title={tenant?.name ?? "Tenant wallet"}
      description={tenantId}
      header={<Tabs tabs={TABS} value={tab} onChange={onTabChange} className="mt-3" />}
      onClose={onClose}
    >
      {tab === "wallet" &&
        (tenantQuery.isLoading ? (
          <Skeleton className="h-64" />
        ) : tenantQuery.error ? (
          <ErrorState message={getApiErrorMessage(tenantQuery.error, "Couldn't load this wallet.")} onRetry={tenantQuery.refetch} />
        ) : (
          <div className="space-y-4">
            <LowCreditBanner state={creditState(tenant.availableCredits, thresholds)} balance={tenant.availableCredits} />
            <dl className="grid grid-cols-2 gap-4 rounded-xl border border-app-border! bg-app-surface p-4">
              <Detail label="Available credits">{formatCredits(tenant.availableCredits)}</Detail>
              <Detail label="Wallet status">
                <Badge tone={STATUS_TONES[tenant.walletStatus]}>{capitalize(tenant.walletStatus)}</Badge>
              </Detail>
              <Detail label="Held by running requests">{formatCredits(tenant.reservedCredits)}</Detail>
              <Detail label="Total purchased">{formatCredits(tenant.totalPurchased)}</Detail>
              <Detail label="Total used">{formatCredits(tenant.totalUsed)}</Detail>
              <Detail label="Added by admins">{formatCredits(tenant.totalAdjustedIn)}</Detail>
              <Detail label="Deducted by admins">{formatCredits(tenant.totalAdjustedOut)}</Detail>
              <Detail label="Last recharge">{formatDate(tenant.lastRecharge)}</Detail>
            </dl>
            <StatusControl tenant={tenant} />
          </div>
        ))}

      {tab === "transactions" && (
        <PagedTable
          query={txQuery}
          columns={transactionColumns}
          page={txPage}
          setPage={setTxPage}
          itemLabel="transactions"
          emptyMessage="No transactions yet"
        />
      )}

      {tab === "usage" && (
        <PagedTable
          query={usageQuery}
          columns={adminUsageColumns}
          page={usagePage}
          setPage={setUsagePage}
          itemLabel="entries"
          emptyMessage="No AI usage yet"
        />
      )}
    </Drawer>
  );
};

export default TenantWalletDrawer;
