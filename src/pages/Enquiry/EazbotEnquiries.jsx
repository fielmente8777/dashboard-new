import { useEffect, useState } from 'react'
import { formatDateTime } from '../../services/formateDate';
import { getLeads } from '../../services/api/leads.api';
import { formatPhoneNumber } from '../../components/Popup/LeadPopup';
import { useSelector } from 'react-redux';
import { extractBookingInfo } from './Leads';
import { Search } from '../../icons/icon';
import DatePicker from 'react-datepicker';
import { FaFileExcel, FaPlus } from 'react-icons/fa';

const EazbotLeads = () => {
  const { user: hotel } = useSelector((state) => state.userProfile);

    const [allLeads, setAllLeads] = useState([]);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const fetchAllLeads = async () => {
        try {
            const response = await getLeads(`page=1&limit=10&created_from=Eazobot`);
            setAllLeads(response.leads);
        }
        catch (error) {
            console.error("Error fetching all leads:", error);
        }
    }

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
    
    useEffect(() => {
        fetchAllLeads();
    }, []);
  return (
    <div className='w-full'>
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
      
                {/* <div className="w-1/3">
                        <button
                          className="w-full px-4 py-2 text-[#575757] text-[14px] font-medium bg-gray-200 rounded-md flex items-center justify-between"
                          onClick={() => setFilterPopup(true)}
                        >
                          <span className="flex items-center gap-2">
                            <Filter className="w-2 h-2" /> Filter
                          </span>
                          <span className="text-[#575757] text-[14px] font-semibold rotate-180">
                            <Arrow />
                          </span>
                        </button>
            
                        <FilterPopup open={filterPopup} setOpen={setOpen} />
                      </div> */}
              </div>
      
              <div className="py-2 lg:px-4 flex flex-col sm:flex-row sm:items-center gap-4">
                {/* <label
                          htmlFor="itemsPerPage"
                          className="text-sm font-medium whitespace-nowrap text-gray-700"
                        >
                          Items per page:
                        </label> */}
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
                    <th className="py-3 text-start px-2 text-[14px] font-medium capitalize">
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

                    <th className="py-3 px-2 text-start text-[14px] font-medium capitalize">
                      Date Added
                    </th>
                    {/* <th className="py-3 px-2 text-start text-[14px] font-medium capitalize">
                      Source
                    </th> */}

                    <th className="py-3 px-2 text-[14px] text-start font-medium capitalize">
                    Source Url
                  </th>
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
                  {allLeads?.length > 0 ? (
                          <tbody>
                            {allLeads.map((enquery, index) => {
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
                                        handleRowSelect(enquery?._id);
                                      }}
                                    />
                                  </td>
                                  <td className="py-3 px-2 text-[14px] capitalize whitespace-nowrap">
                                    {index + 1}
                                  </td>
        
                                
        
                                  <td className="py-3 px-2 text-[14px] whitespace-nowrap capitalize">
                                    {enquery?.Created_at
                                      ? formatDateTime(enquery?.Created_at)
                                      : ""}
                                  </td>
                                  
                                  <td className="py-3 px-2 text-[14px] font-semibold whitespace-nowrap">
                                <span title={enquery?.source_url || "Landing Page"}>
                                  {(enquery?.source_url?.length ?? 0) > 60
                                    ? `${enquery?.source_url.slice(0, 40)}...`
                                    : enquery?.source_url || "Landing Page"}
                                </span>
                              </td>
                                  <td className="py-3 px-2 text-[14px] font-semibold whitespace-nowrap">
                                    {/* {enquery?.Name.slice(0, 15)} */}
                                    {enquery?.Name?.substring(0, 15)}
                                  </td>
                                  <td className="py-3 px-2 text-[14px] capitalize whitespace-nowrap">
                                    {formatPhoneNumber(enquery?.Contact)}
                                  </td>
                                  <td className="py-3 px-2 text-[14px] text-[#575757]">
                                    {enquery?.Email === "undefined"
                                      ? "-"
                                      : enquery?.Email}
                                  </td>
        
                                  {!hotel?.Profile?.websiteType && (
                                    <td className="py-3 px-2 text-[14px] text-[#575757] text-center">
                                      {enquery?.numberOfGuest == ""
                                        ? "-"
                                        : enquery?.numberOfGuest
                                          ? enquery?.numberOfGuest
                                          : isNaN(
                                                extractBookingInfo(enquery?.Message)
                                                  ?.guests,
                                              ) ||
                                              extractBookingInfo(enquery?.Message)
                                                ?.guests === 0
                                            ? "-"
                                            : extractBookingInfo(enquery?.Message)
                                                ?.guests}
                                    </td>
                                  )}
        
                                  {/* <td className="py-3 px-2 text-[14px] text-[#575757]">
                                {enquery?.Message}
                              </td> */}
                                  {!hotel?.Profile?.websiteType && (
                                    <td className="py-3 px-2 text-[14px] text-[#575757]">
                                      {enquery?.check_in
                                        ? enquery?.check_in === "undefined"
                                          ? "-"
                                          : enquery.check_in
                                        : extractBookingInfo(enquery?.Message)
                                            ?.checkIn || "-"}
                                    </td>
                                  )}
        
                                  {!hotel?.Profile?.websiteType && (
                                    <td className="py-3 px-2 text-[14px] text-[#575757]">
                                      {enquery?.check_out
                                        ? enquery?.check_out === "undefined"
                                          ? "-"
                                          : enquery.check_out
                                        : extractBookingInfo(enquery?.Message)
                                            ?.checkOut || "-"}
                                    </td>
                                  )}
        
                                  {/* <td className="py-3 px-2 text-[14px] text-[#575757] font-medium">
                                {enquery?.status}
                              </td> */}
        
                                  <td className="py-3 px-2 text-[14px] text-[#575757] font-medium">
                                    <select
                                      className="outline-none py-2 bg-gray-50 cursor-pointer"
                                      defaultValue={enquery?.status}
                                      value={enquery?.status}
                                      onClick={(e) => e.stopPropagation()}
                                      // onChange={(e) => {
                                      //   handleStatusChange(enquery, e.target.value);
                                      // }}
                                    >
                                      <option
                                        disabled
                                        className="text-gray-500 bg-white"
                                      >
                                        Select Status
                                      </option>
                                      <option
                                        value="Converted"
                                        className="bg-white text-black"
                                      >
                                        Converted
                                      </option>
                                      <option
                                        value="Contacted"
                                        className="bg-white  text-black"
                                      >
                                        Contacted
                                      </option>
                                      <option
                                        value="Open"
                                        className="bg-white  text-black"
                                      >
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
        
                                      <option
                                        value="Reserved"
                                        className="bg-white  text-black"
                                      >
                                        Reserved
                                      </option>
        
                                      <option
                                        value="Hot"
                                        className="bg-white  text-black"
                                      >
                                        Hot
                                      </option>
                                    </select>
                                  </td>
        
                                  {/* <td className="py-3 px-2 text-[14px] text-[#575757] font-medium">
                                    <span
                                      className="flex justify-center"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(enquery._id, enquery.Email);
                                      }}
                                    >
                                      <MdDeleteOutline size={22} color="#df4545" />
                                    </span>
                                  </td> */}
                                </tr>
                              );
                            })}
                          </tbody>
                        ) : (
                          <tbody>
                            <tr className="bg-white text-gray-600 text-center border">
                              <td colSpan={12} className="py-2">
                                Data not found!
                              </td>
                            </tr>
                          </tbody>
                        )}
                      </table>

    </div>
  )
}

export default EazbotLeads