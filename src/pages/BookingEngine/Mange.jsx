import axios from "axios";
import React, { useContext, useEffect, useState } from 'react';
import { CiCirclePlus } from "react-icons/ci";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { GiBackwardTime } from "react-icons/gi";
import { IoSync } from "react-icons/io5";
import AuthContext from '../../context/AuthProvider';
// import { inventoryGetApi, priceGetApi } from '../../Api-helpers/Api';

const Mange = () => {
  const { showAll, setShowAll, showInventory, setShowInventory, showPrice, setShowPrice,baseUrl } = useContext(AuthContext)
  const [inventory, setInventory] = useState({})
  const [price, setPrice] = useState([])
  ;
  const getInventoryApi = async() => {
    const res = await axios.get("http://127.0.0.1:5000/inventory/getinventory/all/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiZjllYzIxNDItNmM0MS00OGRlLWExYjYtNGNlZWY2ZmRjYTc3IiwiaWQiOiIyYjk1Y2UzZi03MTYyLTRhM2QtYTAwNi1jYWIwOGE1OTZlZWEiLCJleHAiOjE3MTg1NTc0ODQuMTI0Mjc5fQ.la20f4IfFiBXOyD_QKFIXrWNfAzdEBSkL4JE72CloAA/95291122")
    const result = res.data;
    setInventory(result);
  }
  useEffect(() => {
      getInventoryApi();
  }, []);
  // console.log("inventory", inventory.Inventory?.["1"]);

  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today)
  const [prevDate,setprevDate] = useState()
  const [nextDate,setnextDate] = useState()

  const [inventoryDatas,setinventoryDatas] = useState({
    "Inventory": {
      "1": {
        "2024-05-10": 2,
        "2024-05-11": 2,
        "2024-05-12": 2,
        "2024-05-13": 2,
        "2024-05-14": 2,
        "2024-05-15": 3,
        "2024-05-16": 2,
        "2024-05-17": 2
      },
      "2": {
        "2024-05-10": 2,
        "2024-05-11": 2,
        "2024-05-12": 2,
        "2024-05-13": 2,
        "2024-05-14": 4,
        "2024-05-15": 2,
        "2024-05-16": 2,
        "2024-05-17": 2
      },
      "3": {
        "2024-05-10": 2,
        "2024-05-11": 2,
        "2024-05-12": 2,
        "2024-05-13": 2,
        "2024-05-14": 4,
        "2024-05-15": 2,
        "2024-05-16": 2,
        "2024-05-17": 2
      }
    },
    "Status": true,
    "next": "2024-05-17",
    "prev": "2024-05-10"
  })
  
  // console.log("inventory-datas", inventoryDatas.Inventory["1"]);
  const [priceDatas,setpriceDatas] = useState({
    "Price": {
      "1": {
        "2024-05-10": 2000,
        "2024-05-11": 2008,
        "2024-05-12": 2999,
        "2024-05-13": 2999,
        "2024-05-14": 2999,
        "2024-05-15": 3999,
        "2024-05-16": 2999,
        "2024-05-17": 2999
      },
      "2": {
        "2024-05-10": 2500,
        "2024-05-11": 2500,
        "2024-05-12": 2500,
        "2024-05-13": 2500,
        "2024-05-14": 4500,
        "2024-05-15": 2500,
        "2024-05-16": 2500,
        "2024-05-17": 2500
      },
      "3": {
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
    "Status": true,
    "next": "2024-05-17",
    "prev": "2024-05-10"
  })

  const [priceData, setPriceData] = useState(priceDatas.Price)
  const [PriceBulkupdate, setPriceBulkupdate] = useState({})

  const [inventoryData, setInventoryData] = useState(inventoryDatas.Inventory)
  const [InventoryBulkupdate, setInventoryBulkupdate] = useState({})
  // console.log(inventoryData);

  const x = Object.keys(inventoryData);
  if(x.length !== 0) {
    var dates = Object.keys(inventoryData[x[0]])
    
  }
  else{
    var dates = []
  }
  

  const getDayFromDate = (dateString) => {
    const dt = new Date(dateString);
    return dt.getDate();
  }

  const getDayOfWeek = (date) => {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayIndex = new Date(date).getDay();
    return daysOfWeek[dayIndex];
  };


  const getMonthInWords = (dateString) => {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const dt = new Date(dateString);
    const monthIndex = dt.getMonth();
    return monthNames[monthIndex];
  };

  const getYearFromDate = (dateString) => {
    const yearIndex = new Date(dateString)
    const year = yearIndex.getFullYear();

    return year;
  }


  const handleAllClick = () => {
    setShowAll(true)
    setShowPrice(false);
    setShowInventory(false)
  }
  const handleInventoryClick = () => {
    setShowAll(false)
    setShowPrice(false);
    setShowInventory(true)
  }
  const handlePriceClick = () => {
    setShowAll(false)
    setShowInventory(false)
    setShowPrice(true);
  }

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



    setPriceBulkupdate(updatedBulkPriceUpdate)
    setPriceData(updatePriceData)
    // console.log(updatedBulkPriceUpdate)
  }

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



    setInventoryBulkupdate(updatedBulkPriceUpdate)
    // setInventoryData(updatePriceData)
    console.log(updatedBulkPriceUpdate)
  }


  const GetDataForDate = (date, key) => {
    FetchDateRangePrice(date,key)
    FetchDateRangeInventory(date,key)
  }

  const bulkupdateFunction = () => {
    // alert("Bulk Update")
    if (showPrice) {
      // console.log(PriceBulkupdate)
      BulkUpdatePrice(PriceBulkupdate)
    }
    if (showInventory) {
      BulkUpdateInventory(InventoryBulkupdate)
      
    }

  }

  const FetchInventoryManage=async()=>{
    const response = await fetch(`${baseUrl}/inventory/getinventory/all/${localStorage.getItem("engineUserToken")}/${localStorage.getItem("locationid")}`,
            {
              method: "GET",
              headers: {
                Accept: "application/json, text/plain, /",
                "Content-Type": "application/json",
              },
            }
        );
      
        const json = await response.json();
        // console.log(json)
        if(json.Status){
            setinventoryDatas(json)
            setInventoryData(json.Inventory)
            setnextDate(json.next)
            setprevDate(json.prev)
        }

    
  }

  const FetchPriceManage=async()=>{
    const response = await fetch(`${baseUrl}/price/getprice/all/${localStorage.getItem("engineUserToken")}/${localStorage.getItem("locationid")}`,
            {
              method: "GET",
              headers: {
                Accept: "application/json, text/plain, /",
                "Content-Type": "application/json",
              },
            }
        );
      
        const json = await response.json();
        // console.log(json)
        if(json.Status){
          setpriceDatas(json)
          setPriceData(json.Prices)
      }

    
  }

  const FetchDateRangePrice = async(date,operation)=>{
    const response = await fetch(`${baseUrl}/price/getprice/all/nextprev/${localStorage.getItem("engineUserToken")}`, {
      method: "POST",
      headers: {
        Accept: "application/json, text/plain, /",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "operation":operation,
        "hId":localStorage.getItem("locationid"),
        "date":date
    }),
    });
    const json1 = await response.json()
    console.log(json1)
    if(json1.Status){
        setpriceDatas(json1)
        setPriceData(json1.Prices)
        setDate(date)
        setnextDate(json1.next)
        setprevDate(json1.prev)
    }
  }

  const FetchDateRangeInventory = async(date,operation)=>{
    const response = await fetch(`${baseUrl}/inventory/getinventory/all/nextprev/${localStorage.getItem("engineUserToken")}/${localStorage.getItem("locationid")}`, {
      method: "POST",
      headers: {
        Accept: "application/json, text/plain, /",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "date":date,
        "operation":operation
      }),
    });
    const json1 = await response.json()
    console.log(json1)
    if(json1.Status){
        setinventoryDatas(json1)
        setInventoryData(json1.Inventory)
    }
  }

  const BulkUpdatePrice = async(bulkupdateData)=>{
    const response = await fetch(`${baseUrl}/price/update/bulkprice`, {
      method: "POST",
      headers: {
        Accept: "application/json, text/plain, /",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "token":localStorage.getItem("engineUserToken"),
        "hId":localStorage.getItem("locationid"),
        "bulkprice":bulkupdateData
    }),
    });
    const json1 = await response.json()
    console.log(json1)
    if(json1.Status){
      FetchInventoryManage()
      FetchPriceManage()
    }
  }

  const BulkUpdateInventory = async(bulkupdateData)=>{
    const response = await fetch(`${baseUrl}/inventory/update/bulk/inventory`, {
      method: "POST",
      headers: {
        Accept: "application/json, text/plain, /",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "token":localStorage.getItem("engineUserToken"),
        "hId":localStorage.getItem("locationid"),
        "bulkinventory":bulkupdateData
    }),
    });
    const json1 = await response.json()
    console.log(json1)
    if(json1.Status){
      FetchInventoryManage()
      FetchPriceManage()
    }
  }

  useEffect(()=>{
    FetchInventoryManage()
    FetchPriceManage()
  },[])

  return (
    <div className='maxwidth mx-auto mt-4 md:px-2'>
      <div className='flex justify-between max-md:px-2'>
        <div class="inline-flex rounded-lg shadow-sm" role="group">
          {/* <button onClick={handleAllClick} type="button" className={`px-4 py-2 text-sm font-medium  rounded-s-lg   ${showAll === true ? "border border-orange-600 bg-orange-600 text-white" : "text-gray-900 bg-white border border-gray-200 hover:text-orange-600 hover:bg-neutral-100"} `}>
            All
          </button> */}
          <button onClick={handleInventoryClick} type="button" className={`px-4 py-2 text-sm font-medium  rounded-s-lg ${showInventory === true ? "border-t border-b border-orange-600 bg-orange-600 text-white" : "text-gray-900 bg-white border-t border-b border-gray-200 hover:bg-neutral-100 hover:text-orange-600 "}`}>
            Inventory
          </button>
          <button onClick={handlePriceClick} type="button" className={`px-4 py-2 text-sm font-medium  rounded-e-lg ${showPrice ? "border border-orange-600 bg-orange-600 text-white" : "text-gray-900 bg-white border border-gray-200 hover:bg-neutral-100 hover:text-orange-600 "} `}>
            Price
          </button>
        </div>
        {/* <div>
          <button className='px-4 py-1 text-sm font-medium text-zinc-700 bg-white border border-zinc-700 rounded-lg hover:bg-zinc-700 hover:text-white'><BsThreeDots size={22} /></button>
        </div> */}
      </div>


      <div class="relative overflow-x-auto mt-4">
        <table class="w-full text-sm text-left rtl:text-right text-gray-500 border border-gray-300">
          <thead class="text-xs text-gray-700 uppercase">
            <tr>
              <th scope="col" class="flex justify-between  gap-4 h-[64px] px-4 py-4 bg-gray-200">
                <button className="px-4 text-sm font-medium  rounded-lg   text-gray-900 bg-white hover:bg-orange-600 hover:text-white flex items-center gap-1">
                  <IoSync size={20} />Sync</button>
                <button className="px-4 text-sm font-medium  rounded-lg   text-gray-900 bg-white hover:bg-orange-600 hover:text-white flex items-center gap-1">
                  <GiBackwardTime size={20} />Logs</button>
              </th>
              <th scope="col" class="px-4  py-3 bg-gray-100 w-full mx-auto text-center border-t border-r border-b border-gray-300">
                <div className='flex justify-between'>
                  <div className='w-[33.33%] max-md:hidden'>

                  </div>
                  <div className='w-[33.33%] max-md:w-[66.66%] flex gap-4 md:justify-center items-center'>
                    <button onClick={(e) => { GetDataForDate(prevDate, "prev") }} className="me-1 p-2 bg-white border hover:bg-orange-600 hover:text-white rounded-full "><FaArrowLeft /></button>
                    <input type="date"
                      value={date}
                      onChange={(e) => { GetDataForDate(e.target.value, "next") }}
                      className="border py-2 px-4 bg-white  rounded-md" />

                    <button onClick={(e) => { GetDataForDate(nextDate, "next") }} className="ms-1 p-2 bg-white border hover:bg-orange-600 hover:text-white rounded-full "><FaArrowRight /></button>

                  </div>
                  <div className='w-[33.33%] flex justify-end items-center'>
                    <button onClick={() => { bulkupdateFunction() }} className='px-4 py-2 text-sm font-medium  rounded-lg   text-gray-900 bg-white border hover:bg-orange-600 hover:text-white flex items-center gap-1'>Bulk Update</button>

                  </div>
                </div>

              </th>

            </tr>
          </thead>
          <tbody>
            <tr class="bg-white border-b border-gray-300 flex-grow">
              <th scope="row" class="px-4 py-4 font-medium text-zinc-700 bg-gray-200 whitespace-nowrap w-[16rem]">
                <span className="text-[2rem] font-bold">Rooms</span>
              </th>

              <td class="w-full flex justify-between">
                {dates.map(date => (
                  <div className='flex flex-col  w-full text-center border-r border-gray-300'>
                    <span>{getMonthInWords(date)}</span>
                    <span>{getYearFromDate(date)}</span>
                    <span>{getDayOfWeek(date)}</span>
                    <span className="bg-zinc-500 text-white max-md:px-7 ">{getDayFromDate(date)}</span>
                  </div>
                ))}


              </td>
            </tr>


            {
              showInventory && <>{
                Object.keys(inventoryData).map((item, itemIndex) => (
                  <tr key={itemIndex} className="bg-white border-t border-gray-300">

                    <th className="px-4 font-medium text-zinc-700 bg-gray-200 w-[16rem] py-2">
                      <div className="gap-4 flex flex-col">
                        <span className="font-extrabold text-1xl">{item}</span>
                        <div>
                          <div className='flex items-center gap-2'>
                            <CiCirclePlus fontSize={20} fontWeight={500} />
                            <span className='text-bold'>Inventory</span>
                          </div>
                          <div className='ms-7'>
                            <span className='font-light border-b-2 border-gray-400'>Multi Update</span>
                          </div>
                        </div>
                      </div>
                    </th>

                    <td class="w-full flex">
                      {dates.map(date => (
                        <div key={date} className='flex flex-col justify-end py-2 px-[10px] w-full h-full border-l-2 border-white'>
                          <span className="bg-green-600 h-[8px] rounded-md mb-[3px] mt-6"></span>
                          <span className="border-2 border-gray-300 rounded-md text-center overflow-hidden">
                            <input type='text'
                              value={inventoryData[item][date]}
                              onChange={(e) => InventoryUpdate(e.target.value, item, date)}
                              className="w-[100%]  py-1 text-center outline-none  h-[100%] " />

                          </span>
                        </div>
                      ))}
                    </td>
                  </tr>
                ))
              }</>
            }

            {
              showPrice && <>{
                Object.keys(priceData).map((item, itemIndex) => (
                  <tr key={itemIndex} className="bg-white border-t border-gray-300">
                    <th className="px-4 font-medium text-zinc-700 bg-gray-200 w-[16rem] py-2">
                      <div className="gap-4 flex flex-col">
                        <span className="font-extrabold text-1xl">{item}</span>
                        <div>
                          <div className='flex items-center gap-2'>
                            <CiCirclePlus fontSize={20} fontWeight={500} />
                            <span className='text-bold'>Inventory</span>
                          </div>
                          <div className='ms-7'>
                            <span className='font-light border-b-2 border-gray-400'>Multi Update</span>
                          </div>
                        </div>
                      </div>
                    </th>

                    <td class="w-full flex">
                      {dates.map(date => (
                        <div key={date} className='flex flex-col justify-end py-2 px-[10px] w-full h-full border-l-2 border-white'>
                          <span className="bg-green-600 h-[8px] rounded-md mb-[3px] mt-6"></span>
                          <span className="border-2 border-gray-300 rounded-md text-center overflow-hidden">
                            <input type='text'
                              value={priceData[item][date]}
                              onChange={(e) => PriceUpdate(e.target.value, item, date)}
                              className="w-[100%] py-1 text-center outline-none  h-[100%] " />

                          </span>
                        </div>
                      ))}
                    </td>
                  </tr>
                ))
              }</>
            }


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
  )
}

export default Mange