import { useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  createWhatsAppMessageTemplate,
  getWhatsAppMessageTemplates,
  deleteWhatsAppMessageTemplate,
  getWhatsappAccountDetails,
} from "../../../services/api/whatsApp";
import Swal from "sweetalert2";

import { AiOutlineDelete } from "react-icons/ai";
import DataContext from "../../../context/DataContext";
import { connectWhatsapp } from "../../../services/api/Integration";
import WhatsappMessageTemplateSkelton from "../../../components/Skeltons/WhatsappMessageTemplateSkelton";
import { FaWhatsapp } from "react-icons/fa";

const chipClass = (variant) => {
  const map = {
    green: "bg-green-50 text-green-700 ring-1 ring-green-200",
    yellow: "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200",
    red: "bg-red-50 text-red-700 ring-1 ring-red-200",
  };
  return map[variant];
};

export default function WhatsAppMessageTemplate() {
  const hasFetchedRef = useRef(false);
  const {
    integrationStatus,
    checkIntegrationStatus,
    isLoadingIntegrationStatus,
  } = useContext(DataContext);
  const [accountDetails, setAccountDetails] = useState(null);
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
      const response = await getWhatsappAccountDetails();
      setAccountDetails(response?.result?.docs);
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
    const result = await Swal.fire({
      title: "Delete template?",
      text: `This will permanently delete "${template.name}"`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Delete",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteWhatsAppMessageTemplate({
        templateName: template.name,
        language: template.language,
      });

      Swal.fire("Deleted!", "Template deleted successfully", "success");

      setTemplates((prev) => prev.filter((t) => t.name !== template.name));
    } catch (error) {
      Swal.fire(
        "Error",
        error?.message || "Failed to delete template",
        "error",
      );
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
      return Swal.fire("Validation", "Name & body required", "warning");
    }

    setIsCreating(true);

    try {
      const response = await createWhatsAppMessageTemplate({
        name,
        category,
        language,
        body,
      });

      if (response?.error) {
        const metaError = response.error;
        console.log(metaError);

        return Swal.fire({
          icon: "error",
          title: metaError?.error?.error_user_title || "Template Error",
          text:
            metaError?.error?.error_user_msg ||
            metaError?.error?.message ||
            "Something went wrong while creating the template",
        });
      }

      if (response?.success && response?.responseStatusCode) {
        Swal.fire("Success", "Template created", "success");
        setOpen(false);
        setName("");
        setBody("");
        setVariables({});
        fetchTemplates();
      }
    } catch (err) {
      console.log(err);
      const metaError = err?.response?.data?.error;

      console.log(metaError);

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
        <div className="max-w-md w-full rounded-2xl bg-white p-8 border border-gray-100 text-center">
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

  const isMessagingEnabled =
    accountDetails?.phoneNumber?.platformType === "CLOUD_API";

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between">
        <h1 className="text-2xl font-semibold">WhatsApp Message Templates</h1>

        {templates.length > 0 && (
          <button
            onClick={() => setOpen(true)}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            + Create Template
          </button>
        )}
      </div>

      <div className="w-full rounded-xl border bg-white px-6 py-5">
        <div className="flex items-start justify-between">
          {/* LEFT */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FaWhatsapp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-semibold text-gray-900">
                Phone Number
              </span>
            </div>

            <p className="text-2xl font-semibold text-gray-900">
              {accountDetails?.phoneNumber?.displayPhoneNumber}
            </p>

            <p className="text-sm text-gray-500">
              {accountDetails?.phoneNumber?.verifiedName}
            </p>
          </div>

          {/* RIGHT: STATUS */}
          <div className="flex flex-col items-end gap-2">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                isMessagingEnabled
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {isMessagingEnabled ? "Messages Enabled" : "Messages Disabled"}
            </span>

            {!isMessagingEnabled && (
              <span className="text-xs text-gray-400">
                Not connected to Cloud API
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          {/* MODE */}
          <span
            className={`rounded-full px-3 py-1 font-medium ${chipClass(
              accountDetails?.phoneNumber?.accountMode === "LIVE"
                ? "green"
                : "yellow",
            )}`}
          >
            Mode: {accountDetails?.phoneNumber?.accountMode}
          </span>

          {/* NAME STATUS */}
          <span
            className={`rounded-full px-3 py-1 font-medium ${chipClass(
              accountDetails?.phoneNumber?.nameStatus === "APPROVED"
                ? "green"
                : accountDetails?.phoneNumber?.nameStatus === "REJECTED"
                  ? "red"
                  : "yellow",
            )}`}
          >
            Name: {accountDetails?.phoneNumber?.nameStatus}
          </span>

          {/* QUALITY */}
          <span
            className={`rounded-full px-3 py-1 font-medium ${chipClass(
              accountDetails?.phoneNumber?.qualityRating === "HIGH"
                ? "green"
                : accountDetails?.phoneNumber?.qualityRating === "LOW"
                  ? "red"
                  : "yellow",
            )}`}
          >
            Quality: {accountDetails?.phoneNumber?.qualityRating}
          </span>
        </div>
      </div>

      <div className="rounded-lg overflow-hidden">
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
          <div className="overflow-hidden rounded-xl bg-white shadow-sm mt-6 border">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-5 py-3 text-left font-bold text-gray-600">
                    Name
                  </th>
                  <th className="px-5 py-3 text-center font-bold text-gray-600">
                    Category
                  </th>
                  <th className="px-5 py-3 text-center font-bold text-gray-600">
                    Language
                  </th>
                  <th className="px-5 py-3 text-center font-bold text-gray-600">
                    Status
                  </th>
                  <th className="px-5 py-3 text-right font-bold text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="">
                {templates.map((t) => (
                  <tr key={t.name} className="hover:bg-gray-50 transition">
                    {/* NAME */}
                    <td className="px-5 py-4 font-medium text-gray-800">
                      {t.name}
                    </td>

                    {/* CATEGORY */}
                    <td className="px-5 py-4 text-center text-gray-600">
                      {t.category}
                    </td>

                    {/* LANGUAGE */}
                    <td className="px-5 py-4 text-center text-gray-600">
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
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleDelete(t)}
                        disabled={t.status === "APPROVED"}
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>Sample Template</div>

      {/* CREATE MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white w-full max-w-2xl rounded-lg p-6 space-y-5">
            <h2 className="text-xl font-semibold">Create Message Template</h2>

            <input
              className="border p-2 w-full"
              placeholder="Template name (snake_case)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <div className="flex gap-3">
              <select
                className="border p-2 w-full"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="UTILITY">UTILITY</option>
                <option value="MARKETING">MARKETING</option>
                <option value="AUTHENTICATION">AUTHENTICATION</option>
              </select>

              <select
                className="border p-2 w-full"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="en_US">English (US)</option>
                <option value="en_IN">English (India)</option>
                <option value="hi">Hindi</option>
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
            <div className="border rounded p-4 bg-gray-50">
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
