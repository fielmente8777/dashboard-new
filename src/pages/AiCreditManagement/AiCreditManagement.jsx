import { ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import InProgressNotice from "../../components/AiCredits/InProgressNotice";
import { creditState } from "../../components/AiCredits/aiCredits";
import PageShell from "../../components/ui/PageShell";
import { EmptyState, ErrorState, Skeleton } from "../../components/ui/States";
import { useToast } from "../../context/ToastContext";
import { getApiErrorMessage } from "../../redux/api/baseApi";
import { useGetAdminAiCreditsQuery } from "../../redux/api/aiCreditsApi";
import AdjustCreditsDialog from "./components/AdjustCreditsDialog";
import CreditPackages from "./components/CreditPackages";
import EditPricingDialog from "./components/EditPricingDialog";
import LowCreditSettings from "./components/LowCreditSettings";
import OverviewCards from "./components/OverviewCards";
import PackageDialog from "./components/PackageDialog";
import PricingTable from "./components/PricingTable";
import TenantCreditsTable from "./components/TenantCreditsTable";
import TenantWalletDrawer from "./components/TenantWalletDrawer";

// IN PROGRESS: every change below is kept in this page's state only.
const NOT_SAVED = "Updated for this session only. Saving arrives with the wallet API.";

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

// Admin > AI Credit Management: every tenant's AI wallet, AI prices,
// recharge packages and low-credit alerts. Owner accounts only.
const AiCreditManagement = () => {
  const { authUser, loading: profileLoading } = useSelector((state) => state.userProfile);
  const isOwner = authUser?.role === "owner";
  const { data, isLoading, error, refetch } = useGetAdminAiCreditsQuery(undefined, { skip: !isOwner });
  const { showToast } = useToast();

  const [tenants, setTenants] = useState([]);
  const [pricing, setPricing] = useState([]);
  const [packages, setPackages] = useState([]);
  const [settings, setSettings] = useState(null);
  const [adjustments, setAdjustments] = useState({});

  const [adjusting, setAdjusting] = useState(null); // { mode, tenant }
  const [viewing, setViewing] = useState(null); // { tenantId, tab }
  const [editingService, setEditingService] = useState(null);
  const [packageForm, setPackageForm] = useState(null); // { pack } (null pack = new)

  useEffect(() => {
    if (!data) return;
    setTenants(data.tenants ?? []);
    setPricing(data.pricing ?? []);
    setPackages(data.packages ?? []);
    setSettings(data.lowCreditSettings ?? null);
  }, [data]);

  const thresholds = { low: settings?.lowThreshold, critical: settings?.criticalThreshold };

  const overview = useMemo(
    () =>
      data && {
        ...data.overview,
        totalAvailableCredits: tenants.reduce((sum, t) => sum + t.availableCredits, 0),
        lowCreditTenants: tenants.filter((t) => creditState(t.availableCredits, thresholds) !== "healthy").length,
      },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, tenants, settings],
  );

  const saved = (message) => showToast({ title: message, message: NOT_SAVED, type: "info", duration: 4000 });

  const onTenantAction = (action, tenant) => {
    if (action === "add" || action === "deduct") setAdjusting({ mode: action, tenant });
    else setViewing({ tenantId: tenant.tenantId, tab: action === "transactions" ? "transactions" : "wallet" });
  };

  const applyAdjustment = ({ amount, reason }) => {
    const { mode, tenant } = adjusting;
    const credits = mode === "add" ? amount : -amount;
    const balanceAfter = Math.max(0, tenant.availableCredits + credits);
    setTenants((prev) =>
      prev.map((t) => (t.tenantId === tenant.tenantId ? { ...t, availableCredits: balanceAfter } : t)),
    );
    setAdjustments((prev) => ({
      ...prev,
      [tenant.tenantId]: [
        { id: `${Date.now()}`, date: new Date().toISOString(), credits, reason, balanceAfter },
        ...(prev[tenant.tenantId] ?? []),
      ],
    }));
    setAdjusting(null);
    saved(`${mode === "add" ? "Added" : "Deducted"} ${amount.toLocaleString("en-IN")} credits`);
  };

  const savePricing = (service) => {
    setPricing((prev) => prev.map((s) => (s.id === service.id ? service : s)));
    setEditingService(null);
    saved(`${service.name} pricing updated`);
  };

  const savePackage = (pack) => {
    setPackages((prev) => {
      // only one package can be the highlighted one
      const others = pack.popular ? prev.map((p) => ({ ...p, popular: false })) : prev;
      return pack.id
        ? others.map((p) => (p.id === pack.id ? pack : p))
        : [...others, { ...pack, id: `custom-${Date.now()}` }];
    });
    setPackageForm(null);
    saved(pack.id ? `${pack.name} updated` : `${pack.name} created`);
  };

  const saveSettings = (next) => {
    setSettings(next);
    saved("Low-credit settings updated");
  };

  if (profileLoading && !authUser) {
    return (
      <PageShell title="AI Credit Management">
        <LoadingPage />
      </PageShell>
    );
  }

  if (!isOwner) {
    return (
      <PageShell title="AI Credit Management">
        <EmptyState
          icon={ShieldCheck}
          title="Only Eazotel admins can open this page"
          description="Your AI credits are on the AI Wallet page."
        />
      </PageShell>
    );
  }

  const viewedTenant = viewing && tenants.find((t) => t.tenantId === viewing.tenantId);

  return (
    <PageShell
      title="AI Credit Management"
      description="AI credit wallets, pricing and recharge packages for every tenant"
    >
      <InProgressNotice />

      {isLoading && <LoadingPage />}

      {error && (
        <ErrorState message={getApiErrorMessage(error, "Couldn't load AI credits.")} onRetry={refetch} />
      )}

      {data && settings && (
        <>
          <OverviewCards overview={overview} />
          <TenantCreditsTable tenants={tenants} thresholds={thresholds} onAction={onTenantAction} />
          <div className="grid gap-5 2xl:grid-cols-2">
            <PricingTable pricing={pricing} onEdit={setEditingService} />
            <CreditPackages
              packages={packages}
              onEdit={(pack) => setPackageForm({ pack })}
              onCreate={() => setPackageForm({ pack: null })}
            />
          </div>
          <LowCreditSettings settings={settings} onSave={saveSettings} />

          <AdjustCreditsDialog
            open={Boolean(adjusting)}
            mode={adjusting?.mode}
            tenant={adjusting?.tenant}
            onClose={() => setAdjusting(null)}
            onSubmit={applyAdjustment}
          />
          <TenantWalletDrawer
            tenant={viewedTenant}
            tab={viewing?.tab}
            onTabChange={(tab) => setViewing((prev) => ({ ...prev, tab }))}
            adjustments={adjustments[viewing?.tenantId] ?? []}
            thresholds={thresholds}
            onClose={() => setViewing(null)}
          />
          <EditPricingDialog
            service={editingService}
            onClose={() => setEditingService(null)}
            onSubmit={savePricing}
          />
          <PackageDialog
            open={Boolean(packageForm)}
            pack={packageForm?.pack}
            onClose={() => setPackageForm(null)}
            onSubmit={savePackage}
          />
        </>
      )}
    </PageShell>
  );
};

export default AiCreditManagement;
