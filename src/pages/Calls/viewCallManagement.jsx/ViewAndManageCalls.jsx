import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useToast } from "../../../context/ToastContext";
import LeadTabs from "../../Enquiry/ViewAndManageLead/LeadTabs";
import { getAllCalls, updateCall } from "../../../services/api/call.api";
import { IoArrowBack } from "react-icons/io5";
import { LeadDetailsSkeleton } from "../../../components/Skeltons/LeadDetailsSkelton";
import CustomerInfoCard from "../../Enquiry/ViewAndManageLead/CustomerInfoCard";
import CallInfoCard from "./CallInfoCard";
import NotesCard from "../../Enquiry/ViewAndManageLead/NotesCard";
import DatePicker from "react-datepicker";
import { FiX } from "react-icons/fi";

const ViewAndManageCalls = () => {
  const { showToast } = useToast();
  const { leadId } = useParams(); // actually callId

  const [searchParams] = useSearchParams();

  const hid = searchParams.get("hid");
  const search = searchParams.get("search");
  const stage = searchParams.get("stage");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const status = searchParams.get("status");
  const callPageNumber = searchParams.get("call");

  const [page, setPage] = useState(callPageNumber || 1);
  const [call, setCall] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState();
  const [showSave, setShowSave] = useState(false);

  // ✅ FETCH CALL (same like leads pagination)
  const fetchCall = async () => {
    setLoading(true);

    const params = {
      hid,
      page,
      limit: 1,
      ...(search && { search: search }),
      ...(stage && { stage: stage }),
      ...(from && { from: from }),
      ...(to && { to: to }),
      ...(status && { status: status }),
    };

    try {
      const response = await getAllCalls(params);
      const callData = response?.result?.docs?.calls?.[0];

      if (callData) {
        setCall(callData);
        const followUpDate = callData.followUpDate;
        setSelectedDate(followUpDate ? new Date(followUpDate) : null);
      } else {
        setCall(null);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Pagination
  const handleNextPage = () => {
    setPage((prev) => Number(prev) + 1);
  };

  const handlePrevPage = () => {
    if (page === 1) return;
    setPage((prev) => Number(prev) - 1);
  };

  const handleFollow = async (value) => {
    try {
      const payload = {
        sid: call?.sid,
        followUpDate: value,
        stage: "Follow Up",
      };

      const response = await updateCall(payload);

      if (response?.success && response?.responseStatusCode === 200) {
        showToast({
          message:
            response?.responseMessage || "Lead stage updated successfully",
          type: "success",
        });
      }
    } catch (error) {
      showToast({
        message: error?.message || "Failed to update lead stage",
        type: "error",
      });
    }
  };

  useEffect(() => {
    if (!hid) return;
    fetchCall();
  }, [hid, page]);

  // ================= UI =================

  if (loading) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <LeadDetailsSkeleton />
      </div>
    );
  }

  if (!call) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 p-3 border-b bg-white">
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100"
          >
            <IoArrowBack size={18} />
          </button>
          <span className="text-sm font-medium text-gray-700">Calls</span>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <h3 className="text-lg font-semibold">No Calls Found</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6 bg-[#f4f6fb] min-h-screen space-y-4">
      {/* HEADER */}
      <div className="flex items-center gap-2.5 bg-white p-3 rounded-md">
        <button
          onClick={() => window.history.back()}
          className="flex size-8 justify-center bg-gray-100 rounded-full items-center"
        >
          <IoArrowBack />
        </button>

        <div className="flex flex-1 justify-between items-center">
          {/* Pagination Buttons */}
          <h2>Call Details</h2>

          <div className="flex items-center gap-2">
            <div className="flex gap-2 py-2 justify-center rounded items-center border px-2 text-primary/90 bg-white font-medium">
              <label htmlFor="" className="">
                Follow Up
              </label>

              <DatePicker
                minDate={new Date()}
                selected={selectedDate}
                onChange={(date) => {
                  setSelectedDate(date);
                }}
                onCalendarClose={() => {
                  if (selectedDate) {
                    handleFollow(selectedDate);
                  }
                }}
                showTimeSelect
                timeIntervals={5}
                dateFormat="dd/MM/yyyy h:mm aa"
                placeholderText="Select Date & Time"
                className="bg-transparent outline-none text-sm w-44"
                popperClassName="!z-50"
              />
              {call?.followUpDate && (
                <button
                  className="size-4 flex items-center justify-center bg-red-200 text-red-500 rounded-full"
                  onClick={() => {
                    setSelectedDate(null);
                    handleFollow(null);
                  }}
                >
                  <FiX size={12} />
                </button>
              )}

              {showSave && (
                <button
                  onClick={() => {
                    handleFollow(selectedDate);
                    setShowSave(false);
                  }}
                  className="px-2 py-1 bg-green-500 text-white rounded text-xs"
                >
                  Save
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handlePrevPage}
                className="px-4 py-2 border rounded bg-white disabled:opacity-80"
                disabled={Number(page) === 1}
              >
                ← Prev
              </button>

              <button
                onClick={handleNextPage}
                className="px-4 py-2 border rounded bg-white"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* LEFT */}
        <CallInfoCard call={call} />

        {/* RIGHT */}
        <NotesCard lead={call} setLead={setCall} callManagement={true} />
      </div>
    </div>
  );
};

export default ViewAndManageCalls;
