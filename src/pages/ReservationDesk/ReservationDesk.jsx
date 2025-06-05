import React from "react";
import { useEffect } from "react";
import handleLocalStorage from "../../utils/handleLocalStorage";
import { getBookingsData } from "../../services/api/reservationDesk";
import { useState } from "react";
import { formatDateTime } from "../../services/formateDate";

const ReservationDesk = () => {
  const [bookingData, setBookingsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <div className="bg-white p-4">
      <div>
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
