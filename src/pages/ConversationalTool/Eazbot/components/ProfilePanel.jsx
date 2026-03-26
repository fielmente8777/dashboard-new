import React, { useState } from "react";
import { BsChevronUp, BsChevronDown } from "react-icons/bs";

const ProfilePanel = ({ selectedContact }) => {
  // console.log(selectedContact);
  const [expandedSections, setExpandedSections] = useState({
    payments: false,
    campaigns: false,
    attributes: false,
    tags: true,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col sm:block hidden">
      {/* Profile Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
            {selectedContact?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {/* {selectedContact} */}
            </h3>
            <p className="capitalize">{selectedContact?.name}</p>
            <p className="text-sm text-gray-500">{selectedContact?.phone}</p>
          </div>
        </div>

        {/* Status Information */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Status</span>
            <span className="text-gray-900">{selectedContact?.status}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Email</span>
            <span className="text-gray-900">
              {selectedContact?.email !== null && undefined
                ? selectedContact.email
                : "Null"}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Last Active</span>
            <span className="text-gray-900">7/22/2025, 8:35 AM</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Check In</span>
            <span className="text-gray-900">
              {selectedContact?.check_in !== null && undefined
                ? selectedContact.check_in
                : "Null"}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Check Out</span>
            <span className="text-gray-900">
              {selectedContact.check_out !== null && undefined
                ? selectedContact.check_out
                : "Null"}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Created From</span>
            <span className="text-gray-900">
              {selectedContact?.created_from === "eazobot"
                ? "Eazobot"
                : "Eazbot"}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Source URL</span>
            <span className="text-gray-900">
              {selectedContact?.source_url !== null
                ? "/landing-page"
                : "/website"}
            </span>
          </div>

          {/* <div className="flex justify-between text-sm">
            <span className="text-gray-600">First Message</span>
            <span className="text-gray-900">-</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">WA Conversation</span>
            <span className="text-gray-900">Inactive</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">MAU Status</span>
            <span className="text-gray-900">Active</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Incoming</span>
            <span className="text-gray-900">Allowed</span>
          </div> */}
          {/* <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Opted In</span>
            <div className="w-10 h-6 bg-teal-500 rounded-full relative">
              <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 transition-transform"></div>
            </div>
          </div> */}
        </div>
      </div>

      {/* Expandable Sections */}
      <div className="flex-1 overflow-y-auto">
        {/* Payments Section */}
        {/* <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection("payments")}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50"
          >
            <span className="text-sm font-medium text-gray-700">Payments</span>
            {expandedSections.payments ? (
              <BsChevronUp className="text-gray-400" />
            ) : (
              <BsChevronDown className="text-gray-400" />
            )}
          </button>
          {expandedSections.payments && (
            <div className="px-4 pb-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Order Id</span>
                  <span className="text-gray-600">Amount</span>
                  <span className="text-gray-600">Status</span>
                </div>
                <p className="text-xs text-gray-400 text-center py-4">
                  No payment records
                </p>
              </div>
            </div>
          )}
        </div> */}

        {/* Campaigns Section */}
        {/* <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection("campaigns")}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50"
          >
            <span className="text-sm font-medium text-gray-700">Campaigns</span>
            {expandedSections.campaigns ? (
              <BsChevronUp className="text-gray-400" />
            ) : (
              <BsChevronDown className="text-gray-400" />
            )}
          </button>
          {expandedSections.campaigns && (
            <div className="px-4 pb-4">
              <p className="text-xs text-gray-400 text-center py-4">
                No campaigns
              </p>
            </div>
          )}
        </div> */}

        {/* Attributes Section */}
        {/* <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection("attributes")}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50"
          >
            <span className="text-sm font-medium text-gray-700">
              Attributes
            </span>
            {expandedSections.attributes ? (
              <BsChevronUp className="text-gray-400" />
            ) : (
              <BsChevronDown className="text-gray-400" />
            )}
          </button>
          {expandedSections.attributes && (
            <div className="px-4 pb-4">
              <p className="text-xs text-gray-400 text-center py-4">
                No attributes
              </p>
            </div>
          )}
        </div> */}

        {/* Tags Section */}
        {/* <div>
          <button
            onClick={() => toggleSection("tags")}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50"
          >
            <span className="text-sm font-medium text-gray-700">Tags</span>
            {expandedSections.tags ? (
              <BsChevronUp className="text-gray-400" />
            ) : (
              <BsChevronDown className="text-gray-400" />
            )}
          </button>
          {expandedSections.tags && (
            <div className="px-4 pb-4">
              <p className="text-xs text-gray-400 text-center py-4">No tags</p>
            </div>
          )}
        </div> */}
      </div>
    </div>
  );
};

export default ProfilePanel;
