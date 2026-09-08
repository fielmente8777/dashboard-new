import React, { useContext, useEffect } from "react";

import DataContext from "../../context/DataContext";
import { BASE_URL } from "../../data/constant";

/* ── styling only — legacy class names are kept alongside ───── */
const SECTION_TITLE =
  "text-sm font-semibold text-app-text dark:text-app-text-muted mb-2";
const HEX_FIELD =
  "min-w-0 flex-1 rounded-md border border-app-border bg-app-surface px-3 py-2 text-sm text-app-text outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30";
const SWATCH =
  "h-10 w-12 shrink-0 cursor-pointer rounded-md border border-app-border bg-app-surface p-1";

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
        // console.log(json)
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
    <div className="bCustom bg-app-surface p-4 [color-scheme:light] dark:[color-scheme:dark]">
      <div className="b-desc">
        <h6 className="text-base font-semibold text-app-text">Step 2</h6>
        {/* <p>Customize your Booking Engine using options below. There's no need to insert anything to your site, just click on the "Preview & Save" button, and your changes will be automatically applied to your site.</p> */}
      </div>
      <div className="b-templt py-3">
        <h6 className={SECTION_TITLE}>Background Image</h6>
        {BackgroundImage ? (
          <img
            className="h-[120px] w-[150px] rounded-md border border-app-border object-cover"
            src={BackgroundImage}
            alt="Booking engine background"
          />
        ) : (
          <div className="flex h-[120px] w-[150px] items-center justify-center rounded-md border border-dashed border-app-border bg-app-surface-secondary text-xs text-app-text-faint">
            No image
          </div>
        )}
      </div>
      <div className="c-color py-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <div className="c-div min-w-0">
          <h6 className={SECTION_TITLE}>Page Color</h6>
          <div className="choose-clr flex items-center gap-2">
            <input
              type="color"
              name=""
              id="Bg_color"
              className={SWATCH}
              value={BackgroundColor}
              onChange={(e) => {
                setBackgroundColor(e.target.value);
              }}
            />
            <input
              type="text"
              name=""
              id=""
              readOnly
              className={HEX_FIELD}
              value={BackgroundColor}
            />
          </div>
        </div>
        <div className="c-div min-w-0">
          <h6 className={SECTION_TITLE}>Reservation Card Color</h6>
          <div className="choose-clr flex items-center gap-2">
            <input
              type="color"
              name=""
              id="Box_color"
              className={SWATCH}
              value={BoardColor}
              onChange={(e) => {
                setBoardColor(e.target.value);
              }}
            />
            <input
              type="text"
              name=""
              id=""
              readOnly
              className={HEX_FIELD}
              value={BoardColor}
            />
          </div>
        </div>
        <div className="c-div min-w-0">
          <h6 className={SECTION_TITLE}>Check-in/Check-out Button color</h6>
          <div className="choose-clr flex items-center gap-2">
            <input
              type="color"
              name=""
              id="Button_color"
              className={SWATCH}
              value={ButtonColor}
              onChange={(e) => {
                setButtonColor(e.target.value);
              }}
            />
            <input
              type="text"
              name=""
              id=""
              readOnly
              className={HEX_FIELD}
              value={ButtonColor}
            />
            {/* <input type="color" name="" id="Button_color"  value={props.isbutton_color} />
            <input type="text" name="" id="" value={props.isbutton_color} /> */}
          </div>
        </div>
      </div>

      <div className="Save_div flex justify-end">
        <button
          type="button"
          onClick={UpdateLabelEngine}
          className="addBtn w-full sm:w-auto rounded-md bg-primary hover:bg-primary/90 px-6 py-2 text-sm font-medium text-white transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  );
}

export default BookingCustom;