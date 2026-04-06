import { useState } from "react";
import { FaCommentDots, FaQuestionCircle, FaRandom } from "react-icons/fa";
import { IoMdArrowRoundBack } from "react-icons/io";

export default function Sidebar({ addNode, addSendMessageNode }) {
  const [showQuestionMenu, setShowQuestionMenu] = useState(false);
  const blocks = [
    {
      type: "message",
      label: "Send a message",
      desc: "With no response required from visitor",
      icon: <FaCommentDots />,
      color: "from-red-400 to-red-500",
    },
    {
      type: "question",
      label: "Ask a question",
      desc: "Ask question and store user input in variable",
      icon: <FaQuestionCircle />,
      color: "from-orange-400 to-orange-500",
    },
  ];

  const questionsBlock = [
    // {
    //   type: "question",
    //   label: "Question",
    //   desc: "Ask an open question to the user",
    //   color: "from-orange-400 to-orange-600",
    //   icon: "❓",
    // },
    {
      type: "button",
      label: "Buttons",
      desc: "Let user choose from quick reply buttons",
      color: "from-orange-400 to-orange-500",
      icon: "🔘",
    },
    {
      type: "list",
      label: "List",
      desc: "Show selectable list options",
      color: "from-purple-400 to-purple-600",
      icon: "📋",
    },
    {
      type: "carousel",
      label: "Carousel",
      desc: "Show selectable list options",
      color: "from-primary to-primary/85",
      icon: "📋",
    },
  ];

  return (
    <div className="w-72  bg-primary/ h-full bordrer-r! border-gray-200! p-4">
      {showQuestionMenu && (
        <div
          onClick={() => setShowQuestionMenu(false)}
          className="size-6 rounded-full bg-slate-800 flex items-center justify-center cursor-pointer  "
        >
          <IoMdArrowRoundBack color="#fefefe" size={14} />
        </div>
      )}

      {!showQuestionMenu && (
        <div className="space-y-4">
          {blocks.map((block) => (
            <div
              key={block.type}
              onClick={() => {
                if (block.type === "message") {
                  addSendMessageNode(block.type);
                } else if (block.type === "question") {
                  setShowQuestionMenu(true);
                } else {
                  addNode(block.type);
                }
              }}
              className={`cursor-pointer rounded-xl p-4 text-white bg-gradient-to-r ${block.color} shadow hover:scale-[1.02] transition`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-sm">{block.label}</h3>

                  <p className="text-xs opacity-90 mt-1">{block.desc}</p>
                </div>

                <div className="text-2xl opacity-90">{block.icon}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showQuestionMenu && (
        <div className="space-y-4 mt-4">
          {questionsBlock.map((item) => (
            <div
              key={item.type}
              onClick={() => addNode(item.type)}
              className={`cursor-pointer rounded-xl p-4 text-white bg-gradient-to-r ${item.color} shadow hover:scale-[1.02] transition`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-sm">{item.label}</h3>

                  <p className="text-xs opacity-90 mt-1">{item.desc}</p>
                </div>

                <div className="text-2xl opacity-90">{item.icon}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
