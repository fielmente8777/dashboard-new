import React, { useContext, useEffect, useState } from "react";
import Form from "react-bootstrap/Form";
import Inventoryupdatefilter from "../../Components/InventoryUpdate";
import Priceupdatefilter from "../../Components/Priceupdatefilter";
import AuthContext from "../../Context/AuthProvider";
import "../../Style/BookingRoomPrice.css";

const BookingRoomPrice = () => {
  const {
    priceData,
    setPriceData,
    EngineUrl,
    EngineNewUrl,
    handleGetPrice,
    getNextPrev,
    haveroom,
    next,
    setNext,
    prev,
    setPrev,
    handleGetInventory,
    inventoryData,
    setinventoryData,
    haveinventory,
    getNextPrevInventory,
    RoomsData,
  } = useContext(AuthContext); // Use destructuring to get priceData directly
  const [Bulkupdate, setBulkupdate] = useState({});
  const [InventoryBulkupdate, setInventoryBulkupdate] = useState({});

  const [roomAvailability, setRoomAvailability] = useState([]);
  const [GotoDate, setGotoDate] = useState(prev);

  const roomTypes = Object.keys(priceData);
  const [selectedValueInv, setSelectedValueInv] = useState("div1");
  const [isOnPrice, setOnPrice] = useState(true);

  useEffect(() => {
    handleGetInventory();
    handleGetPrice();
  }, []);

  const getDateOnly = (dateStr) => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" });
    const dayOfWeek = date.toLocaleString("default", { weekday: "short" });
    const formattedDate = `${dayOfWeek} ${day} ${month}`;

    return formattedDate;
  };

  const BulkUpdate = (updateprice, roomtype, date) => {
    const updatedBulkUpdate = { ...Bulkupdate };
    const updatePriceData = { ...priceData };

    if (!updatedBulkUpdate[roomtype]) {
      updatedBulkUpdate[roomtype] = {};
    }

    if (!updatePriceData[roomtype]) {
      updatePriceData[roomtype] = {};
    }

    updatedBulkUpdate[roomtype][date] = updateprice;
    updatePriceData[roomtype][date] = updateprice;

    // Update the state with the new data
    setPriceData(updatePriceData);

    setBulkupdate(updatedBulkUpdate);
  };

  const InventoryUpdate = (updateinventory, roomtype, date) => {
    const updatedBulkUpdate = { ...InventoryBulkupdate };
    const updatePriceData = { ...inventoryData };

    if (!updatedBulkUpdate[roomtype]) {
      updatedBulkUpdate[roomtype] = {};
    }

    if (!updatePriceData[roomtype]) {
      updatePriceData[roomtype] = {};
    }

    updatedBulkUpdate[roomtype][date] = updateinventory;
    updatePriceData[roomtype][date] = updateinventory;

    setinventoryData(updatePriceData);

    setInventoryBulkupdate(updatedBulkUpdate);

    console.log(updatedBulkUpdate);
  };

  const BulkUpdateToDatabase = async () => {
    try {
      const response = await fetch(`${EngineNewUrl}/price/update/bulkprice`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: localStorage.getItem("Token"),
          bulkprice: Bulkupdate,
          hId: localStorage.getItem("hotelLocationId"),
        }),
      });

      const response1 = await fetch(
        `${EngineNewUrl}/inventory/update/bulk/inventory`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: localStorage.getItem("Token"),
            bulkinventory: InventoryBulkupdate,
            hId: localStorage.getItem("hotelLocationId"),
          }),
        }
      );

      const json = await response.json();

      if (json.Status === true) {
        alert("updated");
        handleGetPrice();
        handleGetInventory();
        setBulkupdate({});
        setInventoryBulkupdate({});
      } else {
        console.error("Error filtering dates:", json.Error);
      }
    } catch (error) {
      console.error("Error sending POST request:", error);
    }
  };

  const handleOptionChange = (event) => {
    setSelectedValueInv(event.target.value);
  };
  return (
    <div className="bookingRoomPrice">
      <div className="b-filters">
        {/* <h5>Filters</h5> */}
        {["radio"].map((type) => (
          <div key={`inline-${type}`} className="mb-3">
            <Form.Check
              inline
              label="Update Price"
              name="group1"
              type={type}
              value="div1"
              checked={selectedValueInv === "div1"}
              onChange={handleOptionChange}
              id={`inline-${type}-2`}
            />
            <Form.Check
              inline
              label="Update Inventory"
              name="group1"
              type={type}
              value="div2"
              checked={selectedValueInv === "div2"}
              onChange={handleOptionChange}
              id={`inline-${type}-2`}
            />
          </div>
        ))}
      </div>
      <div className="filter">
        <div
          id="div1"
          style={{ display: selectedValueInv === "div1" ? "block" : "none" }}
        >
          <Priceupdatefilter />
        </div>
        <div
          id="div2"
          style={{ display: selectedValueInv === "div2" ? "block" : "none" }}
        >
          <Inventoryupdatefilter />
        </div>
      </div>
      <div className="d-flex justify-content-between">
        <div
          style={{ width: "33%", justifyContent: "flex-end", display: "flex" }}
        >
          <button
            className="price_bulk_update_btn"
            onClick={() => {
              setOnPrice(true);
            }}
          >
            Price
          </button>
          <button
            className="price_bulk_update_btn"
            onClick={() => {
              setOnPrice(false);
            }}
          >
            Inventory
          </button>
        </div>

        <div
          className="mb-2 mt-2 form-group"
          style={{ width: "33%", justifyContent: "flex-end" }}
        >
          <label>Go to : </label>
          <input
            className="form-control"
            type="date"
            value={GotoDate}
            onChange={(e) => {
              getNextPrev(e.target.value, "next");
              getNextPrevInventory(e.target.value, "next");
            }}
          />
        </div>

        <div className="button_prev_next" style={{ width: "33%" }}>
          <i
            className="fas fa-chevron-circle-left m-2"
            onClick={() => {
              getNextPrev(prev, "prev");
              getNextPrevInventory(prev, "prev");
            }}
            style={{ fontSize: "34px" }}
          ></i>
          <i
            className="fas fa-sync m-2"
            onClick={() => {
              handleGetPrice();
              handleGetInventory();
            }}
            style={{ fontSize: "34px" }}
          ></i>
          <i
            className="fas fa-chevron-circle-right m-2"
            onClick={() => {
              getNextPrev(next, "next");
              getNextPrevInventory(next, "next");
            }}
            style={{ fontSize: "34px" }}
          ></i>
        </div>
        <div
          className="d-flex"
          style={{ width: "33%", justifyContent: "flex-end" }}
        >
          <button
            className="price_bulk_update_btn"
            onClick={() => {
              BulkUpdateToDatabase();
            }}
          >
            Bulk Update
          </button>
        </div>
      </div>

      <div className="price_table">
        {haveroom & haveinventory ? (
          <table className="pricetable">
            <thead>
              <tr>
                <th className="fixed-head">RoomType</th>
                {Object.keys(priceData[roomTypes[0]]).map((date, index) => (
                  <th className="table-head" key={index}>
                    {getDateOnly(date)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RoomsData.map((room, index) => (
                <tr key={index}>
                  <td className="fixed-room-type">{room.roomName}</td>
                  {Object.keys(priceData[room.roomType]).map(
                    (date, dateIndex) => (
                      <td className="table-data" key={dateIndex}>
                        {isOnPrice ? (
                          <input
                            className="priceInput"
                            type="text"
                            value={priceData[room.roomType][date]}
                            onChange={(e) =>
                              BulkUpdate(e.target.value, room.roomType, date)
                            }
                          />
                        ) : (
                          <input
                            className="priceInput mt-1"
                            type="text"
                            value={inventoryData[room.roomType][date]}
                            onChange={(e) =>
                              InventoryUpdate(
                                e.target.value,
                                room.roomType,
                                date
                              )
                            }
                          />
                        )}
                      </td>
                    )
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="pricetable">
            <thead>
              <tr>
                <th className="fixed-head">RoomType</th>
                <th className="table-head" key={0}>
                  -
                </th>
              </tr>
            </thead>
            <tbody>
              <tr key={0}>
                <td className="fixed-room-type">-</td>
                <td className="table-data" key={0}>
                  <input
                    className="priceInput"
                    type="text"
                    value="-"
                    // onChange={(e) => BulkUpdate(e.target.value, roomType, date)}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
      {/* <div className='button_prev_next'>
                <i className='fas fa-chevron-circle-left m-2' onClick={() => { getNextPrev(prev, "prev") }} style={{ fontSize: '34px' }}></i>
                <i className='fas fa-sync m-2' onClick={() => { handleGetPrice() }} style={{ fontSize: '34px' }}></i>
                <i className='fas fa-chevron-circle-right m-2' onClick={() => { getNextPrev(next, "next") }} style={{ fontSize: '34px' }}></i>

            </div>
            <div className='d-flex w-100 justify-content-center'>
                <button className='price_bulk_update_btn' onClick={() => { BulkUpdateToDatabase() }}>Bulk Update</button>
            </div> */}
    </div>
  );
};

export default BookingRoomPrice;
