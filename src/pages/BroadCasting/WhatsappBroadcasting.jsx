import { useEffect, useState } from "react";
import {
  getCampaign,
  getWhatsAppMessageTemplates,
} from "../../services/api/whatsApp";
import CreateWhatsAppCampaign from "./components/CreateWhatsAppCampaign";
import { getStatusStyle } from "../../utils/getStatusStyle";
import { formatDateTime } from "../../utils/formateDate";
import { IoMdRefresh } from "react-icons/io";
import { FiInbox } from "react-icons/fi";

const campaignHeaders = [
  { key: "name", label: "Campaign Name" },
  { key: "templateName", label: "Template" },
  { key: "audience", label: "Audience" },
  { key: "sent", label: "Sent" },
  { key: "failedCount", label: "Failed" },
  { key: "deliveredCount", label: "Delivered" },
  { key: "readCount", label: "Read" },
  { key: "date", label: "Date" },
  { key: "status", label: "Status" },
];

const WhatsappBroadcasting = () => {
  const [campaignsData, setCampaignsData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [filter, setFilter] = useState("all");
  const [isRefresh, setIsRefresh] = useState(false);
  const [isLoadingCampaign, setIsLoadingCampaign] = useState(false);

  // const filteredCampaigns =
  //   filter === "all"
  //     ? campaignsData
  //     : campaignsData.filter((c) => c.status === filter);

  const fetchTemplates = async () => {
    try {
      // setIsTemplateLoading(true);
      const response = await getWhatsAppMessageTemplates();
      if (response.success) {
        setTemplates(response?.result?.docs?.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      // setIsTemplateLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    setIsLoadingCampaign(true);
    try {
      const response = await getCampaign();
      if (response.success) {
        setCampaignsData(response?.result?.docs?.campaigns || []);
        // setTemplates(response?.result?.docs?.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingCampaign(false);
      setIsRefresh(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    fetchTemplates();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Campaign Management</h1>

        <button
          onClick={() => setIsOpen(true)}
          className="bg-[#0a3a75] text-white px-4 py-2 rounded-md"
        >
          Create New Campaign
        </button>
      </div>

      <hr className="mt-4" />

      <div className="py-4 bg-gray-50 min-h-screen">
        {/* Filters */}
        <div className="flex justify-between items-center">
          <div className="flex mb-2">
            {["all", "sent", "scheduled", "inprogress"].map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`px-4 py-2 font-medium text-sm capitalize ${
                  filter === item
                    ? "bg-[#0a3a75] border !border-[#0a3a75] text-white"
                    : "bg-white border !border-white text-gray-600"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <button
            disabled={isRefresh}
            onClick={() => {
              fetchCampaigns();
              setIsRefresh(!isRefresh);
            }}
            className="border px-4 py-2 bg-primary text-white rounded-md text-sm flex items-center gap-1 disabled:opacity-60 disabled:cursor-not-allowed!"
          >
            <span className={`${isRefresh && "animate-spin"}`}>
              <IoMdRefresh size={20} />
            </span>{" "}
            Refresh
          </button>
        </div>

        {/* Campaign Table */}
        <div className="border rounded-lg overflow-x-auto hide-scrollba mt-6">
          <table className="min-w-full text-sm">
            <thead className="bg-primary sticky top-0 z-10">
              <tr>
                <th className="px-3 py-3 text-white">#</th>

                {campaignHeaders.map((h) => (
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
              {isLoadingCampaign ? (
                <tr>
                  <td
                    colSpan={campaignHeaders.length + 1}
                    className="py-3 px-3 text-center"
                  >
                    Loading...
                  </td>
                </tr>
              ) : campaignsData?.length > 0 ? (
                campaignsData.map((campaign, i) => {
                  const percent =
                    campaign.totalRecipients > 0
                      ? Math.round(
                          (campaign.sentCount / campaign.totalRecipients) * 100,
                        )
                      : 0;

                  return (
                    <tr
                      key={campaign._id}
                      className="odd:bg-white border-b even:bg-gray-50 hover:bg-blue-50"
                    >
                      {/* Index */}
                      <td className="px-3 py-2">
                        {(i + 1).toString().padStart(2, "0")}
                      </td>

                      {/* Campaign Name */}
                      <td className="px-3 py-2 font-medium text-gray-800">
                        {campaign.name}
                      </td>

                      {/* Template */}
                      <td className="px-3 py-2">
                        {campaign.templateName || "-"}
                      </td>

                      {/* Audience */}
                      <td className="px-3 py-2">{campaign.totalRecipients}</td>

                      {/* Sent */}
                      <td className="px-3 py-2">
                        {campaign.sentCount}/{campaign.totalRecipients}
                        <span className="text-xs text-gray-600 ml-1">
                          ({percent}%)
                        </span>
                      </td>

                      {/* Failed */}
                      <td className="px-3 py-2 text-red-600">
                        {campaign.failedCount || 0}
                      </td>

                      {/* Delivered */}
                      <td className="px-3 py-2 text-green-600">
                        {campaign.deliveredCount || 0}
                      </td>

                      {/* Read */}
                      <td className="px-3 py-2 text-green-600">
                        {campaign.readCount || 0}
                      </td>

                      {/* Date */}
                      <td className="px-3 py-2 whitespace-nowrap">
                        {formatDateTime(campaign.createdAt)}
                      </td>

                      {/* Status */}
                      <td className="px-3 py-2">
                        <span
                          className={`px-3 py-1 rounded-full capitalize ${getStatusStyle(
                            campaign.status,
                          )}`}
                        >
                          {campaign.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={campaignHeaders.length + 1} className="py-3">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      {/* Title */}
                      <p className="text-base font-semibold text-gray-400">
                        No Campaigns Yet
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateWhatsAppCampaign
        templates={templates}
        onClose={() => setIsOpen(false)}
        open={isOpen}
      />
    </div>
  );
};

export default WhatsappBroadcasting;

{
  /* Template Type */
}
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

{
  /* Template */
}
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
