import jsonToCsvExport from "json-to-csv-export";
import { useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import { IoIosClose, IoMdSync } from "react-icons/io";
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
  Stages,
  TurnAwayCode,
  WEBSOCKET_EVENTS,
  WS_BASE_URL,
} from "../../data/constant";
import useDebounce from "../../hooks/useDebounce";
import usePagination from "../../hooks/usePagination";
import { getLeads, updateLead } from "../../services/api/leads.api";
import {
  bulkImportMetaLeads,
  deleteLMultipleeadGenForm,
  getMetaAccounts,
} from "../../services/api/MetaLeads.api";

import { formatDateTime } from "../../utils/formateDate";
import ViewAndManageLeadDrawer from "./ViewAndManageLead/ViewAndManageLeadDrawer";
import DatePickerModal from "../../components/Modal/DatePickerModal";
import { useToast } from "../../context/ToastContext";
import { fetchUserManagementData } from "../../services/api";
import { FaTrashAlt } from "react-icons/fa";
import CustomDropdown2 from "../../components/ui/Dropdown2";

/* ── shared presentation tokens (styling only) ──────────────── */
const CELL = "px-3 py-2.5 whitespace-nowrap";
const HEAD_CELL =
  "px-3 py-3 text-left text-white font-semibold whitespace-nowrap min-w-40";
const FILTER_SHELL =
  "h-10 px-3 flex items-center gap-2 rounded-lg border border-app-border bg-app-surface-secondary text-app-text transition-colors focus-within:ring-2 focus-within:ring-primary";
const INLINE_DROPDOWN =
  "border w-40! p-1! rounded-md! bg-app-surface-secondary! z-9!";
const NOTES_TAB = "flex-1 sm:flex-none px-4 text-sm whitespace-nowrap transition-colors";

const CREATED_FROM = "facebook";

const MetaLeads = () => {
  const wsRef = useRef(null);

  const [isExporting, setIsExporting] = useState(false);
  const navigate = useNavigate();

  const { showToast } = useToast();
  const [isSync, setIsSync] = useState(true);
  const [allLeads, setAllLeads] = useState([]);
  const [allCampaigns, setAllCampaigns] = useState([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [stage, setStage] = useState("");
  const [notesFilter, setNotesFilter] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [isPageRestored, setIsPageRestored] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [rowSelected, setRowSelected] = useState([]);

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
        `${LOCAL_STORAGE.MetaLeadsPage}.startDate`,
        start.toISOString(),
      );
      localStorage.setItem(
        `${LOCAL_STORAGE.MetaLeadsPage}.endDate`,
        end.toISOString(),
      );
    }
  };

  const fetchLeads = async (withDateFilter = false) => {
    setIsLoadingLeads(true);

    try {
      const params = {
        page: page,
        search: debouncedSearch,
        limit: limit,
        created_from: CREATED_FROM,
        stage: stage,
        notes: notesFilter,
        // stage: Stages.META_LEAD,
      };

      if (withDateFilter && startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      }

      const response = await getLeads(params);

      if (response?.success) {
        const allLeads = response?.result?.docs?.leads || [];
        const allCampaign = response?.result?.docs?.allCampaigns || [];
        setAllLeads(allLeads);
        setTotal(response?.result?.pagination?.total || 0);

        setAllCampaigns(allCampaign);
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

  const handleUpdateStage = async ({
    leadId,
    hid,
    stage,
    followUpDate,
    turnAwayCode,
  }) => {
    const payload = {
      leadId: leadId,
      status: stage,
      hid: hid,
      followUpDate: followUpDate || null,
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
    localStorage.setItem(LOCAL_STORAGE.MetaLeadsPage, page);
    const hid = localStorage.getItem("hid");

    const queryParams = new URLSearchParams({
      hid: row?.hId,
      lead: index,
      created_from: CREATED_FROM,
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
      ...(stage ? { stage: stage } : {}),
      ...(startDate ? { startDate: startDate } : {}),
      ...(endDate ? { endDate: endDate } : {}),
    });
    const navigatePath = `${BASE_PATH}/${hid}/${ROUTES_PATH.LEADS_MANAGEMENT}/all-leads/${row._id}/view?${queryParams.toString()}`;
    navigate(navigatePath);

    // setSelectedRow({
    //   leadId: row._id,
    //   hid: hid,
    // });
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
    fetchPageConnectionDetails();
    fetchUsersData();
  }, []);

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
    notesFilter,
  ]);

  useEffect(() => {
    const savedPage = localStorage.getItem(LOCAL_STORAGE.MetaLeadsPage);
    const startDate = localStorage.getItem(
      `${LOCAL_STORAGE.MetaLeadsPage}.startDate`,
    );
    const endDate = localStorage.getItem(
      `${LOCAL_STORAGE.MetaLeadsPage}.endDate`,
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

  useEffect(() => {
    wsRef.current = new WebSocketClient(WS_BASE_URL);

    wsRef.current.connect((serverResponse) => {
      const ndid = localStorage.getItem("ndid");
      const hid = localStorage.getItem("hid");
      console.log(serverResponse);
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

  return (
    <div className="bg-app-surface text-app-text p-3 md:p-4 space-y-3 md:space-y-5 min-h-[80dvh] md:h-[90vh] flex flex-col [color-scheme:light] dark:[color-scheme:dark]">
      <div className="space-y-3">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <h2 className="text-lg font-semibold text-app-text">Meta Leads</h2>

          {allLeads?.length > 0 && (
            <button
              disabled={isExporting}
              onClick={exportToExcel}
              className="bg-ternary hover:opacity-90 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 whitespace-nowrap transition-opacity disabled:opacity-60"
            >
              Export to Excel{" "}
              {isExporting && <Loader color="#fefefe" size={12} />}
            </button>
          )}
        </div>

        <div className="">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
            {/* LEFT SIDE FILTERS */}
            <div className="flex flex-1 flex-wrap items-center gap-2 md:gap-3">
              {/* SEARCH */}
              <div
                className={`${FILTER_SHELL} w-full sm:w-auto sm:flex-1 sm:min-w-[220px]`}
              >
                <IoSearch
                  className="shrink-0 text-gray-400 dark:text-app-text-faint"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search clients..."
                  className="w-full min-w-0 bg-transparent outline-none text-sm text-app-text placeholder:text-app-text-faint"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="w-full sm:w-auto sm:flex-1 sm:min-w-48">
                <CustomDropdown
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
                    }}
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 text-white shadow cursor-pointer transition-colors"
                  >
                    <IoIosClose size={18} />
                  </span>
                )}
              </div>

              <div className="flex h-10 w-full sm:w-auto rounded-lg border border-app-border overflow-hidden">
                <button
                  onClick={() => setNotesFilter("")}
                  className={`${NOTES_TAB} ${
                    notesFilter === ""
                      ? "bg-primary text-white"
                      : "bg-app-surface-secondary text-app-text hover:bg-app-surface"
                  }`}
                >
                  All
                </button>

                <button
                  onClick={() => setNotesFilter("true")}
                  className={`${NOTES_TAB} border-x border-app-border ${
                    notesFilter === "true"
                      ? "bg-primary text-white"
                      : "bg-app-surface-secondary text-app-text hover:bg-app-surface"
                  }`}
                >
                  Has Notes
                </button>

                <button
                  onClick={() => setNotesFilter("false")}
                  className={`${NOTES_TAB} ${
                    notesFilter === "false"
                      ? "bg-primary text-white"
                      : "bg-app-surface-secondary text-app-text hover:bg-app-surface"
                  }`}
                >
                  No Notes
                </button>
              </div>

              {allCampaigns?.length > 0 && (
                <div className="w-full sm:w-auto sm:flex-1 sm:min-w-48">
                  <CustomDropdown
                    label="All Campaigns"
                    options={[
                      { value: "", label: "All" },
                      ...(allCampaigns?.map((c) => ({
                        value: c,
                        label: c,
                      })) || []),
                    ]}
                    width="w-60"
                    onChange={(value) => setSearchTerm(value)}
                  />
                </div>
              )}
            </div>

            {/* RIGHT ACTION */}
            <button
              disabled={isSyncing}
              onClick={handleBulkImportMetaLeads}
              className="h-10 w-full md:w-auto px-5 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-medium flex items-center justify-center gap-2 whitespace-nowrap transition-colors disabled:opacity-60"
            >
              Refresh
              <span className={isSyncing ? "animate-spin" : ""}>
                <IoMdSync />
              </span>
            </button>
          </div>
        </div>
      </div>

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
              <tr>
                <th className="px-3 py-3 text-center text-white font-semibold whitespace-nowrap">
                  Select
                </th>
                <th className="px-3 py-3 text-center text-white font-semibold whitespace-nowrap">
                  #
                </th>
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
                allLeads?.length > 0 &&
                allLeads?.map((row, i) => (
                  <tr
                    key={i}
                    onClick={() => {
                      handleRedirectToPage(row, i + limit * (page - 1) + 1);
                    }}
                    className="odd:bg-app-surface even:bg-app-surface-secondary border-b border-app-border text-app-text hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors cursor-pointer"
                  >
                    <td
                      onClick={(e) => e.stopPropagation()}
                      className="px-3 py-2.5 text-center text-[14px] capitalize whitespace-nowrap"
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
                      // const timesLabels = ["created_time", "Created_at"];

                      if (h.key === "Created_at") {
                        const isLeadCreatedTime = row?.meta?.created_time;

                        return (
                          <td key={h.key} className={CELL}>
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
                                  handleUpdateStage(row?._id, row?.hId, value);
                                }
                              }}
                            />
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
                      if (h.key === "Name") {
                        const isName = row[h.key];
                        const followUpDate = new Date(
                          row["followUpDate"] || row["followUp"] || "",
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

                      return (
                        <td key={h.key} className={CELL}>
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
                  <td
                    colSpan={tableHeaders.length + 2}
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
          });
          setShowDatePicker(false);
        }}
      />
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