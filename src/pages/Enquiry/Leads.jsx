import React, { useEffect, useState } from "react";
import { MdRefresh } from "react-icons/md";
import LeadPopup from "../../components/Popup/LeadPopup";
import { Search } from "../../icons/icon";
import { getAllClientEnquires } from "../../services/api";
import { formatDateTime } from "../../services/formateDate";
// import FilterPopup from '../../components/Popup/FilterPopup';

export const extractBookingInfo = (input) => {
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
  const [enquires, setEnquires] = useState([]);
  const [filteredEnquires, setFilteredEnquires] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [open, setOpen] = useState(false);

  const fetchEnquires = async (token) => {
    setLoading(true);
    try {
      const response = await getAllClientEnquires(token);
      setEnquires(response);
    } catch (error) {
      console.error("Error fetching enquires:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquires(localStorage.getItem("token"));
  }, []);
  // const fetchFilteredClientQuery = async (e) => {
  //     console.log(e)
  //     const response = await getAllClientEnquires(localStorage.getItem("token"), e)
  //     console.log(response)
  //     setEnquires(response);
  // }

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
      // Restore full list if search is empty
      setFilteredEnquires(enquires);
    }
  }, [searchTerm, enquires]);

  // useEffect(() => {

  //     const delayDebounce = setTimeout(() => {
  //         const fetchData = async () => {
  //             try {
  //                 const token = localStorage.getItem("token");
  //                 const response = await getAllClientEnquires(token, searchTerm);
  //                 setEnquires(response);
  //             } catch (error) {
  //                 console.error("Failed to fetch client enquiries:", error);
  //             }
  //         };

  //         fetchData();
  //     }, 500);

  //     return () => clearTimeout(delayDebounce);
  // }, [searchTerm]);

  const handleTabClick = async (index) => {
    setSearchTerm("");
    setLoading(true);
    setActive(index);
    const token = localStorage.getItem("token");
    try {
      if (index === 0) {
        const response = await getAllClientEnquires(token, searchTerm);
        setEnquires(response);
      } else if (index === 1) {
        const response = await getAllClientEnquires(token, searchTerm, "Open");
        setEnquires(response);
      } else if (index === 2) {
        const response = await getAllClientEnquires(
          token,
          searchTerm,
          "Contacted"
        );
        setEnquires(response);
      } else if (index === 3) {
        const response = await getAllClientEnquires(
          token,
          searchTerm,
          "Converted"
        );
        setEnquires(response);
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  console.log(enquires);
  // console.log(filteredEnquires,)

  return (
    <div>
      <div className="flex mt-4">
        {header.map((item, index) => (
          <button
            onClick={() => handleTabClick(index)}
            key={index}
            className={`text-[14px] ${
              active === index
                ? "border-b-2 border-[#575757]"
                : "border-b-2 border-transparent"
            } px-4 py-3 bg-white font-medium text-[#575757]`}
          >
            {item}
          </button>
        ))}
        <div
          onClick={() => fetchEnquires(localStorage.getItem("token"))}
          className={`flex justify-end items-center text-[#575757] px-3 cursor-pointer ${
            loading ? "animate-spin" : ""
          } `}
        >
          <MdRefresh size={25} />
        </div>
      </div>

      <div className="bg-white p-4">
        <div className="flex justify-between items-center mb-4 gap-2">
          <div className="w-full relative">
            <span className="absolute top-3.5 left-2">
              <Search />
            </span>
            <input
              type="text"
              placeholder="Search clients by name, contact or message"
              className=" px-3 pl-8 w-full py-2 text-[14px] border rounded-md outline-none"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {!loading ? (
          <div className="overflow-auto">
            <table className="w-full text-left bg-[#0a3a75] text-white/90 rounded-sm shadow-md shadow-black/20">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-4 text-[14px] font-medium capitalize">
                    Name
                  </th>
                  <th className="py-3 px-4 text-[14px] font-medium capitalize">
                    Contact
                  </th>
                  <th className="py-3 px-4 text-[14px] font-medium capitalize">
                    Email
                  </th>
                  {/* <th className="py-3 px-4 text-[14px] font-medium capitalize">
                    Details
                  </th> */}

                  <th className="py-3 px-4 text-[14px] font-medium capitalize">
                    Check In
                  </th>

                  <th className="py-3 px-4 text-[14px] font-medium capitalize">
                    Check Out
                  </th>

                  {/* <th className="py-3 px-4 text-[14px] font-medium capitalize">
                    status
                  </th> */}

                  <th className="py-3 px-4 text-[14px] font-medium capitalize resize">
                    Date Added
                  </th>
                </tr>
              </thead>

              {filteredEnquires && (
                <tbody>
                  {filteredEnquires
                    .map((enquery, index) => (
                      <tr
                        key={index}
                        className={`py-1 border-b odd:bg-gray-50 even:bg-gray-100 rounded-lg border-gray-200 hover:bg-[#f8f8fb] transition duration-300 cursor-pointer ${
                          enquery?.status === "Open"
                            ? " text-purple-500"
                            : "text-[#575757]"
                        }`}
                        onClick={() => {
                          setSelectedLead(enquery);
                          setIsPopupOpen(true);
                        }}
                      >
                        <td className="py-3 px-2 text-[14px] font-semibold">
                          {enquery.Name.slice(0, 15)}
                        </td>

                        <td className="py-3 px-2 text-[14px] capitalize">
                          {enquery?.Contact}
                        </td>

                        <td className="py-3 px-2 text-[14px] w-10   text-[#575757]">
                          {enquery.Email}
                        </td>

                        {/* <td className="py-3 px-2 text-[14px]  ">
                          <span className="font-medium text-[14px]">
                            <span className="capitalize">
                              {enquery?.created_from}
                            </span>
                            :
                          </span>{" "}
                          {enquery?.Message.slice(0, 25)}{" "}
                          {enquery?.Message.length > 30 ? (
                            <span className="text-blue-600">...read more</span>
                          ) : (
                            ""
                          )}
                        </td> */}

                        <td className="py-3 px-2 text-[14px]  text-[#575757]">
                          {enquery.check_in ? (
                            enquery.check_in
                          ) : extractBookingInfo(enquery?.Message).checkIn ? (
                            extractBookingInfo(enquery?.Message).checkIn
                          ) : (
                            <span className="text-center">-</span>
                          )}
                        </td>

                        <td className="py-3 px-2 text-[14px]  text-[#575757]">
                          {enquery.check_out ? (
                            enquery.check_out
                          ) : extractBookingInfo(enquery?.Message).checkOut ? (
                            extractBookingInfo(enquery?.Message).checkOut
                          ) : (
                            <span className="">-</span>
                          )}
                        </td>

                        {/* <td className="py-3 px-2 text-[14px] font-medium capitalize">
                          {enquery?.status}
                        </td> */}

                        <td className="py-3 px-2 text-[14px] whitespace-nowrap capitalize">
                          {enquery?.Created_at
                            ? formatDateTime(enquery?.Created_at)
                            : ""}
                        </td>
                      </tr>
                    ))
                    .reverse()}
                </tbody>
              )}
            </table>
          </div>
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
      {/* <FilterPopup open={open} setOpen={setOpen} /> */}
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

/* <button onClick={() => setOpen(!open)} className="w-1/3 px-4 py-2 text-[#575757] text-[14px] font-medium bg-gray-200 rounded-md flex items-center justify-between">
                        <span className="flex items-center gap-2"><Filter className="w-2 h-2" /> Filter</span>
                        <span className="text-[#575757] text-[14px] font-semibold rotate-180"><Arrow /></span>
                    </button> */

/* <button onClick={() => setOpen(!open)} className="w-1/3 px-4 py-2 text-[#575757] text-[14px] font-medium bg-gray-200 rounded-md flex items-center justify-between">
                        <span className="flex items-center gap-2"><Filter className="w-2 h-2" /> Filter</span>
                        <span className="text-[#575757] text-[14px] font-semibold rotate-180"><Arrow /></span>
                    </button> */
