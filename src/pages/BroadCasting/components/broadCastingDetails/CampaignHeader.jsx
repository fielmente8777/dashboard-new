const CampaignHeader = ({ campaign, onRefresh }) => (
  <div className="bg-white border-b border-gray-100 px-8 py-5 flex items-center justify-between sticky top-0 z-20 shadow-sm">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
        <svg
          className="w-5 h-5 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
          />
        </svg>
      </div>
      <div>
        <h1 className="text-lg font-bold text-gray-900 leading-tight">
          {campaign?.name}
        </h1>
        <p className="text-xs text-gray-400 font-mono">
          {campaign?.templateName}
        </p>
      </div>
    </div>

    <div className="flex items-center gap-2">
      <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-200">
        ✓ Campaign Completed
      </span>
      <button
        onClick={onRefresh}
        className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
        title="Refresh"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>
    </div>
  </div>
);

export default CampaignHeader;
