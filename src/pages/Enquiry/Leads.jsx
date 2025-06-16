import React, { useEffect, useState } from "react";
import { MdRefresh } from "react-icons/md";
import LeadPopup from "../../components/Popup/LeadPopup";
import { Arrow, Filter, Search } from "../../icons/icon";
import { formatDateTime } from "../../services/formateDate";
import handleLocalStorage from "../../utils/handleLocalStorage";
import { getAllClientEnquires } from "../../services/api/clientEnquire.api";
import FilterPopup from "../../components/Popup/FilterPopup";
import { FaFileExcel } from "react-icons/fa";
import jsonToCsvExport from "json-to-csv-export";
export const extractBookingInfo = (input) => {
  if (!input) return null;
  const parts = input.split(",");
  const booking = {
    checkIn: "",
    checkOut: "",
    guests: 0,
  };

  parts.forEach((part) => {
    const [key, value] = part.split(":").map((s) => s.trim());
    if (key === "check-in") booking.checkIn = value;
    if (key === "check-out") booking.checkOut = value;
    if (key === "number of guest") booking.guests = parseInt(value, 10);
  });

  return booking;
};

const Leads = () => {
  const [active, setActive] = useState(0);
  const header = ["All Enquires", "Open Queries", "Contacted", "Converted"];
  const [exportedData, setExportedData] = useState([]);
  const [enquires, setEnquires] = useState([]);
  const [filteredEnquires, setFilteredEnquires] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [open, setOpen] = useState(false);

  const createExportData = (apiData) => {
    return apiData.map((item) => {
      const message = item?.Message || "";

      const checkInMatch = message.match(/check-in:\s*(\d{2}-\d{2}-\d{4})/i);
      const checkOutMatch = message.match(/check-out:\s*(\d{2}-\d{2}-\d{4})/i);
      const guestsMatch = message.match(/number of guest:\s*([\w\s\d]+)/i);
      return {
        ...item,
        check_in: checkInMatch ? checkInMatch[1] : null,
        check_out: checkOutMatch ? checkOutMatch[1] : null,
        number_of_guest: guestsMatch ? guestsMatch[1].trim() : null,
      };
    });
  };

  const fetchEnquires = async (token) => {
    setLoading(true);
    try {
      const hid = handleLocalStorage("hid");
      const response = await getAllClientEnquires({ token, hid });
      const data = createExportData(response);
      setExportedData(data);
      setEnquires(response?.reverse());
    } catch (error) {
      console.error("Error fetching enquires:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquires(localStorage.getItem("token"));
  }, []);

  useEffect(() => {
    if (searchTerm.length > 0) {
      const filtered = enquires.filter(
        (enquery) =>
          enquery.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          enquery.Contact.includes(searchTerm) ||
          enquery.Message.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEnquires(filtered);
    } else {
      setFilteredEnquires(enquires);
    }
    setCurrentPage(1); // Reset to page 1 when search or data changes
  }, [searchTerm, enquires]);

  const handleTabClick = async (index) => {
    setSearchTerm("");
    setLoading(true);
    setActive(index);
    setCurrentPage(1);
    const token = localStorage.getItem("token");
    const hid = handleLocalStorage("hid");
    try {
      let response;
      switch (index) {
        case 0:
          response = await getAllClientEnquires({ token, hid });
          break;
        case 1:
          response = await getAllClientEnquires({ token, hid, status: "Open" });
          break;
        case 2:
          response = await getAllClientEnquires({
            token,
            hid,
            status: "Contacted",
          });
          break;
        case 3:
          response = await getAllClientEnquires({
            token,
            hid,
            status: "Converted",
          });
          break;
        default:
          response = await getAllClientEnquires({ token, hid });
      }
      setEnquires(response?.reverse());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Pagination Logic
  const totalPages = Math.ceil(filteredEnquires.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredEnquires.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const headers = [
    { key: "Name", label: "Name" },
    { key: "Contact", label: "Contact" },
    { key: "Email", label: "Email" },
    { key: "check_in", label: "Check In" },
    { key: "check_out", label: "Check Out" },
    { key: "number_of_guest", label: "Number of Guest" },
    { key: "Message", label: "Message" },
    { key: "created_from", label: "Lead Source" },
    { key: "status", label: "Status" },
  ];

  return (
    <div className="cardShadow">
      <div className="flex flex-col lg:flex-row justify-between  bg-white">
        <div className="flex flex-wrap mt-4">
          {header.map((item, index) => (
            <button
              onClick={() => handleTabClick(index)}
              key={index}
              className={`text-[14px] whitespace-nowrap  ${active === index
                ? "border-b-2 border-[#575757]"
                : "border-b-2 border-transparent"
                } px-4 py-3 bg-white font-medium text-[#575757]`}
            >
              {item}
            </button>
          ))}
          <div
            onClick={() => fetchEnquires(localStorage.getItem("token"))}
            className={`flex justify-end items-center text-[#575757] px-3 cursor-pointer ${loading ? "animate-spin" : ""
              } `}
          >
            <MdRefresh size={25} />
          </div>
        </div>
        <div className=" py-2 px-4 mt-4 flex flex-col sm:flex-row sm:items-center gap-4">
          <label
            htmlFor="itemsPerPage"
            className="text-sm font-medium whitespace-nowrap text-gray-700"
          >
            Items per page:
          </label>
          <select
            id="itemsPerPage"
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="border  sm:w-fit border-gray-300 rounded-md px-1 lg:px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>

          <div
            onClick={() => jsonToCsvExport({ data: exportedData, headers })}
            className="bg-green-500 w-fit text-white border py-1 px-3 cursor-pointer rounded flex items-center gap-2 "
          >
            <FaFileExcel />
            <span className="font-medium">Export</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-4  mb-10">
        <div className="flex justify-between items-center mb-4 gap-2 ">
          <div className="w-full relative">
            <span className="absolute top-3.5 left-2 -z-10">
              <Search />
            </span>
            <input
              type="text"
              placeholder="Search clients by name, contact or message"
              className=" px-3 pl-2 lg:pl-8 w-full py-2 text-[14px] border rounded-md outline-none"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {!loading ? (
          <div className="overflow-auto">
            <table className="w-full text-left bg-[#0a3a75] text-white/90 rounded-sm shadow-md shadow-black/20">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-2 text-[14px] font-medium capitalize">
                    Date Added
                  </th>
                  <th className="py-3 px-2 text-[14px] font-medium capitalize">
                    Source
                  </th>
                  <th className="py-3 px-2 text-[14px] font-medium capitalize">
                    Name
                  </th>
                  <th className="py-3 px-2 text-[14px] font-medium capitalize">
                    Contact
                  </th>
                  <th className="py-3 px-2 text-[14px] font-medium capitalize">
                    Email
                  </th>
                  {/* <th className="py-3 px-4 text-[14px] font-medium capitalize">
                    Message
                  </th> */}
                  <th className="py-3 px-2 text-[14px] font-medium capitalize whitespace-nowrap">
                    Check In
                  </th>
                  <th className="py-3 px-2 text-[14px] font-medium capitalize whitespace-nowrap">
                    Check Out
                  </th>
                  <th className="py-3 px-2 text-[14px] font-medium capitalize">
                    Stages
                  </th>
                </tr>
              </thead>

              {currentItems?.length > 0 ? (
                <tbody>
                  {currentItems.map((enquery, index) => (
                    <tr
                      key={index}
                      className={`py-1 border-b odd:bg-gray-50 even:bg-gray-100 border-gray-200 hover:bg-[#f8f8fb] transition duration-300 cursor-pointer ${enquery?.status === "Open"
                        ? " text-[#575757]"
                        : "text-[#575757]"
                        }`}
                      onClick={() => {
                        setSelectedLead(enquery);
                        setIsPopupOpen(true);
                      }}
                    >
                      <td className="py-3 px-2 text-[14px] whitespace-nowrap capitalize">
                        {enquery?.Created_at
                          ? formatDateTime(enquery?.Created_at)
                          : ""}
                      </td>
                      <td className="py-3 px-2 text-[14px] font-semibold">
                        {enquery?.created_from?.toLowerCase() === "chatbot"
                          ? "Eazobot"
                          : enquery.created_from}
                      </td>
                      <td className="py-3 px-2 text-[14px] font-semibold whitespace-nowrap">
                        {enquery?.Name.slice(0, 15)}
                      </td>
                      <td className="py-3 px-2 text-[14px] capitalize whitespace-nowrap">
                        {enquery?.Contact}
                      </td>
                      <td className="py-3 px-2 text-[14px] text-[#575757]">
                        {enquery?.Email}
                      </td>

                      {/* <td className="py-3 px-2 text-[14px] text-[#575757]">
                        {enquery?.Message}
                      </td> */}
                      <td className="py-3 px-2 text-[14px] text-[#575757]">
                        {enquery?.check_in
                          ? enquery.check_in
                          : extractBookingInfo(enquery?.Message)?.checkIn ||
                          "-"}
                      </td>
                      <td className="py-3 px-2 text-[14px] text-[#575757]">
                        {enquery?.check_out
                          ? enquery.check_out
                          : extractBookingInfo(enquery?.Message)?.checkOut ||
                          "-"}
                      </td>
                      <td className="py-3 px-2 text-[14px] text-[#575757] font-medium">
                        {enquery?.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              ) : (
                <tbody>
                  <tr className="bg-white text-gray-600 text-center border">
                    <td colSpan={9} className="py-2">
                      Data not found!
                    </td>
                  </tr>
                </tbody>
              )}
            </table>
          </div>
        ) : (
          <div className="space-y-2">
            {[...Array(itemsPerPage)].map((_, index) => (
              <div key={index}>
                <p className="py-[1.35rem] animate-pulse bg-gray-100"></p>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-6 max-w-[800px] overflow mx-auto">
            <nav className="inline-flex items-center gap-1 rounded-lg border bg-white px-2 py-1 shadow-sm">
              {/* Previous Button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1.5 text-sm rounded-md transition-all whitespace-nowrap duration-200
          ${currentPage === 1
                    ? "text-gray-300 cursor-not-allowed"
                    : "hover:bg-gray-100 text-gray-700"
                  }`}
              >
                ← Previous
              </button>

              {/* Page Numbers */}
              <div className="flex overflow-x-auto hide-scrollbar">
                {Array.from({ length: totalPages }, (_, index) => index + 1)
                  .filter((page) => {
                    return (
                      page === 1 || // first page
                      page === totalPages || // last page
                      (page >= currentPage - 1 && page <= currentPage + 1) // nearby pages
                    );
                  })
                  .reduce((acc, page, index, arr) => {
                    if (index > 0 && page - arr[index - 1] > 1) {
                      acc.push("ellipsis");
                    }
                    acc.push(page);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    item === "ellipsis" ? (
                      <span
                        key={`ellipsis-${idx}`}
                        className="px-2 text-gray-400"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => handlePageChange(item)}
                        className={`px-3 py-1.5 text-sm rounded-md font-medium transition-all duration-200
                  ${currentPage === item
                            ? "bg-primary text-white shadow-sm"
                            : "text-gray-700 hover:bg-gray-100"
                          }`}
                      >
                        {item}
                      </button>
                    )
                  )}
              </div>

              {/* Next Button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1.5 text-sm rounded-md whitespace-nowrap transition-all duration-200
          ${currentPage === totalPages
                    ? "text-gray-300 cursor-not-allowed"
                    : "hover:bg-gray-100 text-gray-700"
                  }`}
              >
                Next →
              </button>
            </nav>
          </div>
        )}
      </div>

      <LeadPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        lead={selectedLead}
        fetchEnquires={fetchEnquires}
        handleTabClick={handleTabClick}
        activeIndex={active}
      />
    </div>
  );
};

export default Leads;
