import { useCallback, useContext, useEffect, useRef, useState } from "react";

import Swal from "sweetalert2";

import { AiOutlineDelete, AiOutlineEye } from "react-icons/ai";

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

  const [name, setName] = useState("");
  const [category, setCategory] = useState("UTILITY");
  const [language, setLanguage] = useState("en_US");
  const [body, setBody] = useState("");

  const [templates, setTemplates] = useState([]);

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
      <div className="flex items-center justify-center py-12">
        <div className="max-w-md w-full rounded-2xl bg-app-surface p-8 border border-app-border text-center">
          {/* Icon */}
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
            <svg
              className="h-7 w-7 text-green-600"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M3 21l1.5-4.5A8.5 8.5 0 1 1 21 12a8.5 8.5 0 0 1-8.5 8.5H3z" />
            </svg>
          </div>

          {/* Heading */}
          <h2 className="text-2xl font-semibold text-gray-900">
            Connect WhatsApp Business
          </h2>

          {/* Description */}
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
            Connect your WhatsApp Business account to send messages, manage
            conversations, automate notifications, and engage with customers
            directly from your dashboard.
          </p>

          {/* CTA */}
          <button
            onClick={handleWhatsappConnect} // 👈 Meta OAuth / Embedded Signup
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            <span>Connect WhatsApp Business</span>
          </button>

          {/* Helper text */}
          <p className="mt-4 text-xs text-gray-400">
            Secure Meta OAuth • Embedded signup • Official WhatsApp Cloud API
          </p>
        </div>
      </div>
    );
  }

  if (isLoadingIntegrationStatus || isFetching) {
    return (
      <div className="p-4">
        <WhatsappMessageTemplateSkelton />
      </div>
    );
  }

  return (
    <div className="border-primary/60! bg-app-surface px-6 py-5 space-y-5">
      <div className="flex justify-between">
        <h1 className="text-lg text-gray-600 dark:text-app-text font-medium">
          WhatsApp Templates
        </h1>

        {templates.length > 0 && (
          <button
            onClick={() => setOpen(true)}
            className="flex gap-[5px] text-sm font-medium px-3 rounded py-2 bg-green-500 text-white items-center justify-between"
          >
            <MdAdd size={20} /> Create Template
          </button>
        )}
      </div>

      <div className="overflow-hidden">
        {!isFetching && templates?.length === 0 && (
          <div className="p-10 text-center space-y-3">
            <p className="text-lg font-medium">No templates created yet</p>
            <p className="text-sm text-gray-500">
              Create your first WhatsApp message template to get started.
            </p>
            <button
              onClick={() => setOpen(true)}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Create Template
            </button>
          </div>
        )}

        {!isFetching && templates?.length > 0 && (
          <div className="overflow-x-auto bg-app-surface shadow-sm mt-6 border">
            <table className="w-full text-sm">
              <thead className="bg-app-surface-secondary border-b">
                <tr>
                  <th className="px-5 py-3 text-left font-bold text-gray-600 dark:text-app-text-muted">
                    Name
                  </th>
                  <th className="px-5 py-3 text-center font-bold text-gray-600 dark:text-app-text-muted">
                    Category
                  </th>
                  <th className="px-5 py-3 text-center font-bold text-gray-600 dark:text-app-text-muted">
                    Language
                  </th>
                  <th className="px-5 py-3 text-center font-bold text-gray-600 dark:text-app-text-muted">
                    Status
                  </th>
                  <th className="px-5 py-3 text-right font-bold text-gray-600 dark:text-app-text-muted">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="">
                {templates.map((t) => (
                  <tr key={t.name} className="hover:bg-app-surface-secondary/60 transition">
                    {/* NAME */}
                    <td className="px-5 py-4 font-medium text-gray-800 dark:text-app-text">
                      {t.name}
                    </td>

                    {/* CATEGORY */}
                    <td className="px-5 py-4 text-center text-gray-600 dark:text-app-text-faint">
                      {t.category}
                    </td>

                    {/* LANGUAGE */}
                    <td className="px-5 py-4 text-center text-gray-600 dark:text-app-text-faint">
                      {t.language}
                    </td>

                    {/* STATUS */}
                    <td className="px-5 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          t.status === "APPROVED"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-5 py-4 flex gap-1.5 text-right">
                      <button
                        onClick={() => handleDelete(t)}
                        // disabled={t.status === "APPROVED"}
                        className={`inline-flex items-center justify-center w-9 h-9 rounded-lg transition ${
                          t.status === "APPROVED"
                            ? "bg-red-100 text-gray-400 cursor-not-allowed"
                            : "bg-red-50 text-red-600 hover:bg-red-100"
                        }`}
                        title={
                          t.status === "APPROVED"
                            ? "Approved templates cannot be deleted"
                            : "Delete template"
                        }
                      >
                        <AiOutlineDelete size={16} color="#ad3c3c" />
                      </button>

                      <button
                        onClick={() => setSelectedTemplatePreview(t.components)}
                        // disabled={t.status === "APPROVED"}
                        className={`inline-flex items-center justify-center w-9 h-9 rounded-lg bg-green-200/60 hover:bg-green-200 transition`}
                      >
                        <AiOutlineEye size={16} color="#2e7d32" />
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[99999]">
          <div className="bg-app-surface w-full max-w-2xl rounded-lg p-6 space-y-5">
            <h2 className="text-xl font-semibold">Create Message Template</h2>

            <input
              className="border p-2 w-full"
              placeholder="Template name (snake_case)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <div className="flex gap-3">
              <select
                className="border p-2 w-full bg-app-surface"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="UTILITY">UTILITY</option>
                <option value="MARKETING">MARKETING</option>
                <option value="AUTHENTICATION">AUTHENTICATION</option>
              </select>

              <select
                className="border p-2 w-full bg-app-surface"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="en">English (US)</option>
                {/* <option value="en_IN">English (India)</option> */}
                {/* <option value="hi">Hindi</option> */}
              </select>
            </div>

            <textarea
              className="border p-2 w-full"
              rows={4}
              placeholder="Hello {{1}}, your order {{2}} is confirmed"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />

            {/* Variables */}
            {Object.keys(variables).length > 0 && (
              <div className="border rounded p-4 space-y-3">
                <p className="text-sm font-medium">Template Variables</p>

                {Object.keys(variables).map((key) => (
                  <div key={key} className="flex gap-3 items-center">
                    <span className="w-16 text-sm">{key}</span>
                    <input
                      className="border p-2 flex-1"
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
            <div className="border rounded p-4 bg-app-surface-secondary">
              <p className="text-sm font-medium mb-1">Preview</p>
              <p className="text-sm">{preview || "Nothing to preview yet"}</p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>

              <button
                disabled={isCreating}
                onClick={submit}
                className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-60"
              >
                {isCreating ? "Creating..." : "Create Template"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
