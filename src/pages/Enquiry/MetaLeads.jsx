import jsonToCsvExport from "json-to-csv-export";
import { useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import { FaCalendarAlt, FaPlus } from "react-icons/fa";
import { IoIosClose, IoMdSync } from "react-icons/io";
import { IoCalendar, IoSearch } from "react-icons/io5";
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
  Stages,
  WEBSOCKET_EVENTS,
  WS_BASE_URL,
} from "../../data/constant";
import useDebounce from "../../hooks/useDebounce";
import usePagination from "../../hooks/usePagination";
import { getLeads, updateLead } from "../../services/api/leads.api";
import {
  bulkImportMetaLeads,
  getMetaAccounts,
  updateMetaLead,
} from "../../services/api/MetaLeads.api";

import { formatDate, formatDateTime } from "../../utils/formateDate";
import ActivityModal from "../ConversationalTool/WhatsApp/components/ActivityModal";
import Timeline from "../ConversationalTool/WhatsApp/components/Timeline";

const CREATED_FROM = "facebook";

const MetaLeads = () => {
  const wsRef = useRef(null);
  const navigate = useNavigate();

  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [isEditingLoading, setIsEditingLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [isSync, setIsSync] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const [allLeads, setAllLeads] = useState([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

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
        // stage: Stages.META_LEAD,
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

  const handleBulkImportMetaLeads = async () => {
    setIsSyncing(true);
    try {
      const response = await bulkImportMetaLeads();

      if (response?.success && response?.responseStatusCode === 200) {
        fetchLeads();
        setIsSync(true);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsSyncing(false);
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

  const fetchPageConnectionDetails = async () => {
    try {
      const response = await getMetaAccounts();

      if (response?.success && response?.responseStatusCode === 200) {
        setIsSync(response?.result?.docs?.isSynced);
      }
    } catch (error) {
      console.log(error);
    }
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

  const hanldeUpdateNotes = async (leadId) => {
    setIsEditingLoading(true);
    const payload = {
      leadId: leadId,
      notes: selectedLead?.notes || [],
    };
    try {
      const response = await updateMetaLead(payload);
      if (response?.success && response?.responseStatusCode === 200) {
        return;
      }
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
    const navigatePath = `${BASE_PATH}/${hid}/${ROUTES_PATH.LEADS_MANAGEMENT}/all-leads/${row._id}/view?hid=${row?.hId}`;
    navigate(navigatePath);
  };

  useEffect(() => {
    fetchPageConnectionDetails();
  }, []);

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
      const ndid = localStorage.getItem("ndid");
      const hid = localStorage.getItem("hid");
      if (
        serverResponse?.event === WEBSOCKET_EVENTS.META_NEW_LEAD &&
        ndid === serverResponse?.data?.ndid &&
        hid === serverResponse?.data?.hId
      ) {
        const { data } = serverResponse;
        const newMetaLead = data;

        setAllLeads((prev) => [newMetaLead, ...prev]);
      }
    });

    return () => wsRef.current?.close();
  }, [allLeads]);

  console.log("allLeads", allLeads);
  return (
    <div className="bg-white p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Meta Leads</h2>

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

            {/* PAGE DROPDOWN */}
            {/* {pages?.length > 0 && (
              <div>
                <CustomDropdown
                  label="Select Page"
                  options={pages?.map((p) => ({
                    value: p.id,
                    label: p.name,
                  }))}
                  onChange={setPageId}
                />
              </div>
            )} */}

            {/* FORM DROPDOWN */}
            {/* {forms?.length > 0 && (
              <div>
                <CustomDropdown
                  label="All Forms"
                  options={[
                    { value: "", label: "All" },
                    ...(forms?.map((f) => ({
                      value: f.id,
                      label: f.name,
                    })) || []),
                  ]}
                  width="w-60"
                  onChange={setFormId}
                />
              </div>
            )} */}

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

          {/* RIGHT ACTION */}
          {!!isSync && (
            <button
              disabled={isSyncing}
              onClick={handleBulkImportMetaLeads}
              className="h-10 px-5 rounded-lg bg-primary text-white text-sm font-medium flex items-center gap-2 hover:bg-primary/90 disabled:opacity-60"
            >
              Bulk Import
              <span className={isSyncing ? "animate-spin" : ""}>
                <IoMdSync />
              </span>
            </button>
          )}
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
              allLeads?.length > 0 &&
              allLeads?.map((row, i) => (
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
                      console.log(isLeadCreatedTime);
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
                          <Link to={`tel:${row[h.key]}`}>{row[h.key]}</Link>
                        </td>
                      );
                    }
                    if (h.key === "status") {
                      return (
                        <td onClick={(e) => e.stopPropagation()}>
                          <CustomDropdown
                            label={row?.status || "Select Status"}
                            options={Stages || []}
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
                    if (h.key === "Name") {
                      const isName = row[h.key];

                      const userName = isName
                        ? isName
                        : row?.other_details?.full_name;
                      return <td>{userName}</td>;
                    }
                    return (
                      <td key={h.key} className="px-3 py-2">
                        {row[h.key]
                          ? row[h.key]
                          : row?.created_from === "facebook"
                            ? row?.other_details["full_name "]
                            : "-"}
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

export default MetaLeads;

// const getFieldValue = (fieldData, includes) => {
//   const field = fieldData?.find((f) => includes.includes(f.name));
//   return field?.values?.[0] || "-";
// };
// const extractLeadFields = (lead) => {
//   const includesNamesLabel = ["full_name", "name", "what_is_name?", "name?"];
//   const includesPhoneLabel = ["phone", "phone_number", "mobile"];
//   // const includesCheckInLabel = [
//   //   "check_in",
//   //   "check_in_date",
//   //   "what_is_your_preferred_check_in_date",
//   //   "when_would_you_like_to_check_in?",
//   //   "what_is_your_preferred_check-in_date?",
//   // ];
//   // const includesCheckOutLabel = [
//   //   "check_out",
//   //   "check_out_date",
//   //   "preferred_check-out_date?",
//   //   "what_is_your_preferred_check_out_date",
//   //   "when_would_you_like_to_check_out?",
//   // ];

//   const fd = lead?.lead?.field_data;

//   return {
//     leadgen_id: lead?.meta?.leadgen_id,
//     created_time: new Date(lead?.meta?.created_time).toLocaleString(),
//     full_name: getFieldValue(fd, includesNamesLabel),
//     phone_number: getFieldValue(fd, includesPhoneLabel),
//     email: getFieldValue(fd, "email"),

//     stage: lead?.stage || "NEW",
//     notes: lead?.notes?.slice(-1)[0]?.message || null,
//   };
// };
