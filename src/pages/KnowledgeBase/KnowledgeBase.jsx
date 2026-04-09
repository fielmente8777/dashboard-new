import { useEffect, useState } from "react";

import axios from "axios";
import KnowledgeBaseForm from "./KnowledgeBaseForm";
import { JsonEditor } from "json-edit-react";
import { NEW_BASE_URL, SALES_AGEENT_BASE_URL } from "../../data/constant";
import UploadDocument from "./UploadDocument";
import { ArrowBigUp } from "lucide-react";
const KnowledgeBase = () => {
  const [jsondata, setJsonData] = useState(null);
  const [url, setUrl] = useState("");
  const [activeTab, setActiveTab] = useState("url"); // "url" or "manual"
  const [loading, setLoading] = useState(false);
  const [kbLoading, setKbLoading] = useState(false);

  const fetchData = async (link) => {
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${SALES_AGEENT_BASE_URL}/api/v1/knowledgebase/create`,
        {
          url: link,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      // console.log("API response", data);
      setJsonData(data?.data?.knowledge_base);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim()) {
      fetchData(url);
    }
  };

  const handleFormSave = async (formData) => {
    setLoading(true);
    try {
      // You can send this form data to your API
      const { data } = await axios.post(
        "http://127.0.0.1:5000/leadeazbot/create-knowledge-base",
        {
          manualData: formData,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      // console.log("Form data saved:", data);
      setJsonData(formData); // Display the form data
    } catch (error) {
      console.error("Error saving form data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchKnowledgeBaseData = async () => {
    setKbLoading(true);
    try {
      const { data } = await axios.get(`${SALES_AGEENT_BASE_URL}/api/v1/knowledgebase`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setJsonData(data?.data?.knowledge_base);
    } catch (error) {
      // console.log(error);
    } finally {
      setKbLoading(false);
    }
  };

  useEffect(() => {
    fetchKnowledgeBaseData();
  }, []);

 const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Knowledge Base</h1>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("url")}
          className={`px-4 py-2 font-medium ${
            activeTab === "url"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Import from URL
        </button>
        <button
          onClick={() => setActiveTab("manual")}
          className={`px-4 py-2 font-medium ${
            activeTab === "manual"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Manual Entry
        </button>
        <button
          onClick={() => setActiveTab("document")}
          className={`px-4 py-2 font-medium ${
            activeTab === "document"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Upload Documents
        </button>
      </div>

      {/* URL Input Tab */}
      {activeTab === "url" && (
        <div className="space-y-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="url"
              placeholder="Enter website link..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!url.trim() || loading}
              className="px-6 py-2 rounded-md bg-blue-600 text-white disabled:bg-gray-400"
            >
              {loading ? "Fetching..." : "Fetch"}
            </button>
          </form>
        </div>
      )}

      {/* Manual Entry Tab */}
      {activeTab === "manual" && (
        <div>
          <KnowledgeBaseForm onSave={handleFormSave} initialData={jsondata} />
        </div>
      )}
      {activeTab === "document" && (
        <div>
         <UploadDocument/>
        </div>
      )}

      {/* JSON Viewer */}
      {/* {!jsondata && (
        <div className="border rounded-md p-4">
          <h2 className="text-lg font-semibold mb-3">Data Preview</h2>
          <p>No data available.</p>
        </div>
      )} */}

      {/* {kbLoading ? (
        <div>Loading...</div>
      ) : !jsondata ? (
        <div className="border rounded-md p-4">
          <h2 className="text-lg font-semibold mb-3">Data Preview</h2>
          <p>No data available.</p>
        </div>
      ) : (
        <div className="border rounded-md p-4">
          <h2 className="text-lg font-semibold mb-3">Data Preview</h2>
          <JsonEditor data={jsondata} />
          {JSON.stringify(jsondata,null,2)}
        </div>
      )} */}

  <RenderValue data={jsondata} />

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Processing...</span>
        </div>
      )}

      {show&&<button onClick={() =>{
        console.log("jhjgfc");
          window.scrollTo({ top: 0, behavior: "smooth" })}} className="border absolute bottom-5 right-5 h-10 w-10 bg-primary text-ternary flex items-center justify-center rounded-full text-xs"><ArrowBigUp size={20}/></button>
          }
    </div>
  );
};

export default KnowledgeBase;


  const RenderValue = ({ data }) => {
    if (Array.isArray(data)) {
      return (
        <ul className="list-disc ml-5 space-y-1">
          {data.map((item, idx) => (
            <li key={idx}>
              <RenderValue data={item} />
            </li>
          ))}
        </ul>
      );
    }

    if (typeof data === "object" && data !== null) {
      return (
        <div className="ml-4 border-l pl-4 space-y-2">
          {Object.entries(data).map(([key, value]) => (
            <div key={key}>
              <p className="font-medium text-gray-400 capitalize">{key}:</p>
              <RenderValue data={value} />
            </div>
          ))}
        </div>
      );
    }

    return <p className="text-gray-900">{String(data)}</p>;
  };