import { useCallback, useEffect, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useEdgesState,
  useNodesState,
} from "reactflow";
import "reactflow/dist/style.css";
import { v4 as uuidv4 } from "uuid";

import { NEW_BASE_URL } from "../../data/constant";
import { getWhatsAppFlows } from "../../services/api/whatsApp";
import { Rocket } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import Button from "../ui/Button";
import ButtonsNode from "./nodes/ButtonNodes";
import CarouselNode from "./nodes/CarouselNode";
import ListNode from "./nodes/ListNode";
import QuestionNode from "./nodes/QuestionNode";
import SendMessageNode from "./nodes/SendMessageNode";
import SettingsPanel from "./SettingsPanel";
import Sidebar from "./Sidebar";
import { FiX } from "react-icons/fi";
import FlowNode from "./nodes/FlowNode";

const NODE_OPTIONS = [
  {
    key: "sendMessage",
    label: "Send Message",
    icon: "📩",
  },
  {
    key: "button",
    label: "Buttons",
    icon: "🔘",
  },
  {
    key: "list",
    label: "List",
    icon: "📋",
  },
  {
    key: "question",
    label: "Question",
    icon: "❓",
  },
  {
    key: "flow",
    label: "Flows",
    icon: "📡",
  },
];

const nodeTypes = {
  sendMessage: SendMessageNode,
  button: ButtonsNode,
  list: ListNode,
  question: QuestionNode,
  carousel: CarouselNode,
  flow: FlowNode,
};

export default function FlowBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [filesMap, setFilesMap] = useState({});
  // const [filesMapCarousel, setFilesMapCarousel] = useState({});
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [sourceNodeId, setSourceNodeId] = useState(null);

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: "smoothstep",
            animated: true,
          },
          eds,
        ),
      ),
    [setEdges],
  );

  const onConnectStart = (_, { nodeId }) => {
    setSourceNodeId(nodeId);
  };

  const onConnectEnd = (event) => {
    const targetIsPane = event.target.classList.contains("react-flow__pane");

    if (targetIsPane) {
      setPopupPosition({
        x: event.clientX - 280,
        y: event.clientY - 100,
      });

      setShowPopup(true);
    }
  };

  const handleAddNodeFromPopup = (type) => {
    // let data = {};

    // 🔁 reuse your existing logic
    addNode(type);

    // const newNodeId = uuidv4();

    // const newNode = {
    //   id: newNodeId,
    //   type,
    //   position: {
    //     x: popupPosition.x - 250,
    //     y: popupPosition.y - 100,
    //   },
    //   data,
    // };

    // setNodes((nds) => [...nds, newNode]);

    // // 🔗 auto connect edge
    // setEdges((eds) => [
    //   ...eds,
    //   {
    //     id: `e-${sourceNodeId}-${newNodeId}`,
    //     source: sourceNodeId,
    //     target: newNodeId,
    //     type: "smoothstep",
    //     animated: true,
    //   },
    // ]);

    setShowPopup(false);
  };

  const addSendMessageNode = () => {
    const newNode = {
      id: uuidv4(),
      type: "sendMessage",
      position: {
        x: 250 + Math.random() * 100,
        y: 100 + Math.random() * 100,
      },
      data: {},
    };

    setNodes((nds) => [...nds, newNode]);
  };

  const addNode = (type) => {
    let data = {};

    if (type === "button") {
      data = {
        interactive: {
          header: {
            type: "text",
            text: "",
          },
          body: {
            text: "Ask a question here",
          },
          footer: {
            text: "",
          },
          action: {
            buttons: [
              {
                type: "reply",
                reply: {
                  id: "btn_1",
                  title: "Answer 1",
                },
              },
            ],
          },
          type: "button",
        },
        type: "interactive",
        variable: "",
      };
    } else if (type === "list") {
      data = {
        interactive: {
          header: {
            type: "text",
            text: "",
          },
          body: {
            text: "Select an option",
          },
          footer: {
            text: "",
          },
          action: {
            sections: [
              {
                title: "Section 1",
                rows: [
                  {
                    id: `row_1_1_${uuidv4()}`,
                    title: "Option 1",
                  },
                ],
              },
            ],
          },
          type: "list",
        },
        type: "interactive",
        variable: "",
      };
    } else if (type === "carousel") {
      data = {
        interactive: {
          type: "carousel",

          body: {
            text: "Choose an option",
          },

          action: {
            cards: [
              {
                card_index: 0,

                // default header (text)
                header: {
                  type: "text",
                  text: "Card Title",
                },

                body: {
                  text: "Card description",
                },

                action: {
                  buttons: [
                    {
                      type: "quick_reply",
                      quick_reply: {
                        id: "card_0_btn_0",
                        title: "Option 1",
                      },
                    },
                  ],
                },

                // 🔥 UI-only fields (important)
                headerType: "text", // for frontend toggle
                headerText: "Card Title",
                image: null, // file (not URL)
              },
            ],
          },
        },

        type: "interactive",
        variable: "",
      };
    } else if (type === "question") {
      data = {
        message: "Ask a question here",
        type: "question",
        variable: "",
      };
    }

    const newNode = {
      id: uuidv4(),
      type,
      position: {
        x: 250,
        y: 100,
      },
      data,
    };

    setNodes((nds) => [...nds, newNode]);
  };

  const onNodeClick = (_, node) => {
    if (node.type !== "sendMessage") {
      setSelectedNode(node);
    } else {
      setSelectedNode(null);
    }
  };

  const onEdgeClick = (_, edge) => {
    setEdges((eds) => eds.filter((e) => e.id !== edge.id));
  };

  const handlePublish = async () => {
    setLoading(true);
    const formData = new FormData();

    formData.append("nodes", JSON.stringify(nodes));
    formData.append("edges", JSON.stringify(edges));

    // console.log(filesMap);

    Object.entries(filesMap).forEach(([blockId, file]) => {
      formData.append(`file_${blockId}`, file);
    });

    try {
      const response = await fetch(
        `${NEW_BASE_URL}/api/v1/whatsapp/flow?hid=${localStorage.getItem("hid")}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        },
      );
      const data = await response.json().catch(() => null);
      if (!response.ok || data?.success === false) {
        throw new Error(data?.responseMessage);
      }
      showToast({ message: "Chatbot published" });
    } catch (error) {
      showToast({
        message: error?.message || "Could not publish the chatbot.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFlows = async () => {
    const response = await getWhatsAppFlows();

    if (response.success && response.responseStatusCode === 200) {
      setNodes(response?.result?.docs?.flow?.nodes || []);
      setEdges(response?.result?.docs?.flow?.edges || []);
    }
  };

  // console.log(nodes);
  // console.log(edges);

  useEffect(() => {
    fetchFlows();
  }, []);

  return (
    <div className="relative flex h-[calc(100dvh-11rem)] min-h-[32rem] w-full flex-col overflow-hidden rounded-xl border border-app-border! bg-app-surface">
      <div className="flex flex-wrap items-center gap-3 border-b border-app-border! px-4 py-2.5">
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-app-text">Chatbot builder</h2>
          <p className="text-xs text-app-text-muted">
            Drag blocks onto the canvas and connect them to build the replies your WhatsApp bot sends.
          </p>
        </div>
        <Button icon={Rocket} onClick={handlePublish} loading={loading}>
          Publish
        </Button>
      </div>

      <div className="flex min-h-0 flex-1">
        <Sidebar addNode={addNode} addSendMessageNode={addSendMessageNode} />

        <div className="min-w-0 flex-1">
          <div className="h-full w-full bg-app-bg">
            <ReactFlow
              nodes={nodes?.map((node) => ({
                ...node,
                data: {
                  ...node.data,
                  filesMap,
                  setFilesMap,
                },
              }))}
              edges={edges}
              nodeTypes={nodeTypes}
              onConnect={onConnect}
              onConnectStart={onConnectStart} // ✅ NEW
              onConnectEnd={onConnectEnd}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={onNodeClick}
              onEdgeClick={onEdgeClick}
              connectionLineType="smoothstep"
              className="h-full!"
            >
              <Background variant="line" gap={2} size={1.5} />
              <Controls />
              <MiniMap
                position="bottom-right"
                zoomable
                pannable
                nodeStrokeWidth={3}
                nodeColor={(node) => {
                  if (node.type === "sendMessage") return "#22c55e"; // green
                  if (node.type === "button") return "#ef4444"; // red
                  if (node.type === "default") return "#3b82f6"; // blue
                  return "#6366f1"; // fallback
                }}
              />
            </ReactFlow>
          </div>
        </div>
      </div>

      {showPopup && (
        <div
          className="absolute z-50 w-56 overflow-hidden rounded-lg border border-app-border! bg-app-surface shadow-xl"
          style={{
            top: popupPosition.y,
            left: popupPosition.x,
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-app-border! px-3 py-2">
            <span className="text-sm font-semibold text-app-text">Add a block</span>
            <button
              type="button"
              aria-label="Close"
              onClick={() => setShowPopup(false)}
              className="flex size-6 items-center justify-center rounded-md text-app-text-muted hover:bg-app-surface-secondary"
            >
              <FiX size={14} />
            </button>
          </div>

          {/* Options */}
          <div className="flex flex-col max-h-60 h-full overflow-y-auto scrollbar-hidden">
            {NODE_OPTIONS.map((item) => (
              <div
                key={item.key}
                onClick={() => handleAddNodeFromPopup(item.key)}
                className="flex cursor-pointer items-center gap-2 px-3 py-2 text-app-text transition hover:bg-app-surface-secondary"
              >
                <span>{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedNode && (
        <SettingsPanel
          node={selectedNode}
          setSelectedNode={setSelectedNode}
          setNode={setNodes}
        />
      )}
    </div>
  );
}
