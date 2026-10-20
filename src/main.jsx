import { createRoot } from "react-dom/client";
import "./index.css";
import "./App.css";
import { RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/Store.js";
import { applyColorMode, selectColorMode } from "./redux/slice/themeSlice.js";
import router from "./Navigation/router.jsx";

// index.html already set the class before paint; this also saves the choice
// and sets the browser's theme colour.
applyColorMode(selectColorMode(store.getState()));

// Providers that need the router (toasts, confirm, chatbot, global data)
// live in Navigation/RootLayout.jsx.
createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>,
);
