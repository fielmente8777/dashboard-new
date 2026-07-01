import { useEffect, useState } from "react";
import StatusPill from "./StatusPill";
import { timeAgo } from "../../../../utils/formateDate";
import Pagination from "../../../../components/Pagination";
import { useNavigate } from "react-router-dom";
import { BASE_PATH } from "../../../../data/constant";

const TABS = ["all", "sent", "delivered", "read", "failed"];
const LIMIT = 20;

const TABLE_COLS = [
  { label: "#" },
  { label: "Name" },
  { label: "Phone" },
  { label: "Status" },
  { label: "Sent" },
  { label: "Delivered" },
  { label: "Read" },
  { label: "Failed At / Reason" },
];

// ── Toolbar ─────────────────────────────────────────────────────────────────
const Toolbar = ({
  filter,
  search,
  onFilterChange,
  onSearchChange,
  recipients,
}) => {
  const [inputValue, setInputValue] = useState(search);

  // Debounce: only call onSearchChange 500ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => onSearchChange(inputValue), 500);
    return () => clearTimeout(timer);
  }, [inputValue]);

  return (
    <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-1 bg-gray-50 rounded-xl p-1 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => onFilterChange(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
              filter === t
                ? "bg-white text-indigo-700 shadow-sm border border-gray-200"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t}
            {t !== "all" && (
              <span className="ml-1 text-gray-400">
                ({recipients.filter((r) => r.status === t).length})
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Search name or phone…"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 w-52 transition-all"
        />
      </div>
    </div>
  );
};

// ── Table row ────────────────────────────────────────────────────────────────
const RecipientRow = ({ item, index }) => {
  const navigate = useNavigate();
  const handleRowClick = () => {
    navigate(
      `${BASE_PATH}/${localStorage?.getItem("hid")}/channel/wa/chat?number=${item.phone}`,
    );
  };
  return (
    <tr
      className="hover:bg-indigo-50/30 transition-colors cursor-pointer"
      onClick={handleRowClick}
    >
      <td className="px-5 py-4 text-gray-300 tabular-nums text-xs">
        {index + 1}
      </td>

      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {item.name ? item.name[0].toUpperCase() : "?"}
          </div>
          <span className="font-medium text-gray-800">
            {item.name || <span className="text-gray-300 italic">Unknown</span>}
          </span>
        </div>
      </td>

      <td className="px-5 py-4 text-gray-500 font-mono text-xs">
        {item.phone}
      </td>

      <td className="px-5 py-4">
        <StatusPill status={item.status} />
      </td>

      <td className="px-5 py-4 whitespace-nowrap text-xs text-gray-500">
        {item.sentAt ? timeAgo(item.sentAt) : "-"}
      </td>

      <td className="px-5 py-4 whitespace-nowrap text-xs text-gray-500">
        {item.deliveredAt ? timeAgo(item.deliveredAt) : "-"}
      </td>

      <td className="px-5 py-4 whitespace-nowrap text-xs text-gray-500">
        {item.readAt ? timeAgo(item.readAt) : "-"}
      </td>

      <td className="px-5 py-4">
        {item.status === "failed" ? (
          <div className="flex flex-col gap-1">
            <span className="text-xs text-red-500 font-medium whitespace-nowrap">
              {item.failedAt ? timeAgo(item.failedAt) : "-"}
            </span>
            {item.error && (
              <span
                className="text-xs text-red-400 leading-tight max-w-xs"
                title={item.error}
              >
                {item.error}
              </span>
            )}
          </div>
        ) : (
          <span className="text-gray-300 text-xs">—</span>
        )}
      </td>
    </tr>
  );
};

const RecipientsTable = ({
  recipients,
  total,
  totalPages,
  page,
  filter,
  search,
  loading,
  onFilterChange,
  onSearchChange,
  onPageChange,
  onNextPage,
  onPrevPage,
}) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
    <Toolbar
      filter={filter}
      search={search}
      onFilterChange={onFilterChange}
      onSearchChange={onSearchChange}
      recipients={recipients}
    />

    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-xs font-semibold tracking-wide text-gray-500 uppercase">
            {TABLE_COLS.map(({ label }) => (
              <th key={label} className="px-5 py-3 text-left whitespace-nowrap">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {loading ? (
            <tr>
              <td colSpan={8} className="text-center py-16">
                <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto" />
              </td>
            </tr>
          ) : recipients.length === 0 ? (
            <tr>
              <td colSpan={8} className="text-center py-16 text-gray-400">
                <div className="text-4xl mb-2">🔍</div>
                <div className="text-sm">No recipients match your filter</div>
              </td>
            </tr>
          ) : (
            recipients.map((item, i) => (
              <RecipientRow
                key={item._id}
                item={item}
                index={(page - 1) * LIMIT + i}
              />
            ))
          )}
        </tbody>
      </table>
    </div>

    <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
      <span className="text-xs text-gray-400">
        Showing {recipients.length} of {total} recipients
      </span>

      <Pagination
        totalPages={totalPages}
        page={page}
        onPageChange={onPageChange}
        onNext={onNextPage}
        onPrev={onPrevPage}
      />
    </div>
  </div>
);

export default RecipientsTable;
