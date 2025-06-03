import React, { useEffect } from "react";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import BookingSetup from "./BookingSetup";
import BookingCustom from "./BookingCustom";
import BookingContent from "./BookingContent";
import BookingLabel from "./BookingLabel";
import BookingRoomPrice from "./BookingRoomPrice";
import { useContext } from "react";
import AuthContext from "../../Context/AuthProvider";
import PricePackage from "./PricePackage";
import AdsPackages from "./AdsPackages";

function BookingTab() {
  const { handleGetPrice } = useContext(AuthContext);
  useEffect(() => {
    handleGetPrice();
  }, []);

  return (
    <div className="CmsBookingTab">
      <Tabs defaultActiveKey="setup" id="noanim-tab-example" className="mb-3">
        <Tab eventKey="setup" title="Setup">
          <BookingSetup />
        </Tab>
        <Tab eventKey="room price" title="Price / Inventory">
          <BookingRoomPrice />
        </Tab>
        <Tab eventKey="price package" title="Meal Packages">
          <PricePackage />
        </Tab>
        <Tab eventKey="Ads Packages" title="Packages">
          <AdsPackages />
        </Tab>
        <Tab eventKey="customization" title="Customization">
          <BookingCustom />
        </Tab>
        <Tab eventKey="content" title="Content">
          <BookingContent />
        </Tab>
        <Tab eventKey="label" title="Label">
          <BookingLabel />
        </Tab>
      </Tabs>
    </div>
  );
}

export default BookingTab;
