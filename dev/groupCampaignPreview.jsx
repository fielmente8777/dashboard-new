/* eslint-disable react-refresh/only-export-components -- an entry file, not a module */
// Dev-only preview of "Create group email campaign" (components/Email/GroupCampaignDialog):
// the real dialog, talking to whatever VITE_NODE_API_URL points at (for the screenshots: a
// demo server running gian's real audience code on an in-memory database).
//   ?group=Spain&ticks=opened,clicked&includeNew=0&theme=dark
// Never imported by the app.
import { useState } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import "../src/index.css";
import "../src/App.css";
import GroupCampaignDialog from "../src/components/Email/GroupCampaignDialog";
import { ConfirmProvider } from "../src/context/ConfirmContext";
import { ToastProvider } from "../src/context/ToastContext";
import store from "../src/redux/Store.js";
import { applyColorMode } from "../src/redux/slice/themeSlice.js";
import { setHid } from "../src/redux/slice/UserSlice";

const params = new URLSearchParams(location.search);
applyColorMode(params.get("theme") === "dark" ? "dark" : "light");
store.dispatch(setHid("demo-hid"));

const Preview = () => {
  const [result, setResult] = useState(null);
  return (
    <div className="min-h-screen bg-app-bg p-6 text-app-text">
      <GroupCampaignDialog open initialGroup={params.get("group") || ""} onClose={() => {}} onContinue={setResult} />
      {result && (
        <pre id="batch-result" className="fixed bottom-2 left-2 z-[99999] rounded bg-black/80 p-2 text-xs text-white">
          {JSON.stringify({ count: result.count, label: result.label })}
        </pre>
      )}
    </div>
  );
};

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <ToastProvider>
      <ConfirmProvider>
        <Preview />
      </ConfirmProvider>
    </ToastProvider>
  </Provider>,
);
