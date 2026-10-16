import { ArrowUpRight, Lock, Plug, Search } from "lucide-react";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import GscSettings from "../../components/GscSettings";
import IntegrationSkelton from "../../components/Skeltons/IntegrationSkelton";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { Input } from "../../components/ui/Field";
import Icon from "../../components/ui/Icon";
import { EmptyState } from "../../components/ui/States";
import Tabs from "../../components/ui/Tabs";
import { useConfirm } from "../../context/ConfirmContext";
import DataContext from "../../context/DataContext";
import { useToast } from "../../context/ToastContext";
import { BASE_URL } from "../../data/constant";
import { PAGES, ROUTES, dashboardPath } from "../../routes/paths";
import { useLazyGetAnalyticsPropertiesQuery } from "../../redux/api/analyticsApi";
import { getApiErrorMessage } from "../../redux/api/baseApi";
import {
  useConnectMetaLeadMutation,
  useDisconnectAnalyticsMutation,
  useDisconnectIntegrationMutation,
  useGetAnalyticsStatusMutation,
  useStartGmailAuthMutation,
  useStartGoogleAdsAuthMutation,
} from "../../redux/api/integrationsApi";
import { useConnectWhatsAppMutation } from "../../redux/api/whatsappApi";
import {
  ExotelDialog,
  GaPropertyDialog,
  OtpLessDialog,
  WebsiteTrackingDialog,
} from "./IntegrationDialogs";
import { CATEGORIES, INTEGRATIONS, readPath } from "./integrationsData";
import { announcePropertyChange } from "../../components/Analytics/analyticsRange";

// a thrown Error keeps its message; an API error shows what the server said
const errorText = (error, fallback) => getApiErrorMessage(error, error?.message || fallback);

// the hotel and account the connect links are made for
const tenant = () => ({ hid: localStorage.getItem("hid"), ndid: localStorage.getItem("ndid") });

const openPopup = (url, name) => {
  const width = 500;
  const height = 620;
  const left = window.screen.width / 2 - width / 2;
  const top = window.screen.height / 2 - height / 2;
  return window.open(url, name, `width=${width},height=${height},top=${top},left=${left}`);
};

// One app: what it does, whether it is connected, and the action for it.
const IntegrationCard = ({ app, connected, locked, busy, onConnect, onDisconnect }) => (
  <div className="flex flex-col rounded-xl border border-app-border! bg-app-surface p-4 transition hover:shadow-sm">
    <div className="mb-3 flex items-start justify-between gap-3">
      <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-app-border! bg-white">
        {app.img ? <img src={app.img} alt="" className="size-full object-contain p-1" /> : app.icon}
      </span>
      {app.comingSoon ? (
        <Badge>Coming soon</Badge>
      ) : locked ? (
        <Badge tone="amber">
          <Lock className="mr-1 size-3" /> Upgrade
        </Badge>
      ) : connected ? (
        <Badge tone="green">Connected</Badge>
      ) : null}
    </div>

    <h3 className="text-sm font-semibold text-app-text">{app.name}</h3>
    <p className="mt-1 flex-1 text-xs leading-relaxed text-app-text-muted">{app.description}</p>

    <div className="mt-4 flex gap-2">
      {app.comingSoon ? (
        <Button variant="secondary" size="sm" disabled className="w-full">
          Coming soon
        </Button>
      ) : locked ? (
        <Link to={ROUTES.PLANS} className="w-full">
          <Button size="sm" icon={Lock} className="w-full">
            Upgrade to connect
          </Button>
        </Link>
      ) : connected ? (
        <>
          {app.openPage && (
            <Link to={dashboardPath(app.openPage)} className="flex-1">
              <Button size="sm" variant="secondary" className="w-full">
                Open <ArrowUpRight className="size-3.5" />
              </Button>
            </Link>
          )}
          {(app.statusKey || app.id === "google_analytics") && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onDisconnect}
              loading={busy}
              className="text-red-500! hover:bg-red-500/10!"
            >
              Disconnect
            </Button>
          )}
        </>
      ) : (
        <Button size="sm" icon={Plug} onClick={onConnect} loading={busy} className="w-full">
          Connect
        </Button>
      )}
    </div>
  </div>
);

function Integration() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const { subscription } = useSelector((state) => state?.subscription);
  const { integrationStatus, checkIntegrationStatus } = useContext(DataContext);

  const [getGaStatus] = useGetAnalyticsStatusMutation();
  const [getGaProperties] = useLazyGetAnalyticsPropertiesQuery();
  const [disconnectGa] = useDisconnectAnalyticsMutation();
  const [connectWhatsapp] = useConnectWhatsAppMutation();
  const [connectMetaLead] = useConnectMetaLeadMutation();
  const [startGoogleAdsAuth] = useStartGoogleAdsAuthMutation();
  const [startGmailAuth] = useStartGmailAuthMutation();
  const [disconnectIntegration] = useDisconnectIntegrationMutation();

  const [loaded, setLoaded] = useState(false);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [dialog, setDialog] = useState(null); // "exotel" | "otp-less" | "tracking"
  const [isGaConnected, setIsGaConnected] = useState(false);
  const [ga, setGa] = useState({ open: false, email: "", properties: [], loading: false });
  // set while the user signs in to an app in another tab
  const awaitingRef = useRef(false);

  const checkGaStatus = useCallback(async () => {
    const hid = localStorage.getItem("hid");
    if (!hid) return;
    try {
      const data = await getGaStatus(hid).unwrap();
      setIsGaConnected(Boolean(data?.connected));
    } catch {
      // keeps the last known status
    }
  }, [getGaStatus]);

  const refresh = useCallback(async () => {
    await Promise.all([checkIntegrationStatus(), checkGaStatus()]);
    setLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkGaStatus]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // back from a sign-in tab: show the new status without a reload
  useEffect(() => {
    const onFocus = () => {
      if (!awaitingRef.current) return;
      awaitingRef.current = false;
      refresh();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refresh]);

  const loadGaProperties = async (email) => {
    setGa({ open: true, email, properties: [], loading: true });
    try {
      const properties = await getGaProperties(email).unwrap();
      setGa({ open: true, email, properties, loading: false });
    } catch {
      setGa({ open: true, email, properties: [], loading: false });
    }
  };

  // Google can also send the user back here with ?ga_connected=true&email=…
  const gaParam = searchParams.get("ga_connected") === "true" && searchParams.get("email");
  useEffect(() => {
    if (gaParam) loadGaProperties(gaParam);
  }, [gaParam]);

  const closeGa = () => {
    setGa({ open: false, email: "", properties: [], loading: false });
    if (gaParam) {
      const next = new URLSearchParams(searchParams);
      next.delete("ga_connected");
      next.delete("email");
      navigate({ search: next.toString() }, { replace: true });
    }
  };

  // The tab is opened on the click itself and pointed at the sign-in page once
  // the API answers; opening it after the await gets it eaten by popup blockers
  // whenever the backend is slow to wake up.
  const openInNewTab = async (request, pickUrl, name) => {
    const tab = window.open("", "_blank");
    try {
      const response = await request();
      const url = pickUrl(response);
      if (!url) throw new Error(response?.responseMessage);
      awaitingRef.current = true;
      if (tab && !tab.closed) {
        tab.opener = null;
        tab.location.href = url;
      } else {
        window.open(url, "_blank");
      }
    } catch (error) {
      tab?.close();
      showToast({ message: errorText(error, `Could not start connecting ${name}.`), type: "error" });
    }
  };

  const connect = async (app) => {
    setBusyId(app.id);
    try {
      switch (app.id) {
        case "metaWhatsapp":
          return await openInNewTab(
            // resolves with the signup URL itself
            () => connectWhatsapp(tenant()).unwrap(),
            (url) => url,
            app.name,
          );
        case "meta":
          return await openInNewTab(
            () => connectMetaLead(tenant()).unwrap(),
            (r) => r?.result?.docs?.authUrl,
            app.name,
          );
        case "googleadsinsights":
          return await openInNewTab(
            () => startGoogleAdsAuth(tenant().ndid).unwrap(),
            (r) => r?.googleAuthUrl,
            app.name,
          );
        case "gmail": {
          const data = await startGmailAuth(tenant().ndid).unwrap();
          if (!data?.auth_url) throw new Error();
          window.location.href = data.auth_url;
          return;
        }
        case "google_analytics": {
          openPopup(`${BASE_URL}/google/auth?hid=${localStorage.getItem("hid")}`, "GoogleAnalyticsAuth");
          const onMessage = (event) => {
            if (!event.origin.includes("localhost") && !BASE_URL.includes(event.origin)) return;
            if (event.data?.type === "GOOGLE_OAUTH_SUCCESS") {
              window.removeEventListener("message", onMessage);
              loadGaProperties(event.data.email);
            }
          };
          window.addEventListener("message", onMessage);
          return;
        }
        case "exotel":
          return setDialog("exotel");
        case "otp-less":
          return setDialog("otp-less");
        case "WebsiteTracking":
          return setDialog("tracking");
        default:
          return;
      }
    } catch {
      showToast({ message: `Could not start connecting ${app.name}.`, type: "error" });
    } finally {
      setBusyId(null);
    }
  };

  const disconnect = async (app) => {
    const confirmed = await confirm(
      `${app.name} will stop syncing with your dashboard. You can connect it again any time.`,
      { title: `Disconnect ${app.name}?`, confirmText: "Disconnect" },
    );
    if (!confirmed) return;

    setBusyId(app.id);
    try {
      if (app.id === "google_analytics") {
        await disconnectGa(tenant().hid).unwrap();
        setIsGaConnected(false);
        localStorage.removeItem("activePropertyId");
        window.dispatchEvent(new CustomEvent("dashboard_property_changed", { detail: {} }));
      } else {
        const response = await disconnectIntegration({
          hid: tenant().hid,
          id: app.disconnectId || app.statusKey,
        }).unwrap();
        if (!response?.success) throw new Error(response?.responseMessage);
        await checkIntegrationStatus();
      }
      showToast({ message: `${app.name} disconnected` });
    } catch (error) {
      showToast({ message: errorText(error, `Could not disconnect ${app.name}.`), type: "error" });
    } finally {
      setBusyId(null);
    }
  };

  if (!loaded) return <IntegrationSkelton />;

  const isConnected = (app) =>
    app.id === "google_analytics"
      ? isGaConnected
      : Boolean(app.statusKey && readPath(integrationStatus, app.statusKey));
  const isLocked = (app) =>
    Boolean(app.access && subscription?.appAccess && !subscription.appAccess[app.access]);

  const term = search.trim().toLowerCase();
  const searched = INTEGRATIONS.filter(
    (app) => !term || `${app.name} ${app.description}`.toLowerCase().includes(term),
  );
  const shown = searched.filter((app) => category === "All" || app.category === category);
  const connectedCount = INTEGRATIONS.filter(isConnected).length;

  const tabs = CATEGORIES.map((c) => ({
    value: c,
    label: `${c} (${c === "All" ? searched.length : searched.filter((a) => a.category === c).length})`,
  }));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-app-text">Integrations</h2>
          <p className="text-xs text-app-text-muted">
            Connect the apps you already use to bring their data into one dashboard.
          </p>
        </div>
        <Badge tone={connectedCount ? "green" : "gray"}>
          {connectedCount} of {INTEGRATIONS.length} connected
        </Badge>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative lg:w-72">
          <Icon icon={Search} size="sm" tone="faint" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search apps"
            className="pl-9"
          />
        </div>
        <Tabs tabs={tabs} value={category} onChange={setCategory} />
      </div>

      {shown.length === 0 ? (
        <EmptyState icon={Search} title="No apps match" description="Try another name or category." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {shown.map((app) => (
            <IntegrationCard
              key={app.id}
              app={app}
              connected={isConnected(app)}
              locked={isLocked(app)}
              busy={busyId === app.id}
              onConnect={() => connect(app)}
              onDisconnect={() => disconnect(app)}
            />
          ))}
        </div>
      )}

      {(category === "All" || category === "Analytics") && !term && <GscSettings />}

      <ExotelDialog
        open={dialog === "exotel"}
        onClose={() => setDialog(null)}
        onConnected={() => {
          setDialog(null);
          navigate(dashboardPath(PAGES.CALLS));
        }}
      />
      <OtpLessDialog open={dialog === "otp-less"} onClose={() => setDialog(null)} />
      <WebsiteTrackingDialog open={dialog === "tracking"} onClose={() => setDialog(null)} />
      <GaPropertyDialog
        open={ga.open}
        email={ga.email}
        properties={ga.properties}
        loading={ga.loading}
        onClose={closeGa}
        onSaved={(propertyId) => {
          // Search Console below works off this property
          announcePropertyChange(propertyId);
          closeGa();
          refresh();
        }}
      />
    </div>
  );
}

export default Integration;
