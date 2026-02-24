import jsonToCsvExport from "json-to-csv-export";
import { useEffect, useMemo, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import { FaPlus } from "react-icons/fa";
import { IoIosClose, IoMdSync } from "react-icons/io";
import { IoSearch } from "react-icons/io5";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import Pagination from "../../components/Pagination";
import { TableRowSkelton } from "../../components/Skeltons/TableSkelton";
import TablePaginationInfo from "../../components/TablePaginationInfo";
import CustomDropdown from "../../components/ui/Dropdown";
import WebSocketClient from "../../config/websocketClient";
import { WEBSOCKET_EVENTS, WS_BASE_URL } from "../../data/constant";
import useDebounce from "../../hooks/useDebounce";
import usePagination from "../../hooks/usePagination";
import {
  bulkImportMetaLeads,
  getAllMetaLeads,
  getMetaAccounts,
  getMetaForms,
  updateMetaLead,
} from "../../services/api/MetaLeads.api";
import { formatDate } from "../../utils/formateData";
import Timeline from "../ConversationalTool/WhatsApp/components/Timeline";
import ActivityModal from "../ConversationalTool/WhatsApp/components/ActivityModal";
import Loader from "../../components/Loader";

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
  { label: "Hot", value: "Hot" },
];

const MetaLeads = () => {
  const wsRef = useRef(null);
  // const { pageId } = useContext(DataContext);

  const [pages, setPages] = useState([]);
  const [forms, setForms] = useState([]);
  const [pageId, setPageId] = useState("");
  const [formId, setFormId] = useState("");
  const [stage, setStage] = useState(Stages[0].value);
  const [rowId, setRowId] = useState("");

  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [isEditingLoading, setIsEditingLoading] = useState(false);

  const [isSync, setIsSync] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const [allMetaLeads, setAllMetaLeads] = useState([]);
  const [isLoadingMetaLeads, setIsLoadingMetaLeads] = useState(false);
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
    { key: "created_time", label: "Created Time" },
    { key: "full_name", label: "Full Name" },
    { key: "phone_number", label: "Phone Number" },
    { key: "email", label: "Email" },
    { key: "notes", label: "Notes" },
    { key: "stages", label: "Stages" },
  ];

  const tableData = useMemo(() => {
    return allMetaLeads.map((lead) => extractLeadFields(lead));
  }, [allMetaLeads]);

  const setDateRange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  const fetchMetaLeads = async (withDateFilter = false) => {
    setIsLoadingMetaLeads(true);

    try {
      const params = {
        page: page,
        search: debouncedSearch,
        limit: limit,
        pageId: pageId,
        formId: formId,
      };

      if (withDateFilter && startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      }

      const response = await getAllMetaLeads(params);

      if (response?.success) {
        setAllMetaLeads(response?.result?.docs?.metaLeads || []);
        setTotal(response?.result?.pagination?.total || 0);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoadingMetaLeads(false);
    }
  };

  const handleBulkImportMetaLeads = async () => {
    setIsSyncing(true);
    try {
      const response = await bulkImportMetaLeads();

      if (response?.success && response?.responseStatusCode === 200) {
        fetchMetaLeads();
        setIsSync(true);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsSyncing(false);
    }
  };

  const exportToExcel = () => {
    if (!tableData.length) return;

    jsonToCsvExport({
      data: tableData,
      options: {
        filename: "Meta_Leads",
        delimiter: ",",
        headers: tableHeaders.map((h) => h.key),
      },
    });
  };

  const fetchPageConnectionDetails = async () => {
    try {
      const response = await getMetaAccounts();

      if (response?.success && response?.responseStatusCode === 200) {
        setPages(response?.result?.docs?.pages || []);
        setIsSync(response?.result?.docs?.isSynced);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchMetaForms = async (pageId) => {
    try {
      const response = await getMetaForms(pageId);
      if (response?.success && response?.responseStatusCode === 200) {
        const formsData = response?.result?.docs?.forms || [];
        setForms(formsData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleUpdateStage = async (leadId, stage) => {
    setRowId(leadId);
    setStage(stage);
    const payload = {
      leadId: leadId,
      stage: stage,
    };
    try {
      const response = await updateMetaLead(payload);
      if (response?.success && response?.responseStatusCode === 200) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Lead stage updated successfully",
        });
        fetchMetaLeads();
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

  useEffect(() => {
    fetchPageConnectionDetails();
    fetchMetaForms();
  }, []);

  useEffect(() => {
    if (!startDate && !endDate) {
      fetchMetaLeads(false);
      return;
    }

    // Fetch ONLY when both dates are selected
    if (startDate && endDate) {
      fetchMetaLeads(true);
    }
  }, [page, debouncedSearch, startDate, endDate, limit, pageId, formId]);

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
  console.log(tableData);

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

            {/* PAGE DROPDOWN */}
            {tableData.length > 0 && (
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
            )}

            {/* FORM DROPDOWN */}
            {tableData.length > 0 && (
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
            )}

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
          {!isSync && (
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
            {isLoadingMetaLeads && (
              <TableRowSkelton rows={limit} columns={tableHeaders?.length} />
            )}

            {!isLoadingMetaLeads &&
              tableData?.length > 0 &&
              tableData.map((row, i) => (
                <tr
                  key={i}
                  onClick={() => {
                    setIsEdit(false);
                    setSelectedLead(allMetaLeads[i]);
                  }}
                  className="odd:bg-white even:bg-gray-50 hover:bg-blue-50 cursor-pointer"
                >
                  <td className="px-3 py-2.5">{i + limit * (page - 1) + 1}</td>

                  {tableHeaders.map((h) => {
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

                    if (h.key === "stages") {
                      return (
                        <td onClick={(e) => e.stopPropagation()}>
                          <CustomDropdown
                            label={
                              rowId === row?.leadgen_id ? stage : row.stage
                            }
                            options={Stages}
                            className="border w-40! p-1! rounded-md! bg-gray-100!"
                            onChange={(value) => {
                              handleUpdateStage(row?.leadgen_id, value);
                            }}
                          />
                        </td>
                      );
                    }
                    return (
                      <td key={h.key} className="px-3 py-2">
                        {row[h.key]}
                      </td>
                    );
                  })}
                </tr>
              ))}

            {!isLoadingMetaLeads && tableData.length === 0 && (
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

const getFieldValue = (fieldData, includes) => {
  const field = fieldData?.find((f) => includes.includes(f.name));
  return field?.values?.[0] || "-";
};
const extractLeadFields = (lead) => {
  const includesNamesLabel = ["full_name", "name", "what_is_name?", "name?"];
  const includesPhoneLabel = ["phone", "phone_number", "mobile"];
  // const includesCheckInLabel = [
  //   "check_in",
  //   "check_in_date",
  //   "what_is_your_preferred_check_in_date",
  //   "when_would_you_like_to_check_in?",
  //   "what_is_your_preferred_check-in_date?",
  // ];
  // const includesCheckOutLabel = [
  //   "check_out",
  //   "check_out_date",
  //   "preferred_check-out_date?",
  //   "what_is_your_preferred_check_out_date",
  //   "when_would_you_like_to_check_out?",
  // ];

  const fd = lead?.lead?.field_data;

  return {
    leadgen_id: lead?.meta?.leadgen_id,
    created_time: new Date(lead?.meta?.created_time).toLocaleString(),
    full_name: getFieldValue(fd, includesNamesLabel),
    phone_number: getFieldValue(fd, includesPhoneLabel),
    email: getFieldValue(fd, "email"),

    stage: lead?.stage || "NEW",
    notes: lead?.notes.slice(-1)[0]?.message || null,
  };
};
