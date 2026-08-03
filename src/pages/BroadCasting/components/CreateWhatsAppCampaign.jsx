import React, { useEffect, useState } from "react";
import CustomDropdown from "../../../components/ui/Dropdown";
import {
  createCampaign,
  getCampaignUsers,
} from "../../../services/api/whatsApp";
import { Sources } from "../../../data/constant";
import { useToast } from "../../../context/ToastContext";
import TemplatePreview from "../../Channels/Whatsapp/components/TemplatePreview";
import Loader from "../../../components/Loader";

const MESSAGE_LIMIT = 2000;

const pricing = {
  utility: 0.05,
  marketing: 0.1,
};

/* -------------------- Custom Select -------------------- */

/* -------------------- Main Component -------------------- */
const CreateWhatsAppCampaign = ({ open, onClose, templates = [] }) => {
  const { showToast } = useToast();
  const [campaignName, setCampaignName] = useState("");
  const [templateType, setTemplateType] = useState("utility");
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const [audienceFilter, setAudienceFilter] = useState("last30days");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [source, setSource] = useState("");

  const [isFetchingUsers, setIsFetchingUsers] = useState(false);
  const [isCreatingLoading, setIsCreatingLoading] = useState(false);

  const [estimatedUsers, setEstimatedUsers] = useState(0);

  /* -------------------- Filter Templates -------------------- */
  const filteredTemplates = templates.filter(
    (t) => t.category?.toLowerCase() === templateType,
  );

  const templateOptions = filteredTemplates.map((t) => ({
    label: t.name,
    value: t.id,
    data: t,
  }));

  const templateCategory = selectedTemplate?.category?.toLowerCase();
  const totalPrice = estimatedUsers * (pricing[templateCategory] || 0);

  const exceedsLimit = estimatedUsers > MESSAGE_LIMIT;

  const handleSourceChange = async (source = null) => {
    setSource(source);
    setIsFetchingUsers(true);

    try {
      const params = {
        ...(source && { source }),
      };

      const response = await getCampaignUsers(params);

      if (response.result) {
        setEstimatedUsers(response.result.totalUsers);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsFetchingUsers(false);
    }
  };

  const handleTemplateTypeChange = (value) => {
    setTemplateType(value);
    setSelectedTemplate(null);
  };

  const createWhatsappCampaign = async () => {
    try {
      setIsCreatingLoading(true);

      if (!selectedTemplate) {
        showToast({
          type: "error",
          message: "Please select a template",
        });
        return;
      }

      if (!estimatedUsers || estimatedUsers === 0) {
        showToast({
          type: "error",
          message: "Users not found",
        });
        return;
      }

      const selectTemplate = templates.find(
        (t) => t.id === selectedTemplate?.id,
      );

      const headerExample =
        selectTemplate.components?.find((c) => c.type === "HEADER")?.example
          ?.header_text?.[0] || [];

      const bodyExample =
        selectTemplate.components?.find((c) => c.type === "BODY")?.example
          ?.body_text?.[0] || [];
      const payload = {
        template: {
          templateId: selectTemplate.id,
          templateName: selectTemplate.name,
          templateCategory: selectTemplate.category,
          templateLanguage: selectTemplate.language,
          ...(bodyExample && { templateParams: bodyExample }),
          ...(headerExample && { templateParamsHeader: headerExample }),
        },
        campaignName,
        ...(source && { source }),
      };

      const response = await createCampaign(payload);

      if (response?.success) {
        showToast({
          type: "success",
          message: response?.responseMessage || "Campaign created successfully",
        });
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreatingLoading(false);
    }
  };

  useEffect(() => {
    handleSourceChange();
  }, []);

  const isDisabled = !campaignName || !selectedTemplate || isCreatingLoading;

  return (
    open && (
      <div className="fixed inset-0 bg-app-surface/80 flex items-center justify-center z-50 h-screen">
        <div className="bg-app-surface/60 max-w-xl w-full p-6 rounded-xl h-[95vh] overflow-y-auto hide-scrollbar">
          <h2 className="text-lg font-semibold mb-4 text-app-text dark:text-app-text">
            Create WhatsApp Campaign
          </h2>

          {/* Campaign Name */}
          <div className="mb-4">
            <label className="block mb-1">Campaign Name</label>
            <input
              className="w-full border p-2 rounded-md"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
            />
          </div>

          {/* Template Type */}
          <div className="mb-4">
            <label className="block mb-1">Template Type</label>
            <select
              className="w-full border p-2 rounded-md text-app-text dark:text-app-text-faint bg-app-surface-secondary"
              value={templateType}
              onChange={(e) => handleTemplateTypeChange(e.target.value)}
            >
              <option value="utility">Utility</option>
              <option value="marketing">Marketing</option>
            </select>
          </div>

          {/* Template Select */}

          <div className="mb-4">
            <label className="block mb-1">Template</label>

            <select
              className="w-full border p-2 rounded-md text-app-text dark:text-app-text-faint bg-app-surface-secondary"
              value={selectedTemplate?.id || ""}
              onChange={(e) => {
                const selected = filteredTemplates.find(
                  (t) => t.id === e.target.value,
                );
                setSelectedTemplate(selected || null);
              }}
            >
              <option value="">Select Template</option>

              {filteredTemplates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Template Preview */}
          {selectedTemplate && (
            <div className="mt-4">
              <TemplatePreview
                components={
                  templates?.find((t) => t.id === selectedTemplate?.id)
                    ?.components || []
                }
              />
            </div>
          )}

          {/* Audience Filter */}
          <div className="mb-4">
            <label className="block mb-1">Audience Based On</label>
            <select
              className="w-full border p-2 rounded-md text-app-text dark:text-app-text-faint bg-app-surface-secondary"
              value={audienceFilter}
              onChange={(e) => setAudienceFilter(e.target.value)}
            >
              <option value="last30days">Last 30 Days</option>
              <option value="dateRange">Custom Date Range</option>
            </select>
          </div>

          {/* Date Range */}
          {audienceFilter === "dateRange" && (
            <div className="flex gap-3 mb-4">
              <input
                type="date"
                className="border p-2 rounded-md w-full"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <input
                type="date"
                className="border p-2 rounded-md w-full"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          )}

          {/* Source */}
          <div className="mb-4">
            <label className="block mb-1">Source</label>
            <select
              className="w-full border p-2 rounded-md text-app-text dark:text-app-text-faint bg-app-surface-secondary"
              value={source}
              onChange={(e) => handleSourceChange(e.target.value)}
            >
              {/* <option value="" disabled>
                Select Source
              </option> */}
              {Sources.map((source) => (
                <option value={source.value || ""}>{source.label}</option>
              ))}
            </select>
          </div>

          {/* Estimated Users */}
          <div className="mb-2 text-sm">
            {isFetchingUsers && <p>Loading...</p>}
            <strong>Estimated Users:</strong> {estimatedUsers}
          </div>

          {exceedsLimit && (
            <div className="mb-2 text-yellow-600 text-sm">
              ⚠ Tier 1 limit exceeded (1000 users/day). Split campaign.
            </div>
          )}

          {/* Price */}
          <div className="mb-4 text-sm">
            <strong>Total Price:</strong> ₹{totalPrice.toFixed(2)}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="border px-4 py-2 rounded-md">
              Cancel
            </button>

            <button
              type="button"
              onClick={createWhatsappCampaign}
              disabled={isDisabled}
              // disabled={!campaignName || !selectedTemplate || exceedsLimit}
              className=" bg-green-600 text-white px-4 py-2 rounded-md disabled:opacity-60 disabled:cursor-not-allowed! flex items-center gap-2"
            >
              Create Campaign{" "}
              {isCreatingLoading && <Loader color="#fefefe" size={14} />}
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default CreateWhatsAppCampaign;

// import React, { useState } from "react";

// const MESSAGE_LIMIT = 1000; // Tier 1 Limi
// const pricing = {
//   utility: 0.05,
//   marketing: 0.1,
// };

// const CreateWhatsAppCampaign = ({ open, onClose, templates }) => {
//   console.log(templates);
//   const [campaignName, setCampaignName] = useState("");
//   const [templateType, setTemplateType] = useState("utility");

//   const [audienceFilter, setAudienceFilter] = useState("last30days");
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [source, setSource] = useState("");

//   const [estimatedUsers, setEstimatedUsers] = useState(0);

//   const totalPrice = estimatedUsers * pricing[templateType];
//   const exceedsLimit = estimatedUsers > MESSAGE_LIMIT;
//   return (
//     open && (
//       <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-9999">
//         <div className="bg-white max-w-150 w-full p-6 rounded-xl">
//           <h2 className="text-lg font-semibold mb-4">
//             Create WhatsApp Campaign
//           </h2>

//           {/* Campaign Name */}
//           <div className="mb-4">
//             <label className="block mb-1">Campaign Name</label>
//             <input
//               className="w-full border p-2 rounded-md"
//               value={campaignName}
//               onChange={(e) => setCampaignName(e.target.value)}
//             />
//           </div>

//           {/* Template Type */}
//           <div className="mb-4">
//             <label className="block mb-1">Template Type</label>
//             <select
//               className="w-full border p-2 rounded-md"
//               value={templateType}
//               onChange={(e) => setTemplateType(e.target.value)}
//             >
//               <option value="utility">Utility</option>
//               <option value="marketing">Marketing</option>
//             </select>
//           </div>

//           {/* Audience Filter */}
//           <div className="mb-4">
//             <label className="block mb-1">Audience Based On</label>
//             <select
//               className="w-full border p-2 rounded-md"
//               value={audienceFilter}
//               onChange={(e) => setAudienceFilter(e.target.value)}
//             >
//               <option value="last30days">Last 30 Days</option>
//               <option value="dateRange">Custom Date Range</option>
//             </select>
//           </div>

//           {/* Date Range */}
//           {audienceFilter === "dateRange" && (
//             <div className="flex gap-3 mb-4">
//               <input
//                 type="date"
//                 className="border p-2 rounded-md w-full"
//                 value={startDate}
//                 onChange={(e) => setStartDate(e.target.value)}
//               />
//               <input
//                 type="date"
//                 className="border p-2 rounded-md w-full"
//                 value={endDate}
//                 onChange={(e) => setEndDate(e.target.value)}
//               />
//             </div>
//           )}

//           {/* Source */}
//           <div className="mb-4">
//             <label className="block mb-1">Source</label>
//             <select
//               className="w-full border p-2 rounded-md"
//               value={source}
//               onChange={(e) => setSource(e.target.value)}
//             >
//               <option value="">All Sources</option>
//               <option value="google_ads">Google Ads</option>
//               <option value="meta">Meta Leads</option>
//               <option value="website">Website</option>
//               <option value="eazbot">Eazbot</option>
//               <option value="webform">Webform</option>
//             </select>
//           </div>

//           {/* Estimated Users */}
//           <div className="mb-2 text-sm">
//             <strong>Estimated Users:</strong> {estimatedUsers}
//           </div>

//           {exceedsLimit && (
//             <div className="mb-2 text-red-600 text-sm">
//               ⚠ Tier 1 limit exceeded (1000 users/day). You must split this
//               campaign.
//             </div>
//           )}

//           {/* Price */}
//           <div className="mb-4 text-sm">
//             <strong>Total Price:</strong> ${totalPrice.toFixed(2)}
//           </div>

//           <div className="flex justify-end gap-3">
//             <button onClick={onClose} className="border px-4 py-2 rounded-md">
//               Cancel
//             </button>

//             <button
//               // onClick={createWhatsappCampaign}
//               disabled={!campaignName || exceedsLimit}
//               className="bg-green-600 text-white px-4 py-2 rounded-md disabled:bg-gray-400"
//             >
//               Create Campaign
//             </button>
//           </div>
//         </div>
//       </div>
//     )
//   );
// };

// export default CreateWhatsAppCampaign;
