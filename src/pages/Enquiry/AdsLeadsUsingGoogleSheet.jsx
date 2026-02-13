import React, { useEffect, useMemo, useState } from "react";
import {
  getMetaAccounts,
  getMetaForms,
  getMetaLeads,
} from "../../services/api/MetaLeads.api";

/* Clean labels for headers */
const FIELD_LABELS = {
  id: "ID",
  created_time: "Created Time",
  full_name: "Full Name",
  phone_number: "Phone Number",
  job_title: "Job Title",
  email: "Email",
  city: "City",
  are_you_looking_to_booking_for: "Guests",
  what_kind_of_room_are_you_looking_to_reserve: "Room Type",
  what_time_during_the_day_would_you_like_to_be_contacted_by_our_team:
    "Contact Time",
  what_is_your_preferred_check_in_date: "Check-in Date",
  preferred_check_out_date: "Check-out Date",
  do_you_want_to_include_breakfast: "Budget",
  are_you_interested_in_booking_a_stay_at_sparv_aulakhs_resort_goa:
    "Interested",
};

const AdsLeadsUsingGoogleSheet = () => {
  const [pages, setPages] = useState([]);
  const [forms, setForms] = useState([]);
  const [leads, setLeads] = useState([]);

  const [afterCursor, setAfterCursor] = useState(null);
  const [beforeCursor, setBeforeCursor] = useState(null);

  const [selectedPageId, setSelectedPageId] = useState("");
  const [selectedFormId, setSelectedFormId] = useState("");

  const [loadingPages, setLoadingPages] = useState(false);
  const [loadingForms, setLoadingForms] = useState(false);
  const [loadingLeads, setLoadingLeads] = useState(false);

  /* ---------------- FETCH DATA ---------------- */

  const fetchMetaPages = async () => {
    setLoadingPages(true);
    try {
      const response = await getMetaAccounts();
      if (response?.success) {
        const pagesData = response?.result?.docs?.pages || [];
        setPages(pagesData);

        if (pagesData.length === 1) {
          setSelectedPageId(pagesData[0].id);
          fetchPageForms(pagesData[0].id);
        }
      }
    } finally {
      setLoadingPages(false);
    }
  };

  const fetchPageForms = async (pageId) => {
    setLoadingForms(true);
    try {
      const response = await getMetaForms(pageId);
      if (response?.success) {
        const formsData = response?.result?.docs?.forms || [];
        setForms(formsData);

        if (formsData.length) {
          setSelectedFormId(formsData[0].id);
          fetchLeads(pageId, formsData[0].id);
        }
      }
    } finally {
      setLoadingForms(false);
    }
  };

  const fetchLeads = async (pageId, formId, cursor) => {
    setLoadingLeads(true);
    try {
      const response = await getMetaLeads(pageId, formId, cursor);
      if (response?.success) {
        setLeads(response?.result?.docs?.leads || []);
        const cursors = response?.result?.paging?.cursors;
        setAfterCursor(cursors?.after || null);
        setBeforeCursor(cursors?.before || null);
      }
    } finally {
      setLoadingLeads(false);
    }
  };

  /* ---------------- HANDLERS ---------------- */

  const handlePageChange = (e) => {
    const pageId = e.target.value;
    setSelectedPageId(pageId);
    setForms([]);
    setLeads([]);
    setSelectedFormId("");
    fetchPageForms(pageId);
  };

  const handleFormChange = (e) => {
    const formId = e.target.value;
    setSelectedFormId(formId);
    fetchLeads(selectedPageId, formId);
  };

  /* ---------------- NORMALIZE LEADS ---------------- */

  const normalizedLeads = useMemo(() => {
    return leads.map((lead) => {
      const row = {
        id: lead.id,
        created_time: new Date(lead.created_time).toLocaleString(),
      };

      lead.field_data.forEach((f) => {
        row[f.name] = f.values?.join(", ");
      });

      return row;
    });
  }, [leads]);

  const tableHeaders = useMemo(() => {
    if (!normalizedLeads.length) return [];
    return Object.keys(normalizedLeads[0]);
  }, [normalizedLeads]);

  useEffect(() => {
    fetchMetaPages();
  }, []);

  /* ---------------- UI ---------------- */

  return (
    <div className="bg-white rounded-xl shadow border p-6 space-y-6">
      <h2 className="text-lg font-semibold text-gray-800">Meta Lead Forms</h2>

      {/* SELECTION ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PAGE */}
        <div className="border rounded-lg p-4">
          <label className="block text-sm font-medium mb-1">
            Facebook Page
          </label>
          <select
            value={selectedPageId}
            onChange={handlePageChange}
            disabled={loadingPages}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Select a page</option>
            {pages.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          {loadingPages && (
            <p className="text-xs text-blue-600 mt-2">Fetching pages…</p>
          )}
        </div>

        {/* FORM */}
        <div className="border rounded-lg p-4">
          <label className="block text-sm font-medium mb-1">Lead Form</label>
          <select
            value={selectedFormId}
            onChange={handleFormChange}
            disabled={loadingForms || !selectedPageId}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Select a form</option>
            {forms.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
          {loadingForms && (
            <p className="text-xs text-blue-600 mt-2">Fetching forms…</p>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className="border rounded-lg overflow-x-auto">
        {loadingLeads ? (
          <p className="p-6 text-sm text-blue-600">Loading leads…</p>
        ) : normalizedLeads.length === 0 ? (
          <p className="p-6 text-sm text-gray-500">No leads available</p>
        ) : (
          <table className="min-w-full table-fixed text-sm">
            <thead className="bg-primary border-b">
              <tr>
                {tableHeaders.map((h) => (
                  <th
                    key={h}
                    className="px-3 py-3 text-left font-semibold text-xs text-white
                               min-w-[160px] max-w-[260px]"
                  >
                    <div className="line-clamp-2">
                      {FIELD_LABELS[h] || h.replaceAll("_", " ")}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {normalizedLeads.map((row, i) => (
                <tr
                  key={row.id || i}
                  className="odd:bg-white even:bg-gray-50 hover:bg-blue-50 transition"
                >
                  {tableHeaders.map((h) => (
                    <td
                      key={h}
                      className="px-3 py-2 text-gray-800
                                 min-w-[160px] max-w-[260px]"
                    >
                      <div className="line-clamp-2">{row[h] || "-"}</div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {(afterCursor || beforeCursor) && (
        <div className="flex justify-start gap-3 pt-4">
          <button
            disabled={!beforeCursor || loadingLeads}
            onClick={() =>
              fetchLeads(selectedPageId, selectedFormId, {
                before: beforeCursor,
              })
            }
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Previous
          </button>

          <button
            disabled={!afterCursor || loadingLeads}
            onClick={() =>
              fetchLeads(selectedPageId, selectedFormId, {
                after: afterCursor,
              })
            }
            className="px-4 py-2 bg-primary text-white rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdsLeadsUsingGoogleSheet;

// import { useContext, useEffect, useState } from "react";
// import { LoginSocialGoogle } from "reactjs-social-login";
// // import { LoginSocialGoogle } from "reactjs-social-login";

// import {
//   useGoogleLogin,
//   GoogleOAuthProvider,
//   GoogleLogin,
// } from "@react-oauth/google";
// import { BASE_URL } from "../../data/constant";
// import AdLeadsAnalytics from "./AdLeadsAnalytics";
// import DataContext from "../../context/DataContext";
// import {
//   FiAlertTriangle,
//   FiDatabase,
//   FiShield,
//   FiTrendingUp,
// } from "react-icons/fi";
// import { FaGoogle } from "react-icons/fa";
// import { TbAlertTriangle } from "react-icons/tb";
// import { IoMdCheckmarkCircle } from "react-icons/io";
// import { FaPowerOff } from "react-icons/fa6";
// import { Link } from "react-router-dom";
// import { useSelector } from "react-redux";
// import Loader from "../../components/Loader";

// // import AuthContext from '../../Context/AuthProvider';

// const AdsLeadsUsingGoogleSheet = () => {
//   const { Leads, setLeads } = useContext(DataContext);
//   const { leadsLists, setLeadsList } = useContext(DataContext);

//   const [isChange, setisChange] = useState(false);
//   const [isChangeLoading, setisChangeLoading] = useState(false);
//   const [Spreadsheet, setSpreadsheet] = useState([]);
//   const [id, setid] = useState("");
//   const [sheetName, setSheetName] = useState("");
//   const [Sheets, setSheets] = useState([]);
//   // const [Leads, setLeads] = useState([]);
//   const [sheetaccessToken, setsheetaccessToken] = useState("None");
//   const [sheetid, setsheetid] = useState("None");
//   const [tokenExpire, settokenExpire] = useState(false);
//   const [sheetNamess, setsheetNamess] = useState("");
//   const [selectedRow, setSelectedRow] = useState(null);

//   const { user: hotel } = useSelector((state) => state.userProfile);

//   function getSheetId(input) {
//     // Check if the input is a link
//     const linkMatch = input.match(/\/spreadsheets\/d\/(.+?)\//);

//     if (linkMatch && linkMatch[1]) {
//       // If it's a link, extract sheet ID from the link
//       // console.log(linkMatch[1])
//       return linkMatch[1];
//     } else {
//       // If it's not a link, assume it's already a sheet ID
//       // console.log(input)
//       return input;
//     }
//   }
//   const ChangeSpreadsheetFetchData = (spreadsheetid) => {
//     setsheetid(spreadsheetid);
//     FetchSheetofSpreadSheet(spreadsheetid);
//   };
//   const ChangeSheetFetchData = (sheetname) => {
//     const spreadid = document.getElementById("spreadsheet").value;
//     setsheetNamess(sheetname);
//     setsheetid(spreadid);
//     localStorage.setItem("SheetName", sheetname);
//     FetchSheetsDataofSpreadSheet(spreadid, sheetname);
//   };

//   const FetchAccessTokenFromDb = async () => {
//     try {
//       // console.log("jsfhkdhbkhksf");
//       const response = await fetch(
//         `${BASE_URL}/leadmanagement/getGoogltoken/${localStorage.getItem(
//           "token",
//         )}`,
//         {
//           method: "GET",
//           headers: {
//             Accept: "application/json, text/plain, /",
//             "Content-Type": "application/json",
//           },
//         },
//       );
//       const json = await response.json();
//       console.log(json);
//       if (json.Status === true) {
//         setsheetaccessToken(json.Message);
//       }
//     } catch {
//       setsheetaccessToken("None");
//     }
//   };

//   const FetchSheetsDataofSpreadSheet = async (sheetid, sheetname) => {
//     try {
//       const response = await fetch(
//         `${BASE_URL}/leadmanagement/getSheetDetailLead/${localStorage.getItem(
//           "token",
//         )}/${sheetid}/${sheetname}`,
//         {
//           method: "GET",
//           headers: {
//             Accept: "application/json, text/plain, /",
//             "Content-Type": "application/json",
//           },
//         },
//       );
//       const json = await response.json();

//       if (json.Status) {
//         setsheetNamess(sheetname);
//         setsheetid(sheetid);
//         setLeads(json.Message.values);
//         setLeadsList(json.Message.values);
//         settokenExpire(false);

//         // localStorage.setItem("token", json.Message.token);
//       } else {
//         setLeads([]);
//         settokenExpire(true);
//       }
//     } catch {
//       // alert("Some Problem update token");
//     }
//   };

//   const updateAccessTokenDb = async (gtoken, refreshToken) => {
//     try {
//       const response = await fetch(
//         `${BASE_URL}/leadmanagement/updategoogletokenleadmanagement`,
//         {
//           method: "POST",
//           headers: {
//             Accept: "application/json, text/plain, /",
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             token: localStorage.getItem("token"),
//             googleToken: gtoken,
//             refreshToken: refreshToken,
//           }),
//         },
//       );

//       const json = await response.json();

//       FetchSpreadSheetFromDb();
//     } catch {
//       // alert("Some Problem update token");
//     }
//   };
//   const FetchSheetofSpreadSheet = async (sheetid) => {
//     try {
//       const response = await fetch(
//         `${BASE_URL}/leadmanagement/getsheetName/${sheetid}/${localStorage.getItem(
//           "token",
//         )}`,
//         {
//           method: "GET",
//           headers: {
//             Accept: "application/json, text/plain, /",
//             "Content-Type": "application/json",
//           },
//         },
//       );
//       // console.log(response);
//       const json = await response.json();
//       // console.log(json);
//       if (json.Status) {
//         // console.log("vchghjklhjgfvxc", json.sheets);
//         setSheets(json.sheets);
//         if (json.sheets.length > 0) {
//           setsheetid(json.sheets[0]);
//           FetchSheetsDataofSpreadSheet(
//             sheetid,
//             json.sheets[0].properties.title,
//           );
//           localStorage.setItem("SheetName", json.sheets[0].properties.title);
//           localStorage.setItem("SheetId", sheetid);
//         }
//       } else {
//         settokenExpire(true);
//         setSheets([]);
//       }
//     } catch (error) {
//       // console.log("Error fetching sheets:", error);
//       setSheets([]);
//       setsheetaccessToken("None");
//       updateAccessTokenDb("None");
//       // alert("Some Problem update token getsheetname");
//     }
//   };
//   const FetchSpreadSheetFromDb = async () => {
//     try {
//       const response = await fetch(
//         `${BASE_URL}/leadmanagement/getSheetName/${localStorage.getItem(
//           "token",
//         )}`,
//         {
//           method: "GET",
//           headers: {
//             Accept: "application/json, text/plain, /",
//             "Content-Type": "application/json",
//           },
//         },
//       );
//       const json = await response.json();
//       // console.log(json);
//       if (json.Status) {
//         setSpreadsheet(json.data);
//         if (json.data.length > 0) {
//           setsheetid(json.data[0].id);
//           FetchSheetofSpreadSheet(json.data[0].id);
//         }
//       }
//     } catch {
//       // alert("Some Problem update token");
//     }
//   };
//   const AddSpreadSheet = () => {
//     if (id === "" || sheetName === "") {
//       alert("Sheet Not Added");
//     } else {
//       const sheetuid = getSheetId(id);
//       alert("Sheet Added");
//       AddSpreadSheetToDb(sheetuid, sheetName);
//       setSheetName("");
//       setid("");
//     }
//   };

//   const handleConnectGoogleTool = async (provider, data) => {
//     try {
//       // console.log(data);
//       const tokenEndpoint = "https://oauth2.googleapis.com/token";
//       const response = await fetch(tokenEndpoint, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/x-www-form-urlencoded",
//         },
//         body: new URLSearchParams({
//           code: data.code,
//           // client_id:
//           //   "",
//           // client_secret: "",
//           client_id:
//             import.meta.env.VITE_CLIENT_ID,
//           client_secret: import.meta.env.VITE_CLIENT_SECRET,
//           redirect_uri: window.location.origin,
//           grant_type: "authorization_code",
//         }),
//       });

//       const tokenData = await response.json();
//       const accessToken = tokenData.access_token; // <-- 🟡 important
//       const refreshToken = tokenData.refresh_token; // <-- 🟡 important

//       console.log(refreshToken);

//       setsheetaccessToken(accessToken);
//       updateAccessTokenDb(accessToken, refreshToken);

//       if (Spreadsheet.length != 0) {
//         FetchSheetofSpreadSheet(Spreadsheet[0].id);
//       }
//     } catch (error) {
//       console.error("Google login error:", error);
//       updateAccessTokenDb("None");
//     }
//   };

//   const reconnect = () => {
//     setsheetaccessToken("None");
//     updateAccessTokenDb("None");
//     settokenExpire(true);
//   };

//   useEffect(() => {
//     FetchAccessTokenFromDb();
//     FetchSpreadSheetFromDb();
//   }, []);

//   // console.log("sheetaccessToken", sheetaccessToken);

//   const [alphabet, setalphabet] = useState({
//     0: "A",
//     1: "B",
//     2: "C",
//     3: "D",
//     4: "E",
//     5: "F",
//     6: "G",
//     7: "H",
//     8: "I",
//     9: "J",
//     10: "K",
//     11: "L",
//     12: "M",
//     13: "N",
//     14: "O",
//     15: "P",
//     16: "Q",
//     17: "R",
//     18: "S",
//     19: "T",
//     20: "U",
//     21: "V",
//     22: "W",
//     23: "X",
//     24: "Y",
//     25: "Z",
//   });

//   const getColumn = (column, rowindex, columnindex, newContent) => {
//     // alert(column)
//     // console.log(columnindex);
//     // console.log(column);
//     // console.log(newContent);
//     setLeads((prevData) => {
//       const updatedState = [...prevData];
//       updatedState[Leads?.length - rowindex - 1][columnindex] = newContent;
//       return updatedState;
//     });
//     // alert(sheetid)
//     // updateSheetData();
//   };

//   const updateSheetData = async () => {
//     const sheet = sheetid;
//     setisChangeLoading(true);
//     try {
//       const response = await fetch(
//         `${BASE_URL}/leadmanagement/updateSheet/${localStorage.getItem(
//           "token",
//         )}/${sheet}/${sheetNamess}`,
//         {
//           method: "PUT",
//           headers: {
//             Accept: "application/json, text/plain, /",
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             rowstart: "1",
//             rowend: String(Leads.length + 1),
//             colstart: "A",
//             colend: "Z",
//             values: Leads,
//           }),
//         },
//       );

//       const json = await response.json();
//       console.log(json);
//       FetchSheetsDataofSpreadSheet(sheetid, sheetNamess);
//     } catch {
//       alert("Some Problem update token");
//     } finally {
//       setisChangeLoading(false);
//     }
//   };

//   const AddSpreadSheetToDb = async (sheetid, sheetname) => {
//     try {
//       const response = await fetch(`${BASE_URL}/leadmanagement/addSheetName`, {
//         method: "POST",
//         headers: {
//           Accept: "application/json, text/plain, /",
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           token: localStorage.getItem("token"),
//           hId: localStorage.getItem("hid"),
//           spreadSheetId: sheetid,
//           spreadSheetName: sheetname,
//         }),
//       });

//       const json = await response.json();
//       updateAccessTokenDb(sheetaccessToken);
//       FetchSpreadSheetFromDb();
//     } catch {
//       // alert("Some Problem update token");
//     }
//   };

//   const headerRow = Leads[0];
//   const bodyData = Leads.slice(1, Leads.length);

//   const notShowIndexContent = [0, 2, 3, 4, 5, 6, 7, 8, 9, 10];

//   const header = [
//     { label: "Open Queries", value: "Open" },
//     { label: "Contacted", value: "Contacted" },
//     { label: "Converted", value: "Converted" },
//     { label: "Out Of Budget", value: "Out Of Budget" },
//     { label: "Potential For Later", value: "Potential For Later" },
//     { label: "Quotation Provided", value: "Quotation Provided" },
//     { label: "Dead Lead", value: "Dead Lead" },
//     { label: "Date Sold Out", value: "Date Sold Out" },
//     { label: "Duplicate", value: "Duplicate" },
//   ];

//   return (
//     <div className="bg-white">
//       {sheetaccessToken !== "None" && (
//         <div className="flex justify-between p-2 gap-5 items-center  text-slate-900 py-4">
//           {sheetaccessToken !== "None" ? (
//             <div className="w-fit flex gap-2">
//               <div className="pr-2 py-2 rounded-sm shadow-sm outline-none border border-gray-200 min-w-32">
//                 <select
//                   className="outline-none bg-transparent w-full px-4"
//                   id="spreadsheet"
//                   onChange={(event) =>
//                     ChangeSpreadsheetFetchData(event.target.value)
//                   }
//                 >
//                   {Spreadsheet.reverse().map((spread) => (
//                     <option
//                       key={spread.id}
//                       value={spread.id}
//                       className="py-4 text-gray-700"
//                     >
//                       {spread.Name}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div className="pr-2 py-2 rounded-sm shadow-sm outline-none border border-gray-200">
//                 <select
//                   className="outline-none bg-transparent px-4"
//                   onChange={(event) => ChangeSheetFetchData(event.target.value)}
//                 >
//                   {Sheets.map((sheet) => (
//                     <option
//                       key={sheet.properties.title}
//                       value={sheet.properties.title}
//                       className="text-gray-700"
//                     >
//                       {sheet.properties.title}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//           ) : (
//             ""
//           )}

//           {sheetaccessToken !== "None" && tokenExpire ? (
//             <button
//               className="bg-yellow-400 font-medium px-4 py-2 rounded-full text-gray-800 flex items-center gap-1"
//               onClick={() => {
//                 reconnect();
//               }}
//             >
//               Reconnect{" "}
//               <span className="mt-[2px]">
//                 <FaPowerOff />
//               </span>
//             </button>
//           ) : sheetaccessToken !== "None" && !tokenExpire ? (
//             <div className="flex gap-2.5">
//               <button
//                 className=" bg-green-600 flex justify-center items-center gap-1 px-4 py-2 font-medium text-white rounded-full"
//                 // onClick={() => {
//                 //   updateSheetData();
//                 // }}
//               >
//                 <p className="h-3 w-3 rounded-full bg-red-400 animate-pulse"></p>
//                 Connected
//               </button>

//               {isChange && (
//                 <button
//                   disabled={isChangeLoading}
//                   className="bg-primary flex justify-center items-center gap-1 px-4 py-2 font-medium text-white rounded-full disabled:opacity-35"
//                   onClick={() => {
//                     updateSheetData();
//                   }}
//                 >
//                   Save Changes {isChangeLoading && <Loader color="#fff" />}
//                 </button>
//               )}
//             </div>
//           ) : (
//             ""
//           )}

//           {/* {sheetaccessToken !== "None" ? (
//             <div className="flex justify-end items-center gap-2">
//               <input
//                 type="text"
//                 value={sheetName}
//                 onChange={(e) => {
//                   setSheetName(e.target.value);
//                 }}
//                 placeholder="Sheet Name"
//                 className="placeholder:text-gray-600  w-[14rem] py-2 px-2 outline-none bg-gray-200 border border-gray-300 rounded-sm text-black"
//               />
//               <input
//                 type="text"
//                 value={id}
//                 onChange={(e) => {
//                   setid(e.target.value);
//                 }}
//                 placeholder="Enter sheet Id or Url"
//                 className="placeholder:text-gray-600 w-[200px] py-2 px-2 outline-none bg-gray-200 border border-gray-300 rounded-sm text-black"
//               />
//               <button
//                 className=" bg-[#00C899] py-2 px-4 text-white rounded-full font-semibold"
//                 onClick={() => {
//                   AddSpreadSheet();
//                 }}
//               >
//                 Add <span className="font-bold text-lg">+</span>
//               </button>
//             </div>
//           ) : (
//             ""
//           )} */}
//         </div>
//       )}

//       {sheetaccessToken !== "None" ? (
//         <div className="h-full w-full overflow-scroll">
//           {Leads.length > 0 ? (
//             <table className="border bg-white ">
//               <thead>
//                 <tr className="tablerow bg-primary text-white">
//                   <th className="w-auto px-2 py-3 border font-medium capitalize">
//                     S.N
//                   </th>
//                   {headerRow &&
//                     headerRow.length > 0 &&
//                     headerRow?.map((headerLabel, idx) => {
//                       if (notShowIndexContent.includes(idx)) return null;
//                       return (
//                         <th
//                           className="w-auto px-2 py-3 border font-medium capitalize whitespace-nowrap"
//                           key={headerLabel}
//                         >
//                           {headerLabel}
//                         </th>
//                       );
//                     })}
//                 </tr>
//               </thead>

//               <tbody>
//                 {bodyData?.reverse()?.map((data, rowindex) => {
//                   const isToday =
//                     new Date(data[1]).toDateString() ===
//                     new Date().toDateString();

//                   return (
//                     <tr
//                       className={`cursor-pointer ${
//                         isToday
//                           ? "bg-blue-100 text-gray-900"
//                           : "text-gray-600  "
//                       }`}
//                       onClick={() => {
//                         setSelectedRow(rowindex);
//                       }}
//                     >
//                       <p className="w-auto px-2 py-2 outline-none border-t border-gray-300 text-center text-black">
//                         {rowindex + 1}
//                       </p>
//                       {data?.map((head, index) => {
//                         const phoneRegex = /^p:\+?\d{10,15}$/i;
//                         const isoDateRegex =
//                           /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?([+-]\d{2}:?\d{2})?)?$/;
//                         const isPhone = phoneRegex.test(head);
//                         const isDate =
//                           typeof head === "string" &&
//                           isoDateRegex.test(head) &&
//                           !isNaN(Date.parse(head));

//                         if (notShowIndexContent.includes(index)) return null;

//                         if (
//                           headerRow[index].toLowerCase() === "note" ||
//                           headerRow[index].toLowerCase() === "notes" ||
//                           headerRow[index].toLowerCase() === "stages" ||
//                           headerRow[index].toLowerCase() === "stage"
//                         ) {
//                           return (
//                             <td className="border border-gray-300">
//                               <p className="w-auto px-2 py-2 outline-none  rounded-md text-black">
//                                 {headerRow[index].toLowerCase() === "stage" ? (
//                                   <select
//                                     onClick={(e) => e.stopPropagation()}
//                                     onChange={(e) => {
//                                       setisChange(true);
//                                       getColumn(
//                                         `${
//                                           alphabet[String(index)] +
//                                           String(rowindex)
//                                         }`,
//                                         rowindex,
//                                         index,
//                                         e.target.value,
//                                       );
//                                     }}
//                                     value={head}
//                                   >
//                                     {header.map((stage) => {
//                                       return (
//                                         <option value={stage.value}>
//                                           {stage.label}
//                                         </option>
//                                       );
//                                     })}
//                                   </select>
//                                 ) : (
//                                   <input
//                                     className="w-auto px-2 py-2 outline-none  rounded-md text-black"
//                                     type="text"
//                                     value={head}
//                                     onClick={(e) => {
//                                       e.stopPropagation();
//                                     }}
//                                     placeholder={
//                                       headerRow[index].toLowerCase() === "note"
//                                         ? "Add Note"
//                                         : headerRow[index].toLowerCase() ===
//                                             "notes"
//                                           ? "Add Note"
//                                           : "Stages"
//                                     }
//                                     onChange={(e) => {
//                                       setisChange(true);
//                                       getColumn(
//                                         `${
//                                           alphabet[String(index)] +
//                                           String(rowindex)
//                                         }`,
//                                         rowindex,
//                                         index,
//                                         e.target.value,
//                                       );
//                                     }}
//                                   />
//                                 )}
//                               </p>
//                               yes
//                             </td>
//                           );
//                         }

//                         if (isPhone) {
//                           const phone = head.replace("p:", "");

//                           return (
//                             <td className="border border-gray-300">
//                               <Link
//                                 className="w-auto px-2 py-2 outline-none  rounded-md text-black"
//                                 target="_blank"
//                                 to={`https://wa.me/${phone}?text=${encodeURIComponent(
//                                   `Hello! ${""}👋\nWelcome to ${
//                                     hotel?.Profile?.hotelName
//                                   } 🌐\nHow can I assist you today?`,
//                                 )}`}
//                               >
//                                 {head}
//                               </Link>
//                             </td>
//                           );
//                         }

//                         if (isDate) {
//                           // const isToday =
//                           //   new Date(head).toDateString() ===
//                           //   new Date().toDateString();

//                           return (
//                             <td
//                               className={`w-full border border-gray-300 whitespace-nowrap`}
//                             >
//                               <p className="px-2 py-2">
//                                 {new Date(head).toLocaleDateString("en-US", {
//                                   day: "2-digit",
//                                   month: "short",
//                                   year: "numeric",
//                                 })}
//                               </p>
//                             </td>
//                           );
//                         }

//                         return (
//                           <td className="w-full border border-gray-300 whitespace-nowrap">
//                             <p className="w-auto px-2 py-2 outline-none  rounded-md whitespace-nowrap">
//                               {head}
//                             </p>
//                           </td>
//                         );
//                       })}
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           ) : (
//             <div className="flex justify-center items-center h-[calc(100vh-30vh)]">
//               <h2 className="text-3xl text-gray-300">Opps! Data Not Found!</h2>
//             </div>
//           )}
//         </div>
//       ) : (
//         <div className="w-full bg-white cardShadow overflow-hidden p-8  text-center">
//           {/* Header */}
//           <div className="mb-8">
//             <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
//               <TbAlertTriangle className="text-red-500 text-3xl" />
//             </div>
//             <h1 className="text-2xl font-bold text-gray-800 mb-2">
//               Google Connection Required
//             </h1>
//             <p className="text-gray-600">
//               Connect your Google account to access Sheets data and analytics
//             </p>
//           </div>

//           {/* Benefits Section */}
//           <div className="mb-8">
//             <h2 className="text-lg font-semibold text-gray-700 mb-4">
//               What you'll get with Google connection:
//             </h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="bg-blue-50 p-4 rounded-lg flex items-start">
//                 <FiDatabase className="text-blue-500 text-xl mt-1 mr-3" />
//                 <div>
//                   <h3 className="font-medium text-gray-800">
//                     Real-time Data Sync
//                   </h3>
//                   <p className="text-sm text-gray-600">
//                     Automatically sync with your Google Sheets
//                   </p>
//                 </div>
//               </div>
//               <div className="bg-green-50 p-4 rounded-lg flex items-start">
//                 <FiTrendingUp className="text-green-500 text-xl mt-1 mr-3" />
//                 <div>
//                   <h3 className="font-medium text-gray-800">
//                     Advanced Analytics
//                   </h3>
//                   <p className="text-sm text-gray-600">
//                     Unlock powerful visualization tools
//                   </p>
//                 </div>
//               </div>
//               <div className="bg-purple-50 p-4 rounded-lg flex items-start">
//                 <svg
//                   className="text-purple-500 text-xl mt-1 mr-3 w-5 h-5"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth="2"
//                     d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
//                   />
//                 </svg>
//                 <div>
//                   <h3 className="font-medium text-gray-800">
//                     Dashboard Features
//                   </h3>
//                   <p className="text-sm text-gray-600">
//                     Access all reporting capabilities
//                   </p>
//                 </div>
//               </div>
//               <div className="bg-amber-50 p-4 rounded-lg flex items-start">
//                 <FiShield className="text-amber-500 text-xl mt-1 mr-3" />
//                 <div>
//                   <h3 className="font-medium text-gray-800">
//                     Secure Connection
//                   </h3>
//                   <p className="text-sm text-gray-600">
//                     OAuth 2.0 protected authorization
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Connection Button */}
//           <button className="w-full max-w-xs mx-auto bg-white border border-gray-300 rounded-lg py-3 px-6 flex items-center justify-center text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm hover:shadow-md">
//             <FaGoogle className="text-xl mr-3" />

//             <div className="">
//               <GoogleOAuthProvider
//                 clientId={
//                   import.meta.env.VITE_CLIENT_ID
//                 }
//                 // clientSecret={
//                 //   import.meta.env.VITE_CLIENT_SECRET
//                 // }
//               >
//                 {/* <div className="flex justify-center w-full rounded-md">
//                   <GoogleLogin
//                     onSuccess={(response) => {
//                       // Here you get the authorization code
//                       console.log(response);
//                       const authCode = response.code;
//                       console.log("Auth Code:", authCode);
//                       handleConnectGoogleTool(authCode);
//                     }}
//                     flow="auth-code"
//                     redirect_uri="postmessage"
//                     // onError={handleFailure}
//                     disabled={loading}
//                     text="continue_with"
//                     width="700px"
//                     access_type="offline"
//                     prompt="consent"
//                     // type="icon"
//                     type="standard"
//                     theme="outline"
//                     size="large"
//                     shape="rectangular"
//                     scope="https://www.googleapis.com/auth/spreadsheets"
//                     // useOneTap={true}
//                   />
//                 </div> */}
//               </GoogleOAuthProvider>
//             </div>
//             <LoginSocialGoogle
//               client_id={
//                 import.meta.env.VITE_CLIENT_ID
//               }
//               scope="https://www.googleapis.com/auth/spreadsheets"
//               discoveryDocs="claims_supported"
//               access_type="offline"
//               prompt="consent"
//               onResolve={({ provider, data }) => {
//                 handleConnectGoogleTool(provider, data);
//               }}
//               onReject={(err) => {
//                 console.error("Error connecting google", err);
//               }}
//             >
//               Connect with google
//             </LoginSocialGoogle>
//           </button>

//           {/* Privacy Notice */}
//           <div className="mt-6 text-xs text-gray-500 flex items-center justify-center">
//             <FiShield className="mr-1" />
//             <span>
//               We only request access to your Sheets data. Your information is
//               secure and never shared.
//             </span>
//           </div>

//           {/* Help Link */}
//           <div className="mt-8">
//             <Link
//               href="#"
//               className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
//             >
//               Need help connecting? Contact support
//             </Link>
//           </div>
//         </div>
//       )}

//       {(selectedRow || selectedRow === 0) && (
//         <div className="fixed inset-0 bg-black/80 backdrop:blur-md z-[9999] overflow-auto">
//           <div className="max-w-5xl mx-auto p-8 bg-white shadow-xl rounded-xl mt-10">
//             <div className="flex items-center justify-between">
//               <h2 className="text-2xl font-bold text-gray-800">
//                 Detailed View
//               </h2>

//               <div className="text-right">
//                 <button
//                   onClick={() => setSelectedRow(null)}
//                   className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition"
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>

//             <div className="space-y-4 mt-8">
//               {headerRow &&
//                 headerRow?.length > 0 &&
//                 headerRow.map((headerLabel, index) => {
//                   if (notShowIndexContent.includes(index)) return null;

//                   const value = bodyData[selectedRow]?.[index] || "-";

//                   console.log(value);

//                   // Regex to match a phone number (basic international or local)
//                   const isPhoneNumber =
//                     typeof value === "string" &&
//                     /^p:[+]?[\d\s-]{7,20}$/.test(value.trim());

//                   return (
//                     <div
//                       key={headerLabel}
//                       className="grid grid-cols-2 gap-8 border-b pb-3"
//                     >
//                       <dt className="font-medium text-gray-600 break-words">
//                         {headerLabel}
//                       </dt>
//                       <dd className="text-gray-800 py-2 flex px-2 break-all font-bold bg-blue-50 rounded-md">
//                         {isPhoneNumber ? (
//                           <Link
//                             target="_blank"
//                             to={`tel:${value.replace("p:", "")}`}
//                             className="underline"
//                           >
//                             {value}
//                           </Link>
//                         ) : (
//                           value
//                         )}
//                       </dd>
//                     </div>
//                   );
//                 })}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdsLeadsUsingGoogleSheet;

// // Leads?.map((data, rowindex) => {
// //                 if (rowindex === 0) {
// //                   return (
// //                     <thead>
// //                       <tr className="tablerow bg-primary text-white">
// //                         {headerRow.map((headerLabel) => (
// //                           <th
// //                             className="w-auto px-2 py-3 border font-medium capitalize"
// //                             key={headerLabel}
// //                           >
// //                             {headerLabel}
// //                           </th>
// //                         ))}
// //                       </tr>
// //                     </thead>
// //                   );
// //                 } else {
// //                   return (
// //                     <tbody>
// //                       <tr>
// //                         {data.map((head, index) => {
// //                           const phoneRegex = /^p:\+?\d{10,15}$/i;
// //                           const isPhone = phoneRegex.test(head);
// //                           const isDate = Date.parse(head);

// //                           // const nameRegex = /^[a-zA-Z]+(?:\s[a-zA-Z]+)*$/;

// //                           if (isPhone) {
// //                             const phone = head.replace("p:", "");

// //                             return (
// //                               <td className="border border-gray-300">
// //                                 <Link
// //                                   className="w-auto px-2 py-2 outline-none  rounded-md text-black"
// //                                   target="_blank"
// //                                   to={`https://wa.me/${phone}?text=${encodeURIComponent(
// //                                     `Hello! ${""}👋\nWelcome to ${
// //                                       hotel?.Profile?.hotelName
// //                                     } 🌐\nHow can I assist you today?`
// //                                   )}`}
// //                                 >
// //                                   {head}
// //                                 </Link>
// //                               </td>
// //                             );
// //                           }

// //                           if (!isNaN(isDate)) {
// //                             const isToday =
// //                               new Date(head).toDateString() ===
// //                               new Date().toDateString();
// //                             console.log(isToday);
// //                             return (
// //                               <td className="w-full border border-gray-300 whitespace-nowrap">
// //                                 <p className="px-2 py-2">
// //                                   {new Date(head).toLocaleDateString("en-US", {
// //                                     day: "2-digit",
// //                                     month: "short",
// //                                     year: "numeric",
// //                                   })}
// //                                 </p>
// //                                 {/* <input
// //                                   className="w-auto px-2 py-2 outline-none  rounded-md text-black"
// //                                   type="text"
// //                                   value={new Date(head).toLocaleDateString(
// //                                     "en-US",
// //                                     {
// //                                       day: "2-digit",
// //                                       month: "short",
// //                                       year: "numeric",
// //                                     }
// //                                   )}
// //                                   onChange={(e) => {
// //                                     getColumn(
// //                                       `${alphabet[String(index)] +
// //                                       String(rowindex)
// //                                       }`,
// //                                       rowindex,
// //                                       index,
// //                                       e.target.value
// //                                     );
// //                                   }}
// //                                 /> */}
// //                               </td>
// //                             );
// //                           }

// //                           return (
// //                             <td className="w-full border border-gray-300 whitespace-nowrap">
// //                               <p className="w-auto px-2 py-2 outline-none  rounded-md text-black whitespace-nowrap">
// //                                 {head}
// //                               </p>
// //                               {/* <input
// //                                 className="w-auto px-2 py-2 outline-none  rounded-md text-black"
// //                                 type="text"
// //                                 value={head}
// //                                 onChange={(e) => {
// //                                   getColumn(
// //                                     `${
// //                                       alphabet[String(index)] + String(rowindex)
// //                                     }`,
// //                                     rowindex,
// //                                     index,
// //                                     e.target.value
// //                                   );
// //                                 }}
// //                               /> */}
// //                             </td>
// //                           );
// //                         })}
// //                       </tr>
// //                     </tbody>
// //                   );
// //                 }
// //               })

// /*
//         {sheetaccessToken !== "None" && (
//           <div className="flex justify-between bg-primary p-2 gap-5 items-center  text-white rounded-sm">
//             {sheetaccessToken !== "None" ? (
//               <div className="w-fit flex gap-2">
//                 <div className="pr-2 py-2 rounded-sm shadow-sm outline-none border border-gray-200 min-w-32">
//                   <select
//                     className="outline-none bg-transparent w-full px-4"
//                     id="spreadsheet"
//                     onChange={(event) =>
//                       ChangeSpreadsheetFetchData(event.target.value)
//                     }
//                   >
//                     {Spreadsheet.reverse().map((spread) => (
//                       <option
//                         key={spread.id}
//                         value={spread.id}
//                         className="py-4 text-gray-700"
//                       >
//                         {spread.Name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 <div className="pr-2 py-2 rounded-sm shadow-sm outline-none border border-gray-200">
//                   <select
//                     className="outline-none bg-transparent px-4"
//                     onChange={(event) =>
//                       ChangeSheetFetchData(event.target.value)
//                     }
//                   >
//                     {Sheets.map((sheet) => (
//                       <option
//                         key={sheet.properties.title}
//                         value={sheet.properties.title}
//                         className="text-gray-700"
//                       >
//                         {sheet.properties.title}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               </div>
//             ) : (
//               ""
//             )}

//             {sheetaccessToken !== "None" ? (
//               <div className="flex justify-end items-center gap-2">
//                 <input
//                   type="text"
//                   value={sheetName}
//                   onChange={(e) => {
//                     setSheetName(e.target.value);
//                   }}
//                   placeholder="Sheet Name"
//                   className="placeholder:text-gray-600  w-[14rem] py-2 px-2 outline-none bg-gray-200 border border-gray-300 rounded-sm text-black"
//                 />
//                 <input
//                   type="text"
//                   value={id}
//                   onChange={(e) => {
//                     setid(e.target.value);
//                   }}
//                   placeholder="Enter sheet Id or Url"
//                   className="placeholder:text-gray-600 w-[200px] py-2 px-2 outline-none bg-gray-200 border border-gray-300 rounded-sm text-black"
//                 />
//                 <button
//                   className=" bg-[#00C899] py-2 px-4 text-white rounded-full font-semibold"
//                   onClick={() => {
//                     AddSpreadSheet();
//                   }}
//                 >
//                   Add <span className="font-bold text-lg">+</span>
//                 </button>
//               </div>
//             ) : (
//               ""
//             )}
//           </div>
//         )} */
