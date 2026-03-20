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
} from "../../services/api/MetaLeads.api";

import { formatDateTime } from "../../utils/formateDate";
import ViewAndManageLeadDrawer from "./ViewAndManageLead/ViewAndManageLeadDrawer";

const CREATED_FROM = "facebook";

const MetaLeads = () => {
  const wsRef = useRef(null);

  const [isExporting, setIsExporting] = useState(false);
  const navigate = useNavigate();

  const [isSync, setIsSync] = useState(true);
  const [allLeads, setAllLeads] = useState([]);
  const [allCampaigns, setAllCampaigns] = useState([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);

  const [selectedRow, setSelectedRow] = useState(null);

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

  const handleRedirectToPage = (row, index) => {
    const hid = localStorage.getItem("hid");
    const navigatePath = `${BASE_PATH}/${hid}/${ROUTES_PATH.LEADS_MANAGEMENT}/all-leads/${row._id}/view?hid=${row?.hId}&lead=${index}&created_from=${CREATED_FROM}`;
    navigate(navigatePath);

    // setSelectedRow({
    //   leadId: row._id,
    //   hid: hid,
    // });
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
    <div className="bg-white px-3 md:p-6 space-y-3 md:space-y-6 pt-2">
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

      <div className="bg-white rounded-xl md:shadow-sm border border-gray-200 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* LEFT SIDE FILTERS */}
          <div className="flex flex-wrap items-center gap-3">
            {/* SEARCH */}
            <div className="flex items-center gap-2 h-10 w-full md:w-72 px-3 rounded-lg border border-gray-300 bg-gray-50 focus-within:ring-2 focus-within:ring-primary">
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

            {allCampaigns?.length > 0 && (
              <div>
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
            className="h-10 px-5 rounded-lg bg-primary text-white text-sm font-medium flex items-center gap-2 hover:bg-primary/90 disabled:opacity-60"
          >
            Refresh
            <span className={isSyncing ? "animate-spin" : ""}>
              <IoMdSync />
            </span>
          </button>
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
                    handleRedirectToPage(row, i + limit * (page - 1) + 1);
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

      {/* <ViewAndManageLeadDrawer
        leadId={selectedRow?.leadId}
        hid={selectedRow?.hid}
        isOpen={selectedRow}
        onClose={() => setSelectedRow(null)}
      /> */}
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
