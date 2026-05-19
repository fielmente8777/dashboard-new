import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { IoIosClose } from "react-icons/io";
import CustomDropdown from "../ui/Dropdown";
import { Sources, Stages } from "../../data/constant";
import NotesCard from "../../pages/Enquiry/ViewAndManageLead/NotesCard";
import Timeline from "../../pages/ConversationalTool/WhatsApp/components/Timeline";
import ActivityModal from "../../pages/ConversationalTool/WhatsApp/components/ActivityModal";
import Loading from "../Loading";
import Loader from "../Loader";
import DatePicker from "react-datepicker";
import { addLeadGenForm } from "../../services/api/MetaLeads.api";
import { useSelector } from "react-redux";

const defaultForm = {
  Name: "",
  Contact: "",
  Email: "",
  campaign_name: "",
  notes: [],
  assignee: "",
  checkIn: null,
  checkOut: null,
  numberOfGuests: 1,
};

const AddLeadModal = ({ isOpen, onClose, onSuccess }) => {
  const { user: hotel } = useSelector((state) => state.userProfile);
  const [formData, setFormData] = useState(defaultForm);
  const [source, setSource] = useState(Sources[0]?.value);
  const [status, setStatus] = useState(Stages[0]?.value);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    setIsLoading(true);
    e.preventDefault();

    const formDataPayload = {
      Domain: hotel?.Profile?.domain,
      Contact: formData.Contact,
      Email: formData.Email,
      hId: localStorage.getItem("hid"),
      ndid: localStorage.getItem("ndid"),
      Name: formData.Name,
      campaign_name: formData.campaign_name,
      notes: formData.notes,
      status,
      check_in: formData.checkIn
        ? formData.checkIn.toLocaleDateString("en-CA")
        : null,
      check_out: formData.checkOut
        ? formData.checkOut.toLocaleDateString("en-CA")
        : null,
      numberOfGuest: formData.numberOfGuests,
      created_from: source,
      Created_at: new Date(),
    };

    try {
      setIsLoading(true);

      const response = await addLeadGenForm(formDataPayload);
      console.log(response);
      if (response?.success) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Lead created successfully",
        });
        setFormData(defaultForm);
        onSuccess?.();
        onClose?.();
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.message || "Failed to create lead",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-99999 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4">
      <div className="bg-white rounded-5xl max-w-3xl w-full p-5 relative max-h-[90vh] rounded-md overflow-y-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold">Add Lead</h2>

          <button onClick={onClose}>
            <IoIosClose size={28} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* NAME */}
            <div>
              <label className="text-sm font-medium">Full Name</label>

              <input
                type="text"
                name="Name"
                value={formData.Name}
                onChange={handleChange}
                placeholder="Enter full name"
                className="w-full border rounded-lg px-3 py-2 outline-none"
                required
              />
            </div>

            {/* PHONE */}
            <div>
              <label className="text-sm font-medium">Phone Number</label>

              <input
                type="text"
                name="Contact"
                value={formData.Contact}
                onChange={handleChange}
                placeholder="Enter phone number"
                className="w-full border rounded-lg px-3 py-2 outline-none"
                required
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="text-sm font-medium">Email</label>

              <input
                type="email"
                name="Email"
                value={formData.Email}
                onChange={handleChange}
                placeholder="Enter email"
                className="w-full border rounded-lg px-3 py-2 outline-none"
              />
            </div>

            {/* SOURCE */}
            <div>
              <label className="text-sm font-medium">Source</label>

              <CustomDropdown
                label={Sources[1]?.label}
                options={
                  Sources?.filter(
                    (item) => item?.label?.toLowerCase() !== "all sources",
                  ) || []
                }
                onChange={(value) => setSource(value)}
                className="w-full"
              />
            </div>

            {/* CAMPAIGN */}
            <div>
              <label className="text-sm font-medium">Campaign Name</label>

              <input
                type="text"
                name="campaign_name"
                value={formData.campaign_name}
                onChange={handleChange}
                placeholder="Campaign name"
                className="w-full border rounded-lg px-3 py-2 outline-none"
              />
            </div>

            {/* STAGE */}
            <div>
              <label className="text-sm font-medium">Stage</label>

              <CustomDropdown
                label={Stages[0]?.label}
                options={Stages}
                onChange={(value) => setStatus(value)}
                className="w-full"
              />
            </div>

            {/* CHECK IN */}
            <div>
              <label className="text-sm font-medium block mb-1">Check In</label>

              <div className="h-10 px-3 flex items-center rounded-lg border border-gray-300 bg-gray-50">
                <DatePicker
                  selected={formData.checkIn}
                  minDate={new Date()}
                  onChange={(date) =>
                    setFormData((prev) => ({
                      ...prev,
                      checkIn: date,
                    }))
                  }
                  className="bg-transparent outline-none text-sm w-full"
                  placeholderText="Select check in"
                  popperClassName="ml-4"
                  dateFormat="dd/MM/yyyy"
                />
              </div>
            </div>

            {/* CHECK OUT */}
            <div>
              <label className="text-sm font-medium block mb-1">
                Check Out
              </label>

              <div className="h-10 px-3 flex items-center rounded-lg border border-gray-300 bg-gray-50">
                <DatePicker
                  selected={formData.checkOut}
                  minDate={formData.checkIn || new Date()}
                  onChange={(date) =>
                    setFormData((prev) => ({
                      ...prev,
                      checkOut: date,
                    }))
                  }
                  className="bg-transparent outline-none text-sm w-full"
                  placeholderText="Select check out"
                  popperClassName=""
                  dateFormat="dd/MM/yyyy"
                />
              </div>
            </div>

            {/* NUMBER OF GUESTS */}
            <div>
              <label className="text-sm font-medium">Number Of Guests</label>

              <input
                type="number"
                min={1}
                name="numberOfGuests"
                value={formData.numberOfGuests}
                onChange={handleChange}
                placeholder="Enter guests"
                className="w-full border rounded-lg px-3 py-2 outline-none"
              />
            </div>
          </div>

          {/* NOTES */}
          <div>
            <NotesManager
              notes={formData.notes}
              onChange={(notes) =>
                setFormData((prev) => ({
                  ...prev,
                  notes,
                }))
              }
            />
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="border px-4 py-2 rounded-lg"
            >
              Cancel
            </button>

            <button
              disabled={isLoading}
              type="submit"
              disabled={isLoading}
              className="bg-primary text-white px-5 py-2 rounded-lg flex items-center gap-2"
            >
              Create {isLoading && <Loader size={14} color="white" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLeadModal;

const NotesManager = ({ notes = [], onChange }) => {
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingNote, setEditingNote] = useState(null);

  const handleSave = (activity) => {
    const updatedNotes = [...notes];

    if (editingIndex !== null) {
      updatedNotes[editingIndex] = activity;
    } else {
      updatedNotes.push(activity);
    }

    onChange(updatedNotes);

    setIsAddActivityOpen(false);
    setEditingIndex(null);
    setEditingNote(null);
  };

  const handleDelete = (index) => {
    const updatedNotes = [...notes];
    updatedNotes.splice(index, 1);
    onChange(updatedNotes);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Notes</h3>

        <button
          type="button"
          onClick={() => setIsAddActivityOpen(true)}
          className="bg-primary text-white px-3 py-1 rounded-md"
        >
          Add Note
        </button>
      </div>

      {notes.length > 0 ? (
        <Timeline
          items={notes}
          onEdit={(item, index) => {
            setEditingIndex(index);
            setEditingNote(item);
            setIsAddActivityOpen(true);
          }}
          onDelete={(item, index) => handleDelete(index)}
        />
      ) : (
        <div className="text-sm text-gray-500">No notes added yet</div>
      )}

      <ActivityModal
        open={isAddActivityOpen}
        initialData={editingNote}
        onClose={() => setIsAddActivityOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
};
