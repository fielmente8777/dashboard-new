import React, { useEffect, useState } from "react";
import { MdRefresh } from "react-icons/md";
import LeadPopup from "../../components/Popup/LeadPopup";
import { Arrow, Filter, Search } from "../../icons/icon";
import { formatDateTime } from "../../services/formateDate";
import handleLocalStorage from "../../utils/handleLocalStorage";
import { getAllClientEnquires } from "../../services/api/clientEnquire.api";
import ResizableTable from "../../components/Table/ResizableTable";
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
      const hid = handleLocalStorage("hid");
      const response = await getAllClientEnquires({
        token,
        hid,
      });
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
    const hid = handleLocalStorage("hid");
    try {
      if (index === 0) {
        const response = await getAllClientEnquires({ token, hid });
        setEnquires(response);
      } else if (index === 1) {
        const response = await getAllClientEnquires({
          token,
          hid,
          status: "Open",
        });
        setEnquires(response);
      } else if (index === 2) {
        const response = await getAllClientEnquires({
          token,
          hid,
          status: "Contacted",
        });
        setEnquires(response);
      } else if (index === 3) {
        const response = await getAllClientEnquires({
          token,
          hid,
          status: "Converted",
        });
        setEnquires(response);
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };
  // console.log(filteredEnquires,)

  const tableColumns = [
    {
      key: "Name",
      title: "Name",
      initialWidth: 150,
      render: (row) => row.Name.slice(0, 15),
      bodyCellClassName: "font-semibold",
    },
    {
      key: "Contact",
      title: "Contact",
      initialWidth: 120,
    },
    {
      key: "Email",
      title: "Email",
      initialWidth: 200,
      bodyCellClassName: "text-[#575757]",
    },
    {
      key: "check_in",
      title: "Check In",
      initialWidth: 120,
      render: (row) =>
        row.check_in ||
        extractBookingInfo(row?.Message).checkIn || (
          <span className="text-center">-</span>
        ),
      bodyCellClassName: "text-[#575757]",
    },
    {
      key: "check_out",
      title: "Check Out",
      initialWidth: 120,
      render: (row) =>
        row.check_out ||
        extractBookingInfo(row?.Message).checkOut || (
          <span className="">-</span>
        ),
      bodyCellClassName: "text-[#575757]",
    },
    {
      key: "Created_at",
      title: "Date Added",
      initialWidth: 150,
      sortable: true,
      render: (row) => (row?.Created_at ? formatDateTime(row?.Created_at) : ""),
      bodyCellClassName: "whitespace-nowrap capitalize",
    },
  ];

  const searchFields = ["Name", "Contact", "Email", "Message"];
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

          {/* <div>
            <button
              onClick={() => setOpen(!open)}
              className="w-1/3 px-4 py-2 text-[#575757] text-[14px] font-medium bg-gray-200 rounded-md flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Filter className="w-2 h-2" /> Filter
              </span>
              <span className="text-[#575757] text-[14px] font-semibold rotate-180">
                <Arrow />
              </span>
            </button>
          </div> */}
        </div>

        {!loading ? (
          // <div className="overflow-auto">
          //   <table className="w-full text-left bg-[#0a3a75] text-white/90 rounded-sm shadow-md shadow-black/20">
          //     <thead>
          //       <tr className="border-b">
          //         <th className="py-3 px-4 text-[14px] font-medium capitalize">
          //           Name
          //         </th>
          //         <th className="py-3 px-4 text-[14px] font-medium capitalize">
          //           Contact
          //         </th>
          //         <th className="py-3 px-4 text-[14px] font-medium capitalize">
          //           Email
          //         </th>
          //         {/* <th className="py-3 px-4 text-[14px] font-medium capitalize">
          //           Details
          //         </th> */}

          //         <th className="py-3 px-4 text-[14px] font-medium capitalize">
          //           Check In
          //         </th>

          //         <th className="py-3 px-4 text-[14px] font-medium capitalize">
          //           Check Out
          //         </th>

          //         {/* <th className="py-3 px-4 text-[14px] font-medium capitalize">
          //           status
          //         </th> */}

          //         <th className="py-3 px-4 text-[14px] font-medium capitalize resize">
          //           Date Added
          //         </th>
          //       </tr>
          //     </thead>

          //     {filteredEnquires && (
          //       <tbody>
          //         {filteredEnquires
          //           .map((enquery, index) => (
          //             <tr
          //               key={index}
          //               className={`py-1 border-b odd:bg-gray-50 even:bg-gray-100 rounded-lg border-gray-200 hover:bg-[#f8f8fb] transition duration-300 cursor-pointer ${
          //                 enquery?.status === "Open"
          //                   ? " text-purple-500"
          //                   : "text-[#575757]"
          //               }`}
          //               onClick={() => {
          //                 setSelectedLead(enquery);
          //                 setIsPopupOpen(true);
          //               }}
          //             >
          //               <td className="py-3 px-2 text-[14px] font-semibold ">
          //                 {enquery.Name.slice(0, 15)}
          //               </td>

          //               <td className="py-3 px-2 text-[14px] capitalize">
          //                 {enquery?.Contact}
          //               </td>

          //               <td className="py-3 px-2 text-[14px] w-10   text-[#575757]">
          //                 {enquery.Email}
          //               </td>

          //               {/* <td className="py-3 px-2 text-[14px]  ">
          //                 <span className="font-medium text-[14px]">
          //                   <span className="capitalize">
          //                     {enquery?.created_from}
          //                   </span>
          //                   :
          //                 </span>{" "}
          //                 {enquery?.Message.slice(0, 25)}{" "}
          //                 {enquery?.Message.length > 30 ? (
          //                   <span className="text-blue-600">...read more</span>
          //                 ) : (
          //                   ""
          //                 )}
          //               </td> */}

          //               <td className="py-3 px-2 text-[14px]  text-[#575757]">
          //                 {enquery.check_in ? (
          //                   enquery.check_in
          //                 ) : extractBookingInfo(enquery?.Message).checkIn ? (
          //                   extractBookingInfo(enquery?.Message).checkIn
          //                 ) : (
          //                   <span className="text-center">-</span>
          //                 )}
          //               </td>

          //               <td className="py-3 px-2 text-[14px]  text-[#575757]">
          //                 {enquery.check_out ? (
          //                   enquery.check_out
          //                 ) : extractBookingInfo(enquery?.Message).checkOut ? (
          //                   extractBookingInfo(enquery?.Message).checkOut
          //                 ) : (
          //                   <span className="">-</span>
          //                 )}
          //               </td>

          //               {/* <td className="py-3 px-2 text-[14px] font-medium capitalize">
          //                 {enquery?.status}
          //               </td> */}

          //               <td className="py-3 px-2 text-[14px] whitespace-nowrap capitalize">
          //                 {enquery?.Created_at
          //                   ? formatDateTime(enquery?.Created_at)
          //                   : ""}
          //               </td>
          //             </tr>
          //           ))
          //           .reverse()}
          //       </tbody>
          //     )}
          //   </table>
          // </div>
          <ResizableTable
            columns={tableColumns}
            data={enquires}
            onRowClick={(row) => {
              setSelectedLead(row);
              setIsPopupOpen(true);
            }}
            loading={loading}
            searchTerm={searchTerm}
            searchFields={searchFields}
            containerClassName="bg-white"
            headerRowClassName="border-b bg-[#0a3a75] text-white/90"
            bodyRowClassName={(row) =>
              `py-1 border-b odd:bg-gray-50 even:bg-gray-100 rounded-lg border-gray-200 hover:bg-[#f8f8fb] transition duration-300 cursor-pointer ${
                row?.status === "Open" ? "text-purple-500" : "text-[#575757]"
              }`
            }
          />
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
