import { useState, useEffect } from "react";
import { createWhatsappCampaignService } from "../../services/api/broadcast.api";

const MESSAGE_LIMIT = 1000; // Tier 1 Limit

const WhatsappBroadcasting = () => {
  const [isOpen, setIsOpen] = useState(false);

  const [campaignName, setCampaignName] = useState("");
  const [templateType, setTemplateType] = useState("utility");

  const [audienceFilter, setAudienceFilter] = useState("last30days");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [source, setSource] = useState("");

  const [estimatedUsers, setEstimatedUsers] = useState(0);

  const pricing = {
    utility: 0.05,
    marketing: 0.1,
  };

  // 🔥 Simulate fetching audience count from backend
  useEffect(() => {
    const fetchAudienceCount = async () => {
      // Replace with real API call
      let count = Math.floor(Math.random() * 2500) + 100;
      setEstimatedUsers(count);
    };

    fetchAudienceCount();
  }, [audienceFilter, startDate, endDate, source]);

  const totalPrice = estimatedUsers * pricing[templateType];
  const exceedsLimit = estimatedUsers > MESSAGE_LIMIT;

  const createWhatsappCampaign = async () => {
    try {
      if (exceedsLimit) {
        alert("Audience exceeds Tier 1 limit (1000 users). Please split campaign.");
        return;
      }

      const payload = {
        campaignName,
        templateType,
        audienceFilter,
        startDate,
        endDate,
        source,
        estimatedUsers,
        totalPrice,
      };

      const response = await createWhatsappCampaignService(payload);
      console.log(response);

      setIsOpen(false);
    } catch (error) {
      console.log("Error creating campaign", error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Campaign Management</h1>

        <button
          onClick={() => setIsOpen(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-md"
        >
          Create New Campaign
        </button>
      </div>

      <hr className="mt-4" />

      {isOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[99999]">
          <div className="bg-white w-[600px] p-6 rounded-xl">
            <h2 className="text-lg font-semibold mb-4">
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
                className="w-full border p-2 rounded-md"
                value={templateType}
                onChange={(e) => setTemplateType(e.target.value)}
              >
                <option value="utility">Utility</option>
                <option value="marketing">Marketing</option>
              </select>
            </div>

            {/* Audience Filter */}
            <div className="mb-4">
              <label className="block mb-1">Audience Based On</label>
              <select
                className="w-full border p-2 rounded-md"
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
                className="w-full border p-2 rounded-md"
                value={source}
                onChange={(e) => setSource(e.target.value)}
              >
                <option value="">All Sources</option>
                <option value="google_ads">Google Ads</option>
                <option value="meta">Meta Leads</option>
                <option value="website">Website</option>
                <option value="eazbot">Eazbot</option>
                <option value="webform">Webform</option>
              </select>
            </div>

            {/* Estimated Users */}
            <div className="mb-2 text-sm">
              <strong>Estimated Users:</strong> {estimatedUsers}
            </div>

            {exceedsLimit && (
              <div className="mb-2 text-red-600 text-sm">
                ⚠ Tier 1 limit exceeded (1000 users/day). 
                You must split this campaign.
              </div>
            )}

            {/* Price */}
            <div className="mb-4 text-sm">
              <strong>Total Price:</strong> ${totalPrice.toFixed(2)}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="border px-4 py-2 rounded-md"
              >
                Cancel
              </button>

              <button
                onClick={createWhatsappCampaign}
                disabled={!campaignName || exceedsLimit}
                className="bg-green-600 text-white px-4 py-2 rounded-md disabled:bg-gray-400"
              >
                Create Campaign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsappBroadcasting;



 {/* Template Type */}
            // <div className="mb-4">
            //   <label className="block text-sm font-medium mb-1">
            //     Template Type
            //   </label>
            //   <select
            //     value={templateType}
            //     onChange={(e) => setTemplateType(e.target.value)}
            //     className="w-full border rounded-md p-2"
            //   >
            //     <option value="utility">Utility</option>
            //     <option value="marketing">Marketing</option>
            //   </select>
            // </div>

            {/* Template */}
  //           <div className="mb-4">
  //             <label className="text-sm font-medium text-gray-700">
  //               Select Template
  //             </label>

  //             <select
  //               value={templateName}
  //               onChange={(e) => setTemplateName(e.target.value)}
  //               className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
  //             >
  //               <option value="">Select template</option>

  //               {templates?.map((tpl) => (
  //                 <option key={tpl.name} value={tpl.name}>
  //                   {tpl.name}
  //                 </option>
  //               ))}
  //             </select>
  //           </div>
  // useEffect(()=>{
  //   fetchTemplate();
  // },[])
  // const [templates, setTemplates] = useState([]);
  // const fetchTemplate = async () => {
  //     try {
  //       const response = await getWhatsAppMessageTemplates();
  //       if (response.success) {
  //         setTemplates(response?.result?.docs?.data || []);
  //       }
  //     } catch (error) {
  //       console.log("Error", error);
  //     }
  // };