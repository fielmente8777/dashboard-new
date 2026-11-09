import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { formatCredits, newIdempotencyKey } from "../../components/AiCredits/aiCredits";
import PageShell from "../../components/ui/PageShell";
import { EmptyState, ErrorState, Skeleton } from "../../components/ui/States";
import { useToast } from "../../context/ToastContext";
import useDebounce from "../../hooks/useDebounce";
import { getApiErrorMessage } from "../../redux/api/baseApi";
import {
  useAdjustAiCreditsMutation,
  useGetAdminAiOverviewQuery,
  useGetAdminAiPackagesQuery,
  useGetAdminAiPricingQuery,
  useSaveAiPackageMutation,
  useSaveAiPricingMutation,
  useUpdateAiCreditSettingsMutation,
} from "../../redux/api/aiCreditsApi";
import AdjustCreditsDialog from "./components/AdjustCreditsDialog";
import CreditPackages from "./components/CreditPackages";
import CreditSettings from "./components/CreditSettings";
import OverviewCards from "./components/OverviewCards";
import PackageDialog from "./components/PackageDialog";
import PricingDialog from "./components/PricingDialog";
import PricingTable from "./components/PricingTable";
import TenantCreditsTable from "./components/TenantCreditsTable";
import TenantWalletDrawer from "./components/TenantWalletDrawer";

const LoadingPage = () => (
  <>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
      {Array.from({ length: 6 }, (_, index) => (
        <Skeleton key={index} className="h-24" />
      ))}
    </div>
    <Skeleton className="h-96" />
    <Skeleton className="h-72" />
  </>
);

const NotAllowed = () => (
  <PageShell title="AI Credit Management">
    <EmptyState
      icon={ShieldCheck}
      title="Only Eazotel admins can open this page"
      description="Your AI credits are on the AI Wallet page."
    />
  </PageShell>
);

// Admin > AI Credit Management: every tenant's AI wallet, provider pricing,
// recharge packages and credit settings. gian allows only the emails in
// AI_CREDITS_ADMIN_EMAILS; the owner check here just avoids a pointless call.
const AiCreditManagement = () => {
  const { authUser, loading: profileLoading } = useSelector((state) => state.userProfile);
  const isOwner = authUser?.role === "owner";
  const { showToast } = useToast();

  const [filters, setFilters] = useState({ search: "", status: "all", level: "all" });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const search = useDebounce(filters.search.trim(), 300);

  const overviewQuery = useGetAdminAiOverviewQuery(
    { page, limit, search, status: filters.status, level: filters.level },
    { skip: !isOwner },
  );
  const pricingQuery = useGetAdminAiPricingQuery(undefined, { skip: !isOwner });
  const packagesQuery = useGetAdminAiPackagesQuery(undefined, { skip: !isOwner });
  const [adjustCredits, adjustState] = useAdjustAiCreditsMutation();
  const [savePricing, pricingState] = useSaveAiPricingMutation();
  const [savePackage, packageState] = useSaveAiPackageMutation();
  const [saveSettings, settingsState] = useUpdateAiCreditSettingsMutation();

  const [adjusting, setAdjusting] = useState(null); // { mode, tenant, idempotencyKey }
  const [viewing, setViewing] = useState(null); // { tenantId, tab }
  const [pricingForm, setPricingForm] = useState(null); // { row } (null row = new)
  const [packageForm, setPackageForm] = useState(null); // { pack } (null pack = new)

  const { data, isLoading, error, refetch } = overviewQuery;
  const thresholds = data && { low: data.settings.lowThreshold, critical: data.settings.criticalThreshold };

  const changeFilters = (next) => {
    setFilters((prev) => ({ ...prev, ...next }));
    setPage(1);
  };

  const fail = (err, fallback) => showToast({ type: "error", message: getApiErrorMessage(err, fallback) });

  const onTenantAction = (action, tenant) => {
    if (action === "add" || action === "deduct") {
      // one key per opened dialog: a double submit or a retry applies once
      setAdjusting({ mode: action, tenant, idempotencyKey: newIdempotencyKey() });
    } else {
      setViewing({ tenantId: tenant.tenantId, tab: action === "transactions" ? "transactions" : "wallet" });
    }
  };

  const applyAdjustment = async ({ amount, reason }) => {
    const { mode, tenant, idempotencyKey } = adjusting;
    try {
      const result = await adjustCredits({ tenantId: tenant.tenantId, direction: mode, amount, reason, idempotencyKey }).unwrap();
      setAdjusting(null);
      showToast({
        type: "success",
        message: `${mode === "add" ? "Added" : "Deducted"} ${formatCredits(amount)} credits. New balance: ${formatCredits(result.balanceAfter)}`,
      });
    } catch (err) {
      fail(err, "Couldn't adjust credits");
    }
  };

  const submitPricing = async (row) => {
    try {
      await savePricing(row).unwrap();
      setPricingForm(null);
      showToast({ type: "success", message: `${row.provider} / ${row.model} pricing saved` });
    } catch (err) {
      fail(err, "Couldn't save pricing");
    }
  };

  const submitPackage = async (pack) => {
    try {
      await savePackage(pack).unwrap();
      setPackageForm(null);
      showToast({ type: "success", message: `${pack.name} ${pack.id ? "updated" : "created"}` });
    } catch (err) {
      fail(err, "Couldn't save the package");
    }
  };

  const submitSettings = async (next) => {
    try {
      await saveSettings(next).unwrap();
      showToast({ type: "success", message: "Credit settings saved" });
    } catch (err) {
      fail(err, "Couldn't save settings");
    }
  };

  if (profileLoading && !authUser) {
    return (
      <PageShell title="AI Credit Management">
        <LoadingPage />
      </PageShell>
    );
  }

  if (!isOwner || error?.status === 403) return <NotAllowed />;

  return (
    <PageShell
      title="AI Credit Management"
      description="AI credit wallets, provider pricing and recharge packages for every tenant"
    >
      {isLoading && <LoadingPage />}

      {error && <ErrorState message={getApiErrorMessage(error, "Couldn't load AI credits.")} onRetry={refetch} />}

      {data && (
        <>
          <OverviewCards overview={data.overview} />
          <TenantCreditsTable
            tenants={data.tenants.items}
            pagination={{
              ...data.tenants.pagination,
              page,
              limit,
              onPageChange: setPage,
              onLimitChange: (value) => {
                setLimit(value);
                setPage(1);
              },
            }}
            filters={filters}
            onFiltersChange={changeFilters}
            loading={overviewQuery.isFetching}
            thresholds={thresholds}
            onAction={onTenantAction}
          />
          <PricingTable
            query={pricingQuery}
            onEdit={(row) => setPricingForm({ row })}
            onCreate={() => setPricingForm({ row: null })}
          />
          <div className="grid gap-5 2xl:grid-cols-2">
            <CreditPackages
              query={packagesQuery}
              onEdit={(pack) => setPackageForm({ pack })}
              onCreate={() => setPackageForm({ pack: null })}
            />
            <CreditSettings settings={data.settings} saving={settingsState.isLoading} onSave={submitSettings} />
          </div>

          <AdjustCreditsDialog
            open={Boolean(adjusting)}
            mode={adjusting?.mode}
            tenant={adjusting?.tenant}
            busy={adjustState.isLoading}
            onClose={() => setAdjusting(null)}
            onSubmit={applyAdjustment}
          />
          <TenantWalletDrawer
            tenantId={viewing?.tenantId}
            tab={viewing?.tab}
            onTabChange={(tab) => setViewing((prev) => ({ ...prev, tab }))}
            thresholds={thresholds}
            onClose={() => setViewing(null)}
          />
          <PricingDialog
            open={Boolean(pricingForm)}
            row={pricingForm?.row}
            busy={pricingState.isLoading}
            onClose={() => setPricingForm(null)}
            onSubmit={submitPricing}
          />
          <PackageDialog
            open={Boolean(packageForm)}
            pack={packageForm?.pack}
            busy={packageState.isLoading}
            onClose={() => setPackageForm(null)}
            onSubmit={submitPackage}
          />
        </>
      )}
    </PageShell>
  );
};

export default AiCreditManagement;
