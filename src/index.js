import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { DataProvider } from "./context/DataContext";
import GlobalDataProvider from "./context/GlobalDataProvider";
import "./index.css";
import store from "./redux/Store";
import Whatsapp from "./components/Contacts/WhtasApp";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <DataProvider>
      <BrowserRouter>
        <GlobalDataProvider />
        <Whatsapp whatsAppNumber={"+919501868775"} />
        <App />
      </BrowserRouter>
    </DataProvider>
  </Provider>
);
