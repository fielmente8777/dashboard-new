import React, { useEffect, useMemo, useRef, useState } from "react";
import { BASE_URL, NEW_BASE_URL } from "../../data/constant";
import axios from "axios";
import TableLoaderShimmer from "../../components/TableLoaderShimmer";
import { Link } from "react-router-dom";
// import { MdArrowDropDown } from "react-icons";

const headers = ["full_name", "email", "phone_number"];

const MetaLeads = () => {
  const [leads, setLeads] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTermForm, setSearchTermForm] = useState("");

  const [isOpen, setIsOpen] = useState(false);
  // selected id means page id
  const [selectedId, setSelectedId] = useState("");
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingForm, setLoadingForm] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [showFormDropdown, setShowFormDropdown] = useState(false);
  const [forms, setForms] = useState([]);

  const [selectedLead, setSelectedLead] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const openDrawer = (lead) => {
    setSelectedLead(lead);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setSelectedLead(null);
    setIsDrawerOpen(false);
  };

  const dropdownRef = useRef(null);
  const dropDown1 = useRef(null);
  const dropDown2 = useRef(null);

  // ✅ Fetch accounts
  const getAccounts = async () => {
    try {
      const response = await fetch(`${NEW_BASE_URL}/api/v1/meta/accounts`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      setAccounts(data?.result?.docs?.pages || []);
    } catch (error) {
      console.error("Error fetching accounts:", error);
    }
  };

  // ✅ Fetch leads for selected page ID
  const getForms = async (pageId) => {
    if (!pageId) return;
    try {
      const response = await fetch(
        `${NEW_BASE_URL}/api/v1/meta/forms?pageId=${pageId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();
      setForms(data?.forms || []);
      // return data?.forms || [];
    } catch (error) {
      console.error("Error fetching forms:", error);
      return [];
    }
  };

  const getLeads = async (formId) => {
    if (!formId) return;
    setLoading(true);
    try {
      const response = await fetch(
        `${NEW_BASE_URL}/api/v1/meta/leads?formId=${formId}&pageId=${selectedId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();
      setLeads(data?.leads || []);

      // getFormsByAccount(pageId);
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAccounts();
  }, []);

  // ✅ Filter accounts by search
  const filteredAccounts = accounts.filter((acc) =>
    acc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredForms = forms.filter((form) =>
    form.name.toLowerCase().includes(searchTermForm.toLowerCase())
  );

  // ✅ Extract headers dynamically
  // const headers = useMemo(() => {
  //   const fieldNames = new Set();
  //   leads.forEach((lead) => {
  //     lead.field_data.forEach((f) => fieldNames.add(f.name));
  //   });
  //   return Array.from(fieldNames);
  // }, [leads]);

  const getValue = (fields, fieldName) =>
    fields.find((f) => f.name === fieldName)?.values?.[0] || "-";

  const getFormsByAccount = async (pageId) => {
    setLoadingForm(true);
    setShowFormDropdown(false);
    setSelectedForm(null);

    if (!pageId) return;
    try {
      const response = await fetch(
        `${NEW_BASE_URL}/api/v1/meta/forms?pageId=${pageId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();
      setForms(data?.forms || []);
      // return data?.forms || [];
    } catch (error) {
      console.error("Error fetching forms:", error);
      return [];
    }

    // simulate network call
    // await new Promise((resolve) => setTimeout(resolve, 1000));

    // const fakeForms = [
    //   { id: "101", name: `Form X of Account ${accountId}` },
    //   { id: "102", name: `Form Y of Account ${accountId}` },
    //   { id: "103", name: `Form Z of Account ${accountId}` },
    // ];

    // setForms(fakeForms);
    setLoadingForm(false);
    setShowFormDropdown(true);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropDown1.current && !dropDown1.current.contains(e.target)) {
        // setShowDropdown(false);
        setIsOpen(false);
      }
      if (dropDown2.current && !dropDown2.current.contains(e.target)) {
        setShowFormDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsOpen, setShowFormDropdown]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* 🔹 Top Section (Search + Buttons) */}
      <div className="">
        {/* <h1 className="text-2xl font-semibold text-gray-800">Leads Centre</h1> */}
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-3">
          <div className="flex">
            <div className="relative w-full" ref={dropdownRef}>
              <label className="block text-gray-700 font-medium mb-2">
                Select an Account
              </label>

              <div ref={dropDown1} className="relative w-full max-w-[21rem]">
                {/* Dropdown Button */}
                <button
                  type="button"
                  onClick={() => setIsOpen(!isOpen)}
                  className="w-full py-3 px-4 border border-gray-300 bg-white text-left flex items-center justify-between"
                >
                  <span className="text-gray-500">
                    {selectedAccount || "Please select"}
                  </span>
                  {/* <MdArrowDropDown
                className={`w-6 h-6 text-gray-500 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              /> */}
                </button>

                {/* Dropdown Menu */}
                <div
                  className={`absolute top-full left-0 right-0 bg-white shadow-lg border border-gray-300 z-10 transition-all duration-300 ease-in-out overflow-hidden ${
                    isOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  {/* Search Input */}
                  <div className="px-3 py-2 border-b border-gray-300">
                    <input
                      type="text"
                      placeholder="search accounts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 focus:outline-none"
                    />
                  </div>
                  {/* Dropdown Items */}
                  <div className="max-h-48 overflow-y-auto">
                    {filteredAccounts?.length > 0 &&
                      filteredAccounts?.map((item, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            // setProductItem(item);
                            getFormsByAccount(item?.id);
                            setSelectedId(item?.id);
                            setSelectedAccount(item?.name);
                            setIsOpen(false);
                          }}
                          className={`w-full px-4 py-2 text-left text-sm font-medium uppercase hover:bg-blue-100 transition ${
                            selectedId === item?.id ? "bg-blue-100" : ""
                          }`}
                        >
                          {item?.name}
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="relative w-full" ref={dropDown2}>
              <label className="block text-gray-700 font-medium mb-2">
                Select a Form
              </label>

              <div className="relative w-full">
                <button
                  type="button"
                  onClick={() => setShowFormDropdown(!showFormDropdown)}
                  className="w-full py-3 px-4 border border-gray-300 bg-white text-left flex items-center justify-between"
                >
                  <span className="text-gray-500">
                    {selectedForm?.name || "Please select"}
                  </span>
                </button>

                {/* Form Dropdown Menu */}
                <div
                  className={`absolute top-full left-0 right-0 bg-white shadow-lg border border-gray-300 z-10 transition-all duration-300 ease-in-out overflow-hidden ${
                    showFormDropdown
                      ? "max-h-60 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  {/* Search Input */}
                  <div className="px-3 py-2 border-b border-gray-300">
                    <input
                      type="text"
                      placeholder="search forms..."
                      value={searchTermForm}
                      onChange={(e) => setSearchTermForm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 focus:outline-none"
                    />
                  </div>

                  {/* Form List */}
                  <div className="max-h-48 overflow-y-auto pb-4">
                    {filteredForms.length > 0 ? (
                      filteredForms.map((form) => (
                        <button
                          key={form.id}
                          type="button"
                          onClick={() => {
                            setSelectedForm(form);
                            setShowFormDropdown(false);
                            getLeads(form.id);
                          }}
                          className={`w-full px-4 py-2 text-left text-xs font-medium uppercase hover:bg-blue-100 transition ${
                            selectedForm?.id === form.id ? "bg-blue-100" : ""
                          }`}
                        >
                          {form.name}
                        </button>
                      ))
                    ) : (
                      <p className="p-3 text-gray-500 text-sm">
                        No forms found
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            {/* Secondary Button */}
            <button className="px-6 py-3 bg-gray-100 text-primary text-sm font-medium rounded-md border border-gray-200 hover:bg-gray-100 hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5">
              Add new stage
            </button>

            {/* Secondary Button */}
            <button className="px-6 py-3 bg-gray-100 text-primary text-sm font-medium rounded-md border border-gray-200 hover:bg-gray-100 hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5">
              Bulk edit
            </button>

            {/* Primary Button */}
            <button className="px-6 py-3 bg-gradient-to-r from-primary to-primary/80 text-white text-sm font-medium rounded-md shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 transform">
              + Add leads
            </button>
          </div>
        </div>
      </div>

      {/* 🔹 Account Search + Fetch */}
      {/* <div className="w-full max-w-lg mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Search account..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {showDropdown && filteredAccounts.length > 0 && (
            <ul className="absolute z-10 bg-white border border-gray-200 w-full rounded-md mt-1 max-h-48 overflow-y-auto shadow-lg">
              {filteredAccounts.map((acc) => (
                <li
                  key={acc.id}
                  onClick={() => {
                    setSelectedId(acc.id);
                    setSearchTerm(acc.name);
                    setShowDropdown(false);
                  }}
                  className="px-3 py-2 cursor-pointer hover:bg-blue-100 text-sm"
                >
                  {acc.name}
                </li>
              ))}
            </ul>
          )}

          {showDropdown && filteredAccounts.length === 0 && (
            <div className="absolute z-10 bg-white border border-gray-200 w-full rounded-md mt-1 p-2 text-gray-500 text-sm">
              No accounts found
            </div>
          )}
        </div>

        <button
          onClick={() => getLeads(selectedId)}
          disabled={loading || !selectedId}
          className={`mt-3 w-full p-2 rounded-md text-white ${
            loading || !selectedId
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Loading..." : "Fetch Leads"}
        </button>
      </div> */}

      <div className="w-full flex gap-4 mb-10">
        {/* Search Section */}
        {/* <div className="relative w-full" ref={dropdownRef}>
          <label className="block text-gray-700 font-medium mb-2">
            Select an Account
          </label>
          <div ref={dropDown1} className="relative w-full max-w-[21rem]">
            Dropdown Button
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="w-full py-3 px-4 border border-gray-300 bg-white text-left flex items-center justify-between"
            >
              <span className="text-gray-500">
                {selectedAccount || "Please select"}
              </span>
              <MdArrowDropDown
                className={`w-6 h-6 text-gray-500 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            Dropdown Menu
            <div
              className={`absolute top-full left-0 right-0 bg-white shadow-lg border border-gray-300 z-10 transition-all duration-300 ease-in-out overflow-hidden ${
                isOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              Search Input
              <div className="px-3 py-2 border-b border-gray-300">
                <input
                  type="text"
                  placeholder="search accounts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none"
                />
              </div>
              Dropdown Items
              <div className="max-h-48 overflow-y-auto">
                {filteredAccounts?.length > 0 &&
                  filteredAccounts?.map((item, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        // setProductItem(item);
                        setSelectedId(item?.id);
                        setSelectedAccount(item?.name);
                        setIsOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm font-medium uppercase hover:bg-blue-100 transition ${
                        selectedId === item?.id ? "bg-blue-100" : ""
                      }`}
                    >
                      {item?.name}
                    </button>
                  ))}
              </div>
            </div>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search account..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              className="w-full border border-gray-300 rounded-lg pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 text-gray-700 placeholder-gray-400"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-4.35-4.35M9.5 17A7.5 7.5 0 109.5 2a7.5 7.5 0 000 15z"
              />
            </svg>

            {showDropdown && (
              <div className="absolute z-20 bg-white border border-gray-200 w-full rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto">
                {filteredAccounts.length > 0 ? (
                  filteredAccounts.map((acc) => (
                    <div
                      key={acc.id}
                      onClick={() => {
                        setSelectedId(acc.id);
                        setSearchTerm(acc.name);
                        setShowDropdown(false);
                      }}
                      className={`px-4 py-2 cursor-pointer hover:bg-blue-50 transition ${
                        selectedId === acc.id ? "bg-blue-100" : ""
                      }`}
                    >
                      <p className="text-sm font-medium text-gray-800">
                        {acc.name}
                      </p>
                      <p className="text-xs text-gray-500">ID: {acc.id}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-gray-500 text-sm text-center">
                    No accounts found
                  </div>
                )}
              </div>
            )}
          </div>
          Fetch Leads Button
          <button
            onClick={() => getForms(selectedId)}
            disabled={loading || !selectedId}
            className={`mt-4 w-full py-2.5 rounded-lg font-medium text-white transition duration-150 ${
              loading || !selectedId
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow-md"
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
                Loading...
              </div>
            ) : (
              "Fetch Leads"
            )}
          </button>
        </div> */}

        {/* {loadingForm && (
          <div className="mt w-full text-sm text-gray-600">
            Fetching forms...
          </div>
        )} */}
      </div>

      {/* 🔹 Leads Table */}
      <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <TableLoaderShimmer />
        ) : !selectedId || !selectedForm ? (
          // case 1: nothing selected yet
          <div className="flex flex-col items-center justify-center py-10">
            <svg
              className="w-12 h-12 text-gray-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z"
              />
            </svg>
            <p className="text-center text-gray-500 text-base sm:text-lg font-medium">
              Please select an account and form
            </p>
          </div>
        ) : leads.length === 0 ? (
          <p className="text-center text-gray-500 py-6">No leads found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-gray-700">
              <thead className="bg-gray-50 border-b text-xs uppercase text-gray-500">
                <tr>
                  <th className="w-4 px-4 py-3">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </th>
                  {headers.map((header) => (
                    <th
                      key={header}
                      className="px-4 py-3 text-left whitespace-nowrap"
                    >
                      {header.replace(/_/g, " ")}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left whitespace-nowrap">
                    Created Time
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {leads.slice(0, 10).map((lead, idx) => (
                  <tr
                    key={lead.id}
                    className={`transition-all duration-200 ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-blue-50 cursor-pointer`}
                    onClick={() => openDrawer(lead)}
                    // className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </td>

                    {headers.map((header) => {
                      const value = getValue(lead.field_data, header);

                      return (
                        <td
                          key={header}
                          className="px-4 py-3 whitespace-nowrap"
                        >
                          {header === "email" ? (
                            <Link
                              to={`mailto:${value}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-gray-900 font-medium"
                            >
                              {value}
                            </Link>
                          ) : header === "phone_number" ? (
                            <Link
                              to={`tel:${value}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-gray-900 font-medium"
                            >
                              {value}
                            </Link>
                          ) : (
                            <span className="text-gray-900 font-medium">
                              {value}
                            </span>
                          )}
                        </td>
                      );
                    })}

                    {/* {headers.map((header) => (
                      <td key={header} className="px-4 py-3 whitespace-nowrap">
                        <span className="text-gray-900 font-medium">
                          {getValue(lead.field_data, header)}
                        </span>
                      </td>
                    ))} */}

                    <td className="px-4 py-3 text-gray-900 whitespace-nowrap font-medium">
                      {new Date(lead.created_time).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div
        className={`fixed inset-0 bg-black/20 bg-opacity-30 z-40 transition-opacity duration-300 ${
          isDrawerOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={closeDrawer}
      />

      {/* Drawer Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 transform transition-transform duration-300 ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Lead Details</h2>
          <button
            onClick={closeDrawer}
            className="text-gray-500 hover:text-gray-900 font-bold"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4">
          {selectedLead ? (
            <>
              {selectedLead.field_data.map((field) => (
                <div
                  key={field.name}
                  className="flex justify-between items-center py-2 border-b border-gray-200"
                >
                  <span className="text-gray-500 text-sm font-medium tracking-wide">
                    {field.name.replace(/_/g, " ")}
                  </span>
                  <span className="text-primary text-sm font-medium">
                    {field.values[0]}
                  </span>
                </div>
              ))}

              <div className="flex justify-between border-b border-gray-100 py-2">
                <span className="text-gray-500 text-sm font-medium">
                  Created At
                </span>
                <span className="text-primary text-sm font-medium">
                  {new Date(selectedLead.created_time).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </>
          ) : (
            <p className="text-gray-500">No lead selected.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetaLeads;
