import JoditEditor from "jodit-react";
import React, { useEffect, useRef, useState } from "react";
import { GetwebsiteDetails } from "../../services/api";
import { useSelector } from "react-redux";
const Analytics = () => {
  const editor = useRef(null);

  const [editable, setEditable] = useState("None");
  const [text, setText] = useState("sfsd");
  const [openIndex, setOpenIndex] = useState(null);
  const [websitedata, setWebsitedata] = useState({});
  const [websiteCancellationdata, setwebsiteCancellationdata] = useState("");
  const [websiteTermsdata, setwebsiteTermsdata] = useState("");
  const [websitePrivacydata, setwebsitePrivacydata] = useState("");

  const handleChangeJodit = (idx, name, value) => {
    console.log("value", text);
    // const updatedTerms = [...termsAndCondition]; // Create a copy of the array
    // updatedTerms[idx][name] = value; // Update the value at the specified index
    // setTermsAndCondition(updatedTerms); // Update the state with the modified array
  };

  const { currentLoactionWebsiteData, loading } = useSelector(
    (state) => state?.hotelsWebsiteData
  );

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const update = async (text) => {
    try {
      const response = await fetch(
        `https://nexon.eazotel.com/cms/edit/termsandconditions`,
        {
          method: "POST",
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: localStorage.getItem("token"),
            Privacy: text,
            Cancellation: websiteCancellationdata,
            TermsServices: websiteTermsdata,
          }),
        }
      );

      const result = await response.json();

      if (result?.Status) {
        console.log("Done");
      }
    } catch (error) {
      console.log("Error");
    }
  };

  return (
    <div className="bg-white p-4">
      <div className="flex  justify-between items-center ">
        <h2 className="text-sm font-semibold text-[#575757]">Privacy Policy</h2>
        <button
          className="font-semibold  bg-[#0a3a75] hover:bg-[#0a3a75]/90 text-white px-3 py-1 flex items-center rounded-sm text-[14px]"
          onClick={() => {
            update(text);
          }}
        >
          Update
        </button>
      </div>

      {loading ? (
        <p className="h-[40dvh] animate-pulse bg-gray-100 mt-2"></p>
      ) : (
        <JoditEditor
          ref={editor}
          value={
            currentLoactionWebsiteData?.Details?.TermsConditions[0]?.Privacy
          }
          onChange={(newContent) => {
            setText(newContent);
            handleChangeJodit(newContent);
          }}
          className="my-3"
        />
      )}
    </div>
  );
};

export default Analytics;
