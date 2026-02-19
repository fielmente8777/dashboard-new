import { useEffect, useState } from "react";
import { formatDateTime } from "../../services/formateDate";
import { getLeads, UpdateLeadStatus } from "../../services/api/leads.api";

import Swal from "sweetalert2";
import LeadPopup from "../../components/Popup/LeadPopup";
import { getWhatsAppLeads } from "../../services/api/whatsApp";
import WhatsAppLeadPopup from "../../components/Popup/WhatsAppLeadPopup";

const WhatsAppLeads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  const fetchWhatsAppLeads = async () => {
    setLoading(true);
    try {
      const response = await getWhatsAppLeads();
      if (response?.success) {
        setLeads(response?.result?.docs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStageChange = async (lead, stage) => {
    try {
      await UpdateLeadStatus(lead, stage);

      Swal.fire({
        icon: "success",
        title: "Stage updated",
        timer: 1000,
        showConfirmButton: false,
      });

      fetchWhatsAppLeads();
    } catch {
      Swal.fire("Error", "Failed to update stage", "error");
    }
  };

  useEffect(() => {
    fetchWhatsAppLeads();
  }, []);

  return (
    <div className="w-full px-4">
      <h2 className="text-lg font-semibold mb-4">WhatsApp Leads</h2>

      <table className="w-full border-collapse">
        <thead className="bg-[#0a3a75] text-white">
          <tr>
            <th className="py-3 px-2 text-left">#</th>
            <th className="py-3 px-2 text-left">Date</th>
            <th className="py-3 px-2 text-left">Name</th>
            <th className="py-3 px-2 text-left">Phone</th>
            <th className="py-3 px-2 text-left">Source</th>
            <th className="py-3 px-2 text-left">Stage</th>
          </tr>
        </thead>

        <tbody>
          {loading && (
            <tr>
              <td colSpan="6" className="py-6 text-center">
                Loading leads...
              </td>
            </tr>
          )}

          {!loading &&
            leads?.length > 0 &&
            leads?.map((lead, index) => (
              <tr
                key={lead._id}
                className="border-b odd:bg-gray-50 even:bg-gray-100 hover:bg-[#f8f8fb] cursor-pointer"
                onClick={() => {
                  setSelectedLead(lead);
                  setIsPopupOpen(true);
                }}
              >
                <td className="py-3 px-2">{index + 1}</td>

                <td className="py-3 px-2 whitespace-nowrap">
                  {formatDateTime(lead.createdAt)}
                </td>

                <td className="py-3 px-2 font-medium">{lead.name || "-"}</td>

                <td className="py-3 px-2">+{lead.phone}</td>

                <td className="py-3 px-2 capitalize">{lead.source}</td>

                <td className="py-3 px-2" onClick={(e) => e.stopPropagation()}>
                  <select
                    className="bg-gray-50 border rounded px-2 py-1 outline-none cursor-pointer"
                    value={lead.stage || "Open"}
                    onChange={(e) => handleStageChange(lead, e.target.value)}
                  >
                    <option value="Open">Open</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Converted">Converted</option>
                    <option value="Duplicate">Duplicate</option>
                    <option value="Dead Lead">Dead Lead</option>
                  </select>
                </td>
              </tr>
            ))}

          {!loading && leads.length === 0 && (
            <tr>
              <td colSpan="6" className="py-6 text-center text-gray-500">
                No WhatsApp Leads Found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ✅ Lead Popup */}
      <WhatsAppLeadPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        lead={selectedLead}
        // onAddNote={(text) => addLeadNote(selectedLead._id, text)}
        // onEditNote={(noteId, text) =>
        //   updateLeadNote(selectedLead._id, noteId, text)
        // }
      />
    </div>
  );
};

export default WhatsAppLeads;
