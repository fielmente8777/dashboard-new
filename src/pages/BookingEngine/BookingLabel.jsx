import React from "react";
import SaveBtn from "../../Components/SaveBtn";
import { useContext } from "react";
import AuthContext from "../../Context/AuthProvider";

function BookingLabel() {
  const {
    ConfirmButton,
    setConfirmButton,
    PayButton,
    setPayButton,
    ReserveBoard,
    setReserveBoard,
    ReserveButton,
    setReserveButton,
    baseUrl,
    EngineNewUrl,
  } = useContext(AuthContext);

  const UpdateLabelEngine = async () => {
    try {
      const response = await fetch(`${EngineNewUrl}/cms/edit/engine/labels`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Token: localStorage.getItem("Token"),
          ReserveBoard: ReserveBoard,
          ReserveButton: ReserveButton,
          ConfirmButton: ConfirmButton,
          PayButton: PayButton,
          hId: localStorage.getItem("hotelLocationId"),
        }),
      });

      const json = await response.json();

      alert("Updated");
    } catch (error) {
      console.error("Error sending POST request:", error);
    }
  };
  return (
    <div className="bCustom">
      <div className="lbl">
        <h6>Step 4</h6>
        {/* <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Totam repellendus nam sit rem error! Qui, commodi eum magnam, laborum sequi ad reprehenderit corrupti temporibus provident harum molestias maiores ex porro minus eius quia ullam, assumenda autem similique iste ab dolores esse! Inventore eos quibusdam deserunt, excepturi saepe quae velit dicta?</p> */}
      </div>
      <div className="lbl_m">
        <div className="cutm_lbl">
          <div className="in_lbl">
            <label htmlFor="">
              <strong>Box Label</strong>
            </label>
            <input
              className="lbl_impt"
              type="text"
              value={ReserveBoard}
              onChange={(e) => {
                setReserveBoard(e.target.value);
              }}
            />
          </div>
          <div className="in_lbl">
            <label htmlFor="">
              <strong>Search Room Button Label</strong>
            </label>
            <input
              className="lbl_impt"
              type="text"
              value={ReserveButton}
              onChange={(e) => {
                setReserveButton(e.target.value);
              }}
            />
          </div>
          <div className="in_lbl">
            <label htmlFor="">
              <strong>Book Room Button Label</strong>
            </label>
            <input
              className="lbl_impt"
              type="text"
              value={ConfirmButton}
              onChange={(e) => {
                setConfirmButton(e.target.value);
              }}
            />
          </div>
          <div className="in_lbl">
            <label htmlFor="">
              <strong>Payment Button Label</strong>
            </label>
            <input
              className="lbl_impt"
              type="text"
              value={PayButton}
              onChange={(e) => {
                setPayButton(e.target.value);
              }}
            />
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

export default BookingLabel;
