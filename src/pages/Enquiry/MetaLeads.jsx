import jsonToCsvExport from "json-to-csv-export";
import { useEffect, useMemo, useRef, useState } from "react";
import Pagination from "../../components/Pagination";
import TablePaginationInfo from "../../components/TablePaginationInfo";
import WebSocketClient from "../../config/websocketClient";
import { WEBSOCKET_EVENTS, WS_BASE_URL } from "../../data/constant";
import usePagination from "../../hooks/usePagination";
import {
  bulkImportMetaLeads,
  getAllMetaLeads,
  getMetaAccounts,
  getMetaForms,
} from "../../services/api/MetaLeads.api";
import { formatDate } from "../../utils/formateData";
import { Search } from "../../icons/icon";
import useDebounce from "../../hooks/useDebounce";
import DatePicker from "react-datepicker";
import { TableRowSkelton } from "../../components/Skeltons/TableSkelton";
import { Link } from "react-router-dom";
import Loader from "../../components/Loader";
import { IoIosClose, IoMdSync } from "react-icons/io";

const MetaLeads = () => {
  const wsRef = useRef(null);
  // const { pageId } = useContext(DataContext);

  const [pages, setPages] = useState([]);
  // const [forms, setForms] = useState([]);
  const [pageId, setPageId] = useState("");

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
    { key: "check_in", label: "Check-in" },
    { key: "check_out", label: "Check-out" },
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
  }, [page, debouncedSearch, startDate, endDate, limit, pageId]);

  useEffect(() => {
    wsRef.current = new WebSocketClient(WS_BASE_URL);

    wsRef.current.connect((serverResponse) => {
      if (serverResponse?.event === WEBSOCKET_EVENTS.META_NEW_LEAD) {
        console.log(serverResponse);
      }
    });

    return () => wsRef.current?.close();
  }, []);

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

      <div className="flex justify-between gap-2">
        <div className="flex gap-1.5 items-center max-w-96 w-full px-3 pl-2 lg:pl-2 py-2 text-[14px] border rounded-full bg-gray-100 outline-none">
          <span className="">
            <Search />
          </span>
          <input
            type="text"
            placeholder="Search clients by name, contact or message"
            className="outline-none w-full"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-4 items-center flex-1">
          {/* <div className="border border-gray-300 bg-gray-100 p-1.5  rounded-full">
            <select
              onChange={(e) => setPageId(e.target.value)}
              className="text-sm outline-none px-1.5"
            >
              <option value="" disabled>
                Select Page
              </option>
              {pages?.map((page) => (
                <option key={page.id} value={page.id}>
                  {page.name}
                </option>
              ))}
            </select>
          </div> */}

          <div className="flex items-center gap-2 relative">
            <div className="border border-gray-300 rounded-full bg-gray-100 text-sm p-1.5">
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
                placeholderText="Select Date Range"
                // isClearable
                // minDate={new Date()}
              />
            </div>

            {startDate && endDate && (
              <span
                className="text-white  size-4 font-semibold cursor-pointer bg-red-500 rounded-full flex justify-center items-center absolute -right-1 -top-2"
                onClick={() => {
                  setStartDate(null);
                  setEndDate(null);
                }}
              >
                <IoIosClose size={30} />
              </span>
            )}
          </div>
        </div>

        {!isSync && (
          <button
            disabled={isSyncing}
            onClick={handleBulkImportMetaLeads}
            className="bg-primary/90 text-white px-4 py-2 rounded flex items-center gap-2 "
          >
            Bulk Import Leads{" "}
            <span className={`${isSyncing && "animate-spin"}`}>
              <IoMdSync />
            </span>
          </button>
        )}
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-primary">
            <tr>
              <th className="px-3 py-3 text-white">#</th>
              {tableHeaders.map((h) => (
                <th
                  key={h.key}
                  className="px-3 py-3 text-left text-white min-w-[160px]"
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
                  onClick={() => setSelectedLead(allMetaLeads[i]?.lead)}
                  className="odd:bg-white even:bg-gray-50 hover:bg-blue-50 cursor-pointer"
                >
                  <td className="px-3 py-2">{i + limit * (page - 1) + 1}</td>

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
          <div className="bg-white w-150 p-4 max-h-full overflow-y-auto rounded">
            <div className="flex justify-between mb-4">
              <p className="text-sm text-gray-500">
                Lead Added: {formatDate(selectedLead?.created_time)}
              </p>
              <button
                onClick={() => setSelectedLead(null)}
                className="bg-orange-500 text-white px-3 py-1 rounded"
              >
                Close
              </button>
            </div>

            {selectedLead?.field_data?.map((field, i) => (
              <div key={i} className="mb-3">
                <p className="font-medium text-gray-600 capitalize">
                  {field.name.replaceAll("_", " ")}
                </p>
                <p>{field.values?.[0]}</p>
              </div>
            ))}
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
  const includesCheckInLabel = [
    "check_in",
    "check_in_date",
    "what_is_your_preferred_check_in_date",
    "when_would_you_like_to_check_in?",
    "what_is_your_preferred_check-in_date?",
  ];
  const includesCheckOutLabel = [
    "check_out",
    "check_out_date",
    "preferred_check-out_date?",
    "what_is_your_preferred_check_out_date",
    "when_would_you_like_to_check_out?",
  ];

  const fd = lead?.lead?.field_data;

  return {
    created_time: new Date(lead?.meta?.created_time).toLocaleString(),
    full_name: getFieldValue(fd, includesNamesLabel),
    phone_number: getFieldValue(fd, includesPhoneLabel),
    email: getFieldValue(fd, "email"),
    check_in: getFieldValue(fd, includesCheckInLabel),
    check_out: getFieldValue(fd, includesCheckOutLabel),
  };
};
