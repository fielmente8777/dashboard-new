import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { announcePropertyChange } from "../../components/Analytics/analyticsRange";
import { useConfirm } from "../../context/ConfirmContext";
import { useToast } from "../../context/ToastContext";
import { BASE_URL } from "../../data/constant";
import { useIntegrationStatus } from "../../hooks/useIntegrationStatus";
import { useLazyGetAnalyticsPropertiesQuery } from "../../redux/api/analyticsApi";
import { getApiErrorMessage } from "../../redux/api/baseApi";
import {
  useConnectMetaLeadMutation,
  useDisconnectAnalyticsMutation,
  useDisconnectIntegrationMutation,
  useGetAnalyticsStatusMutation,
  useGetExotelOverviewQuery,
  useStartGmailAuthMutation,
  useStartGoogleAdsAuthMutation,
} from "../../redux/api/integrationsApi";
import { useConnectWhatsAppMutation, useGetWhatsAppAccountQuery } from "../../redux/api/whatsappApi";
import {
  useDisconnectGbpMutation,
  useGetGbpLocationsQuery,
  useStartGbpAuthMutation,
  useSyncGbpLocationsMutation,
} from "../../redux/api/gbpApi";
import { integrationPath } from "../../routes/paths";
import { exotelChecks, whatsappChecks } from "./integrationHealth";
import {
  ExotelDialog,
  GaPropertyDialog,
  OtpLessDialog,
  WebsiteTrackingDialog,
} from "./IntegrationDialogs";
import { INTEGRATIONS, readPath } from "./integrationsData";

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

// Everything the Integrations list and an app's own page share: which apps
// are connected, connecting and disconnecting them (with the dialogs some
// apps need), and the live health of the apps that report it.
//
//   const integrations = useIntegrations();
//   integrations.isConnected(app); integrations.connect(app);
//   return <>{...}{integrations.dialogs}</>;
export const useIntegrations = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const { subscription } = useSelector((state) => state?.subscription);
  const { integrationStatus, checkIntegrationStatus } = useIntegrationStatus();

  const [getGaStatus] = useGetAnalyticsStatusMutation();
  const [getGaProperties] = useLazyGetAnalyticsPropertiesQuery();
  const [disconnectGa] = useDisconnectAnalyticsMutation();
  const [connectWhatsapp] = useConnectWhatsAppMutation();
  const [connectMetaLead] = useConnectMetaLeadMutation();
  const [startGoogleAdsAuth] = useStartGoogleAdsAuthMutation();
  const [startGmailAuth] = useStartGmailAuthMutation();
  const [disconnectIntegration] = useDisconnectIntegrationMutation();
  const [startGbpAuth] = useStartGbpAuthMutation();
  const [syncGbpLocations] = useSyncGbpLocationsMutation();
  const [disconnectGbp] = useDisconnectGbpMutation();
  // Google Business Profile has no flag per hotel: it is connected when the
  // account has listings synced
  const gbp = useGetGbpLocationsQuery();
  const gbpLocations = gbp.data || [];

  const [loaded, setLoaded] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [dialog, setDialog] = useState(null); // "exotel" | "otp-less" | "tracking"
  const [isGaConnected, setIsGaConnected] = useState(false);
  const [ga, setGa] = useState({ open: false, email: "", properties: [], loading: false });
  // set while the user signs in to an app in another tab
  const awaitingRef = useRef(false);
  // Google Business Profile only lists the listings after a sync
  const awaitingGbpRef = useRef(false);

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
      if (awaitingGbpRef.current) {
        awaitingGbpRef.current = false;
        // fails quietly when the user closed the Google tab without connecting
        syncGbpLocations().catch(() => {});
      }
      refresh();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refresh, syncGbpLocations]);

  const isConnected = useCallback(
    (app) =>
      app.id === "google_analytics"
        ? isGaConnected
        : app.id === "gmb"
          ? gbpLocations.length > 0
          : Boolean(app.statusKey && readPath(integrationStatus, app.statusKey)),
    [integrationStatus, isGaConnected, gbpLocations.length],
  );
  const isLocked = (app) =>
    Boolean(app.access && subscription?.appAccess && !subscription.appAccess[app.access]);

  // live health, only for the apps that are connected
  const hid = tenant().hid;
  const byId = (id) => INTEGRATIONS.find((app) => app.id === id);
  const exotelOn = loaded && isConnected(byId("exotel"));
  const whatsappOn = loaded && isConnected(byId("metaWhatsapp"));
  const exotel = useGetExotelOverviewQuery(hid, { skip: !hid || !exotelOn });
  const whatsapp = useGetWhatsAppAccountQuery(hid, { skip: !hid || !whatsappOn });
  const health = {
    exotel: { query: exotel, checks: exotelOn ? exotelChecks(exotel.data) : [] },
    metaWhatsapp: { query: whatsapp, checks: whatsappOn ? whatsappChecks(whatsapp.data) : [] },
  };

  const loadGaProperties = async (email) => {
    setGa({ open: true, email, properties: [], loading: true });
    try {
      const properties = await getGaProperties(email).unwrap();
      setGa({ open: true, email, properties, loading: false });
    } catch {
      setGa({ open: true, email, properties: [], loading: false });
    }
  };

  // gian sends the user back from Google with ?gmail=connected|cancelled|error
  const gmailResult = searchParams.get("gmail");
  useEffect(() => {
    if (!gmailResult) return;
    const messages = {
      connected: { message: "Gmail connected" },
      cancelled: { message: "Gmail was not connected: the Google sign-in was cancelled.", type: "error" },
      error: {
        message: "Gmail could not be connected. Please try again, or contact Eazotel support if it keeps failing.",
        type: "error",
      },
    };
    showToast(messages[gmailResult] || messages.error);
    if (gmailResult === "connected") refresh();
    const next = new URLSearchParams(searchParams);
    next.delete("gmail");
    navigate({ search: next.toString() }, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gmailResult]);

  // Google can also send the user back here with ?ga_connected=true&email=…
  const gaParam = searchParams.get("ga_connected") === "true" && searchParams.get("email");
  useEffect(() => {
    if (gaParam) loadGaProperties(gaParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          const data = await startGmailAuth(tenant().hid).unwrap();
          if (!data?.url) throw new Error();
          window.location.href = data.url;
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
        case "gmb":
          awaitingGbpRef.current = true;
          return await openInNewTab(
            () => startGbpAuth(tenant().ndid).unwrap(),
            (r) => r?.googleAuthUrl,
            app.name,
          );
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
    if (!confirmed) return false;

    setBusyId(app.id);
    try {
      if (app.id === "gmb") {
        // every Google account this login connected
        const accounts = [...new Set(gbpLocations.map((l) => l.googleAccountId).filter(Boolean))];
        await Promise.all(accounts.map((id) => disconnectGbp(id).unwrap()));
      } else if (app.id === "google_analytics") {
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
      return true;
    } catch (error) {
      showToast({ message: errorText(error, `Could not disconnect ${app.name}.`), type: "error" });
      return false;
    } finally {
      setBusyId(null);
    }
  };

  const dialogs = (
    <>
      <ExotelDialog
        open={dialog === "exotel"}
        onClose={() => setDialog(null)}
        onConnected={async () => {
          setDialog(null);
          await checkIntegrationStatus();
          navigate(integrationPath("exotel"));
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
          // Search Console works off this property
          announcePropertyChange(propertyId);
          closeGa();
          refresh();
        }}
      />
    </>
  );

  return {
    loaded,
    refresh,
    integrationStatus,
    gbpLocations,
    isConnected,
    isLocked,
    busyId,
    connect,
    disconnect,
    health,
    // opens the Exotel keys form, also to replace keys that are already saved
    editExotelKeys: () => setDialog("exotel"),
    dialogs,
  };
};
