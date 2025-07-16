import React, { useContext, useEffect } from "react";

import DataContext from "../../context/DataContext";
import { BASE_URL } from "../../data/constant";

const BookingCustom = () => {
  const {
    BackgroundColor,
    setBackgroundColor,
    BoardColor,
    setBoardColor,
    ButtonColor,
    setButtonColor,
    BackgroundImage,
    setBackgroundImage,
    baseUrl,
    EngineNewUrl,
  } = useContext(DataContext);

  const fetchBookingDatatData = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/booking/getengine/${localStorage.getItem(
          "token"
        )}/${localStorage.getItem("hid")}`,
        {
          method: "GET", // Use 'GET' method
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      const json = await response.json();
      if (json.Status) {
        console.log(json)
        // setgateway(json.Details.Gateway);
        // setAboutusEngine(json.Details.AboutUs);
        // setCancellationPolicyEngine(json.Details.CancellationPolicy);
        // setPrivacyPolicyEngine(json.Details.PrivacyPolicy);
        // setTermsConditionsEngine(json.Details.TermsConditions);
        // setConfirmButton(json.Details.Labels.ConfirmButton);
        // setPayButton(json.Details.Labels.PayButton);
        // setReserveBoard(json.Details.Labels.ReserveBoard);
        // setReserveButton(json.Details.Labels.ReserveButton);
        // setBackgroundColor(json.Details.Colors.BackgroundColor);
        // setBoardColor(json.Details.Colors.BoardColor);
        // setButtonColor(json.Details.Colors.ButtonColor);
        // setBackgroundImage(json.Details.BgImage);
        // fetchRazorpayData("0");
      }
    } catch (error) {
      // console.log('Error fetching data:', error);
    }
  };

  const UpdateLabelEngine = async () => {
    try {
      const response = await fetch(`${EngineNewUrl}/cms/edit/engine/colors`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Token: localStorage.getItem("Token"),
          BackgroundColor: BackgroundColor,
          BoardColor: BoardColor,
          ButtonColor: ButtonColor,
          hId: localStorage.getItem("hotelLocationId"),
        }),
      });

      const json = await response.json();

      alert("Updated");
    } catch (error) {
      console.error("Error sending POST request:", error);
    }
  };

  useEffect(() => {
    fetchBookingDatatData()
  }, [])
  return (
    <div className="bCustom">
      <div className="b-desc">
        <h6>Step 2</h6>
        {/* <p>Customize your Booking Engine using options below. There's no need to insert anything to your site, just click on the "Preview & Save" button, and your changes will be automatically applied to your site.</p> */}
      </div>
      <div className="b-templt py-3">
        <h6>Background Image</h6>
        <img
          style={{ height: "120px", weight: "150px" }}
          src={BackgroundImage}
        />
      </div>
      <div className="c-color py-3">
        <div className="c-div">
          <h6>Page Color</h6>
          <div className="choose-clr">
            <input
              type="color"
              name=""
              id="Bg_color"
              value={BackgroundColor}
              onChange={(e) => {
                setBackgroundColor(e.target.value);
              }}
            />
            <input type="text" name="" id="" value={BackgroundColor} />
          </div>
        </div>
        <div className="c-div">
          <h6>Reservation Card Color</h6>
          <div className="choose-clr">
            <input
              type="color"
              name=""
              id="Box_color"
              value={BoardColor}
              onChange={(e) => {
                setBoardColor(e.target.value);
              }}
            />
            <input type="text" name="" id="" value={BoardColor} />
          </div>
        </div>
        <div className="c-div">
          <h6>Check-in/Check-out Button color</h6>
          <div className="choose-clr">
            <input
              type="color"
              name=""
              id="Button_color"
              value={ButtonColor}
              onChange={(e) => {
                setButtonColor(e.target.value);
              }}
            />
            <input type="text" name="" id="" value={ButtonColor} />
            {/* <input type="color" name="" id="Button_color"  value={props.isbutton_color} />
            <input type="text" name="" id="" value={props.isbutton_color} /> */}
          </div>
        </div>
      </div>

      <div className="Save_div">
        <button onClick={UpdateLabelEngine} className="addBtn">
          Save
        </button>
      </div>
    </div>
  );
}

export default BookingCustom;
