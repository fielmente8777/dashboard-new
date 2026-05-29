import React, { useState } from "react";

const KnowledgeBaseForm = ({ onSave, initialData = null }) => {
  const [formData, setFormData] = useState({
    hotelName: initialData?.hotelName || "",
    aboutUs: initialData?.aboutUs || "",
    description: initialData?.description || "",
    amenities: initialData?.amenities || [""],
    activitiesNearby: initialData?.activitiesNearby || [""],
    houseRules: initialData?.houseRules || "",
    cancellationPolicy: initialData?.cancellationPolicy || "",
    rooms: initialData?.rooms || [
      {
        roomName: "",
        roomType: "",
        totalRooms: "",
        price: "",
        description: "",
        amenities: "",
      },
    ],
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleArrayChange = (field, index, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const addArrayItem = (field, defaultValue = "") => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], defaultValue],
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleRoomChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      rooms: prev.rooms.map((room, i) =>
        i === index ? { ...room, [field]: value } : room
      ),
    }));
  };

  const addRoom = () => {
    addArrayItem("rooms", {
      roomName: "",
      roomType: "",
      totalRooms: "",
      price: "",
      description: "",
      amenities: "",
    });
  };

  const removeRoom = (index) => {
    removeArrayItem("rooms", index);
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <div className="p-6 bg-app-surface rounded-lg shadow-lg mt-6">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl text-blue-600">💾</span>
        <h2 className="text-2xl font-bold text-app-text-faint dark:text-app-text-faint">
          Hotel Knowledge Base Form
        </h2>
      </div>

      <div className="space-y-8">
        {/* Basic Information */}
        <div className="bg-app-surface-secondary p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-app-text dark:text-app-text-muted  mb-4">
            Basic Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-app-text dark:text-app-text-faint mb-2">
                Hotel Name *
              </label>
              <input
                type="text"
                value={formData.hotelName}
                onChange={(e) => handleInputChange("hotelName", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter hotel name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-app-text dark:text-app-text-faint mb-2">
                About Us
              </label>
              <textarea
                value={formData.aboutUs}
                onChange={(e) => handleInputChange("aboutUs", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tell us about your hotel"
                rows="3"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-app-text dark:text-app-text-faint mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Detailed description of your hotel"
              rows="4"
            />
          </div>
        </div>

        {/* Amenities */}
        <div className="bg-app-surface-secondary p-6 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-app-text dark:text-app-text-muted">Amenities</h3>
            <button
              type="button"
              onClick={() => addArrayItem("amenities")}
              className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              <span className="text-sm font-bold">+</span>
              Add Amenity
            </button>
          </div>

          {formData.amenities.map((amenity, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={amenity}
                onChange={(e) =>
                  handleArrayChange("amenities", index, e.target.value)
                }
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Amenity ${index + 1}`}
              />
              {formData.amenities.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayItem("amenities", index)}
                  className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  <span className="text-sm font-bold">×</span>
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Activities Nearby */}
        <div className="bg-app-surface-secondary p-6 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-app-text dark:text-app-text-muted">
              Activities Nearby
            </h3>
            <button
              type="button"
              onClick={() => addArrayItem("activitiesNearby")}
              className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              <span className="text-sm font-bold">+</span>
              Add Activity
            </button>
          </div>

          {formData.activitiesNearby.map((activity, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={activity}
                onChange={(e) =>
                  handleArrayChange("activitiesNearby", index, e.target.value)
                }
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Activity ${index + 1}`}
              />
              {formData.activitiesNearby.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayItem("activitiesNearby", index)}
                  className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  <span className="text-sm font-bold">×</span>
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Policies */}
        <div className="bg-app-surface-secondary p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-app-text dark:text-app-text-muted mb-4">Policies</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-app-text dark:text-app-text-faint mb-2">
                House Rules
              </label>
              <textarea
                value={formData.houseRules}
                onChange={(e) =>
                  handleInputChange("houseRules", e.target.value)
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter house rules"
                rows="4"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-app-text dark:text-app-text-faint mb-2">
                Cancellation Policy
              </label>
              <textarea
                value={formData.cancellationPolicy}
                onChange={(e) =>
                  handleInputChange("cancellationPolicy", e.target.value)
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter cancellation policy"
                rows="4"
              />
            </div>
          </div>
        </div>

        {/* Rooms */}
        <div className="bg-app-surface-secondary p-6 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-app-text dark:text-app-text-muted">Rooms</h3>
            <button
              type="button"
              onClick={addRoom}
              className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              <span className="text-sm font-bold">+</span>
              Add Room
            </button>
          </div>

          {formData.rooms.map((room, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 mb-4 bg-app-surface-secondary"
            >
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-app-text dark:text-app-text-faint">Room {index + 1}</h4>
                {formData.rooms.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRoom(index)}
                    className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    <span className="text-sm font-bold">×</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={room.roomName}
                  onChange={(e) =>
                    handleRoomChange(index, "roomName", e.target.value)
                  }
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Room Name"
                />
                <input
                  type="text"
                  value={room.roomType}
                  onChange={(e) =>
                    handleRoomChange(index, "roomType", e.target.value)
                  }
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Room Type"
                />
                <input
                  type="number"
                  value={room.totalRooms}
                  onChange={(e) =>
                    handleRoomChange(index, "totalRooms", e.target.value)
                  }
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Total Rooms"
                />
                <input
                  type="number"
                  value={room.price}
                  onChange={(e) =>
                    handleRoomChange(index, "price", e.target.value)
                  }
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Price per night"
                />
                <input
                  type="text"
                  value={room.amenities}
                  onChange={(e) =>
                    handleRoomChange(index, "amenities", e.target.value)
                  }
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Room Amenities"
                />
              </div>

              <div className="mt-3">
                <textarea
                  value={room.description}
                  onChange={(e) =>
                    handleRoomChange(index, "description", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Room Description"
                  rows="2"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-6">
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <span className="text-lg">💾</span>
            Save Knowledge Base
          </button>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBaseForm;
