import React, { useContext, useEffect, useState } from "react";
// import { LoginSocialGoogle } from "reactjs-social-login";
import { LoginSocialGoogle } from "reactjs-social-login";
import { BASE_URL } from "../../data/constant";
import AdLeadsAnalytics from "./AdLeadsAnalytics";
import DataContext from "../../context/DataContext";
import {
  FiAlertTriangle,
  FiDatabase,
  FiShield,
  FiTrendingUp,
} from "react-icons/fi";
import { FaGoogle } from "react-icons/fa";
import { TbAlertTriangle } from "react-icons/tb";
import { IoMdCheckmarkCircle } from "react-icons/io";
import { FaPowerOff } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

// import AuthContext from '../../Context/AuthProvider';

const AdsLeadsUsingGoogleSheet = () => {
  const { Leads, setLeads } = useContext(DataContext);
  const [Spreadsheet, setSpreadsheet] = useState([]);
  const [id, setid] = useState("");
  const [sheetName, setSheetName] = useState("");
  const [Sheets, setSheets] = useState([]);
  // const [Leads, setLeads] = useState([]);
  const [sheetaccessToken, setsheetaccessToken] = useState("None");
  const [sheetid, setsheetid] = useState("None");
  const [tokenExpire, settokenExpire] = useState(false);
  const [sheetNamess, setsheetNamess] = useState("");

  const {
    user: hotel,
    authUser,
    hid,
    loading,
    isAuthLoading,
  } = useSelector((state) => state.userProfile);

  function getSheetId(input) {
    // Check if the input is a link
    const linkMatch = input.match(/\/spreadsheets\/d\/(.+?)\//);

    if (linkMatch && linkMatch[1]) {
      // If it's a link, extract sheet ID from the link
      // console.log(linkMatch[1])
      return linkMatch[1];
    } else {
      // If it's not a link, assume it's already a sheet ID
      // console.log(input)
      return input;
    }
  }
  const ChangeSpreadsheetFetchData = (spreadsheetid) => {
    // console.log(spreadsheetid);
    setsheetid(spreadsheetid);
    FetchSheetofSpreadSheet(spreadsheetid);
  };
  const ChangeSheetFetchData = (sheetname) => {
    const spreadid = document.getElementById("spreadsheet").value;
    setsheetNamess(sheetname);
    setsheetid(spreadid);
    FetchSheetsDataofSpreadSheet(spreadid, sheetname);
  };

  const FetchAccessTokenFromDb = async () => {
    try {
      // console.log("jsfhkdhbkhksf");
      const response = await fetch(
        `${BASE_URL}/leadmanagement/getGoogltoken/${localStorage.getItem(
          "token"
        )}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json, text/plain, /",
            "Content-Type": "application/json",
          },
        }
      );
      const json = await response.json();
      // console.log(json);
      if (json.Status === true) {
        setsheetaccessToken(json.Message);
      }
    } catch {
      setsheetaccessToken("None");
    }
  };
  const FetchSheetsDataofSpreadSheet = async (sheetid, sheetname) => {
    try {
      const response = await fetch(
        `${BASE_URL}/leadmanagement/getSheetDetailLead/${localStorage.getItem(
          "token"
        )}/${sheetid}/${sheetname}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json, text/plain, /",
            "Content-Type": "application/json",
          },
        }
      );
      const json = await response.json();
      // console.log(json);
      if (json.Status) {
        setsheetNamess(sheetname);
        setsheetid(sheetid);
        setLeads(json.Message.values);
        settokenExpire(false);
      } else {
        setLeads([]);
        settokenExpire(true);
      }
    } catch {
      // alert("Some Problem update token");
    }
  };
  const updateAccessTokenDb = async (gtoken, refreshToken) => {
    try {
      const response = await fetch(
        `${BASE_URL}/leadmanagement/updategoogletokenleadmanagement`,
        {
          method: "POST",
          headers: {
            Accept: "application/json, text/plain, /",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: localStorage.getItem("token"),
            googleToken: gtoken,
            refreshToken: refreshToken,
          }),
        }
      );

      const json = await response.json();
      console.log(json)

      FetchSpreadSheetFromDb();
    } catch {
      // alert("Some Problem update token");
    }
  };
  const FetchSheetofSpreadSheet = async (sheetid) => {
    // console.log("ncxzxnjkndsjjk", sheetid);
    try {
      const response = await fetch(
        `${BASE_URL}/leadmanagement/getsheetName/${sheetid}/${localStorage.getItem(
          "token"
        )}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json, text/plain, /",
            "Content-Type": "application/json",
          },
        }
      );
      // console.log(response);
      const json = await response.json();
      // console.log(json);
      if (json.Status) {
        // console.log("vchghjklhjgfvxc", json.sheets);
        setSheets(json.sheets);
        if (json.sheets.length > 0) {
          setsheetid(json.sheets[0]);
          FetchSheetsDataofSpreadSheet(
            sheetid,
            json.sheets[0].properties.title
          );
        }
      } else {
        settokenExpire(true);
        setSheets([]);
      }
    } catch (error) {
      // console.log("Error fetching sheets:", error);
      setSheets([]);
      setsheetaccessToken("None");
      updateAccessTokenDb("None");
      // alert("Some Problem update token getsheetname");
    }
  };
  const FetchSpreadSheetFromDb = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/leadmanagement/getSheetName/${localStorage.getItem(
          "token"
        )}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json, text/plain, /",
            "Content-Type": "application/json",
          },
        }
      );
      const json = await response.json();
      // console.log(json);
      if (json.Status) {
        setSpreadsheet(json.data);
        if (json.data.length > 0) {
          setsheetid(json.data[0].id);
          FetchSheetofSpreadSheet(json.data[0].id);
        }
      }
    } catch {
      // alert("Some Problem update token");
    }
  };
  const AddSpreadSheet = () => {
    if (id === "" || sheetName === "") {
      alert("Sheet Not Added");
    } else {
      const sheetuid = getSheetId(id);
      alert("Sheet Added");
      AddSpreadSheetToDb(sheetuid, sheetName);
      setSheetName("");
      setid("");
    }
  };

  const handleConnectGoogleTool = async (provider, data) => {
    try {
      // console.log(data);
      const tokenEndpoint = "https://oauth2.googleapis.com/token";
      const response = await fetch(tokenEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          code: data.code,
          client_id:
            "737012285391-mvm0kikmmfqm8vu8hr3lmcc39lb8blj2.apps.googleusercontent.com",
          client_secret: "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",
          redirect_uri: window.location.origin,
          grant_type: "authorization_code",
        }),
      });

      const tokenData = await response.json();
      // console.log("Token Data:", tokenData.access_token);
      console.log("Token Data:", tokenData);
      const accessToken = tokenData.access_token; // <-- 🟡 important
      const refreshToken = tokenData.refresh_token; // <-- 🟡 important

      setsheetaccessToken(accessToken);
      updateAccessTokenDb(accessToken, refreshToken);

      if (Spreadsheet.length != 0) {
        FetchSheetofSpreadSheet(Spreadsheet[0].id);
      }
    } catch (error) {
      console.error("Google login error:", error);
      updateAccessTokenDb("None");
    }
  };

  const reconnect = () => {
    setsheetaccessToken("None");
    updateAccessTokenDb("None");
    settokenExpire(true);
  };

  useEffect(() => {
    FetchAccessTokenFromDb();
    FetchSpreadSheetFromDb();
  }, []);

  // console.log("sheetaccessToken", sheetaccessToken);

  const [alphabet, setalphabet] = useState({
    0: "A",
    1: "B",
    2: "C",
    3: "D",
    4: "E",
    5: "F",
    6: "G",
    7: "H",
    8: "I",
    9: "J",
    10: "K",
    11: "L",
    12: "M",
    13: "N",
    14: "O",
    15: "P",
    16: "Q",
    17: "R",
    18: "S",
    19: "T",
    20: "U",
    21: "V",
    22: "W",
    23: "X",
    24: "Y",
    25: "Z",
  });

  const getColumn = (column, rowindex, columnindex, newContent) => {
    // alert(column)
    setLeads((prevData) => {
      const updatedState = [...prevData];
      updatedState[rowindex][columnindex] = newContent;
      return updatedState;
    });
    // alert(sheetid)
    // updateSheetData()
  };

  const updateSheetData = async () => {
    const sheet = sheetid;
    alert(sheet);
    try {
      const response = await fetch(
        `${BASE_URL}/leadmanagement/updateSheet/${localStorage.getItem(
          "token"
        )}/${sheet}/${sheetNamess}`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json, text/plain, /",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rowstart: "1",
            rowend: String(Leads.length + 1),
            colstart: "A",
            colend: "Z",
            values: Leads,
          }),
        }
      );

      const json = await response.json();
      // console.log(json);
      FetchSheetsDataofSpreadSheet(sheetid, sheetNamess);
    } catch {
      alert("Some Problem update token");
    }
  };

  const AddSpreadSheetToDb = async (sheetid, sheetname) => {
    try {
      const response = await fetch(`${BASE_URL}/leadmanagement/addSheetName`, {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, /",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: localStorage.getItem("token"),
          hId: localStorage.getItem("hid"),
          spreadSheetId: sheetid,
          spreadSheetName: sheetname,
        }),
      });

      const json = await response.json();
      updateAccessTokenDb(sheetaccessToken);
      FetchSpreadSheetFromDb();
    } catch {
      // alert("Some Problem update token");
    }
  };

  return (
    <div className="bg-white">
      <div className="py-4">
        <div className="flex justify-between gap-2 border-b-2 pb-2 w-full px-2 items-center mb-4">
          {/* {sheetaccessToken !== "None" && (
            <div className="rounded-full flex items-center gap-1 text-green-800 border px-3 py-2 border-gray-500 shadow-md">
              <p className="font-semibold">Connected</p>

              <span className="mt-[2px]">
                <IoMdCheckmarkCircle />
              </span>
            </div>
          )} */}

          <div>

            {sheetaccessToken !== "None" && !tokenExpire && <p className="font-medium text-lg  text-gray-500">
              {Spreadsheet[0]?.Name}

            </p>
            }


            {/* {Spreadsheet.reverse().map((spread) => (
              <option
                key={spread.id}
                value={spread.id}
                className="py-4 text-gray-700"
              >
                {spread.Name}
              </option>
            ))} */}

          </div>

          {sheetaccessToken !== "None" && tokenExpire ? (
            <button
              className="bg-yellow-400 font-medium px-4 py-2 rounded-full text-gray-800 flex items-center gap-1"
              onClick={() => {
                reconnect();
              }}
            >
              Reconnect{" "}
              <span className="mt-[2px]">
                <FaPowerOff />
              </span>
            </button>
          ) : sheetaccessToken !== "None" && !tokenExpire ? (
            <button
              className=" bg-green-600 flex justify-center items-center gap-1 px-4 py-2 font-medium text-white rounded-full"
            // onClick={() => {
            //   updateSheetData();
            // }}
            >
              <p className="h-3 w-3 rounded-full bg-red-400 animate-pulse"></p>Connected
            </button>
          ) : (
            ""
          )}
        </div>
        {/* 
        {sheetaccessToken !== "None" && (
          <div className="flex justify-between bg-primary p-2 gap-5 items-center  text-white rounded-sm">
            {sheetaccessToken !== "None" ? (
              <div className="w-fit flex gap-2">
                <div className="pr-2 py-2 rounded-sm shadow-sm outline-none border border-gray-200 min-w-32">
                  <select
                    className="outline-none bg-transparent w-full px-4"
                    id="spreadsheet"
                    onChange={(event) =>
                      ChangeSpreadsheetFetchData(event.target.value)
                    }
                  >
                    {Spreadsheet.reverse().map((spread) => (
                      <option
                        key={spread.id}
                        value={spread.id}
                        className="py-4 text-gray-700"
                      >
                        {spread.Name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pr-2 py-2 rounded-sm shadow-sm outline-none border border-gray-200">
                  <select
                    className="outline-none bg-transparent px-4"
                    onChange={(event) =>
                      ChangeSheetFetchData(event.target.value)
                    }
                  >
                    {Sheets.map((sheet) => (
                      <option
                        key={sheet.properties.title}
                        value={sheet.properties.title}
                        className="text-gray-700"
                      >
                        {sheet.properties.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              ""
            )}

            {sheetaccessToken !== "None" ? (
              <div className="flex justify-end items-center gap-2">
                <input
                  type="text"
                  value={sheetName}
                  onChange={(e) => {
                    setSheetName(e.target.value);
                  }}
                  placeholder="Sheet Name"
                  className="placeholder:text-gray-600  w-[14rem] py-2 px-2 outline-none bg-gray-200 border border-gray-300 rounded-sm text-black"
                />
                <input
                  type="text"
                  value={id}
                  onChange={(e) => {
                    setid(e.target.value);
                  }}
                  placeholder="Enter sheet Id or Url"
                  className="placeholder:text-gray-600 w-[200px] py-2 px-2 outline-none bg-gray-200 border border-gray-300 rounded-sm text-black"
                />
                <button
                  className=" bg-[#00C899] py-2 px-4 text-white rounded-full font-semibold"
                  onClick={() => {
                    AddSpreadSheet();
                  }}
                >
                  Add <span className="font-bold text-lg">+</span>
                </button>
              </div>
            ) : (
              ""
            )}
          </div>
        )} */}
      </div>

      {sheetaccessToken !== "None" ? (
        <div className="h-full w-full overflow-scroll">
          {Leads.length > 0 ? (
            <table className="border bg-white ">
              {Leads.map((data, rowindex) => {
                if (rowindex === 0) {
                  return (
                    <thead>
                      <tr className="tablerow bg-primary text-white">
                        {data.map((headerLabel) => (
                          <th
                            className="w-auto px-2 py-3 border font-medium capitalize"
                            key={headerLabel}
                          >
                            {headerLabel}
                          </th>
                        ))}
                      </tr>
                    </thead>
                  );
                } else {
                  return (
                    <tbody>
                      <tr>
                        {data.map((head, index) => {
                          const phoneRegex = /^p:\+?\d{10,15}$/i;
                          const isPhone = phoneRegex.test(head);
                          const isDate = Date.parse(head);

                          // const nameRegex = /^[a-zA-Z]+(?:\s[a-zA-Z]+)*$/;

                          if (isPhone) {
                            const phone = head.replace("p:", "");

                            return (
                              <td className="border border-gray-300">
                                <Link
                                  className="w-auto px-2 py-2 outline-none  rounded-md text-black"
                                  target="_blank"
                                  to={`https://wa.me/${phone}?text=${encodeURIComponent(
                                    `Hello! ${""}👋\nWelcome to ${hotel?.Profile?.hotelName
                                    } 🌐\nHow can I assist you today?`
                                  )}`}
                                >
                                  {head}
                                </Link>
                              </td>
                            );
                          }

                          if (!isNaN(isDate)) {
                            return (
                              <td className="w-full border border-gray-300 whitespace-nowrap">
                                <p className="px-2 py-2">
                                  {new Date(head).toLocaleDateString(
                                    "en-US",
                                    {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    }
                                  )}
                                </p>
                                {/* <input
                                  className="w-auto px-2 py-2 outline-none  rounded-md text-black"
                                  type="text"
                                  value={new Date(head).toLocaleDateString(
                                    "en-US",
                                    {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    }
                                  )}
                                  onChange={(e) => {
                                    getColumn(
                                      `${alphabet[String(index)] +
                                      String(rowindex)
                                      }`,
                                      rowindex,
                                      index,
                                      e.target.value
                                    );
                                  }}
                                /> */}
                              </td>
                            );
                          }

                          return (
                            <td className="w-full border border-gray-300 whitespace-nowrap">
                              <p className="w-auto px-2 py-2 outline-none  rounded-md text-black whitespace-nowrap">
                                {head}
                              </p>
                              {/* <input
                                className="w-auto px-2 py-2 outline-none  rounded-md text-black"
                                type="text"
                                value={head}
                                onChange={(e) => {
                                  getColumn(
                                    `${
                                      alphabet[String(index)] + String(rowindex)
                                    }`,
                                    rowindex,
                                    index,
                                    e.target.value
                                  );
                                }}
                              /> */}
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  );
                }
              })}
            </table>
          ) : (
            <div className="flex justify-center items-center h-[calc(100vh-30vh)]">
              <h2 className="text-3xl text-gray-300">Opps! Data Not Found!</h2>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full bg-white cardShadow overflow-hidden p-8  text-center">
          {/* Header */}
          <div className="mb-8">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <TbAlertTriangle className="text-red-500 text-3xl" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Google Connection Required
            </h1>
            <p className="text-gray-600">
              Connect your Google account to access Sheets data and analytics
            </p>
          </div>

          {/* Benefits Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              What you'll get with Google connection:
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg flex items-start">
                <FiDatabase className="text-blue-500 text-xl mt-1 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-800">
                    Real-time Data Sync
                  </h3>
                  <p className="text-sm text-gray-600">
                    Automatically sync with your Google Sheets
                  </p>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg flex items-start">
                <FiTrendingUp className="text-green-500 text-xl mt-1 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-800">
                    Advanced Analytics
                  </h3>
                  <p className="text-sm text-gray-600">
                    Unlock powerful visualization tools
                  </p>
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg flex items-start">
                <svg
                  className="text-purple-500 text-xl mt-1 mr-3 w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
                <div>
                  <h3 className="font-medium text-gray-800">
                    Dashboard Features
                  </h3>
                  <p className="text-sm text-gray-600">
                    Access all reporting capabilities
                  </p>
                </div>
              </div>
              <div className="bg-amber-50 p-4 rounded-lg flex items-start">
                <FiShield className="text-amber-500 text-xl mt-1 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-800">
                    Secure Connection
                  </h3>
                  <p className="text-sm text-gray-600">
                    OAuth 2.0 protected authorization
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Connection Button */}
          <button className="w-full max-w-xs mx-auto bg-white border border-gray-300 rounded-lg py-3 px-6 flex items-center justify-center text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm hover:shadow-md">
            <FaGoogle className="text-xl mr-3" />
            <LoginSocialGoogle
              client_id="737012285391-mvm0kikmmfqm8vu8hr3lmcc39lb8blj2.apps.googleusercontent.com"
              scope="https://www.googleapis.com/auth/spreadsheets"
              discoveryDocs="claims_supported"
              access_type="offline"
              prompt="consent"
              onResolve={({ provider, data }) => {
                handleConnectGoogleTool(provider, data);
              }}
              onReject={(err) => {
                console.log("error");
                console.log(err);
              }}
            >
              Connect with google
            </LoginSocialGoogle>
          </button>

          {/* Privacy Notice */}
          <div className="mt-6 text-xs text-gray-500 flex items-center justify-center">
            <FiShield className="mr-1" />
            <span>
              We only request access to your Sheets data. Your information is
              secure and never shared.
            </span>
          </div>

          {/* Help Link */}
          <div className="mt-8">
            <Link
              href="#"
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              Need help connecting? Contact support
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdsLeadsUsingGoogleSheet;
