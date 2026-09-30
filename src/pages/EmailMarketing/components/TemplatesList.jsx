import { useCallback, useEffect, useState } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiEdit3,
  FiLayout,
  FiMenu,
  FiRefreshCw,
  FiSearch,
  FiSend,
  FiTrash2,
  FiZap,
} from "react-icons/fi";

import AITemplateModal from "./AITemplateModal";
import { EmailThumbnail } from "./EmailPreviewFrame";
import {
  deleteEmailTemplate,
  getEmailTemplates,
} from "../../../services/api/emailTemplate";

const PAGE_SIZE = 12;

const formatDate = (value) => {
  if (!value) return "";
  try {
    return new Date(value).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
};

export default function TemplatesList({ onUseTemplate, onOpenMobileNav }) {
  const [templates, setTemplates] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const [modal, setModal] = useState({ open: false, template: null });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const loadTemplates = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError("");
      const res = await getEmailTemplates({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch,
      });
      setTemplates(res?.doc || []);
      setTotal(res?.pagination?.total || 0);
    } catch (error) {
      console.error("Error loading templates:", error);
      setLoadError("Could not load templates. Refresh to try again.");
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const openCreate = () => setModal({ open: true, template: null });
  const openEdit = (template) => setModal({ open: true, template });
  const closeModal = () => setModal({ open: false, template: null });

  const handleSaved = () => {
    if (page !== 1) setPage(1);
    else loadTemplates();
  };

  const handleDelete = async (template) => {
    if (!window.confirm(`Delete "${template.name}"?`)) return;

    try {
      setDeletingId(template._id);
      await deleteEmailTemplate(template._id);

      if (templates.length === 1 && page > 1) setPage((p) => p - 1);
      else loadTemplates();
    } catch (error) {
      console.error("Failed to delete template:", error);
      alert("Could not delete the template. Try again.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="flex min-w-0 flex-1 flex-col overflow-hidden">
      {/* MOBILE HEADER */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-gray-200 px-3 md:hidden">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={onOpenMobileNav}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100"
            aria-label="Open navigation"
          >
            <FiMenu size={20} />
          </button>
          <span className="truncate text-sm font-semibold text-gray-800">
            Templates
          </span>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex h-9 items-center gap-1.5 rounded-lg bg-blue-600 px-3 text-xs font-medium text-white"
        >
          <FiZap size={14} />
          Create
        </button>
      </div>

      {/* SEARCH + CREATE */}
      <div className="flex shrink-0 items-center gap-3 border-b border-gray-200 p-3 sm:p-4 md:px-5 md:py-3">
        <div className="relative min-w-0 flex-1">
          <FiSearch
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates by name or subject"
            className="h-11 w-full rounded-lg border border-gray-200 bg-gray-100 pl-10 pr-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="hidden h-11 shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 md:flex"
        >
          <FiZap size={16} />
          Create with AI
        </button>
      </div>

      {/* TOOLBAR */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-gray-200 px-3 sm:px-4 md:h-14 md:px-5">
        <button
          type="button"
          onClick={loadTemplates}
          disabled={isLoading}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
          aria-label="Refresh templates"
        >
          <FiRefreshCw size={17} className={isLoading ? "animate-spin" : ""} />
        </button>

        <div className="flex items-center gap-0.5">
          <span className="mr-1 whitespace-nowrap text-xs text-gray-600 sm:mr-2 sm:text-sm">
            {total === 0
              ? "0–0 of 0"
              : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(
                  page * PAGE_SIZE,
                  total,
                )} of ${total}`}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Previous page"
          >
            <FiChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Next page"
          >
            <FiChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* GRID */}
      <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4 md:p-5">
        {isLoading && templates.length === 0 ? (
          <div className="flex h-52 items-center justify-center text-sm text-gray-400">
            Loading templates...
          </div>
        ) : loadError ? (
          <div className="flex h-52 items-center justify-center text-sm text-red-600">
            {loadError}
          </div>
        ) : templates.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center px-5 text-center">
            <FiLayout size={38} className="mb-3 text-gray-300" />
            <p className="text-sm font-medium text-gray-700">
              {debouncedSearch ? "No templates found" : "No templates yet"}
            </p>
            <p className="mt-1 max-w-xs text-xs text-gray-400">
              {debouncedSearch
                ? "Try another search."
                : "Describe an email and AI will design it. Save it here to reuse in any broadcast."}
            </p>
            {/* {!debouncedSearch && (
              <button
                type="button"
                onClick={openCreate}
                className="mt-4 flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
              >
                <FiZap size={15} />
                Create your first template
              </button>
            )} */}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {templates.map((template) => (
              <div
                key={template._id}
                className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:border-gray-300 hover:shadow-md"
              >
                <button
                  type="button"
                  onClick={() => openEdit(template)}
                  className="block border-b border-gray-100 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                  aria-label={`Open ${template.name}`}
                >
                  <EmailThumbnail html={template.html} />
                </button>

                <div className="flex flex-1 flex-col p-3">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {template.name}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-gray-500">
                    {template.subject || "No subject"}
                  </p>
                  <p className="mt-1 text-[11px] text-gray-400">
                    Updated {formatDate(template.updatedAt)}
                  </p>

                  <div className="mt-3 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onUseTemplate?.(template)}
                      className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-600 text-xs font-medium text-white transition hover:bg-blue-700"
                    >
                      <FiSend size={13} />
                      Use in email
                    </button>
                    <button
                      type="button"
                      onClick={() => openEdit(template)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50 hover:text-gray-800"
                      aria-label={`Edit ${template.name}`}
                      title="Edit"
                    >
                      <FiEdit3 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(template)}
                      disabled={deletingId === template._id}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                      aria-label={`Delete ${template.name}`}
                      title="Delete"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AITemplateModal
        isOpen={modal.open}
        mode="manage"
        initialTemplate={modal.template}
        onClose={closeModal}
        onSaved={handleSaved}
      />
    </section>
  );
}
