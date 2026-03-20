class WebSocketClient {
  socket = null;
  reconnectInterval = 3000;
  shouldReconnect = true;

  constructor(url) {
    this.url = url;
  }

  connect(onMessage) {
    this.socket = new WebSocket(this.url);

    this.socket.onopen = () => {
      // console.log("WebSocket connected 🚀");
    };

    this.socket.onmessage = (event) => {
      try {
        const parsed =
          typeof event.data === "string" ? JSON.parse(event.data) : event.data;

        onMessage(parsed);
      } catch (error) {
        console.error("Invalid WS JSON:", error);
      }
    };

    this.socket.onclose = () => {
      // console.log("WebSocket closed");
      if (this.shouldReconnect) {
        setTimeout(() => {
          // console.log("Reconnecting WebSocket...");
          this.connect(onMessage);
        }, this.reconnectInterval);
      }
    };

    this.socket.onerror = (err) => {
      console.error("WebSocket error:", err);
    };
  }

  send(payload) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(payload));
    } else {
      console.warn("WebSocket not connected — cannot send");
    }
  }

  close() {
    this.shouldReconnect = false;
    if (this.socket) {
      this.socket.close();
    }
  }
}

export default WebSocketClient;
