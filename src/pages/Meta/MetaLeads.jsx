import React, { useEffect, useMemo, useState } from "react";
import { NEW_BASE_URL } from "../../data/constant";

const MetaLeads = () => {

  const [leads,setLeads]=useState([]);
  const[accounts,setAccounts]=useState([]);
  const getLeads = async () => {
    try {
      const response = await fetch(`${NEW_BASE_URL}/api/v1/meta/leads?pageId=${"421694611037149"}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      if(data.leads){
        setLeads(data?.leads);

      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    // getLeads();
    getAccounts();
  }, []);

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
      console.log("meta accounts",data);
      setAccounts(data?.result?.docs?.pages);
      // if(data.leads){
      //   setLeads(data?.leads);

      // }
    } catch (error) {
      console.log(error);
    }
  };

  // console.log("data",data)
  console.log("accounts",accounts)


  const headers = useMemo(() => {
  const fieldNames = new Set();
    leads.forEach((lead) => {
      lead.field_data.forEach((f) => fieldNames.add(f.name));
    });
    return Array.from(fieldNames);
  }, [leads]);

  const getValue = (fields, fieldName) =>
    fields.find((f) => f.name === fieldName)?.values[0] || "-";

  if (!leads || leads.length === 0) {
    return <p className="text-center text-gray-500">No leads found</p>;
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Meta Leads</h1>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white text-sm">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              {headers?.map((header) => (
                <th key={header} className="px-4 py-3 text-left whitespace-nowrap">
                  {header.replace(/_/g, " ")}
                </th>
              ))}
              <th className="px-4 py-3 text-left">Created Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {leads.slice(0,10)?.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50">
                {headers.map((header) => (
                  <td key={header} className="px-4 py-3 whitespace-nowrap">
                    {getValue(lead.field_data, header)}
                  </td>
                ))}
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                  {new Date(lead.created_time).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MetaLeads;
