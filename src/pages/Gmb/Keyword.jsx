import { useState } from "react";
import { FiTrendingUp, FiTrendingDown, FiSearch, FiX } from "react-icons/fi";

export default function Keywords() {
  const [showModal, setShowModal] = useState(false);
  const [keywordInput, setKeywordInput] = useState("");
  const [keywords, setKeywords] = useState([
    {
      keyword: "coffee shop near me",
      position: 3,
      change: +2,
      volume: 5400,
      difficulty: "Medium",
    },
    {
      keyword: "best cafe downtown",
      position: 7,
      change: -1,
      volume: 2900,
      difficulty: "High",
    },
  ]);

  const addKeyword = () => {
    if (!keywordInput.trim()) return;

    setKeywords([
      {
        keyword: keywordInput,
        position: "-",
        change: 0,
        volume: "-",
        difficulty: "Low",
      },
      ...keywords,
    ]);

    setKeywordInput("");
    setShowModal(false);
  };

  return (
    <div className="flex-1 bg-gray-50 p-8 space-y-6 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Keywords</h1>
          <p className="text-gray-600 mt-1">
            Track keyword-level ranking performance
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          + Add Keyword
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border flex items-center gap-3">
        <FiSearch className="text-gray-500" />
        <input
          placeholder="Search keyword..."
          className="outline-none text-sm w-full"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 text-sm">
            <tr>
              <th className="px-6 py-3 text-left">Keyword</th>
              <th className="px-6 py-3 text-left">Position</th>
              <th className="px-6 py-3 text-left">Change</th>
              <th className="px-6 py-3 text-left">Volume</th>
              <th className="px-6 py-3 text-left">Difficulty</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {keywords.map((k, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{k.keyword}</td>

                <td className="px-6 py-4 font-bold">
                  {k.position !== "-" ? `#${k.position}` : "-"}
                </td>

                <td className="px-6 py-4">
                  {k.change === 0 ? (
                    "-"
                  ) : (
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                        k.change > 0
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {k.change > 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                      {Math.abs(k.change)}
                    </span>
                  )}
                </td>

                <td className="px-6 py-4">{k.volume}</td>

                <td className="px-6 py-4">
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100">
                    {k.difficulty}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ADD KEYWORD MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-xl p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <FiX />
            </button>

            <h2 className="text-xl font-bold mb-2">Add Keyword</h2>
            <p className="text-sm text-gray-600 mb-4">
              Track a new keyword for local ranking
            </p>

            <input
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              placeholder="Enter keyword (e.g. coffee shop near me)"
              className="w-full border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={addKeyword}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
              >
                Add Keyword
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
