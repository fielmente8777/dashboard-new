import { useEffect } from "react";
import { useDispatch } from "react-redux";
import WebSocketClient from "../../../config/websocketClient";
import { WEBSOCKET_EVENTS, WS_BASE_URL } from "../../../data/constant";
import { leadsApi } from "../../../redux/api/leadsApi";

// While `enabled`, reloads the leads lists as soon as a new lead for this
// hotel arrives over the websocket.
export const useNewLeadRefresh = ({ hid, ndid }, enabled) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!enabled || !hid || !ndid) return undefined;

    const client = new WebSocketClient(WS_BASE_URL);

    client.connect(({ event, data }) => {
      if (
        event === WEBSOCKET_EVENTS.META_NEW_LEAD &&
        data?.ndid === ndid &&
        String(data?.hId) === hid
      ) {
        dispatch(leadsApi.util.invalidateTags(["Lead"]));
      }
    });

    return () => client.close();
  }, [dispatch, enabled, hid, ndid]);
};
