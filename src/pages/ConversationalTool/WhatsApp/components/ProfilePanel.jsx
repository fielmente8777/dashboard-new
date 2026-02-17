import React, { useState } from "react";
import { BsChevronUp, BsChevronDown } from "react-icons/bs";
import {
  formatDateByOnlyDay,
  formateDateInTimeIS,
} from "../../../../utils/formateData";

const ProfilePanel = ({ selectedContact }) => {
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


  // console.log(selectedContact);

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      {/* Profile Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 border text-gray-600 border-gray-900 bg-green-200 rounded-full flex items-center justify-center  font-bold text-lg mr-4">
            {selectedContact?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedContact?.name}
            </h3>
            <p className="text-sm text-gray-600 font-medium ">+{selectedContact?.phone}</p>
          </div>
        </div>

        {/* Status Information */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Status</span>
            <span className="text-gray-600 bg-green-200 px-4 rounded-2xl font-medium text-sm">{selectedContact?.status==="ACTIVE"?"Active":"Inactive"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Last Active</span>
            <span className="text-gray-900">{`${formatDateByOnlyDay(selectedContact?.last_message?.created_at)} ${formateDateInTimeIS(selectedContact?.last_message?.created_at)} `}</span>
          </div>
          {/* <div className="flex justify-between text-sm">
            <span className="text-gray-600">Template Messages</span>
            <span className="text-gray-900">0</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Session Messages</span>
            <span className="text-gray-900">1</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Unresolved Queries</span>
            <span className="text-gray-900">0</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Source</span>
            <span className="text-gray-900">AD</span>
          </div> */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Last Message</span>
            <span className="text-gray-900">{selectedContact?.last_message?.text}</span>
          </div>
          {/* <div className="flex justify-between text-sm">
            <span className="text-gray-600">WA Conversation</span>
            <span className="text-gray-900">{selectedContact?.status==="ACTIVE"?"Active":"Inactive"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">MAU Status</span>
            <span className="text-gray-900">{selectedContact?.status==="ACTIVE"?"Active":"Inactive"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Incoming</span>
            <span className="text-gray-900">{selectedContact?.status==="ACTIVE"?"Allowed":"Not Allowed"}</span>
          </div> */}
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Opted In</span>

              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" class="sr-only peer" checked={selectedContact?.status === "ACTIVE"}/>
                <div class="w-11 h-6 bg-gray-300 rounded-full peer 
                            peer-checked:bg-teal-500 
                            transition-colors duration-300"
              ></div>
              <div
                class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full 
                            transition-transform duration-300 
                            peer-checked:translate-x-5"
              ></div>
            </label>
          </div>
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
            {expandedSections?.payments ? (
              <BsChevronUp className="text-gray-400" />
            ) : (
              <BsChevronDown className="text-gray-400" />
            )}
          </button>
          {expandedSections?.payments && (
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
            {expandedSections?.campaigns ? (
              <BsChevronUp className="text-gray-400" />
            ) : (
              <BsChevronDown className="text-gray-400" />
            )}
          </button>
          {expandedSections?.campaigns && (
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
