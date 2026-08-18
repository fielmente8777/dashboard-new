import { useCallback, useContext, useEffect, useRef, useState } from "react";

import Swal from "sweetalert2";

import { AiOutlineDelete, AiOutlineEdit, AiOutlineEye } from "react-icons/ai";

import { FaWhatsapp } from "react-icons/fa";
import { MdAdd } from "react-icons/md";
import TemplatePreviewModal from "./TemplatePreviewModal";
import {
  createWhatsAppMessageTemplate,
  deleteWhatsAppMessageTemplate,
  getWhatsappAccountDetails,
  getWhatsAppMessageTemplates,
} from "../../../../services/api/whatsApp";
import DataContext from "../../../../context/DataContext";
import { useToast } from "../../../../context/ToastContext";
import { useConfirm } from "../../../../context/ConfirmContext";
import { connectWhatsapp } from "../../../../services/api/Integration";
import WhatsappMessageTemplateSkelton from "../../../../components/Skeltons/WhatsappMessageTemplateSkelton";
import CreateTemplate from "./CreateTemplate";

/* ── shared presentation tokens ─────────────────────────────── */
const HEAD_CELL =
  "px-[var(--sp-4)] py-[var(--sp-3)] font-bold text-[length:var(--fs-sm)] text-gray-600 dark:text-app-text-muted whitespace-nowrap";
const CELL = "px-[var(--sp-4)] py-[var(--sp-4)] text-[length:var(--fs-sm)]";
const ICON_BTN =
  "inline-flex shrink-0 items-center justify-center w-9 h-9 rounded-[var(--r-md)] transition-colors";
const FIELD =
  "w-full min-w-0 rounded-[var(--r-sm)] border border-app-border bg-app-surface p-[var(--sp-2)] text-[length:var(--fs-sm)] text-app-text placeholder:text-app-text-faint outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30";

export default function WhatsAppMessageTemplate() {
  const { confirm } = useConfirm();
  const { showToast } = useToast();
  const hasFetchedRef = useRef(false);
  const {
    integrationStatus,
    checkIntegrationStatus,
    isLoadingIntegrationStatus,
  } = useContext(DataContext);

  const [selectedTemplatePreview, setSelectedTemplatePreview] = useState(null);
  // const [accountDetails, setAccountDetails] = useState(null);
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("UTILITY");
  const [language, setLanguage] = useState("en_US");
  const [body, setBody] = useState("");

  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const [variables, setVariables] = useState({});
  const [preview, setPreview] = useState("");

  const fetchTemplates = async () => {
    try {
      setIsFetching(true);
      const response = await getWhatsAppMessageTemplates();
      if (response.success) {
        setTemplates(response?.result?.docs?.data || []);
      }
    } catch (error) {
      Swal.fire("Error", error?.message || "Failed to load templates", "error");
    } finally {
      setIsFetching(false);
    }
  };

  const fetchAccountDetails = useCallback(async () => {
    try {
      await getWhatsappAccountDetails();
      // setAccountDetails(response?.result?.docs);
    } catch (error) {
      console.error("Error fetching data", error?.message);
    }
  }, []);

  const handleWhatsappConnect = async () => {
    try {
      const response = await connectWhatsapp();

      if (response?.success && response?.responseStatusCode) {
        window.open(response?.result?.docs?.signupUrl, "_blank");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async (template) => {
    const isConfirm = await confirm(
      "Are you sure you want to delete this template?",
    );

    if (!isConfirm) return;

    try {
      await deleteWhatsAppMessageTemplate({
        templateName: template.name,
        language: template.language,
      });

      showToast({
        message: "Template deleted successfully",
        type: "success",
      });

      setTemplates((prev) => prev.filter((t) => t.name !== template.name));
    } catch (error) {
      showToast({
        message: error?.message || "Failed to delete template",
        type: "error",
      });
    }
  };

  /* ---------------- VARIABLES ---------------- */
  useEffect(() => {
    const matches = body.match(/{{\d+}}/g) || [];
    const uniqueVars = [...new Set(matches)];
    const updated = {};
    uniqueVars.forEach((v) => (updated[v] = variables[v] || ""));
    setVariables(updated);
  }, [body]);

  useEffect(() => {
    let text = body;
    Object.entries(variables).forEach(([k, v]) => {
      text = text.replaceAll(k, v || k);
    });
    setPreview(text);
  }, [variables, body]);

  const submit = async () => {
    if (!name || !body) {
      return showToast({
        message: "Please fill name and body",
        type: "error",
      });
    }

    setIsCreating(true);

    try {
      const response = await createWhatsAppMessageTemplate({
        name,
        category,
        language: language,
        body,
      });

      if (response?.error || response?.metaError) {
        setOpen(false);
        const metaError = response.error || response.metaError;

        return Swal.fire({
          className: "z-99999",
          icon: "error",
          title: metaError?.error?.error_user_title || "Template Error",
          text:
            metaError?.error?.error_user_msg ||
            metaError?.error?.message ||
            "Something went wrong while creating the template",
        });
      }

      if (response?.success && response?.responseStatusCode) {
        showToast({
          message: "Template created successfully",
          type: "success",
        });
        setOpen(false);
        setName("");
        setBody("");
        setVariables({});
        fetchTemplates();
      }
    } catch (err) {
      const metaError = err?.response?.data?.error;
      if (metaError) {
        Swal.fire({
          icon: "error",
          title: metaError.error_user_title || "Template Error",
          text:
            metaError.error_user_msg ||
            metaError.message ||
            "Something went wrong while creating the template",
        });
      } else {
        Swal.fire("Error", "Creation failed. Please try again.", "error");
      }
    } finally {
      setIsCreating(false);
    }
  };

  useEffect(() => {
    checkIntegrationStatus();
  }, []);

  useEffect(() => {
    if (integrationStatus?.metaWhatsapp && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchAccountDetails();
      fetchTemplates();
    }
  }, [integrationStatus]);

  if (!integrationStatus?.metaWhatsapp) {
    return (
      <div className="flex items-center justify-center px-[var(--sp-4)] py-[var(--sp-6)]">
        <div className="max-w-md w-full rounded-[var(--r-lg)] bg-app-surface p-[var(--sp-5)] sm:p-[var(--sp-6)] border border-app-border text-center">
          {/* Icon */}
          <div className="mx-auto mb-[var(--sp-5)] flex h-14 w-14 items-center justify-center rounded-full bg-green-50 dark:bg-green-500/15">
            <svg
              className="h-7 w-7 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M3 21l1.5-4.5A8.5 8.5 0 1 1 21 12a8.5 8.5 0 0 1-8.5 8.5H3z" />
            </svg>
          </div>

          {/* Heading */}
          <h2 className="text-[length:var(--fs-2xl)] font-semibold text-gray-900 dark:text-app-text">
            Connect WhatsApp Business
          </h2>

          {/* Description */}
          <p className="mt-3 text-[length:var(--fs-sm)] text-gray-600 dark:text-app-text-faint leading-relaxed">
            Connect your WhatsApp Business account to send messages, manage
            conversations, automate notifications, and engage with customers
            directly from your dashboard.
          </p>

          {/* CTA */}
          <button
            onClick={handleWhatsappConnect} // 👈 Meta OAuth / Embedded Signup
            className="mt-[var(--sp-6)] inline-flex w-full items-center justify-center gap-2 rounded-[var(--r-md)] bg-green-600 px-[var(--sp-5)] py-[var(--sp-3)] text-[length:var(--fs-sm)] font-medium text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-app-surface"
          >
            <span>Connect WhatsApp Business</span>
          </button>

          {/* Helper text */}
          <p className="mt-[var(--sp-4)] text-[length:var(--fs-xs)] text-gray-400 dark:text-app-text-faint">
            Secure Meta OAuth • Embedded signup • Official WhatsApp Cloud API
          </p>
        </div>
      </div>
    );
  }

  if (isLoadingIntegrationStatus || isFetching) {
    return (
      <div className="p-[var(--sp-4)]">
        <WhatsappMessageTemplateSkelton />
      </div>
    );
  }

  return (
    <div className="bg-app-surface px-[var(--sp-5)] py-[var(--sp-5)] space-y-[var(--sp-5)]">
      <div className="flex flex-wrap justify-between items-center gap-[var(--sp-3)]">
        <h1 className="text-[length:var(--fs-lg)] text-gray-600 dark:text-app-text font-medium">
          WhatsApp Templates
        </h1>

        {templates.length > 0 && (
          <button
            onClick={() => setOpen(true)}
            className="flex gap-[5px] text-[length:var(--fs-sm)] font-medium px-[var(--sp-3)] py-[var(--sp-2)] rounded-[var(--r-sm)] bg-green-500 hover:bg-green-600 text-white items-center transition-colors whitespace-nowrap"
          >
            <MdAdd size={20} /> Create Template
          </button>
        )}
      </div>

      <div className="overflow-hidden">
        {!isFetching && templates?.length === 0 && (
          <div className="p-[var(--sp-6)] text-center space-y-3">
            <p className="text-[length:var(--fs-lg)] font-medium text-app-text">
              No templates created yet
            </p>
            <p className="text-[length:var(--fs-sm)] text-gray-500 dark:text-app-text-faint">
              Create your first WhatsApp message template to get started.
            </p>
            <button
              onClick={() => setOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-[var(--sp-4)] py-[var(--sp-2)] rounded-[var(--r-sm)] text-[length:var(--fs-sm)] font-medium transition-colors"
            >
              Create Template
            </button>
          </div>
        )}

        {!isFetching && templates?.length > 0 && (
          <div className="overflow-x-auto bg-app-surface shadow-sm mt-[var(--sp-5)] border border-app-border rounded-[var(--r-md)]">
            <table className="w-full min-w-[42rem]">
              <thead className="bg-app-surface-secondary border-b border-app-border">
                <tr>
                  <th className={`${HEAD_CELL} text-left`}>Name</th>
                  <th className={`${HEAD_CELL} text-center`}>Category</th>
                  <th className={`${HEAD_CELL} text-center`}>Language</th>
                  <th className={`${HEAD_CELL} text-center`}>Status</th>
                  <th className={`${HEAD_CELL} text-right`}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {templates.map((t) => (
                  <tr
                    key={t.name}
                    className="border-b border-app-border last:border-b-0 hover:bg-app-surface-secondary/60 transition-colors"
                  >
                    {/* NAME */}
                    <td
                      className={`${CELL} font-medium text-gray-800 dark:text-app-text break-all`}
                    >
                      {t.name}
                    </td>

                    {/* CATEGORY */}
                    <td
                      className={`${CELL} text-center text-gray-600 dark:text-app-text-faint whitespace-nowrap`}
                    >
                      {t.category}
                    </td>

                    {/* LANGUAGE */}
                    <td
                      className={`${CELL} text-center text-gray-600 dark:text-app-text-faint whitespace-nowrap`}
                    >
                      {t.language}
                    </td>

                    {/* STATUS */}
                    <td className={`${CELL} text-center`}>
                      <span
                        className={`inline-flex items-center px-[var(--sp-3)] py-1 rounded-full text-[length:var(--fs-xs)] font-medium whitespace-nowrap ${
                          t.status === "APPROVED"
                            ? "bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400"
                            : "bg-yellow-100 dark:bg-yellow-500/15 text-yellow-700 dark:text-yellow-400"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td
                      className={`${CELL} flex justify-end gap-1.5 text-right`}
                    >
                      <button
                        onClick={() => handleDelete(t)}
                        aria-label="Delete template"
                        // disabled={t.status === "APPROVED"}
                        className={`${ICON_BTN} ${
                          t.status === "APPROVED"
                            ? "bg-red-100 dark:bg-red-500/10 text-gray-400 dark:text-app-text-faint cursor-not-allowed"
                            : "bg-red-50 dark:bg-red-500/15 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/25"
                        }`}
                        title={
                          t.status === "APPROVED"
                            ? "Approved templates cannot be deleted"
                            : "Delete template"
                        }
                      >
                        <AiOutlineDelete size={16} />
                      </button>

                      <button
                        onClick={() => {
                          setSelectedTemplate(t);
                          setOpenEditModal(true);
                        }}
                        aria-label="Edit template"
                        className={`${ICON_BTN} bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-500/25`}
                      >
                        <AiOutlineEdit size={16} />
                      </button>

                      <button
                        onClick={() => setSelectedTemplatePreview(t.components)}
                        aria-label="Preview template"
                        // disabled={t.status === "APPROVED"}
                        className={`${ICON_BTN} bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-500/25`}
                      >
                        <AiOutlineEye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedTemplatePreview && (
        <TemplatePreviewModal
          components={selectedTemplatePreview || []}
          onClose={() => setSelectedTemplatePreview(null)}
        />
      )}

      {/* CREATE MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[99999] p-[var(--sp-4)]">
          <div className="bg-app-surface w-full max-w-2xl max-h-[90dvh] overflow-y-auto rounded-[var(--r-md)] p-[var(--sp-5)] space-y-[var(--sp-5)]">
            <h2 className="text-[length:var(--fs-xl)] font-semibold text-app-text">
              Create Message Template
            </h2>

            <input
              className={FIELD}
              placeholder="Template name (snake_case)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <div className="flex flex-col sm:flex-row gap-[var(--sp-3)]">
              <select
                className={`${FIELD} cursor-pointer`}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="UTILITY">UTILITY</option>
                <option value="MARKETING">MARKETING</option>
                <option value="AUTHENTICATION">AUTHENTICATION</option>
              </select>

              <select
                className={`${FIELD} cursor-pointer`}
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="en">English (US)</option>
                {/* <option value="en_IN">English (India)</option> */}
                {/* <option value="hi">Hindi</option> */}
              </select>
            </div>

            <textarea
              className={`${FIELD} resize-y`}
              rows={4}
              placeholder="Hello {{1}}, your order {{2}} is confirmed"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />

            {/* Variables */}
            {Object.keys(variables).length > 0 && (
              <div className="border border-app-border rounded-[var(--r-sm)] p-[var(--sp-4)] space-y-[var(--sp-3)]">
                <p className="text-[length:var(--fs-sm)] font-medium text-app-text">
                  Template Variables
                </p>

                {Object.keys(variables).map((key) => (
                  <div key={key} className="flex gap-[var(--sp-3)] items-center">
                    <span className="w-16 shrink-0 text-[length:var(--fs-sm)] text-app-text">
                      {key}
                    </span>
                    <input
                      className={FIELD}
                      placeholder={`Preview value for ${key}`}
                      value={variables[key]}
                      onChange={(e) =>
                        setVariables({
                          ...variables,
                          [key]: e.target.value,
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Preview */}
            <div className="border border-app-border rounded-[var(--r-sm)] p-[var(--sp-4)] bg-app-surface-secondary">
              <p className="text-[length:var(--fs-sm)] font-medium mb-1 text-app-text">
                Preview
              </p>
              <p className="text-[length:var(--fs-sm)] text-gray-700 dark:text-app-text-muted whitespace-pre-line break-words">
                {preview || "Nothing to preview yet"}
              </p>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-[var(--sp-3)]">
              <button
                onClick={() => setOpen(false)}
                className="px-[var(--sp-4)] py-[var(--sp-2)] border border-app-border text-app-text rounded-[var(--r-sm)] text-[length:var(--fs-sm)] hover:bg-app-surface-secondary transition-colors"
              >
                Cancel
              </button>

              <button
                disabled={isCreating}
                onClick={submit}
                className="bg-green-600 hover:bg-green-700 text-white px-[var(--sp-4)] py-[var(--sp-2)] rounded-[var(--r-sm)] text-[length:var(--fs-sm)] font-medium transition-colors disabled:opacity-60"
              >
                {isCreating ? "Creating..." : "Create Template"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPDATE TEMPLATE MODAL  */}

      {openEditModal && (
        <div className="z-[99999] fixed inset-0 bg-black/40 p-[var(--sp-2)] overflow-hidden">
          <div className="w-full max-w-7xl mx-auto overflow-y-auto h-full bg-app-surface border border-app-border rounded-[var(--r-md)] hide-scrollbar">
            <CreateTemplate
              mode="edit"
              initialData={selectedTemplate}
              onClose={() => {
                setOpenEditModal(false);
                setSelectedTemplate(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}