import React, { useRef } from "react";
import SaveBtn from "../../Components/SaveBtn";
import { useContext } from "react";
import JoditEditor from "jodit-react";
import AuthContext from "../../Context/AuthProvider";

function BookingContent() {
  const {
    AboutusEngine,
    setAboutusEngine,
    CancellationPolicyEngine,
    setCancellationPolicyEngine,
    PrivacyPolicyEngine,
    setPrivacyPolicyEngine,
    TermsConditionsEngine,
    setTermsConditionsEngine,
    baseUrl,
    joditConfig,
    EngineNewUrl,
  } = useContext(AuthContext);

  const editor = useRef(null);
  const editor1 = useRef(null);
  const editor2 = useRef(null);
  const editor3 = useRef(null);

  const UpdateLabelEngine = async () => {
    try {
      const response = await fetch(`${EngineNewUrl}/cms/edit/engine/content`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Token: localStorage.getItem("Token"),
          aboutus: AboutusEngine,
          privacy: PrivacyPolicyEngine,
          cancellation: CancellationPolicyEngine,
          TermsConditions: TermsConditionsEngine,
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
      <div className="cont">
        <h5>Step 3</h5>
        {/* <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Aliquid deleniti mollitia perferendis sunt excepturi eligendi optio unde ea. Dolorum praesentium voluptatem neque eos quae illum officiis ad voluptate nesciunt distinctio totam minus nostrum non odit aliquam maxime, necessitatibus quibusdam sequi quisquam doloribus alias cupiditate. Quaerat nemo incidunt fugit quisquam blanditiis!</p> */}
      </div>
      <div className="cont-in">
        <div className="content">
          <h4 className="my-3">About us</h4>
          <JoditEditor
            id="jodit1"
            ref={editor}
            value={AboutusEngine}
            onChange={(content) => {
              setAboutusEngine(content);
              editor.current?.focus();
            }}
            config={joditConfig}
          />
        </div>

        <div className="content">
          <h4 className="my-3">Cancellation Policy</h4>
          <JoditEditor
            id="jodit2"
            tabIndex={1}
            ref={editor1}
            value={CancellationPolicyEngine}
            onChange={(content1) => {
              setCancellationPolicyEngine(content1);
              editor1.current?.focus();
            }}
            config={joditConfig}
          />
        </div>

        <div className="content">
          <h4 className="my-3"> Privacy Policy</h4>
          <JoditEditor
            id="jodit3"
            ref={editor2}
            value={PrivacyPolicyEngine}
            onChange={(content2) => {
              setPrivacyPolicyEngine(content2);
              editor2.current?.focus();
            }}
            config={joditConfig}
          />
        </div>

        <div className="content">
          <h4 className="my-3"> Payment Terms</h4>
          <JoditEditor
            id="jodit4"
            ref={editor3}
            value={TermsConditionsEngine}
            onChange={(content3) => {
              setTermsConditionsEngine(content3);
              editor3.current?.focus();
            }}
            config={joditConfig}
          />
          {/* <textarea className='BookingContent_Text' name="" id="" cols="70" rows="7" value={TermsConditionsEngine} onChange={(e)=>{setTermsConditionsEngine(e.target.value)}} placeholder='Enter Text Here' ></textarea> */}
        </div>
        <div className="Save_div">
          <button onClick={UpdateLabelEngine} className="addBtn">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookingContent;
