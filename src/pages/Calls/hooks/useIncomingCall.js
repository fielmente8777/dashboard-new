import { useEffect, useState } from "react";
import WebSocketClient from "../../../config/websocketClient";
import { WEBSOCKET_EVENTS, WS_BASE_URL } from "../../../data/constant";

// The call that is ringing for this account right now, pushed over the
// websocket. Returns [call, dismiss]; `call` is null when nothing is ringing.
export const useIncomingCall = () => {
  const [call, setCall] = useState(null);

  useEffect(() => {
    const client = new WebSocketClient(WS_BASE_URL);

    client.connect(({ event, data }) => {
      if (data?.ndid !== localStorage.getItem("ndid")) return;

      if (event === WEBSOCKET_EVENTS.EXOTEL_CALL) {
        setCall(data);
      } else if (
        event === WEBSOCKET_EVENTS.EXOTEL_CALL_ANSWERED ||
        event === WEBSOCKET_EVENTS.EXOTEL_CALL_MISSED
      ) {
        setCall(null);
      }
    });

    return () => client.close();
  }, []);

  return [call, () => setCall(null)];
};
