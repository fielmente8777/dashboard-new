import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { DataProvider } from "./context/DataContext";
import store from "./redux/Store";
import { Provider } from "react-redux";
import GlobalDataProvider from "./context/GlobalDataProvider";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <DataProvider>
      <BrowserRouter>
        <GlobalDataProvider />
        <App />
      </BrowserRouter>
    </DataProvider>
  </Provider>
);
