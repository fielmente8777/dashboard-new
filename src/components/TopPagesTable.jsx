import React, { useState, useEffect } from "react";
import axios from "axios";

const TopPagesTable = () => {
  const [pages, setPages] = useState([]);

  useEffect(() => {
    const fetchPages = async () => {
      const hid = localStorage.getItem("hid");
      if (!hid) return;

      try {
        const { data } = await axios.get(`http://localhost:8001/google/analytics-pages/${hid}`);
        if (data.topPages) {
          setPages(data.topPages);
        }
      } catch (err) {
        console.error("Failed to fetch top pages:", err);
      }
    };

    fetchPages();
  }, []);

  if (pages.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200 w-full mt-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Performance Insights</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-sm text-gray-600">
              <th className="pb-3 font-medium">Page/Screen Name</th>
              <th className="pb-3 font-medium">Views</th>
              <th className="pb-3 font-medium">Active Users</th>
              <th className="pb-3 font-medium">Bounce Rate</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page, index) => (
              <tr key={index} className="border-b border-gray-100 last:border-none text-sm text-gray-800">
                <td className="py-3 pr-4 max-w-[300px] truncate" title={page.pageName}>{page.pageName}</td>
                <td className="py-3">{page.views}</td>
                <td className="py-3">{page.users}</td>
                <td className="py-3">{page.bounceRate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopPagesTable;