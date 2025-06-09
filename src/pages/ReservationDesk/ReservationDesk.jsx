import React, { useRef } from "react";
import { useEffect } from "react";
import handleLocalStorage from "../../utils/handleLocalStorage";
import {
  filterBookingData,
  filterBookingDates,
  filterBookingWithId,
  filterBookingWithPayment,
  getBookingsData,
} from "../../services/api/reservationDesk";
import { useState } from "react";
import { formatDateTime } from "../../services/formateDate";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getDateInputLimits } from "../../utils/getDateInputLimits";

const filterData = [
  { value: "date range", label: "Date Range" },
  { value: "single booking search", label: "Single Booking Search" },
  { value: "filter booking status", label: "Filter Booking Status" },
];

const filterBookingStatus = [
  {
    value: "1",
    label: "Pay at Hotel",
  },
  {
    value: "2",
    label: "Advanced",
  },
  {
    value: "3",
    label: "Success",
  },
];

const ReservationDesk = () => {
  const [bookingData, setBookingsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState("date range");
  const [bookingStatus, setBookingStatus] = useState("1");
  const [bookingId, setBookingId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fromDateRef = useRef(null);
  const toDateRef = useRef(null);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const { min } = getDateInputLimits({
    showPast: false,
  });

  const fetchBookingsData = async () => {
    setIsLoading(true);
    const response = await getBookingsData(
      handleLocalStorage("token"),
      handleLocalStorage("hid")
    );
    setBookingsData(response?.Details);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchBookingsData();
  }, []);

  const resetFilters = () => {
    setFilters({
      dateType: "booking",
      fromDate: "",
      toDate: "",
      bookingId: "",
      guestName: "",
      contact: "",
      bookingStatus: "all",
      paymentStatus: "all",
    });
  };

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleFilterChange = (e) => {
    const { value } = e.target;
    setFilters(value);
  };

  const applyFilters = async (filterType, id) => {
    console.log(filterType);
    if (filterType === "dates") {
      setIsLoading(true);
      const dateFrom = new Date(fromDate).toLocaleDateString("en-CA", {});
      const dateTo = new Date(toDate).toLocaleDateString("en-CA", {});

      const filterData = {
        checkIn: dateFrom,
        checkOut: dateTo,
        hId: String(handleLocalStorage("hid")),
        token: handleLocalStorage("token"),
      };

      const response = await filterBookingDates(filterData);
      setBookingsData(response?.Details);
      setIsLoading(false);
    }

    if (filterType === "bookingId") {
      setIsLoading(true);
      const filterData = {
        hId: String(handleLocalStorage("hid")),
        token: handleLocalStorage("token"),
        bookingId: bookingId,
      };
      const response = await filterBookingWithId(filterData);
      setBookingsData(response?.Details);
      setIsLoading(false);
    }

    if (filterType === "payment") {
      setIsLoading(true);
      const filterData = {
        hId: String(handleLocalStorage("hid")),
        token: handleLocalStorage("token"),
      };

      const response = await filterBookingWithPayment(filterData, id);
      console.log(response);
      setBookingsData(response?.Bookings);
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 mb-10 cardShadow">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">🔍 Filter Bookings</h2>
        {/* Buttons */}
        {/* <div className="flex items-center gap-4">
          <button
            onClick={resetFilters}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg"
          >
            🔄 Reset Filters
          </button>
          <button
            onClick={applyFilters}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
          >
            🔍 Apply Filters
          </button>
        </div> */}
      </div>
      {/* filters fields tabs */}
      <div className="flex items-center gap-2 mt-4">
        {filterData.map((filter) => (
          <div className="flex gap-1 items-center">
            <input
              type="radio"
              name="filter"
              value={filter?.value}
              checked={filters === filter?.value}
              onChange={handleFilterChange}
            />
            <label htmlFor="" className="font-semibold">
              {filter?.label}
            </label>
          </div>
        ))}
      </div>
      {/* render filters fields */}
      <div className="border p-5 rounded-md mt-4">
        {filters === "date range" && (
          <div>
            <div className="grid grid-cols-2 gap-8 max-w-xl items-center">
              {/* <div className="flex flex-col gap-2">
                <label htmlFor="">Booking Date From:</label>
                <div
                  className="w-fit rounded-sm px-3 py-2 relative cusor-pointer"
                  onClick={() => fromDateRef?.current?.showPicker()}
                >
                  <input
                    className="absolute top-0 left-0 w-fit border px-2 py-1"
                    type="date"
                    ref={fromDateRef}
                    cla
                  />
                </div>
              </div> */}

              <div className="flex flex-col gap-2">
                <label htmlFor="">Booking Date From:</label>

                <div className="col-span-1 flex flex-col items-center bg-bg relative">
                  <DatePicker
                    selected={fromDate}
                    onChange={(date) => setFromDate(date)}
                    selectsStart
                    startDate={fromDate}
                    endDate={toDate}
                    // minDate={new Date(min || Date.now())}
                    placeholderText="mm-dd-yyy"
                    className="outline-none border w-full h-full py-2 pl-4 pr-10 bg-transparent barlow text-base text-dark2 placeholder:text-dark2"
                    wrapperClassName="w-full h-full !flex items-center"
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <CalenderIcon />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="">Booking Date to:</label>

                <div className="col-span-1 flex flex-col items-center bg-bg relative">
                  <DatePicker
                    selected={toDate}
                    onChange={(date) => setToDate(date)}
                    selectsStart
                    startDate={fromDate}
                    endDate={toDate}
                    placeholderText="mm-dd-yy"
                    className="outline-none border w-full h-full py-2 pl-4 pr-10 bg-transparent barlow text-base text-dark2 placeholder:text-dark2"
                    wrapperClassName="w-full h-full !flex items-center"
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <CalenderIcon />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <button
                className="rounded-full bg-primary text-white px-4 py-1 mt-4"
                onClick={() => applyFilters("dates")}
              >
                Show Bookings
              </button>
            </div>
          </div>
        )}

        {filters === "single booking search" && (
          <div>
            <div className="flex flex-col gap-2">
              <label htmlFor="">Booking Id :</label>

              <input
                type="text"
                placeholder="Enter Booking Id"
                onChange={(e) => setBookingId(e.target.value)}
                className="border rounded-lg px-3 py-1 w-fit outline-none"
              />
            </div>

            <div>
              <button
                className="rounded-full bg-primary text-white px-4 py-1 mt-5"
                onClick={() => applyFilters("bookingId")}
              >
                Show Bookings
              </button>
            </div>
          </div>
        )}

        {filters === "filter booking status" && (
          <div className="flex items-center gap-3">
            {filterBookingStatus?.map((filter) => (
              <div className="flex items-center gap-1">
                <input
                  type="radio"
                  name="booking-status"
                  checked={bookingStatus === filter?.value}
                  onChange={(e) => {
                    applyFilters("payment", filter?.value);
                    setBookingStatus(filter?.value);
                  }}
                />
                <label htmlFor="" className="text-lg uppercase">
                  {filter?.label}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* render table */}
      <div className="mt-10 overflow-auto">
        {/* <div
          className="tble-head d-flex"
          style={{ border: "1px solid gray", borderRadius: "8px" }}
        >
          <div
            className="tbl-inr d-flex"
            style={{
              justifyContent: "space-around",
              height: "100%",
              alignItems: "center",
              fontWeight: "500",
            }}
          >
            <span>Total Bookings</span>
            <span>{bookingData != null ? bookingData.Details.length : 0}</span>
          </div>
        </div> */}
        {!isLoading ? (
          <table className="w-full text-left bg-[#0a3a75] text-white/90 shadow-md rounded-sm shadow-black/20">
            <thead>
              <tr className="border-b">
                <th className="py-3 px-4 text-[14px] font-medium capitalize">
                  Booking Id
                </th>
                <th className="py-3 px-4 text-[14px] font-medium capitalize">
                  Guest Name
                </th>
                <th className="py-3 px-4 text-[14px] font-medium capitalize">
                  Email-Id
                </th>
                <th className="py-3 px-4 text-[14px] font-medium capitalize">
                  Phone
                </th>

                <th className="py-3 px-4 text-[14px] font-medium capitalize">
                  Check In
                </th>

                <th className="py-3 px-4 text-[14px] font-medium capitalize">
                  Check Out
                </th>

                <th className="py-3 px-4 text-[14px] font-medium capitalize whitespace-nowrap">
                  Total Price
                </th>
                <th className="py-3 px-4 text-[14px] font-medium capitalize whitespace-nowrap">
                  Payment Status
                </th>
                <th className="py-3 px-4 text-[14px] font-medium capitalize whitespace-nowrap">
                  Checked In
                </th>
                <th className="py-3 px-4 text-[14px] font-medium capitalize whitespace-nowrap">
                  CheckedOut
                </th>

                {/* <th className="py-3 px-4 text-[14px] font-medium capitalize resize">
                                Date Added
                            </th> */}
              </tr>
            </thead>

            <tbody>
              {bookingData?.length > 0 ? (
                bookingData
                  ?.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className="py-1  border-b odd:bg-gray-50 even:bg-gray-100 rounded-lg border-gray-200 hover:bg-[#f8f8fb] transition duration-300 cursor-pointer"
                    >
                      <td
                        className="py-3 px-4 text-[14px] text-purple-500 font-semibold"
                        // onClick={() => handleInfoPopup(row)}
                      >
                        {" "}
                        <a>{row?.bookingId}</a>{" "}
                      </td>
                      <td
                        className="py-3 px-4 text-[14px]  text-[#575757]"
                        // onClick={() => handleInfoPopupII(row)}
                      >
                        {row?.guestInfo?.guestName}
                      </td>

                      <td className="py-3 px-4 text-[14px]  text-[#575757]">
                        {row?.guestInfo?.EmailId}{" "}
                      </td>
                      <td className="py-3 px-4 text-[14px]  text-[#575757]">
                        {row?.guestInfo?.Phone}
                      </td>

                      <td className="py-3 px-4 text-[14px] whitespace-nowrap  text-[#575757]">
                        {formatDateTime(row?.checkIn)}
                      </td>
                      <td className="py-3 px-4 text-[14px] whitespace-nowrap  text-[#575757]">
                        {formatDateTime(row?.checkOut)}
                      </td>

                      <td className="py-3 px-4 text-[14px]  text-[#575757] whitespace-nowrap">
                        {row?.price?.Total}{" "}
                      </td>

                      <td className="py-3 px-4 text-[14px]  text-[#575757] whitespace-nowrap">
                        {row?.payment?.Status === "PENDING" ? (
                          <span className="badge bg-danger">
                            {row?.payment?.Status}
                          </span>
                        ) : row?.payment?.Status === "ADVANCED" ? (
                          <span className="badge bg-warning">
                            {row?.payment?.Status}
                          </span>
                        ) : row?.payment?.Status === "CANCELLED" ? (
                          <span className="badge bg-secondary">
                            {row?.payment?.Status}
                          </span>
                        ) : row?.payment?.Status === "REFUND" ? (
                          <span className="badge text-bg-info">
                            {row?.payment?.Status}
                          </span>
                        ) : (
                          <span className="badge bg-success">
                            {row?.payment?.Status}
                          </span>
                        )}
                      </td>
                      <td
                        className="py-3 px-4 text-[14px]  text-[#575757]"
                        style={{ cursor: "pointer" }}
                      >
                        {row?.payment?.Status === "CANCELLED" ? (
                          "-"
                        ) : row.isCheckedIn === true ? (
                          <span
                            // onClick={() => {
                            //     handleInfoPopupIII(row);
                            // }}
                            className="badge bg-success"
                          >
                            Checked In
                          </span>
                        ) : (
                          <button
                            className="btn btn-primary"
                            // onClick={() => {
                            //     BookingCehckinStatus(
                            //         row.bookingId,
                            //         "true",
                            //         "false"
                            //     );
                            // }}
                          >
                            Check In
                          </button>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[14px]  text-[#575757]">
                        {row.payment.Status === "CANCELLED" ? (
                          "-"
                        ) : row.isCheckedIn === true &&
                          row.isCheckedOut === true ? (
                          <span className="badge bg-danger">Checked Out</span>
                        ) : row.isCheckedIn === false ? (
                          "-"
                        ) : (
                          <button
                            className="btn btn-primary"
                            // onClick={() => {
                            //     BookingCehckinStatus(
                            //         row.bookingId,
                            //         "true",
                            //         "true"
                            //     );
                            // }}
                          >
                            Check Out
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                  .reverse()
              ) : (
                <tr className="border text-center bg-white text-gray-500">
                  <td colSpan={10} className="py-2">
                    No data found!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6, 7].map((index) => (
              <div key={index}>
                <p className="py-5 animate-pulse bg-gray-100"></p>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* <div class="flex items-center justify-center space-x-2 my-4">
                <button class="px-3 py-1 border rounded-lg text-sm text-gray-600 bg-white hover:bg-gray-100 disabled:opacity-50" disabled>
                    Previous
                </button>

                <button class="px-3 py-1 border rounded-lg text-sm text-white bg-blue-600 hover:bg-blue-700">
                    1
                </button>
                <button class="px-3 py-1 border rounded-lg text-sm text-gray-700 bg-white hover:bg-gray-100">
                    2
                </button>
                <button class="px-3 py-1 border rounded-lg text-sm text-gray-700 bg-white hover:bg-gray-100">
                    3
                </button>
                <span class="px-3 py-1 text-gray-500">...</span>
                <button class="px-3 py-1 border rounded-lg text-sm text-gray-700 bg-white hover:bg-gray-100">
                    10
                </button>

                <button class="px-3 py-1 border rounded-lg text-sm text-gray-600 bg-white hover:bg-gray-100">
                    Next
                </button>
            </div> */}
    </div>
  );
};

export default ReservationDesk;

export const CalenderIcon = ({ ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    {...props}
  >
    <path
      d="M5.615 21c-.46 0-.844-.154-1.152-.462A1.565 1.565 0 014 19.384V6.616c0-.46.154-.845.463-1.153A1.565 1.565 0 015.615 5h1.77V2.77H8.46V5h7.155V2.77h1V5h1.768c.46 0 .845.154 1.154.463.308.308.462.692.462 1.153v12.768c0 .46-.154.845-.462 1.154a1.565 1.565 0 01-1.154.462H5.616zm0-1h12.77a.588.588 0 00.423-.192.589.589 0 00.192-.424v-8.768H5v8.768c0 .154.064.296.192.424s.27.192.423.192zM5 9.615h14v-3a.588.588 0 00-.192-.423.588.588 0 00-.424-.192H5.616a.588.588 0 00-.424.192.588.588 0 00-.192.424v3zm7 4.539a.739.739 0 01-.54-.23.738.738 0 01-.23-.54c0-.206.077-.386.23-.539a.739.739 0 01.54-.23c.206 0 .386.077.54.23.153.153.23.333.23.54a.738.738 0 01-.23.539.739.739 0 01-.54.23zm-4 0a.739.739 0 01-.54-.23.738.738 0 01-.23-.54c0-.206.077-.386.23-.539a.739.739 0 01.54-.23c.206 0 .386.077.54.23.153.153.23.333.23.54a.738.738 0 01-.23.539.739.739 0 01-.54.23zm8 0a.739.739 0 01-.54-.23.738.738 0 01-.23-.54c0-.206.077-.386.23-.539a.739.739 0 01.54-.23c.206 0 .386.077.54.23.153.153.23.333.23.54a.738.738 0 01-.23.539.739.739 0 01-.54.23zM12 18a.739.739 0 01-.54-.23.738.738 0 01-.23-.54c0-.206.077-.385.23-.539a.739.739 0 01.54-.23c.206 0 .386.077.54.23.153.154.23.334.23.54a.738.738 0 01-.23.54A.739.739 0 0112 18zm-4 0a.739.739 0 01-.54-.23.739.739 0 01-.23-.54c0-.206.077-.385.23-.539a.739.739 0 01.54-.23c.206 0 .386.077.54.23.153.154.23.334.23.54a.739.739 0 01-.23.54A.739.739 0 018 18zm8 0a.739.739 0 01-.54-.23.738.738 0 01-.23-.54c0-.206.077-.385.23-.539a.739.739 0 01.54-.23c.206 0 .386.077.54.23.153.154.23.334.23.54a.738.738 0 01-.23.54A.739.739 0 0116 18z"
      fill="#EF6521"
    />
  </svg>
);

/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10">
  Date Type Selection
  <div className="flex flex-col">
    <label className="text-sm font-medium mb-1">📅 Date Type</label>
    <div className="flex gap-4 ml-1">
      <label className="flex items-center gap-1">
        <input
          type="radio"
          name="dateType"
          value="booking"
          checked={filters.dateType === "booking"}
          onChange={handleChange}
        />
        Booking
      </label>
      <label className="flex items-center gap-1">
        <input
          type="radio"
          name="dateType"
          value="checkin"
          checked={filters.dateType === "checkin"}
          onChange={handleChange}
        />
        Check-in
      </label>
      <label className="flex items-center gap-1">
        <input
          type="radio"
          name="dateType"
          value="checkout"
          checked={filters.dateType === "checkout"}
          onChange={handleChange}
        />
        Check-out
      </label>
    </div>
  </div>

  Date Pickers
  <div className="flex flex-col md:flex-row gap-4">
    <div className="flex flex-col flex-1">
      <label className="text-sm font-medium mb-1">📆 From</label>
      <input
        type="date"
        name="fromDate"
        value={filters.fromDate}
        onChange={handleChange}
        className="border rounded-lg px-3 py-2"
      />
    </div>
    <div className="flex flex-col flex-1">
      <label className="text-sm font-medium mb-1">To</label>
      <input
        type="date"
        name="toDate"
        value={filters.toDate}
        onChange={handleChange}
        className="border rounded-lg px-3 py-2"
      />
    </div>
  </div>

  Booking ID
  <div className="flex flex-col">
    <label className="text-sm font-medium mb-1">🔢 Booking ID</label>
    <input
      type="text"
      name="bookingId"
      value={filters.bookingId}
      onChange={handleChange}
      placeholder="Enter booking ID"
      className="border rounded-lg px-3 py-2"
    />
  </div>

  Guest Name
  <div className="flex flex-col">
    <label className="text-sm font-medium mb-1">🧑 Guest Name</label>
    <input
      type="text"
      name="guestName"
      value={filters.guestName}
      onChange={handleChange}
      placeholder="Enter guest name"
      className="border rounded-lg px-3 py-2"
    />
  </div>

  Contact
  <div className="flex flex-col">
    <label className="text-sm font-medium mb-1">📞 Email / Phone</label>
    <input
      type="text"
      name="contact"
      value={filters.contact}
      onChange={handleChange}
      placeholder="Enter email or phone"
      className="border rounded-lg px-3 py-2"
    />
  </div>

  Booking Status
  <div className="flex flex-col">
    <label className="text-sm font-medium mb-1">📌 Booking Status</label>
    <select
      name="bookingStatus"
      value={filters.bookingStatus}
      onChange={handleChange}
      className="border rounded-lg px-3 py-2"
    >
      <option value="all">All</option>
      <option value="confirmed">Confirmed</option>
      <option value="cancelled">Cancelled</option>
      <option value="pending">Pending</option>
    </select>
  </div>

  Payment Status
  <div className="flex flex-col">
    <label className="text-sm font-medium mb-1">💰 Payment Status</label>
    <select
      name="paymentStatus"
      value={filters.paymentStatus}
      onChange={handleChange}
      className="border rounded-lg px-3 py-2"
    >
      <option value="all">All</option>
      <option value="paid">Paid</option>
      <option value="unpaid">Unpaid</option>
      <option value="partial">Partial</option>
    </select>
  </div>
</div>; */
