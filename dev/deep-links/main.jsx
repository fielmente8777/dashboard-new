import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import DeepLinks from "../../src/pages/BookingEngine/DeepLinks.jsx";
import "./test.css";

// Standalone fixture store: no production login, profile loader, sidebar or sockets.
const firstHotel = "test-hotel-a";
localStorage.setItem("hid", firstHotel);
const store = configureStore({
  reducer: (state = { userProfile: { hid: firstHotel } }, action) => action.type === "test/select-hotel" ? { userProfile: { hid: action.payload } } : state,
});
function selectHotel(event) {
  localStorage.setItem("hid", event.target.value);
  store.dispatch({ type: "test/select-hotel", payload: event.target.value });
}
createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <header className="test-header">
      <strong>Eazotel · Isolated testing</strong>
      <label>Sample hotel <select defaultValue={firstHotel} onChange={selectHotel}><option value="test-hotel-a">Test hotel A</option><option value="test-hotel-b">Test hotel B</option></select></label>
      <p>Test database: <code>eazotel_deep_links_test</code>. Use <code>http://localhost:3001/client.html</code> as the booking destination.</p>
    </header>
    <DeepLinks />
  </Provider>
);
