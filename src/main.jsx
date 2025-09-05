import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { DataProvider } from "./context/DataContext.jsx";
import { BrowserRouter } from "react-router-dom";
import GlobalDataProvider from "./context/GlobalDataProvider.jsx";
import { Provider } from "react-redux";
import store from "./redux/Store.js";
import Whatsapp from "./components/Contacts/WhtasApp.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <DataProvider>
        <BrowserRouter>
          <GlobalDataProvider />
          <Whatsapp whatsAppNumber={"+919501868775"} />
          <App />
        </BrowserRouter>
      </DataProvider>
    </Provider>
  </StrictMode>
);
