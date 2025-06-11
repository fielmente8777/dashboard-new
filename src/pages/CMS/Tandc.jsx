import JoditEditor from "jodit-react";
import React, { useEffect, useRef, useState } from "react";
import { GetwebsiteDetails } from "../../services/api";
import { useDispatch, useSelector } from "react-redux";
import handleLocalStorage from "../../utils/handleLocalStorage";
import { BASE_URL } from "../../data/constant";
import Swal from "sweetalert2";
import { fetchWebsiteData } from "../../redux/slice/websiteDataSlice";
import Loader from "../../components/Loader";
const Analytics = () => {
  const editor = useRef(null);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [editable, setEditable] = useState("None");
  const [text, setText] = useState("sfsd");
  const [openIndex, setOpenIndex] = useState(null);
  const [websiteCancellationdata, setwebsiteCancellationdata] = useState("");
  const [websiteTermsdata, setwebsiteTermsdata] = useState("");
  const [websitePrivacydata, setwebsitePrivacydata] = useState("");

  const dispatch = useDispatch();

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
      setLoadingUpdate(true);
      const response = await fetch(`${BASE_URL}/cms/edit/termsandconditions`, {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: localStorage.getItem("token"),
          Privacy: currentLoactionWebsiteData?.TermsConditions[0]?.Privacy,
          Cancellation:
            currentLoactionWebsiteData?.TermsConditions[1]?.Cancellation,
          TermsServices: text,
          hid: String(handleLocalStorage("hid")),
        }),
      });

      const result = await response.json();
      if (result?.Status) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Updated Successfully",
        });

        dispatch(
          fetchWebsiteData(
            handleLocalStorage("token"),
            handleLocalStorage("hid")
          )
        );
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `${error?.message || "Something went wrong"}`,
      });
    } finally {
      setLoadingUpdate(false);
    }
  };

  return (
    <div className="bg-white p-4">
      <div className="flex  justify-between items-center ">
        <h2 className="text-sm font-semibold text-[#575757]">
          Terms and Conditions
        </h2>

        <button
          disabled={loadingUpdate}
          className="text-sm font-semibold disabled:opacity-80 bg-primary disabled:hover:bg-primary hover:bg-primary/90 text-white px-3 py-1 flex items-center rounded-sm gap-4"
          onClick={() => {
            update(text);
          }}
        >
          Update {loadingUpdate && <Loader size={16} color="#fff" />}
        </button>
      </div>

      {loading ? (
        <p className="h-[40dvh] animate-pulse bg-gray-100 mt-2 rounded-sm"></p>
      ) : (
        <JoditEditor
          ref={editor}
          value={currentLoactionWebsiteData?.TermsConditions[2]?.TermsServices}
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
