import jsonToCsvExport from "json-to-csv-export";
import { useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
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
  LOCAL_STORAGE,
  ROUTES_PATH,
  Sources,
  Stages,
  TurnAwayCode,
  WEBSOCKET_EVENTS,
  WS_BASE_URL,
} from "../../data/constant";
import useDebounce from "../../hooks/useDebounce";
import usePagination from "../../hooks/usePagination";
import { getLeads, updateLead } from "../../services/api/leads.api";
import { formatDateTime } from "../../utils/formateDate";
import ViewAndManageLeadDrawer from "./ViewAndManageLead/ViewAndManageLeadDrawer";
import AdsLeadsUsingGoogleSheet from "./AdsLeadsUsingGoogleSheet";
import DatePickerModal from "../../components/Modal/DatePickerModal";
import { useToast } from "../../context/ToastContext";
import { fetchUserManagementData } from "../../services/api";
import TurnAwayModal from "../../components/Modal/TurnAwayModal";
import ImportLead from "../../components/button/ImportLead";
import { FaTrashAlt } from "react-icons/fa";
import { deleteLMultipleeadGenForm } from "../../services/api/MetaLeads.api";
import CustomDropdown2 from "../../components/ui/Dropdown2";
import ExportLeadsModal from "../../components/Modal/ExportLeadsModal";
import AddLeadModal from "../../components/Modal/AddLeadModal";

/* ── shared presentation tokens ─────────────────────────────── */
const CELL = "px-3 py-2.5 whitespace-nowrap";
const HEAD_CELL =
  "px-3 py-3 text-left text-white font-semibold whitespace-nowrap";
const FILTER_SHELL =
  "h-10 px-3 flex items-center gap-2 rounded-xl border border-app-border bg-app-surface-secondary text-app-text transition-colors focus-within:ring-2 focus-within:ring-primary";
const INLINE_DROPDOWN =
  "border w-40! p-1! rounded-md! bg-app-surface-secondary! z-9!";

const AllLeads = () => {
  const wsRef = useRef(null);
  const navigate = useNavigate();

  const [showExportModal, setShowExportModal] = useState(false);
  const [exportStartDate, setExportStartDate] = useState(null);
  const [exportEndDate, setExportEndDate] = useState(null);
  const [exportRange, setExportRange] = useState("");

  const [notesFilter, setNotesFilter] = useState("");

  const { showToast } = useToast();
  const [allLeads, setAllLeads] = useState([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isPageRestored, setIsPageRestored] = useState(false);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [stage, setStage] = useState("");
  const [source, setSource] = useState([]);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTurnAwayModal, setShowTurnAwayModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);

  const [allUsers, setAllUsers] = useState([]);
  const [rowSelected, setRowSelected] = useState([]);

  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [open, setOpen] = useState(false);

  const {
    page,
    limit,
    total,
    totalPages,
    setPage,
    setTotal,
    goToPage,
    nextPage,
    prevPage,
    changeLimit,
  } = usePagination({ initialLimit: 20 });

  const tableHeaders = [
    { key: "Created_at", label: "Created Time" },
    { key: "created_from", label: "Source" },
    { key: "Name", label: "Full Name" },
    { key: "Contact", label: "Phone Number" },
    { key: "Email", label: "Email" },
    { key: "notes", label: "Notes" },
    { key: "campaign_name", label: "Campaign Name" },
    { key: "assignee", label: "Attempted By" },
    { key: "status", label: "Stages" },
    { key: "turnAwayCode", label: "Turn Away Code" },
  ];

  const setDateRange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);

    if (start && end) {
      localStorage.setItem(
        `${LOCAL_STORAGE.AllLeadsPage}.startDate`,
        start.toISOString(),
      );
      localStorage.setItem(
        `${LOCAL_STORAGE.AllLeadsPage}.endDate`,
        end.toISOString(),
      );
    }
  };

  const fetchLeads = async (withDateFilter = false, lastPage) => {
    setIsLoadingLeads(true);

    try {
      const params = {
        page: lastPage || page,
        search: debouncedSearch,
        limit: limit,
        stage: stage,
        source: source,
        notes: notesFilter,
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

  const exportToExcel = async ({ start, end }) => {
    setShowExportModal(false);
    setIsExporting(true);
    const params = {
      is_export: "excel",
      ...(start && { startDate: start }),
      ...(end && { endDate: end }),
      ...(stage && { stage: stage }),
      ...(source && { source: source }),
    };
    try {
      const response = await getLeads(params);
      if (response?.success) {
        const leads = response?.result?.docs?.leads || [];
        console.log(leads);

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

  const handleUpdateStage = async ({
    leadId,
    hid,
    stage,
    followUpDate,
    conversationId = null,
    turnAwayCode,
  }) => {
    const payload = {
      leadId: leadId,
      status: stage,
      hid: hid,
      followUpDate: followUpDate || null,
      ...(conversationId && { conversationId }),
      ...(turnAwayCode && { turnAwayCode }),
    };
    try {
      const response = await updateLead(payload);
      if (response?.success && response?.responseStatusCode === 200) {
        showToast({
          message:
            response?.responseMessage || "Lead stage updated successfully",
          type: "success",
        });
        return;
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.message || "Failed to update lead stage",
      });
    }
  };

  const handleUserAssign = async (leadId, hid, item, conversationId = null) => {
    const [phone, email] = item.value.split(",");
    try {
      const payload = {
        leadId: leadId,
        hid: hid,
        ...(conversationId && { conversationId }),
        assignee: item?.label,
        assigneeNumber: phone || null,
        assigneeEmail: email || null,
      };

      const response = await updateLead(payload);

      if (response?.success && response?.responseStatusCode === 200) {
        showToast({
          message:
            response?.responseMessage || "Lead stage updated successfully",
          type: "success",
        });
      }
    } catch (error) {
      showToast({
        message: error?.message || "Failed to update lead stage",
        type: "error",
      });
    }
  };

  const handleRedirectToPage = (row, index) => {
    localStorage.setItem(LOCAL_STORAGE.AllLeads, page);
    const hid = localStorage.getItem("hid");

    const queryParams = new URLSearchParams({
      hid: row?.hId,
      lead: index,
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
      ...(stage ? { stage: stage } : {}),
      ...(source ? { source: source } : {}),
      ...(startDate ? { startDate: startDate } : {}),
      ...(endDate ? { endDate: endDate } : {}),
    });
    const navigatePath = `${BASE_PATH}/${hid}/${ROUTES_PATH.LEADS_MANAGEMENT}/all-leads/${row._id}/view?${queryParams.toString()}`;
    navigate(navigatePath);
  };

  const handleDeleteAll = () => {
    // alert("We are working on it");
    Swal.fire({
      title: "Are you sure?",
      text: `This will permanently delete ${"this record"}.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const data = await deleteLMultipleeadGenForm(rowSelected);
        if (data?.Status) {
          fetchLeads(false);
          Swal.fire("Deleted!", "The record has been removed.", "success");
          setRowSelected([]);
        } else {
          Swal.fire("Error!", data?.Message, "error");
        }
      }
    });
  };

  const fetchUsersData = async () => {
    const token = localStorage.getItem("token");
    const usersData = await fetchUserManagementData(token);
    setAllUsers(usersData);
  };

  const handleRowSelect = (id) => {
    if (rowSelected.length < 10) {
      setRowSelected((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
      );
    } else {
      if (rowSelected.includes(id)) {
        setRowSelected((prev) => prev.filter((item) => item !== id));
        return;
      }
      alert("You can select only 10 rows at a time");
    }
  };

  useEffect(() => {
    if (!isPageRestored) return; // 🚨 WAIT until page restored

    if (!startDate && !endDate) {
      fetchLeads(false);
      return;
    }

    if (startDate && endDate) {
      fetchLeads(true);
    }
  }, [
    isPageRestored,
    page,
    debouncedSearch,
    startDate,
    endDate,
    limit,
    stage,
    source,
    notesFilter,
  ]);

  useEffect(() => {
    fetchUsersData();
    const savedPage = localStorage.getItem(LOCAL_STORAGE.AllLeads);
    const startDate = localStorage.getItem(
      `${LOCAL_STORAGE.AllLeadsPage}.startDate`,
    );
    const endDate = localStorage.getItem(
      `${LOCAL_STORAGE.AllLeadsPage}.endDate`,
    );

    if (savedPage) {
      setPage(Number(savedPage));
    }

    if (startDate && endDate) {
      setStartDate(startDate);
      setEndDate(endDate);
    }
    setIsPageRestored(true);
  }, []);

  // useEffect(() => {
  //   wsRef.current = new WebSocketClient(WS_BASE_URL);

  //   wsRef.current.connect((serverResponse) => {
  //     if (serverResponse?.event === WEBShOCKET_EVENTS.META_NEW_LEAD) {
  //     }
  //   });

  //   return () => wsRef.current?.close();
  // }, []);

  return (
    <div className="bg-app-surface text-app-text p-3 md:p-4 space-y-3 md:space-y-5 min-h-[80dvh] md:h-[90vh] flex flex-col [color-scheme:light] dark:[color-scheme:dark]">
      <div className="space-y-3">
        {/* ── title + actions ──────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-app-text">All Leads</h2>

          <div className="flex flex-wrap items-center gap-2">
            {allLeads?.length > 0 && (
              <button
                disabled={isExporting}
                onClick={() => setShowExportModal(true)}
                className="bg-ternary hover:opacity-90 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 whitespace-nowrap transition-opacity disabled:opacity-60 flex-1 sm:flex-none"
              >
                Export to Excel{" "}
                {isExporting && <Loader color="#fefefe" size={12} />}
              </button>
            )}

            <ImportLead open={open} setOpen={setOpen} />

            <button
              onClick={() => setShowAddLeadModal(true)}
              className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 whitespace-nowrap transition-colors flex-1 sm:flex-none"
            >
              Add Lead
            </button>
          </div>
        </div>

        {/* ── filters ──────────────────────────────────────── */}
        <div className="bg-app-surface">
          <div className="flex flex-wrap items-center gap-2 md:gap-3 lg:gap-4">
            {/* SEARCH */}
            <div
              className={`${FILTER_SHELL} w-full sm:w-auto sm:flex-1 sm:min-w-[220px]`}
            >
              <IoSearch className="shrink-0 text-app-text-faint" size={18} />
              <input
                type="text"
                placeholder="Search clients..."
                className="w-full min-w-0 bg-transparent outline-none text-sm text-app-text placeholder:text-app-text-faint"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* DATE RANGE */}
            <div className="relative w-full sm:w-auto sm:flex-1 sm:min-w-[180px]">
              <div className={FILTER_SHELL}>
                <DatePicker
                  selectsRange
                  startDate={startDate}
                  endDate={endDate}
                  maxDate={new Date()}
                  onChange={(update) => setDateRange(update)}
                  className="bg-transparent outline-none text-sm text-app-text placeholder:text-app-text-faint w-full min-w-0"
                  placeholderText="Date range"
                  popperClassName="z-99999!"
                />
              </div>

              {startDate && endDate && (
                <span
                  onClick={() => {
                    setStartDate(null);
                    setEndDate(null);
                    localStorage.removeItem(
                      `${LOCAL_STORAGE.AllLeadsPage}.startDate`,
                    );
                    localStorage.removeItem(
                      `${LOCAL_STORAGE.AllLeadsPage}.endDate`,
                    );
                  }}
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center rounded-full bg-red-500 text-white shadow cursor-pointer hover:bg-red-600 transition-colors"
                >
                  <IoIosClose size={18} />
                </span>
              )}
            </div>

            <div className="w-full sm:w-auto sm:flex-1 sm:min-w-40">
              <CustomDropdown
                multiple
                label={"Source"}
                options={Sources}
                onChange={(value) => setSource(() => [...value])}
              />
            </div>

            <div className="w-full sm:w-auto sm:flex-1 sm:min-w-40">
              <CustomDropdown
                label={"Stage"}
                options={[
                  {
                    value: "",
                    label: "All Stages",
                  },
                  ...Stages,
                ]}
                onChange={(value) => setStage(value)}
              />
            </div>

            <div className="flex h-10 w-full sm:w-auto rounded-lg border border-app-border overflow-hidden">
              <button
                onClick={() => setNotesFilter("")}
                className={`flex-1 sm:flex-none px-4 text-sm whitespace-nowrap transition-colors ${
                  notesFilter === ""
                    ? "bg-primary text-white"
                    : "bg-app-surface-secondary text-app-text hover:bg-app-surface"
                }`}
              >
                All
              </button>

              <button
                onClick={() => setNotesFilter("true")}
                className={`flex-1 sm:flex-none px-4 text-sm whitespace-nowrap border-x border-app-border transition-colors ${
                  notesFilter === "true"
                    ? "bg-primary text-white"
                    : "bg-app-surface-secondary text-app-text hover:bg-app-surface"
                }`}
              >
                Has Notes
              </button>

              <button
                onClick={() => setNotesFilter("false")}
                className={`flex-1 sm:flex-none px-4 text-sm whitespace-nowrap transition-colors ${
                  notesFilter === "false"
                    ? "bg-primary text-white"
                    : "bg-app-surface-secondary text-app-text hover:bg-app-surface"
                }`}
              >
                No Notes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── table ──────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-h-0">
        {rowSelected?.length > 0 && (
          <button
            className="mb-2 bg-red-700/90 hover:bg-red-700 text-white rounded-lg px-3 py-2 text-sm flex items-center gap-2 w-fit transition-colors"
            onClick={handleDeleteAll}
          >
            Delete <span>{rowSelected.length}</span> <FaTrashAlt size={12} />
          </button>
        )}
        <div className="flex flex-1 min-h-0 border border-app-border bg-app-surface rounded-lg overflow-auto hide-scrollbar">
          <table className="min-w-full text-sm">
            <thead className="bg-primary sticky top-0 z-99">
              <tr className="whitespace-nowrap">
                <th className={`${HEAD_CELL} text-center`}>Select</th>
                <th className={`${HEAD_CELL} text-center`}>#</th>
                {tableHeaders?.map((h) => (
                  <th key={h.key} className={HEAD_CELL}>
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {isLoadingLeads && (
                <TableRowSkelton
                  rows={limit}
                  columns={tableHeaders?.length + 2}
                />
              )}

              {!isLoadingLeads &&
                allLeads.length > 0 &&
                allLeads.map((row, i) => (
                  <tr
                    key={i}
                    onClick={() => {
                      handleRedirectToPage(row, i + limit * (page - 1) + 1);
                    }}
                    className="odd:bg-app-surface even:bg-app-surface-secondary border-b border-app-border text-app-text hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors cursor-pointer"
                  >
                    <td
                      onClick={(e) => e.stopPropagation()}
                      className="px-3 py-2.5 text-center whitespace-nowrap"
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-primary cursor-pointer align-middle"
                        checked={rowSelected.includes(row?._id)}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowSelect(row?._id);
                        }}
                      />
                    </td>

                    <td className="px-3 py-2.5 text-center text-app-text-faint tabular-nums">
                      {(i + limit * (page - 1) + 1).toString().padStart(2, "0")}
                    </td>

                    {tableHeaders.map((h) => {
                      const notCapitalize = ["Email"];

                      if (h.key === "Created_at") {
                        const isLeadCreatedTime = row?.meta?.created_time;
                        return (
                          <td key={h.key} className={`${CELL} capitalize`}>
                            {formatDateTime(
                              isLeadCreatedTime
                                ? isLeadCreatedTime
                                : row[h.key],
                            )}
                          </td>
                        );
                      }

                      if (h.key === "phone_number") {
                        return (
                          <td
                            key={h.key}
                            className={CELL}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Link
                              to={`tel:${row[h.key]}`}
                              className="hover:text-primary transition-colors"
                            >
                              {row[h.key]}
                            </Link>
                          </td>
                        );
                      }

                      if (h.key === "status") {
                        return (
                          <td
                            key={h.key}
                            onClick={(e) => e.stopPropagation()}
                            className="px-3 py-2"
                          >
                            <CustomDropdown
                              label={row.status}
                              options={Stages}
                              className={INLINE_DROPDOWN}
                              onChange={(value) => {
                                if (value === "Follow Up") {
                                  setSelectedLead(row);
                                  setShowDatePicker(true);
                                } else {
                                  handleUpdateStage({
                                    leadId: row?._id,
                                    hid: row?.hId,
                                    stage: value,
                                    followUpDate: null,
                                    conversationId: row?.conversationId,
                                  });
                                }
                              }}
                            />
                          </td>
                        );
                      }

                      if (h.key === "notes") {
                        const isNotes = row[h.key] && row[h.key].length > 0;

                        const noteMessage =
                          isNotes && row[h.key]?.slice(-1)[0]?.message;
                        return (
                          <td
                            key={h.key}
                            className="px-3 py-2.5 min-w-[200px] max-w-[320px]"
                          >
                            <span className="block truncate text-app-text-muted">
                              {isNotes ? noteMessage : "-"}
                            </span>
                          </td>
                        );
                      }

                      if (h.key === "turnAwayCode") {
                        const turnAwayCode = row[h.key];
                        return (
                          <td
                            key={h.key}
                            onClick={(e) => e.stopPropagation()}
                            className="px-3 py-2"
                          >
                            <CustomDropdown
                              label={turnAwayCode || "Select Code"}
                              options={TurnAwayCode}
                              className={INLINE_DROPDOWN}
                              onChange={(value) => {
                                handleUpdateStage({
                                  leadId: row?._id,
                                  hid: row?.hId,
                                  stage: "Turn Away",
                                  turnAwayCode: value,
                                  conversationId: row?.conversationId,
                                });
                              }}
                            />
                          </td>
                        );
                      }

                      if (h.key === "Name") {
                        const isName = row[h.key];
                        const followUpDate = new Date(
                          row["followUpDate"] || row["followUp"] || null,
                        );
                        const today = new Date();

                        const isToday =
                          followUpDate.getDate() === today.getDate() &&
                          followUpDate.getMonth() === today.getMonth() &&
                          followUpDate.getFullYear() === today.getFullYear();

                        const userName = isName
                          ? isName
                          : row?.other_details?.full_name || "-";
                        return (
                          <td key={h.key} className={`${CELL} font-medium`}>
                            {userName}{" "}
                            {isToday && (
                              <span className="ml-1 inline-block px-1.5 py-0.5 rounded text-[11px] font-medium bg-[#fd5c01] text-white align-middle">
                                Follow Up
                              </span>
                            )}
                          </td>
                        );
                      }

                      if (h.key === "campaign_name") {
                        const isMeta = row?.meta;
                        return (
                          <td key={h.key} className={CELL}>
                            {isMeta ? isMeta?.campaign_name : "-"}
                          </td>
                        );
                      }

                      if (h.key === "assignee") {
                        return (
                          <td
                            key={h.key}
                            onClick={(e) => e.stopPropagation()}
                            className="px-3 py-2"
                          >
                            <CustomDropdown2
                              label={row["assignee"] || "Attempted By"}
                              options={
                                allUsers?.map((user) => ({
                                  value: `${user?.phone},${user?.emailId}`,
                                  label: user?.userName,
                                })) || []
                              }
                              onChange={(value) =>
                                handleUserAssign(
                                  row?._id,
                                  row?.hId,
                                  value,
                                  row?.conversationId,
                                )
                              }
                              className={INLINE_DROPDOWN}
                            />
                          </td>
                        );
                      }

                      if (h.key === "created_from") {
                        return (
                          <td key={h.key} className={`${CELL} capitalize`}>
                            {row["created_from"] === "facebook"
                              ? "meta"
                              : row["created_from"] || "-"}
                          </td>
                        );
                      }
                      return (
                        <td key={h.key} className={CELL}>
                          {row[h.key]
                            ? row[h.key] === "undefined"
                              ? "-"
                              : row[h.key]
                            : "-"}
                        </td>
                      );
                    })}
                  </tr>
                ))}

              {!isLoadingLeads && allLeads.length === 0 && (
                <tr>
                  <td
                    colSpan={tableHeaders?.length + 2}
                    className="py-10 text-center text-app-text-faint"
                  >
                    No Leads Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── pagination ─────────────────────────────────────── */}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-3 px-1 sm:px-4">
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

      <DatePickerModal
        isOpen={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSave={(date) => {
          handleUpdateStage({
            leadId: selectedLead?._id,
            hid: selectedLead?.hId,
            stage: "Follow Up",
            followUpDate: date,
            conversationId: selectedLead?.conversationId,
          });
          setShowDatePicker(false);
        }}
      />

      <ExportLeadsModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        isLoading={isExporting}
        onExport={(start, end) =>
          exportToExcel({
            start,
            end,
          })
        }
      />

      <AddLeadModal
        isOpen={showAddLeadModal}
        onClose={() => setShowAddLeadModal(false)}
        onSuccess={() => fetchLeads(false)}
      />
    </div>
  );
};

export default AllLeads;
