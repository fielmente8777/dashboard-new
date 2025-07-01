import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { CiCirclePlus } from "react-icons/ci";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { GiBackwardTime } from "react-icons/gi";
import { IoSync } from "react-icons/io5";
import AuthContext from "../../context/DataContext";
import { BASE_URL, room_type_name } from "../../data/constant";
import {
  bulkUpdateInventory,
  bulkUpdatePrice,
  dateRangeInventory,
  dateRangePrice,
  getPriceAndInventory,
  inventoryManage,
  priceManage,
} from "../../services/api/bookingEngine";
import handleLocalStorage from "../../utils/handleLocalStorage";
import Loader from "../../components/Loader";
import { formatDate } from "../../utils/formateData";
// import { inventoryGetApi, priceGetApi } from '../../Api-helpers/Api';

const RoomsAndInventory = () => {
  const { baseUrl } = useContext(AuthContext);
  const [inventory, setInventory] = useState({});
  const [price, setPrice] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [showInventory, setShowInventory] = useState(true);
  const [showPrice, setShowPrice] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [prevDate, setprevDate] = useState();
  const [nextDate, setnextDate] = useState();
  const [inventoryDatas, setinventoryDatas] = useState(
    //   {
    //   Inventory: {
    //     1: {
    //       "2024-05-10": 2,
    //       "2024-05-11": 2,
    //       "2024-05-12": 2,
    //       "2024-05-13": 2,
    //       "2024-05-14": 2,
    //       "2024-05-15": 3,
    //       "2024-05-16": 2,
    //       "2024-05-17": 2,
    //     },
    //     2: {
    //       "2024-05-10": 2,
    //       "2024-05-11": 2,
    //       "2024-05-12": 2,
    //       "2024-05-13": 2,
    //       "2024-05-14": 4,
    //       "2024-05-15": 2,
    //       "2024-05-16": 2,
    //       "2024-05-17": 2,
    //     },
    //     3: {
    //       "2024-05-10": 2,
    //       "2024-05-11": 2,
    //       "2024-05-12": 2,
    //       "2024-05-13": 2,
    //       "2024-05-14": 4,
    //       "2024-05-15": 2,
    //       "2024-05-16": 2,
    //       "2024-05-17": 2,
    //     },
    //   },
    //   Status: true,
    //   next: "2024-05-17",
    //   prev: "2024-05-10",
    // }
  );

  const [priceDatas, setpriceDatas] = useState({
    Price: {
      1: {
        "2024-05-10": 2000,
        "2024-05-11": 2008,
        "2024-05-12": 2999,
        "2024-05-13": 2999,
        "2024-05-14": 2999,
        "2024-05-15": 3999,
        "2024-05-16": 2999,
        "2024-05-17": 2999,
      },
      2: {
        "2024-05-10": 2500,
        "2024-05-11": 2500,
        "2024-05-12": 2500,
        "2024-05-13": 2500,
        "2024-05-14": 4500,
        "2024-05-15": 2500,
        "2024-05-16": 2500,
        "2024-05-17": 2500,
      },
      3: {
        "2024-05-10": 2400,
        "2024-05-11": 2400,
        "2024-05-12": 2400,
        "2024-05-13": 2400,
        "2024-05-14": 4400,
        "2024-05-15": 2400,
        "2024-05-16": 2400,
        "2024-05-17": 2400,
      },
    },
    Status: true,
    next: "2024-05-17",
    prev: "2024-05-10",
  });

  const [priceData, setPriceData] = useState(priceDatas.Price);
  const [PriceBulkupdate, setPriceBulkupdate] = useState({});

  const [inventoryData, setInventoryData] = useState(inventoryDatas?.Inventory);
  const [InventoryBulkupdate, setInventoryBulkupdate] = useState({});
  const [isBulkUpdateLoading, setIsBulkUpdateLoading] = useState(false);

  const x = inventoryData && Object.keys(inventoryData);
  if (x?.length !== 0) {
    var dates = inventoryData && Object.keys(inventoryData[x[0]]);
  } else {
    var dates = [];
  }

  const getDayFromDate = (dateString) => {
    const dt = new Date(dateString);
    return dt.getDate();
  };

  const getDayOfWeek = (date) => {
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayIndex = new Date(date).getDay();
    return daysOfWeek[dayIndex];
  };

  const getMonthInWords = (dateString) => {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const dt = new Date(dateString);
    const monthIndex = dt.getMonth();
    return monthNames[monthIndex];
  };

  const getYearFromDate = (dateString) => {
    const yearIndex = new Date(dateString);
    const year = yearIndex.getFullYear();

    return year;
  };

  const handleAllClick = () => {
    setShowAll(true);
    setShowPrice(false);
    setShowInventory(false);
  };
  const handleInventoryClick = () => {
    setShowAll(false);
    setShowPrice(false);
    setShowInventory(true);
  };
  const handlePriceClick = () => {
    setShowAll(false);
    setShowInventory(false);
    setShowPrice(true);
  };

  const PriceUpdate = (value, roomtype, date) => {
    const updatedBulkPriceUpdate = { ...PriceBulkupdate };
    const updatePriceData = { ...priceData };

    if (!updatedBulkPriceUpdate[roomtype]) {
      updatedBulkPriceUpdate[roomtype] = {};
    }
    if (!updatePriceData[roomtype]) {
      updatePriceData[roomtype] = {};
    }

    updatedBulkPriceUpdate[roomtype][date] = value;
    updatePriceData[roomtype][date] = value;

    setPriceBulkupdate(updatedBulkPriceUpdate);
    setPriceData(updatePriceData);
    // console.log(updatedBulkPriceUpdate)
  };

  const InventoryUpdate = (value, roomtype, date) => {
    const updatedBulkPriceUpdate = { ...InventoryBulkupdate };
    const updatePriceData = { ...inventoryData };

    if (!updatedBulkPriceUpdate[roomtype]) {
      updatedBulkPriceUpdate[roomtype] = {};
    }
    if (!updatePriceData[roomtype]) {
      updatePriceData[roomtype] = {};
    }

    updatedBulkPriceUpdate[roomtype][date] = value;
    updatePriceData[roomtype][date] = value;

    setInventoryBulkupdate(updatedBulkPriceUpdate);
    // setInventoryData(updatePriceData)
    console.log(updatedBulkPriceUpdate);
  };

  const GetDataForDate = (date, key) => {
    if (key === "prev") {
      console.log("daaa", date);
      const currentDate = new Date(date);
      currentDate.setDate(currentDate.getDate() - 7); // go 7 days back
      const formattedDate = formatDate(currentDate);
      FetchDateRangePrice(formattedDate, key);
      FetchDateRangeInventory(formattedDate, key);
      setDate(formattedDate.toString());
      return;
    }

    setDate(date);
    FetchDateRangePrice(date, key);
    FetchDateRangeInventory(date, key);
  };

  const bulkupdateFunction = () => {
    if (showPrice) {
      BulkUpdatePrice(PriceBulkupdate);
    }
    if (showInventory) {
      BulkUpdateInventory(InventoryBulkupdate);
    }
  };

  const FetchInventoryManage = async () => {
    const token = handleLocalStorage("token");
    const hid = String(handleLocalStorage("hid"));
    const response = await inventoryManage(token, hid);
    if (response?.Status) {
      setinventoryDatas(response);
      setInventoryData(response?.Inventory);
      setnextDate(response?.next);
      setprevDate(response?.prev);
    }
  };

  const FetchPriceManage = async () => {
    const token = handleLocalStorage("token");
    const hid = String(handleLocalStorage("hid"));
    const response = await priceManage(token, hid);

    if (response?.Status) {
      setpriceDatas(response);
      setPriceData(response?.Prices);
    }
  };

  const FetchDateRangePrice = async (date, operation) => {
    const token = handleLocalStorage("token");
    const hid = String(handleLocalStorage("hid"));
    const dateRangePriceData = {
      operation: operation,
      hId: hid,
      date: date,
    };
    const response = await dateRangePrice(token, dateRangePriceData);
    // const response = await fetch(
    //   `${baseUrl}/price/getprice/all/nextprev/${localStorage.getItem(
    //     "engineUserToken"
    //   )}`,
    //   {
    //     method: "POST",
    //     headers: {
    //       Accept: "application/json, text/plain, /",
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({
    //       operation: operation,
    //       hId: localStorage.getItem("locationid"),
    //       date: date,
    //     }),
    //   }
    // );
    // const json1 = await response.json();
    // console.log(json1);
    if (response.Status) {
      setpriceDatas(response);
      setPriceData(response.Prices);
      setnextDate(response.next);
      setprevDate(response.prev);
    }
  };

  const FetchDateRangeInventory = async (date, operation) => {
    const token = handleLocalStorage("token");
    const hid = String(handleLocalStorage("hid"));
    const dateRangeInventoryData = {
      date: date,
      operation: operation,
    };

    const response = await dateRangeInventory(
      token,
      hid,
      dateRangeInventoryData
    );
    // const response = await fetch(
    //   `${baseUrl}/inventory/getinventory/all/nextprev/${localStorage.getItem(
    //     "engineUserToken"
    //   )}/${localStorage.getItem("locationid")}`,
    //   {
    //     method: "POST",
    //     headers: {
    //       Accept: "application/json, text/plain, /",
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({
    //       date: date,
    //       operation: operation,
    //     }),
    //   }
    // );
    // const json1 = await response.json();
    if (response.Status) {
      setinventoryDatas(response);
      setInventoryData(response.Inventory);
    }
  };

  const BulkUpdatePrice = async (bulkupdateData) => {
    setIsBulkUpdateLoading(true);
    const updatedBulkPriceData = {
      token: handleLocalStorage("token"),
      hId: String(handleLocalStorage("hid")),
      bulkprice: bulkupdateData,
    };
    const response = await bulkUpdatePrice(updatedBulkPriceData);
    if (response.Status) {
      FetchInventoryManage();
      FetchPriceManage();
    }
    setIsBulkUpdateLoading(false);
  };

  const BulkUpdateInventory = async (bulkupdateData) => {
    setIsBulkUpdateLoading(true);
    const updatedBulkInventoryData = {
      token: handleLocalStorage("token"),
      hId: String(handleLocalStorage("hid")),
      bulkinventory: bulkupdateData,
    };
    const response = await bulkUpdateInventory(updatedBulkInventoryData);

    if (response.Status) {
      FetchInventoryManage();
      FetchPriceManage();
    }
    setIsBulkUpdateLoading(false);
  };

  const getInventoryApi = async () => {
    const token = handleLocalStorage("token");
    const hid = handleLocalStorage("hid");
    const result = await getPriceAndInventory(token, hid);
    setInventory(result);
  };

  const isPreviousDisabled =
    prevDate ===
    formatDate(
      new Date().toLocaleDateString("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
    );

  useEffect(() => {
    getInventoryApi();
    FetchInventoryManage();
    FetchPriceManage();
  }, []);

  return (
    <div className="maxwidth mx-auto mt-4 bg-white p-4 cardShadow mb-10">
      <div className="flex justify-between max-md:px-2">
        <div className="inline-flex rounded-lg shadow-sm" role="group">
          {/* <button onClick={handleAllClick} type="button" className={`px-4 py-2 text-sm font-medium  rounded-s-lg   ${showAll === true ? "border border-orange-600 bg-orange-600 text-white" : "text-gray-900 bg-white border border-gray-200 hover:text-orange-600 hover:bg-neutral-100"} `}>
            All
          </button> */}
          <button
            onClick={handleInventoryClick}
            type="button"
            className={`px-4 py-2 text-sm font-medium  rounded-s-lg ${showInventory === true
              ? "border-t border-b border-primary bg-primary  text-white"
              : "text-gray-900 bg-white border-t border-b border-gray-200 hover:bg-neutral-100 hover:"
              }`}
          >
            Inventory
          </button>

          <button
            onClick={handlePriceClick}
            type="button"
            className={`px-4 py-2 text-sm font-medium  rounded-e-lg ${showPrice
              ? "border bg-primary border-primary text-white"
              : "text-gray-900 bg-white border border-gray-200 hover:bg-neutral-100 hover:text-orange-600 "
              } `}
          >
            Price
          </button>
        </div>
        {/* <div>
          <button className='px-4 py-1 text-sm font-medium text-zinc-700 bg-white border border-zinc-700 rounded-lg hover:bg-zinc-700 hover:text-white'><BsThreeDots size={22} /></button>
        </div> */}
      </div>

      <div className="relative overflow-x-auto mt-4">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 border border-gray-300">
          <thead className="text-xs text-gray-700 uppercase">
            <tr>
              <th
                scope="col"
                className="flex justify-between  gap-4 h-[64px] px-4 py-4 bg-gray-200"
              >
                <button className="px-4 text-sm font-medium  rounded-lg text-gray-900 bg-white hover:bg-orange-600 hover:text-white flex items-center gap-1">
                  <IoSync size={20} />
                  Sync
                </button>
                <button className="px-4 text-sm font-medium  rounded-lg  text-gray-900 bg-white hover:bg-orange-600 hover:text-white flex items-center gap-1">
                  <GiBackwardTime size={20} />
                  Logs
                </button>
              </th>

              <th
                scope="col"
                className="px-4  py-3 bg-gray-100 w-full mx-auto text-center border-t border-r border-b border-gray-300"
              >
                <div className="flex justify-between">
                  <div className="w-[33.33%] max-md:hidden"></div>
                  <div className="w-[33.33%] max-md:w-[66.66%] flex gap-4 md:justify-center items-center">
                    <button
                      disabled={isPreviousDisabled}
                      onClick={(e) => {
                        if (!isPreviousDisabled)
                          GetDataForDate(prevDate, "prev");
                      }}
                      className={`${isPreviousDisabled
                        ? "cursor-not-allowed opacity-65"
                        : "cursor-pointer  text-primary duration-300 hover:bg-gradient-to-r from-primary/80 to-green-600 hover:text-white"
                        } me-1 p-2 bg-white border rounded-full `}
                    >
                      <FaArrowLeft />
                    </button>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => {
                        GetDataForDate(e.target.value, "next");
                      }}
                      className="border py-2 px-4 bg-white  rounded-md"
                    />

                    <button
                      onClick={(e) => {
                        GetDataForDate(nextDate, "next");
                      }}
                      className="ms-1 p-2 bg-white border text-primary duration-300 hover:bg-gradient-to-r from-primary/80 to-green-600 hover:text-white rounded-full "
                    >
                      <FaArrowRight />
                    </button>
                  </div>
                  <div className="w-[33.33%] flex justify-end items-center">
                    <button
                      onClick={() => {
                        bulkupdateFunction();
                      }}
                      className="px-4 py-2 text-sm font-medium  rounded-lg  text-gray-900 bg-white border hover:bg-orange-600 duration-300 hover:text-white flex items-center gap-1"
                    >
                      Bulk Update{" "}
                      {isBulkUpdateLoading && <Loader color="#262524" />}
                    </button>
                  </div>
                </div>
              </th>
            </tr>
          </thead>

          <tbody>
            <tr className="bg-white border-b border-gray-300 flex-grow">
              <th
                scope="row"
                className="px-4 py-4 font-medium text-gray-600 bg-gray-200 whitespace-nowrap w-[16rem]"
              >
                <span className="text-2xl font-bold">Rooms</span>
              </th>

              <td className="w-full flex justify-between">
                {dates?.map((date, index) => (
                  <div
                    key={index}
                    className="flex flex-col  w-full text-center border-r border-gray-300"
                  >
                    <span>{getMonthInWords(date)}</span>
                    <span>{getYearFromDate(date)}</span>
                    <span>{getDayOfWeek(date)}</span>
                    <span className="bg-zinc-500 text-white max-md:px-7 ">
                      {getDayFromDate(date)}
                    </span>
                  </div>
                ))}
              </td>
            </tr>

            {showInventory && (
              <>
                {inventoryData &&
                  Object.keys(inventoryData)?.length > 0 &&
                  Object?.keys(inventoryData)?.map((item, itemIndex) => (
                    <tr
                      key={itemIndex}
                      className="bg-white border-t border-gray-300"
                    >
                      <th className="px-4 font-medium text-gray-600 bg-gray-200 w-[16rem] py-2">
                        <div className="gap-4 flex flex-col">
                          <span className="font-bold text-md uppercase">
                            {room_type_name[item]}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <CiCirclePlus fontSize={20} fontWeight={500} />
                              <span className="text-bold">Inventory</span>
                            </div>
                            <div className="ms-7">
                              <span className="font-light border-b-2 border-gray-400">
                                Multi Update
                              </span>
                            </div>
                          </div>
                        </div>
                      </th>

                      <td className="w-full flex">
                        {dates?.map((date) => (
                          <div
                            key={date}
                            className="flex flex-col justify-end py-2 px-[10px] w-full h-full border-l-2 border-white"
                          >
                            <span className="bg-gradient-to-r from-primary/80 to-green-600 h-[8px] rounded-md mb-[3px] mt-6"></span>
                            <span className="border-2 border-gray-300 rounded-md text-center overflow-hidden">
                              <input
                                type="text"
                                value={inventoryData[item][date]}
                                onChange={(e) =>
                                  InventoryUpdate(e.target.value, item, date)
                                }
                                className="w-[100%]  py-1 text-center outline-none  h-[100%] "
                              />
                            </span>
                          </div>
                        ))}
                      </td>
                    </tr>
                  ))}
              </>
            )}

            {showPrice && (
              <>
                {Object?.keys(priceData)?.map((item, itemIndex) => (
                  <tr
                    key={itemIndex}
                    className="bg-white border-t border-gray-300"
                  >
                    <th className="px-4 font-medium text-zinc-700 bg-gray-200 w-[16rem] py-2">
                      <div className="gap-4 flex flex-col">
                        <span className="font-extrabold text-1xl uppercase">
                          {room_type_name[item]}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <CiCirclePlus fontSize={20} fontWeight={500} />
                            <span className="text-bold">Price</span>
                          </div>
                          <div className="ms-7">
                            <span className="font-light border-b-2 border-gray-400">
                              Multi Update
                            </span>
                          </div>
                        </div>
                      </div>
                    </th>

                    <td className="w-full flex">
                      {dates?.map((date) => (
                        <div
                          key={date}
                          className="flex flex-col justify-end py-2 px-[10px] w-full h-full border-l-2 border-white"
                        >
                          <span className="bg-gradient-to-r from-primary/80 to-green-600 h-[8px] rounded-md mb-[3px] mt-6"></span>
                          <span className="border-2 border-gray-300 rounded-md text-center overflow-hidden">
                            <input
                              type="text"
                              value={priceData[item][date]}
                              onChange={(e) =>
                                PriceUpdate(e.target.value, item, date)
                              }
                              className="w-[100%] py-1 text-center outline-none  h-[100%] "
                            />
                          </span>
                        </div>
                      ))}
                    </td>
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* {
        showAll && <>
          <InventoryTable />
        </>
      }
      {
        showInventory && <>
          <InventoryTable />
        </>
      }
      {
        showPrice && <>
          <PriceTable />
        </>
      } */}
    </div>
  );
};

export default RoomsAndInventory;

// const response = await fetch(
//   `${BASE_URL}/price/getprice/all/${localStorage.getItem(
//     "token"
//   )}/${localStorage.getItem("hid")}`,
//   {
//     method: "GET",
//     headers: {
//       Accept: "application/json, text/plain, /",
//       "Content-Type": "application/json",
//     },
//   }
// );
