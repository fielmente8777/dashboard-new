import React, { useEffect, useState } from "react";
import { GetwebsiteDetails } from "../../services/api";

const Analytics = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [websitedata, setWebsitedata] = useState({});
  const [websitefaqdata, setWebsitefaqdata] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const data = await GetwebsiteDetails(token); // Assuming this is an async function
        setWebsitedata(data);
        setWebsitefaqdata(data?.Faq || []);
      } catch (error) {
        console.error("Error fetching website details:", error);
      }
    };

    fetchData();
  }, []);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <div className="bg-white p-4">
        <h2 className="text-sm font-semibold text-[#575757]">Experience</h2>
      </div>
    </>
  );
};

export default Analytics;
