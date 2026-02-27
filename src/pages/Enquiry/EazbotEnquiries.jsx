import jsonToCsvExport from "json-to-csv-export";
import { useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import { FaPlus } from "react-icons/fa";
import { IoIosClose } from "react-icons/io";
import { IoSearch } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Loader from "../../components/Loader";
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
import { updateMetaLead } from "../../services/api/MetaLeads.api";
import ActivityModal from "../ConversationalTool/WhatsApp/components/ActivityModal";
import Timeline from "../ConversationalTool/WhatsApp/components/Timeline";
import { formatDate, formatDateTime } from "../../utils/formateDate";

const CREATED_FROM = "eazbot";

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

const EazbotLeads = () => {
  const wsRef = useRef(null);
  const navigate = useNavigate();

  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [isEditingLoading, setIsEditingLoading] = useState(false);

  const [selectedLead, setSelectedLead] = useState(null);
  const [allLeads, setAllLeads] = useState([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);

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

      console.log(response);
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

  const flattenMetaLeads = (allMetaLeads) => {
    return allMetaLeads.map((leadObj) => {
      const flatLead = {};

      // Extract field_data
      leadObj.lead?.field_data?.forEach((field) => {
        flatLead[field.name] = field.values?.[0] || "";
      });

      // Add top-level fields
      flatLead.status = leadObj.status;
      flatLead.stage = leadObj.stage;
      flatLead.source = leadObj.source;
      flatLead.createdAt = leadObj.createdAt;
      flatLead.updatedAt = leadObj.updatedAt;

      // Notes (optional)
      flatLead.notes = leadObj.notes?.length
        ? leadObj.notes.map((n) => n.text || "").join(" | ")
        : "";

      return flatLead;
    });
  };

  const exportToExcel = () => {
    if (!allLeads.length) return;

    const flattenedData = flattenMetaLeads(allLeads);

    jsonToCsvExport({
      data: flattenedData,
      options: {
        filename: "Meta_Leads",
        delimiter: ",",
        headers: Object.keys(flattenedData[0]), // auto headers
      },
    });
  };

  const handleUpdateStage = async (leadId, hid, stage) => {
    const payload = {
      leadId: leadId,
      status: stage,
      hid: hid,
    };
    try {
      const response = await updateLead(payload);
      if (response?.success && response?.responseStatusCode === 200) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Lead stage updated successfully",
        });
        fetchLeads();
        return;
      }

      Swal.fire({
        icon: "error",
        title: "Error",
        text: response?.responseMessage || "Failed to update lead stage",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.message || "Failed to update lead stage",
      });
    }
  };

  const hanldeUpdateNotes = async (leadId) => {
    setIsEditingLoading(true);
    const payload = {
      leadId: leadId,
      notes: selectedLead?.notes || [],
    };
    try {
      const response = await updateMetaLead(payload);
      if (response?.success && response?.responseStatusCode === 200) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Lead notes updated successfully",
        });
        return;
      }
      Swal.fire({
        icon: "error",
        title: "Error",
        text: response?.responseMessage || "Failed to update lead notes",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.message || "Failed to update lead notes",
      });
    } finally {
      setIsEditingLoading(false);
      setIsEdit(false);
    }
  };

  const handleNotesSave = (activity) => {
    setIsEdit(true);
    setSelectedLead((prev) => {
      const notes = [...(prev.notes || [])];

      if (editingIndex !== null) {
        notes[editingIndex] = activity;
      } else {
        notes.push(activity);
      }

      return { ...prev, notes };
    });
  };

  const handleRemoveNote = (index) => {
    setIsEdit(true);
    setSelectedLead((prev) => {
      const notes = [...(prev.notes || [])];
      notes.splice(index, 1);
      return { ...prev, notes };
    });
  };

  const handleRedirectToPage = (row) => {
    const hid = localStorage.getItem("hid");
    const navigatePath = `${BASE_PATH}/${hid}/${ROUTES_PATH.LEADS_MANAGEMENT}/eazbot-leads/${row._id}/view?hid=${row?.hId}`;
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
    <div className="bg-white p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Meta Leads</h2>

        <button
          onClick={exportToExcel}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Export to Excel
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3">
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
                    // setIsEdit(false);
                    // setSelectedLead(row);
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
                              handleUpdateStage(row?._id, row?.hId, value);
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

      {/* MODAL */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 py-2">
          <div className="relative bg-white max-w-3xl w-full p-4 max-h-[90vh] overflow-y-auto rounded grid grid-cols-2 gap-4 divide-x divide-amber-500">
            <div>
              <div className="flex justify-between mb-4">
                <p className="text-sm text-gray-500">
                  Lead Added: {formatDate(selectedLead?.created_time)}
                </p>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="bg-orange-500 text-white px-3 py-1 rounded absolute top-2 right-2"
                >
                  Close
                </button>
              </div>

              {selectedLead?.lead?.field_data?.map((field, i) => (
                <div key={i} className="mb-3">
                  <p className="font-medium text-gray-600 capitalize">
                    {field.name.replaceAll("_", " ")}
                  </p>
                  <p className="wrap-break-word">{field.values?.[0]}</p>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <div className="flex gap-2 items-center mb-4 bg-gray-100 px-4 py-1.5 w-fit rounded-full">
                <h3 className="text-sm font-medium text-[#37322F]">Notes</h3>

                <button
                  onClick={() => {
                    setEditingIndex(null);
                    setEditingNote(null);
                    setIsAddActivityOpen(true);
                  }}
                  className="rounded-full size-8 border bg-primary text-white border-gray-400 flex items-center justify-center text-lg"
                >
                  <FaPlus size={10} />
                </button>
              </div>

              {/* Notes exist */}
              {selectedLead?.notes && selectedLead.notes.length > 0 ? (
                <div className="max-h-72 overflow-auto pr-2">
                  <Timeline
                    items={selectedLead.notes}
                    onEdit={(item, index) => {
                      setEditingIndex(index);
                      setEditingNote(item);
                      setIsAddActivityOpen(true);
                    }}
                    onDelete={(item, index) => handleRemoveNote(index)}
                  />
                </div>
              ) : (
                /* No notes placeholder */
                <p className="text-sm text-gray-400">No notes added yet.</p>
              )}

              {isEdit && (
                <div className="flex justify-end mt-2">
                  <button
                    disabled={isEditingLoading}
                    onClick={() => {
                      hanldeUpdateNotes(selectedLead?.meta?.leadgen_id);
                    }}
                    className="bg-green-700 text-white px-3 py-1 rounded flex items-center gap-1.5"
                  >
                    Save {isEditingLoading && <Loader color="#fff" size={12} />}
                  </button>
                </div>
              )}

              <ActivityModal
                open={isAddActivityOpen}
                initialData={editingNote}
                onClose={() => {
                  setIsAddActivityOpen(false);
                  setEditingIndex(null);
                  setEditingNote(null);
                }}
                onSave={(activity) => {
                  handleNotesSave(activity);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EazbotLeads;

// import { useEffect, useState } from "react";
// import { formatDateTime } from "../../services/formateDate";
// import { getLeads, UpdateLeadStatus } from "../../services/api/leads.api";
// import LeadPopup, { formatPhoneNumber } from "../../components/Popup/LeadPopup";
// import { useSelector } from "react-redux";
// import { extractBookingInfo } from "./Leads";
// import { Search } from "../../icons/icon";
// import DatePicker from "react-datepicker";
// import { FaFileExcel, FaPlus } from "react-icons/fa";
// import Swal from "sweetalert2";
// import usePagination from "../../hooks/usePagination";
// import Pagination from "../../components/Pagination";
// import TablePaginationInfo from "../../components/TablePaginationInfo";
// import useDebounce from "../../hooks/useDebounce";

// const EazbotLeads = () => {
//   const { user: hotel } = useSelector((state) => state.userProfile);
//   const [isPopupOpen, setIsPopupOpen] = useState(false);
//   const [selectedLead, setSelectedLead] = useState(null);
//   const [allLeads, setAllLeads] = useState([]);
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [loading, setLoading] = useState(false);
//   const debouncedSearch = useDebounce(searchTerm, 500);

//   const {
//     page,
//     limit,
//     total,
//     totalPages,
//     setTotal,
//     goToPage,
//     nextPage,
//     prevPage,
//     changeLimit,
//   } = usePagination({ initialLimit: 10 });

//   const fetchAllLeads = async () => {
//     setLoading(true);
//     try {
//       const query = `page=${page}&limit=${limit}&created_from=eazbot&search=${debouncedSearch}`;
//       const response = await getLeads(query);
//       if (response?.success && response?.responseStatusCode === 200) {
//         setAllLeads(response?.result?.docs || []);
//         setTotal(response?.result?.pagination?.total || 0);
//       }
//     } catch (error) {
//       console.error("Error fetching all leads:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const setDateRange = (dates) => {
//     const [start, end] = dates;
//     setStartDate(start);
//     setEndDate(end);

//     if (start && end) {
//       // Normalize to full-day range
//       // console.log("inn");
//       const startOfDay = new Date(start);
//       startOfDay.setHours(0, 0, 0, 0);

//       const endOfDay = new Date(end);
//       endOfDay.setHours(23, 59, 59, 999);

//       const filtered = allLeads.filter((item) => {
//         const createdAtDate = new Date(item.Created_at);
//         return createdAtDate >= startOfDay && createdAtDate <= endOfDay;
//       });

//       setAllLeads(filtered);
//     }
//   };

//   const handleStatusChange = async (lead, status) => {
//     try {
//       const { data } = await UpdateLeadStatus(lead, status);
//       // console.log("Handle lead status", data);

//       Swal.fire({
//         icon: "success",
//         title: "Query Status Updated!",
//         text: data.Message || "Query has been updated successfully.",
//         timer: 600,
//         showConfirmButton: false,
//       }).then(() => {
//         if (data.Status) {
//           // handleTabClick(active);
//           fetchAllLeads();
//         }
//       });
//     } catch (error) {
//       Swal.fire({
//         icon: "error",
//         title: "Error",
//         text: error.message || "Error updating Query Status",
//       });
//     }
//   };

//   useEffect(() => {
//     if (page && limit) fetchAllLeads();
//   }, [page, limit, debouncedSearch]);
//   return (
//     <div className="w-full">
//       <div className="flex lg:flex-row flex-col justify-between lg:items-center my-2">
//         <div className="flex lg:flex-row flex-col justify-between lg:items-center gap-2 max-w-3xl w-full px-4">
//           <div className="relative w-full">
//             <span className="absolute top-3.5 left-2 -z-10">
//               <Search />
//             </span>
//             <input
//               type="text"
//               placeholder="Search clients by name, contact or message"
//               className=" px-3 pl-2 lg:pl-8 w-full py-2 text-[14px] border rounded-md outline-none"
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//           </div>

//           <div className="flex items-center gap-2">
//             <div className="border border-gray-300 rounded-md p-1.5">
//               <DatePicker
//                 // maxDate={msg?.disabled ? new Date() : undefined}
//                 className="outline-none w-full"
//                 selectsRange
//                 startDate={startDate}
//                 endDate={endDate}
//                 required
//                 onChange={(update) => {
//                   setDateRange(update);
//                 }}
//                 popperClassName="!z-50"
//                 placeholderText="Select date range"
//                 // isClearable
//                 // minDate={new Date()}
//               />
//             </div>

//             {startDate && endDate && (
//               <span
//                 className="text-[#575757] text-[14px] font-semibold cursor-pointer"
//                 onClick={() => {
//                   setStartDate(null);
//                   setEndDate(null);

//                   fetchAllLeads();
//                 }}
//               >
//                 Clear
//               </span>
//             )}
//           </div>
//         </div>

//         <div className="py-2 lg:px-4 flex flex-col sm:flex-row sm:items-center gap-4">
//           <div
//             // onClick={handleAddRow}
//             className="bg-green-500 whitespace-nowrap w-fit text-white border py-1 px-3 cursor-pointer rounded flex items-center gap-2 "
//           >
//             <FaPlus />
//             <span className="font-medium">Add Lead</span>
//           </div>
//         </div>
//       </div>

//       <table className="w-full border-collapse">
//         <thead className="sticky top-0 bg-[#0a3a75] w-full">
//           <tr className="border-b text-start text-white">
//             <th className="py-3 text-start px-2 text-[14px] font-medium capitalize">
//               Select
//             </th>

//             <th className="py-3 text-start px-2 text-[14px] font-medium capitalize">
//               #
//             </th>

//             <th className="py-3 px-2 text-start text-[14px] font-medium capitalize">
//               Date Added
//             </th>

//             <th className="py-3 px-2 text-[14px] text-start font-medium capitalize">
//               Source Url
//             </th>

//             <th className="py-3 px-2 text-start text-[14px] font-medium capitalize">
//               Name
//             </th>

//             <th className="py-3 px-2 text-start text-[14px] font-medium capitalize">
//               Contact
//             </th>

//             <th className="py-3 px-2 text-start text-[14px] font-medium capitalize">
//               Email
//             </th>

//             {!hotel?.Profile?.websiteType && (
//               <th className="py-3 px-4 text-[14px] text-start font-medium capitalize whitespace-nowrap">
//                 Number of Guests
//               </th>
//             )}

//             {!hotel?.Profile?.websiteType && (
//               <th className="py-3 px-2 text-[14px] text-start font-medium capitalize whitespace-nowrap">
//                 Check In
//               </th>
//             )}

//             {!hotel?.Profile?.websiteType && (
//               <th className="py-3 px-2 text-[14px] text-start font-medium capitalize whitespace-nowrap">
//                 Check Out
//               </th>
//             )}

//             <th className="py-3 px-2 text-start text-[14px] font-medium capitalize">
//               Stages
//             </th>
//           </tr>
//         </thead>

//         <tbody>
//           {loading && (
//             <tr>
//               <td colSpan={12} className="py-6 text-center">
//                 <div className="flex justify-center items-center gap-2 text-gray-500">
//                   Loading leads...
//                 </div>
//               </td>
//             </tr>
//           )}

//           {!loading &&
//             allLeads?.length > 0 &&
//             allLeads.map((enquery, index) => {
//               if (!enquery.Contact || enquery.Contact === "undefined")
//                 return null;
//               return (
//                 <tr
//                   key={index}
//                   className={`py-1 border-b odd:bg-gray-50 even:bg-gray-100 border-gray-200 hover:bg-[#f8f8fb] transition duration-300 cursor-pointer ${
//                     enquery?.status === "Open"
//                       ? " text-[#575757]"
//                       : "text-[#575757]"
//                   }`}
//                   onClick={() => {
//                     setSelectedLead(enquery);
//                     setIsPopupOpen(true);
//                   }}
//                 >
//                   <td className="py-3 px-2 text-[14px] capitalize whitespace-nowrap">
//                     <input
//                       type="checkbox"
//                       // checked={rowSelected.includes(enquery?._id)}
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         // handleRowSelect(enquery?._id);
//                       }}
//                     />
//                   </td>
//                   <td className="py-3 px-2 text-[14px] capitalize whitespace-nowrap">
//                     {index + 1}
//                   </td>

//                   <td className="py-3 px-2 text-[14px] whitespace-nowrap capitalize">
//                     {enquery?.Created_at
//                       ? formatDateTime(enquery?.Created_at)
//                       : ""}
//                   </td>

//                   <td className="py-3 px-2 text-[14px] font-semibold whitespace-nowrap">
//                     <span title={enquery?.source_url || "Landing Page"}>
//                       {(enquery?.source_url?.length ?? 0) > 60
//                         ? `${enquery?.source_url.slice(0, 40)}...`
//                         : enquery?.source_url || "Landing Page"}
//                     </span>
//                   </td>
//                   <td className="py-3 px-2 text-[14px] font-semibold whitespace-nowrap">
//                     {/* {enquery?.Name.slice(0, 15)} */}
//                     {enquery?.Name?.substring(0, 15)}
//                   </td>
//                   <td className="py-3 px-2 text-[14px] capitalize whitespace-nowrap">
//                     {formatPhoneNumber(enquery?.Contact)}
//                   </td>
//                   <td className="py-3 px-2 text-[14px] text-[#575757]">
//                     {enquery?.Email === "undefined" ? "-" : enquery?.Email}
//                   </td>

//                   {!hotel?.Profile?.websiteType && (
//                     <td className="py-3 px-2 text-[14px] text-[#575757] text-center">
//                       {enquery?.numberOfGuest == ""
//                         ? "-"
//                         : enquery?.numberOfGuest
//                           ? enquery?.numberOfGuest
//                           : isNaN(
//                                 extractBookingInfo(enquery?.Message)?.guests,
//                               ) ||
//                               extractBookingInfo(enquery?.Message)?.guests === 0
//                             ? "-"
//                             : extractBookingInfo(enquery?.Message)?.guests}
//                     </td>
//                   )}

//                   {/* <td className="py-3 px-2 text-[14px] text-[#575757]">
//                                 {enquery?.Message}
//                               </td> */}
//                   {!hotel?.Profile?.websiteType && (
//                     <td className="py-3 px-2 text-[14px] text-[#575757]">
//                       {enquery?.check_in
//                         ? enquery?.check_in === "undefined"
//                           ? "-"
//                           : enquery.check_in
//                         : extractBookingInfo(enquery?.Message)?.checkIn || "-"}
//                     </td>
//                   )}

//                   {!hotel?.Profile?.websiteType && (
//                     <td className="py-3 px-2 text-[14px] text-[#575757]">
//                       {enquery?.check_out
//                         ? enquery?.check_out === "undefined"
//                           ? "-"
//                           : enquery.check_out
//                         : extractBookingInfo(enquery?.Message)?.checkOut || "-"}
//                     </td>
//                   )}

//                   {/* <td className="py-3 px-2 text-[14px] text-[#575757] font-medium">
//                                 {enquery?.status}
//                               </td> */}

//                   <td className="py-3 px-2 text-[14px] text-[#575757] font-medium">
//                     <select
//                       className="outline-none py-2 bg-gray-50 cursor-pointer"
//                       defaultValue={enquery?.status}
//                       value={enquery?.status}
//                       onClick={(e) => e.stopPropagation()}
//                       onChange={(e) => {
//                         handleStatusChange(enquery, e.target.value);
//                       }}
//                     >
//                       <option disabled className="text-gray-500 bg-white">
//                         Select Status
//                       </option>
//                       <option value="Converted" className="bg-white text-black">
//                         Converted
//                       </option>
//                       <option
//                         value="Contacted"
//                         className="bg-white  text-black"
//                       >
//                         Contacted
//                       </option>
//                       <option value="Open" className="bg-white  text-black">
//                         Open
//                       </option>

//                       <option
//                         value="Out Of Budget"
//                         className="bg-white  text-black"
//                       >
//                         Out Of Budget
//                       </option>
//                       <option
//                         value="Potential"
//                         className="bg-white  text-black"
//                       >
//                         Potential For Later
//                       </option>

//                       <option
//                         value="Quotation Provided"
//                         className="bg-white  text-black"
//                       >
//                         Quotation Provided
//                       </option>
//                       <option
//                         value="Dead Lead"
//                         className="bg-white  text-black"
//                       >
//                         Dead Lead
//                       </option>

//                       <option
//                         value="Date Sold Out"
//                         className="bg-white  text-black"
//                       >
//                         Date Sold Out
//                       </option>

//                       <option
//                         value="Duplicate"
//                         className="bg-white  text-black"
//                       >
//                         Duplicate
//                       </option>

//                       <option value="Reserved" className="bg-white  text-black">
//                         Reserved
//                       </option>

//                       <option value="Hot" className="bg-white  text-black">
//                         Hot
//                       </option>
//                     </select>
//                   </td>

//                   {/* <td className="py-3 px-2 text-[14px] text-[#575757] font-medium">
//                                     <span
//                                       className="flex justify-center"
//                                       onClick={(e) => {
//                                         e.stopPropagation();
//                                         handleDelete(enquery._id, enquery.Email);
//                                       }}
//                                     >
//                                       <MdDeleteOutline size={22} color="#df4545" />
//                                     </span>
//                                   </td> */}
//                 </tr>
//               );
//             })}

//           {!loading && allLeads?.length === 0 && (
//             <tr>
//               <td colSpan={12} className="py-6 text-center text-gray-500">
//                 No Leads Found
//               </td>
//             </tr>
//           )}
//         </tbody>
//       </table>

//       <div className="flex flex-col items-end px-4 py-6">
//         <Pagination
//           page={page}
//           totalPages={totalPages}
//           onPageChange={goToPage}
//           onNext={nextPage}
//           onPrev={prevPage}
//         />

//         <div>
//           <TablePaginationInfo
//             limit={limit}
//             onLimitChange={changeLimit}
//             page={page}
//             total={total}
//           />
//         </div>
//       </div>

//       <LeadPopup
//         isOpen={isPopupOpen}
//         onClose={() => setIsPopupOpen(false)}
//         lead={selectedLead}
//         fetchEnquires={fetchAllLeads}
//         // handleTabClick={""}
//         // activeIndex={active}
//         show={!hotel?.Profile?.websiteType}
//       />
//     </div>
//   );
// };

// export default EazbotLeads;
