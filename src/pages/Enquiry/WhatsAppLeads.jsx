import jsonToCsvExport from "json-to-csv-export";
import { useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import { IoIosClose } from "react-icons/io";
import { IoSearch } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Pagination from "../../components/Pagination";
import { TableRowSkelton } from "../../components/Skeltons/TableSkelton";
import TablePaginationInfo from "../../components/TablePaginationInfo";
import CustomDropdown from "../../components/ui/Dropdown";
import WebSocketClient from "../../config/websocketClient";
import {
  BASE_PATH,
  ROUTES_PATH,
  WEBSOCKET_EVENTS,
  WS_BASE_URL,
} from "../../data/constant";
import useDebounce from "../../hooks/useDebounce";
import usePagination from "../../hooks/usePagination";
import { getLeads, updateLead } from "../../services/api/leads.api";
import { formatDateTime } from "../../utils/formateDate";

const CREATED_FROM = "whatsapp";

const Stages = [
  { label: "Open Queries", value: "Open" },
  { label: "Contacted", value: "Contacted" },
  { label: "Converted", value: "Converted" },
  { label: "Out Of Budget", value: "Out Of Budget" },
  { label: "Potential For Later", value: "Potential" },
  { label: "Quotation Provided", value: "Quotation Provided" },
  { label: "Dead Lead", value: "Dead Lead" },
  { label: "Date Sold Out", value: "Date Sold Out" },
  { label: "Duplicate", value: "Duplicate" },
  { label: "Follow up", value: "Follow Up" },
  { label: "Not Respond", value: "Not Respond" },
  { label: "Qualified", value: "Qualified" },
  { label: "Not Qualified", value: "Not Qualified" },
  { label: "Turn Away", value: "Turn Away" },
  { label: "Hot", value: "Hot" },
];

const WhatsAppLeads = () => {
  const wsRef = useRef(null);
  const navigate = useNavigate();

  const [allLeads, setAllLeads] = useState([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
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
  } = usePagination({ initialLimit: 20 });

  const tableHeaders = [
    { key: "Created_at", label: "Created Time" },
    { key: "Name", label: "Full Name" },
    { key: "Contact", label: "Phone Number" },
    { key: "Email", label: "Email" },
    { key: "notes", label: "Notes" },
    { key: "status", label: "Stages" },
  ];

  const setDateRange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  const fetchLeads = async (withDateFilter = false) => {
    setIsLoadingLeads(true);

    try {
      const params = {
        page: page,
        search: debouncedSearch,
        limit: limit,

        created_from: CREATED_FROM,
      };

      if (withDateFilter && startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      }

      const response = await getLeads(params);

      if (response?.success) {
        setAllLeads(response?.result?.docs?.leads || []);
        setTotal(response?.result?.pagination?.total || 0);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoadingLeads(false);
    }
  };

  const extractRequiredHeaders = (leads) => {
    const ignoredHeaders = ["_id", "ndid", "hId", "updatedAt", "updated_at"];

    const cleanedLeads = leads.map((lead) =>
      Object.fromEntries(
        Object.entries(lead).filter(([key]) => !ignoredHeaders.includes(key)),
      ),
    );
    return cleanedLeads;
  };

  const exportToExcel = async () => {
    setIsExporting(true);
    const params = {
      is_export: "excel",
      created_from: CREATED_FROM,
    };
    try {
      const response = await getLeads(params);
      if (response?.success) {
        const leads = response?.result?.docs?.leads || [];

        jsonToCsvExport({
          data: extractRequiredHeaders(leads),
          options: {
            filename: "All Leads",
            delimiter: ",",
            headers: Object.keys(leads[0]), // auto headers
          },
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.message || "Failed to update lead stage",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleUpdateStage = async (leadId, hid, stage,conversationId) => {
    const payload = {
      leadId: leadId,
      status: stage,
      hid: hid,
      conversationId: conversationId,
    };
    try {
      const response = await updateLead(payload);
      if (response?.success && response?.responseStatusCode === 200) {
        // fetchLeads();
        // return;
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.message || "Failed to update lead stage",
      });
    }
  };

  const handleRedirectToPage = (row) => {
    const hid = localStorage.getItem("hid");
    const navigatePath = `${BASE_PATH}/${hid}/${ROUTES_PATH.LEADS_MANAGEMENT}/all-leads/${row._id}/view?hid=${row?.hId}`;
    navigate(navigatePath);
  };

  useEffect(() => {
    if (!startDate && !endDate) {
      fetchLeads(false);
      return;
    }

    // Fetch ONLY when both dates are selected
    if (startDate && endDate) {
      fetchLeads(true);
    }
  }, [page, debouncedSearch, startDate, endDate, limit]);

  useEffect(() => {
    wsRef.current = new WebSocketClient(WS_BASE_URL);

    wsRef.current.connect((serverResponse) => {
      if (serverResponse?.event === WEBSOCKET_EVENTS.META_NEW_LEAD) {
        console.log(serverResponse);
      }
    });

    return () => wsRef.current?.close();
  }, []);

  // console.log(selectedLead);

  return (
    <div className="bg-white p-3 md:p-6 space-y-3 md:space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Whatsapp Leads</h2>

        {allLeads?.length > 0 && (
          <button
            disabled={isExporting}
            onClick={exportToExcel}
            className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-1.5"
          >
            Export to Excel{" "}
            {isExporting && <Loader color="#fefefe" size={12} />}
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl md:shadow-sm border border-gray-200 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* LEFT SIDE FILTERS */}
          <div className="flex flex-wrap items-center gap-3">
            {/* SEARCH */}
            <div className="flex items-center gap-2 h-10 w-72 px-3 rounded-lg border border-gray-300 bg-gray-50 focus-within:ring-2 focus-within:ring-primary">
              <IoSearch className="text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search clients..."
                className="w-full bg-transparent outline-none text-sm placeholder-gray-400"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* DATE RANGE */}
            <div className="relative">
              <div className="h-10 px-3 flex items-center rounded-lg border border-gray-300 bg-gray-50 focus-within:ring-2 focus-within:ring-primary">
                <DatePicker
                  selectsRange
                  startDate={startDate}
                  endDate={endDate}
                  onChange={(update) => setDateRange(update)}
                  className="bg-transparent outline-none text-sm w-40"
                  placeholderText="Date range"
                  popperClassName="!z-50"
                />
              </div>

              {startDate && endDate && (
                <span
                  onClick={() => {
                    setStartDate(null);
                    setEndDate(null);
                  }}
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center rounded-full bg-red-500 text-white cursor-pointer"
                >
                  <IoIosClose size={18} />
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-primary">
            <tr>
              <th className="px-3 py-3 text-white">#</th>
              {tableHeaders?.map((h) => (
                <th
                  key={h.key}
                  className="px-3 py-3 text-left text-white min-w-40"
                >
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {isLoadingLeads && (
              <TableRowSkelton rows={limit} columns={tableHeaders?.length} />
            )}

            {!isLoadingLeads &&
              allLeads.length > 0 &&
              allLeads.map((row, i) => (
                <tr
                  key={i}
                  onClick={() => {
                    handleRedirectToPage(row);
                  }}
                  className="odd:bg-white even:bg-gray-50 hover:bg-blue-50 cursor-pointer"
                >
                  <td className="px-3 py-2.5">{i + limit * (page - 1) + 1}</td>

                  {tableHeaders.map((h) => {
                    // const timesLabels = ["created_time", "Created_at"];

                    if (h.key === "Created_at") {
                      const isLeadCreatedTime = row?.meta?.created_time;

                      return (
                        <td key={h.key} className="px-3 py-2">
                          {formatDateTime(
                            isLeadCreatedTime ? isLeadCreatedTime : row[h.key],
                          )}
                        </td>
                      );
                    }
                    if (h.key === "phone_number") {
                      return (
                        <td
                          key={h.key}
                          className="px-3 py-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Link to={`tel:${row[h.key]}`}>
                            {row[h.key] || "-"}
                          </Link>
                        </td>
                      );
                    }
                    if (h.key === "status") {
                      return (
                        <td onClick={(e) => e.stopPropagation()}>
                          <CustomDropdown
                            label={row.status}
                            options={Stages}
                            className="border w-40! p-1! rounded-md! bg-gray-100!"
                            onChange={(value) => {
                              handleUpdateStage(row?._id, row?.hId, value,row?.conversationId);
                            }}
                          />
                        </td>
                      );
                    }
                    if (h.key === "notes") {
                      const isNotes = row[h.key] && row[h.key].length > 0;

                      const noteMessage =
                        isNotes && row[h.key]?.slice(-1)[0]?.message;
                      return <td>{isNotes ? noteMessage : "-"}</td>;
                    }
                    return (
                      <td key={h.key} className="px-3 py-2">
                        {row[h.key] || "-"}
                      </td>
                    );
                  })}
                </tr>
              ))}

            {!isLoadingLeads && allLeads.length === 0 && (
              <tr>
                <td colSpan={7} className="py-6 text-center">
                  No Leads Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col items-end px-4 py-6">
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={goToPage}
          onNext={nextPage}
          onPrev={prevPage}
        />

        <TablePaginationInfo
          limit={limit}
          onLimitChange={changeLimit}
          page={page}
          total={total}
        />
      </div>
    </div>
  );
};

export default WhatsAppLeads;

// import { useEffect, useState } from "react";
// import { formatDateTime } from "../../services/formateDate";
// import { getLeads, UpdateLeadStatus } from "../../services/api/leads.api";

// import Swal from "sweetalert2";
// import LeadPopup from "../../components/Popup/LeadPopup";
// import { getWhatsAppLeads } from "../../services/api/whatsApp";
// import WhatsAppLeadPopup from "../../components/Popup/WhatsAppLeadPopup";

// const WhatsAppLeads = () => {
//   const [leads, setLeads] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const [isPopupOpen, setIsPopupOpen] = useState(false);
//   const [selectedLead, setSelectedLead] = useState(null);

//   const fetchWhatsAppLeads = async () => {
//     setLoading(true);
//     try {
//       const response = await getWhatsAppLeads();
//       if (response?.success) {
//         setLeads(response?.result?.docs || []);
//       }
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleStageChange = async (lead, stage) => {
//     try {
//       await UpdateLeadStatus(lead, stage);

//       Swal.fire({
//         icon: "success",
//         title: "Stage updated",
//         timer: 1000,
//         showConfirmButton: false,
//       });

//       fetchWhatsAppLeads();
//     } catch {
//       Swal.fire("Error", "Failed to update stage", "error");
//     }
//   };

//   useEffect(() => {
//     fetchWhatsAppLeads();
//   }, []);

//   return (
//     <div className="w-full px-4">
//       <h2 className="text-lg font-semibold mb-4">WhatsApp Leads</h2>

//       <table className="w-full border-collapse">
//         <thead className="bg-[#0a3a75] text-white">
//           <tr>
//             <th className="py-3 px-2 text-left">#</th>
//             <th className="py-3 px-2 text-left">Date</th>
//             <th className="py-3 px-2 text-left">Name</th>
//             <th className="py-3 px-2 text-left">Phone</th>
//             <th className="py-3 px-2 text-left">Source</th>
//             <th className="py-3 px-2 text-left">Stage</th>
//           </tr>
//         </thead>

//         <tbody>
//           {loading && (
//             <tr>
//               <td colSpan="6" className="py-6 text-center">
//                 Loading leads...
//               </td>
//             </tr>
//           )}

//           {!loading &&
//             leads?.length > 0 &&
//             leads?.map((lead, index) => (
//               <tr
//                 key={lead._id}
//                 className="border-b odd:bg-gray-50 even:bg-gray-100 hover:bg-[#f8f8fb] cursor-pointer"
//                 onClick={() => {
//                   setSelectedLead(lead);
//                   setIsPopupOpen(true);
//                 }}
//               >
//                 <td className="py-3 px-2">{index + 1}</td>

//                 <td className="py-3 px-2 whitespace-nowrap">
//                   {formatDateTime(lead.createdAt)}
//                 </td>

//                 <td className="py-3 px-2 font-medium">{lead.name || "-"}</td>

//                 <td className="py-3 px-2">+{lead.phone}</td>

//                 <td className="py-3 px-2 capitalize">{lead.source}</td>

//                 <td className="py-3 px-2" onClick={(e) => e.stopPropagation()}>
//                   <select
//                     className="bg-gray-50 border rounded px-2 py-1 outline-none cursor-pointer"
//                     value={lead.stage || "Open"}
//                     onChange={(e) => handleStageChange(lead, e.target.value)}
//                   >
//                     <option value="Open">Open</option>
//                     <option value="Contacted">Contacted</option>
//                     <option value="Converted">Converted</option>
//                     <option value="Duplicate">Duplicate</option>
//                     <option value="Dead Lead">Dead Lead</option>
//                   </select>
//                 </td>
//               </tr>
//             ))}

//           {!loading && leads.length === 0 && (
//             <tr>
//               <td colSpan="6" className="py-6 text-center text-gray-500">
//                 No WhatsApp Leads Found
//               </td>
//             </tr>
//           )}
//         </tbody>
//       </table>

//       {/* ✅ Lead Popup */}
//       <WhatsAppLeadPopup
//         isOpen={isPopupOpen}
//         onClose={() => setIsPopupOpen(false)}
//         lead={selectedLead}
//         // onAddNote={(text) => addLeadNote(selectedLead._id, text)}
//         // onEditNote={(noteId, text) =>
//         //   updateLeadNote(selectedLead._id, noteId, text)
//         // }
//       />
//     </div>
//   );
// };

// export default WhatsAppLeads;
