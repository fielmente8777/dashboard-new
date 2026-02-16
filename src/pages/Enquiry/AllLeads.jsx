import { useEffect, useState } from "react";
import { formatDateTime } from "../../services/formateDate";
import { getLeads, UpdateLeadStatus } from "../../services/api/leads.api";
import LeadPopup, { formatPhoneNumber } from "../../components/Popup/LeadPopup";
import { useSelector } from "react-redux";
import { extractBookingInfo } from "./Leads";
import { Search } from "../../icons/icon";
import DatePicker from "react-datepicker";
import { FaFileExcel, FaPlus } from "react-icons/fa";
import { createExportData } from "../../utils/exportLeadData";
import jsonToCsvExport from "json-to-csv-export";
import Swal from "sweetalert2";
import usePagination from "../../hooks/usePagination";
import Pagination from "../../components/Pagination";
import TablePaginationInfo from "../../components/TablePaginationInfo";
import useDebounce from "../../hooks/useDebounce";
const AllLeads = () => {
  const { user: hotel } = useSelector((state) => state.userProfile);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [allLeads, setAllLeads] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [exportedData, setExportedData] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 500);

  const {
    page,
    limit,
    total,
    totalPages,
    setTotal,
    goToPage,
    nextPage,
    prevPage,
    changeLimit,
  } = usePagination({ initialLimit: 10 });

  const fetchAllLeads = async () => {
    setLoading(true);
    try {
      const query = `page=${page}&limit=${limit}&search=${debouncedSearch || ""}`;
      const response = await getLeads(query);

      if (response?.success && response?.responseStatusCode === 200) {
        setAllLeads(response?.result?.docs || []);
        setTotal(response?.result?.pagination?.total || 0);
        const data = createExportData(response.leads);
        setExportedData(data);
      }
    } catch (error) {
      console.error("Error fetching all leads:", error);
    } finally {
      setLoading(false);
    }
  };

  const setDateRange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);

    if (start && end) {
      // Normalize to full-day range
      // console.log("inn");
      const startOfDay = new Date(start);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(end);
      endOfDay.setHours(23, 59, 59, 999);

      const filtered = allLeads.filter((item) => {
        const createdAtDate = new Date(item.Created_at);
        return createdAtDate >= startOfDay && createdAtDate <= endOfDay;
      });

      setAllLeads(filtered);
    }
  };

  const headers = [
    { key: "Name", label: "Name" },
    { key: "Contact", label: "Contact" },
    { key: "Email", label: "Email" },
    { key: "check_in", label: "Check In" },
    { key: "check_out", label: "Check Out" },
    { key: "number_of_guest", label: "Number of Guest" },
    // { key: "Message", label: "Message" },
    { key: "created_from", label: "Lead Source" },
    { key: "status", label: "Status" },
  ];

  const handleStatusChange = async (lead, status) => {
    try {
      const { data } = await UpdateLeadStatus(lead, status);
      // console.log("Handle lead status", data);

      Swal.fire({
        icon: "success",
        title: "Query Status Updated!",
        text: data.Message || "Query has been updated successfully.",
        timer: 600,
        showConfirmButton: false,
      }).then(() => {
        if (data.Status) {
          // handleTabClick(active);
          fetchAllLeads();
        }
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error updating Query Status",
      });
    }
  };

  useEffect(() => {
    if (limit && page) fetchAllLeads();
  }, [limit, page, debouncedSearch]);
  return (
    <div className="w-full">
      <div className="flex lg:flex-row flex-col justify-between lg:items-center my-2">
        <div className="flex lg:flex-row flex-col justify-between lg:items-center gap-2 max-w-3xl w-full px-4">
          <div className="relative w-full">
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

          <div className="flex items-center gap-2">
            <div className="border border-gray-300 rounded-md p-1.5">
              <DatePicker
                // maxDate={msg?.disabled ? new Date() : undefined}
                className="outline-none w-full"
                selectsRange
                startDate={startDate}
                endDate={endDate}
                required
                onChange={(update) => {
                  setDateRange(update);
                }}
                popperClassName="!z-50"
                placeholderText="Select date range"
                // isClearable
                // minDate={new Date()}
              />
            </div>

            {startDate && endDate && (
              <span
                className="text-[#575757] text-[14px] font-semibold cursor-pointer"
                onClick={() => {
                  setStartDate(null);
                  setEndDate(null);

                  fetchAllLeads();
                }}
              >
                Clear
              </span>
            )}
          </div>
        </div>

        <div className="py-2 lg:px-4 flex flex-col sm:flex-row sm:items-center gap-4">
          <div
            onClick={() => jsonToCsvExport({ data: exportedData, headers })}
            className="bg-green-500 w-fit text-white border py-1 px-3 cursor-pointer rounded flex items-center gap-2 "
          >
            <FaFileExcel />
            <span className="font-medium">Export</span>
          </div>

          <div
            // onClick={handleAddRow}
            className="bg-green-500 whitespace-nowrap w-fit text-white border py-1 px-3 cursor-pointer rounded flex items-center gap-2 "
          >
            <FaPlus />
            <span className="font-medium">Add Lead</span>
          </div>
        </div>
      </div>

      <table className="w-full border-collapse">
        <thead className="sticky top-0 bg-[#0a3a75] w-full">
          <tr className="border-b text-start text-white">
            <th className="py-2 text-start px-2 text-[14px] font-medium capitalize">
              {/* <input
                        type="checkbox"
                        onClick={handleSelectAll}
                        checked={rowSelected.length === currentItems.length}
                      /> */}
              Select
            </th>

            <th className="py-3 text-start px-2 text-[14px] font-medium capitalize">
              #
            </th>
            {/* <th className="py-3 px-2 text-[14px] font-medium capitalize">
                      Reserve
                    </th> */}
            <th className="py-3 px-2 text-start text-[14px] font-medium capitalize">
              Date Added
            </th>
            <th className="py-3 px-2 text-start text-[14px] font-medium capitalize">
              Source
            </th>

            {/* <th className="py-3 px-2 text-[14px] font-medium capitalize">
                      Source Url
                    </th> */}
            <th className="py-3 px-2 text-start text-[14px] font-medium capitalize">
              Name
            </th>
            <th className="py-3 px-2 text-start text-[14px] font-medium capitalize">
              Contact
            </th>
            <th className="py-3 px-2 text-start text-[14px] font-medium capitalize">
              Email
            </th>
            {!hotel?.Profile?.websiteType && (
              <th className="py-3 px-4 text-[14px] text-start font-medium capitalize whitespace-nowrap">
                Number of Guests
              </th>
            )}

            {!hotel?.Profile?.websiteType && (
              <th className="py-3 px-2 text-[14px] text-start font-medium capitalize whitespace-nowrap">
                Check In
              </th>
            )}

            {!hotel?.Profile?.websiteType && (
              <th className="py-3 px-2 text-[14px] text-start font-medium capitalize whitespace-nowrap">
                Check Out
              </th>
            )}

            <th className="py-3 px-2 text-start text-[14px] font-medium capitalize">
              Stages
            </th>

            {/* <th className="py-3 px-2 text-[14px] font-medium capitalize">
                        Actions
                      </th> */}
          </tr>
        </thead>

        <tbody>
          {loading && (
           <>
            {Array.from({length:limit}).map(item=>(
              <tr key={item} className=" mb-2 ">
              
              <td colSpan={12} className="text-center animate-pulse border mb-2 bg-gray-100 py-3 ">

                <div className="flex justify-center h-6 items-center text-gray-500 ">

                </div>
              </td>
            </tr>
            ))}
           </>
          )}

          {!loading &&
            allLeads?.length > 0 &&
            allLeads.map((enquery, index) => {
              if (!enquery.Contact || enquery.Contact === "undefined")
                return null;
              return (
                <tr
                  key={index}
                  className={`py-1 border-b odd:bg-gray-50 even:bg-gray-100 border-gray-200 hover:bg-[#f8f8fb] transition duration-300 cursor-pointer ${
                    enquery?.status === "Open"
                      ? " text-[#575757]"
                      : "text-[#575757]"
                  }`}
                  onClick={() => {
                    setSelectedLead(enquery);
                    setIsPopupOpen(true);
                  }}
                >
                  <td className="py-3 px-2 text-[14px] capitalize whitespace-nowrap">
                    <input
                      type="checkbox"
                      // checked={rowSelected.includes(enquery?._id)}
                      onClick={(e) => {
                        e.stopPropagation();
                        // handleRowSelect(enquery?._id);
                      }}
                    />
                  </td>

                  <td className="py-3 px-2 text-[14px] capitalize whitespace-nowrap">
                    {(page - 1) * limit + index + 1}
                  </td>

                  <td className="py-3 px-2 text-[14px] whitespace-nowrap capitalize">
                    {enquery?.Created_at
                      ? formatDateTime(enquery?.Created_at)
                      : ""}
                  </td>
                  <td className="py-3 px-2 text-[14px] font-semibold">
                    {enquery?.created_from?.toLowerCase() === "chatbot"
                      ? "Eazbot"
                      : enquery?.created_from?.toLowerCase() === "Eazbot"
                        ? "Eazbot"
                        : enquery?.created_from === "Eazobt"
                          ? "Eazbot"
                          : enquery?.created_from?.toLowerCase() === "eazobot"
                            ? "Eazbot"
                            : enquery?.created_from === "Website"
                              ? "Webform"
                              : enquery?.created_from?.toLowerCase() ===
                                  "google_ads"
                                ? "Google Lead Form"
                                : enquery?.created_from === null
                                  ? "Webform"
                                  : "Webform"}
                  </td>
                  <td className="py-3 px-2 text-[14px] font-semibold whitespace-nowrap">
                    {enquery?.Name?.substring(0, 15)}
                  </td>
                  <td className="py-3 px-2 text-[14px] capitalize whitespace-nowrap">
                    {formatPhoneNumber(enquery?.Contact)}
                  </td>
                  <td className="py-3 px-2 text-[14px] text-[#575757]">
                    {enquery?.Email === "undefined" ? "-" : enquery?.Email}
                  </td>

                  {!hotel?.Profile?.websiteType && (
                    <td className="py-3 px-2 text-[14px] text-[#575757] text-center">
                      {enquery?.numberOfGuest == ""
                        ? "-"
                        : enquery?.numberOfGuest
                          ? enquery?.numberOfGuest
                          : isNaN(
                                extractBookingInfo(enquery?.Message)?.guests,
                              ) ||
                              extractBookingInfo(enquery?.Message)?.guests === 0
                            ? "-"
                            : extractBookingInfo(enquery?.Message)?.guests}
                    </td>
                  )}

                  {!hotel?.Profile?.websiteType && (
                    <td className="py-3 px-2 text-[14px] text-[#575757]">
                      {enquery?.check_in
                        ? enquery?.check_in === "undefined"
                          ? "-"
                          : enquery.check_in
                        : extractBookingInfo(enquery?.Message)?.checkIn || "-"}
                    </td>
                  )}

                  {!hotel?.Profile?.websiteType && (
                    <td className="py-3 px-2 text-[14px] text-[#575757]">
                      {enquery?.check_out
                        ? enquery?.check_out === "undefined"
                          ? "-"
                          : enquery.check_out
                        : extractBookingInfo(enquery?.Message)?.checkOut || "-"}
                    </td>
                  )}

                  <td className="py-3 px-2 text-[14px] text-[#575757] font-medium">
                    <select
                      className="outline-none py-2 bg-gray-50 cursor-pointer"
                      defaultValue={enquery?.status}
                      value={enquery?.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        handleStatusChange(enquery, e.target.value);
                      }}
                    >
                      <option disabled className="text-gray-500 bg-white">
                        Select Status
                      </option>
                      <option value="Converted" className="bg-white text-black">
                        Converted
                      </option>
                      <option
                        value="Contacted"
                        className="bg-white  text-black"
                      >
                        Contacted
                      </option>
                      <option value="Open" className="bg-white  text-black">
                        Open
                      </option>

                      <option
                        value="Out Of Budget"
                        className="bg-white  text-black"
                      >
                        Out Of Budget
                      </option>
                      <option
                        value="Potential"
                        className="bg-white  text-black"
                      >
                        Potential For Later
                      </option>

                      <option
                        value="Quotation Provided"
                        className="bg-white  text-black"
                      >
                        Quotation Provided
                      </option>
                      <option
                        value="Dead Lead"
                        className="bg-white  text-black"
                      >
                        Dead Lead
                      </option>

                      <option
                        value="Date Sold Out"
                        className="bg-white  text-black"
                      >
                        Date Sold Out
                      </option>

                      <option
                        value="Duplicate"
                        className="bg-white  text-black"
                      >
                        Duplicate
                      </option>

                      <option value="Reserved" className="bg-white  text-black">
                        Reserved
                      </option>

                      <option value="Hot" className="bg-white  text-black">
                        Hot
                      </option>
                    </select>
                  </td>
                </tr>
              );
            })}

          {!loading && allLeads?.length === 0 && (
            <tr>
              <td colSpan={12} className="py-6 text-center text-gray-500">
                No Leads Found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="flex flex-col items-end px-4 py-6">
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={goToPage}
          onNext={nextPage}
          onPrev={prevPage}
        />

        <div>
          <TablePaginationInfo
            limit={limit}
            onLimitChange={changeLimit}
            page={page}
            total={total}
          />
        </div>
      </div>

      <LeadPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        lead={selectedLead}
        fetchEnquires={fetchAllLeads}
        // handleTabClick={""}
        // activeIndex={active}
        show={!hotel?.Profile?.websiteType}
      />
    </div>
  );
};

export default AllLeads;
