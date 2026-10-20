import { useCallback } from "react";
import { useDispatch } from "react-redux";
import {
  integrationsApi,
  useGetIntegrationStatusQuery,
} from "../redux/api/integrationsApi";
import { useTenant } from "./useTenant";

// what a page sees before the first answer (or when the request fails)
const NOT_CONNECTED = {
  WebsiteTracking: false,
  gmail: false,
  google_analytics: false,
  meta: false,
  exotel: false,
  googleAdsInsight: { status: false, lastSyncTime: null },
};

// Which apps the selected hotel has connected. Fetched fresh whenever a page
// that uses it opens; call checkIntegrationStatus() after connecting or
// disconnecting an app.
export const useIntegrationStatus = () => {
  const dispatch = useDispatch();
  const { hid } = useTenant();
  const { currentData, isFetching } = useGetIntegrationStatusQuery(hid, {
    skip: !hid,
    refetchOnMountOrArgChange: true,
  });

  // resolves once the new status is in (joins a request already on its way)
  const checkIntegrationStatus = useCallback(async () => {
    if (!hid) return;
    await dispatch(
      integrationsApi.endpoints.getIntegrationStatus.initiate(hid, {
        forceRefetch: true,
        subscribe: false,
      }),
    );
  }, [dispatch, hid]);

  return {
    integrationStatus: currentData ?? NOT_CONNECTED,
    checkIntegrationStatus,
    isLoadingIntegrationStatus: isFetching,
  };
};
