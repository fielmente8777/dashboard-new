import { useEffect, useState } from "react";
import { BASE_URL } from "../../data/constant";

const AddContactPopup = ({
  open,
  setOpen,
  isEdit,
  contact,
  setSelectedContact,
  getContacts,
}) => {
  const [data, setData] = useState({
    name: contact?.name,
    email: contact?.email,
    phone: contact?.phone,
    added_from: contact?.added_from,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = !isEdit
        ? `${BASE_URL}/contact`
        : `${BASE_URL}/contact/${contact._id}`;

      const response = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      setData({});

      getContacts();
    } catch (error) {
      console.error("Error adding contact:", error);
    } finally {
      setOpen(false);
    }
  };

  useEffect(() => {
    setData({
      name: contact?.name,
      email: contact?.email,
      phone: contact?.phone,
      added_from: contact?.added_from,
    });
  }, [contact]);

  return (
    <>
      {open && (
        <div className="absolute top-0 left-0 w-full h-screen bg-black/50 z-[99999]">
          <div className="flex justify-center items-center h-screen">
            <form
              onSubmit={handleSubmit}
              className="bg-white p-6 w-[500px] rounded-xl shadow-lg flex flex-col gap-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b pb-3">
                <h1 className="text-xl font-semibold text-gray-700">
                  {isEdit ? "Edit Contact Details" : "Add New Contact"}
                </h1>
                <button
                  onClick={() => {
                    setOpen(false);
                    setSelectedContact({});
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-red-100 text-red-500 font-bold hover:bg-red-200 transition"
                >
                  X
                </button>
              </div>

              {/* Name */}
              <div className="flex flex-col w-full">
                <label className="text-sm mb-1 font-medium text-gray-600">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Enter name"
                  value={data.name}
                  className="w-full border rounded-lg p-3 text-md outline-none focus:ring-2 focus:ring-amber-400"
                  onChange={(e) => setData({ ...data, name: e.target.value })}
                />
              </div>

              {/* Email */}
              <div className="flex flex-col w-full">
                <label className="text-sm mb-1 font-medium text-gray-600">
                  Email
                </label>
                <input
                  type="text"
                  placeholder="Enter email"
                  value={data.email}
                  className="w-full border rounded-lg p-3 text-md outline-none focus:ring-2 focus:ring-amber-400"
                  onChange={(e) => setData({ ...data, email: e.target.value })}
                />
              </div>

              {/* Phone */}
              <div className="flex flex-col w-full">
                <label className="text-sm mb-1 font-medium text-gray-600">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="Enter phone number"
                  value={data.phone}
                  className="w-full border rounded-lg p-3 text-md outline-none focus:ring-2 focus:ring-amber-400"
                  onChange={(e) => setData({ ...data, phone: e.target.value })}
                />
              </div>

              {/* Source */}
              {/* <div className="flex flex-col w-full">
                <label className="text-sm mb-1 font-medium text-gray-600">
                  Contact Source
                </label>
                <input
                  type="text"
                  placeholder="Contact Source"
                  value={data.added_from}
                  className="w-full border rounded-lg p-3 text-md outline-none focus:ring-2 focus:ring-amber-400"
                  onChange={(e) =>
                    setData({ ...data, added_from: e.target.value })
                  }
                />
              </div> */}
              <div className="mb-4">
              <label className="block text-sm mb-1 font-medium text-gray-600">Source</label>
              <select
                className="w-full border p-2 rounded-md"
                value={data.added_from}
                // onChange={(e) => setSource(e.target.value)}
                onChange={(e) =>
                    setData({ ...data, added_from: e.target.value })
                  }
              >
                <option value="">All Sources</option>
                <option value="google_ads">Google Ads</option>
                <option value="meta">Meta Leads</option>
                <option value="website">Website</option>
                <option value="Eazobot">Eazbot</option>
                <option value="website">Website</option>
                <option value="web-form">Webform</option>
                <option value="landing-page">Landing Page</option>
                <option value="landing_page">Landing Page</option>
                <option value="Call">Call</option>
              </select>
            </div>

              {/* Submit Button */}

              {isEdit ? (
                <div className=" flex gap-5">
                  <button className="w-full p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold shadow-md transition">
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setOpen(false);
                    }}
                    className="w-full p-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold shadow-md transition"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="submit"
                  className="w-full p-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold shadow-md transition"
                >
                  Add Contact
                </button>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AddContactPopup;
