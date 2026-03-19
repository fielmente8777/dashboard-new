const TABS = ["All Details"];

const LeadTabs = ({ activeTab, setActiveTab }) => (
  <div className="flex items-center gap-3">
    {TABS.map((tab, i) => (
      <button
        key={i}
        onClick={() => setActiveTab(i)}
        className="font-medium"
        // className={`px-5 py-2 rounded-md font-medium transition ${
        //   activeTab === i
        //     ? "bg-primary text-white shadow"
        //     : "bg-white text-gray-500 hover:bg-gray-100"
        // }`}
      >
        {tab}
      </button>
    ))}
  </div>
);

export default LeadTabs;
