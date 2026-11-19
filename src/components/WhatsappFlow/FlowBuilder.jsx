import { useCallback, useEffect, useRef, useState } from "react";
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
import { getWhatsAppFlows } from "../../redux/api/whatsappBusinessApi";
import { MousePointerClick, Rocket, X } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import Button from "../ui/Button";
import Icon from "../ui/Icon";
import { blockStyle } from "./blockStyles";
import "./flowBuilder.css";
import ButtonsNode from "./nodes/ButtonNodes";
import CarouselNode from "./nodes/CarouselNode";
import ListNode from "./nodes/ListNode";
import QuestionNode from "./nodes/QuestionNode";
import SendMessageNode from "./nodes/SendMessageNode";
import SettingsPanel from "./SettingsPanel";
import Sidebar from "./Sidebar";
import FlowNode from "./nodes/FlowNode";

// the blocks offered when a connection is dropped on empty canvas
const NODE_OPTIONS = ["sendMessage", "button", "list", "question", "flow"];

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

  const builderRef = useRef(null);
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
      // next to where the connection was dropped, kept inside the builder
      const box = builderRef.current?.getBoundingClientRect();
      const MENU_WIDTH = 256;
      const MENU_HEIGHT = 360;
      const x = box ? event.clientX - box.left + 12 : event.clientX;
      const y = box ? event.clientY - box.top - 24 : event.clientY;
      setPopupPosition({
        x: box ? Math.max(8, Math.min(x, box.width - MENU_WIDTH - 8)) : x,
        y: box ? Math.max(8, Math.min(y, box.height - MENU_HEIGHT - 8)) : y,
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
    <div ref={builderRef} className="relative flex h-[calc(100dvh-11rem)] min-h-[32rem] w-full flex-col overflow-hidden rounded-xl border border-app-border! bg-app-surface">
      <div className="flex flex-wrap items-center gap-3 border-b border-app-border! px-4 py-2.5">
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-app-text">Chatbot builder</h2>
          <p className="text-xs text-app-text-muted">
            Add blocks and connect them to build the replies your WhatsApp bot sends. Click a block
            to edit it, click a connection to remove it.
          </p>
        </div>
        <Button icon={Rocket} onClick={handlePublish} loading={loading}>
          Publish
        </Button>
      </div>

      <div className="flex min-h-0 flex-1">
        <Sidebar addNode={addNode} addSendMessageNode={addSendMessageNode} />

        <div className="min-w-0 flex-1">
          <div className="eaz-flow relative h-full w-full bg-app-bg">
            {nodes.length === 0 && (
              <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center p-6">
                <div className="max-w-xs rounded-xl border border-dashed border-app-border! bg-app-surface/80 p-5 text-center backdrop-blur">
                  <span className="mx-auto mb-2 flex size-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                    <Icon icon={MousePointerClick} size="lg" />
                  </span>
                  <p className="text-sm font-medium text-app-text">Your chatbot is empty</p>
                  <p className="mt-1 text-xs text-app-text-muted">
                    Pick a block on the left to start, then drag from its green dot to connect the
                    next step.
                  </p>
                </div>
              </div>
            )}
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
              <Background variant="dots" gap={20} size={1.5} />
              <Controls />
              <MiniMap
                position="bottom-right"
                zoomable
                pannable
                nodeBorderRadius={6}
                nodeColor={(node) => blockStyle(node.type).minimap}
                maskColor="color-mix(in srgb, var(--app-bg) 70%, transparent)"
              />
            </ReactFlow>
          </div>
        </div>
      </div>

      {showPopup && (
        <div
          className="anim-fade absolute z-50 w-64 overflow-hidden rounded-xl border border-app-border! bg-app-surface shadow-2xl"
          style={{
            top: popupPosition.y,
            left: popupPosition.x,
          }}
        >
          <div className="flex items-center justify-between border-b border-app-border! px-3 py-2.5">
            <div>
              <p className="text-sm font-semibold text-app-text">Add a block</p>
              <p className="text-[11px] text-app-text-faint">It appears on the canvas</p>
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={() => setShowPopup(false)}
              className="flex size-7 items-center justify-center rounded-lg text-app-text-muted transition hover:bg-app-surface-secondary hover:text-app-text"
            >
              <Icon icon={X} size="sm" />
            </button>
          </div>

          <div className="scrollbar-hidden flex max-h-72 flex-col gap-0.5 overflow-y-auto p-1.5">
            {NODE_OPTIONS.map((type) => {
              const style = blockStyle(type);
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleAddNodeFromPopup(type)}
                  className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-left transition hover:bg-app-surface-secondary"
                >
                  <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${style.tile}`}>
                    <Icon icon={style.icon} size="sm" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-app-text">{style.label}</span>
                    <span className="block truncate text-[11px] text-app-text-muted">{style.description}</span>
                  </span>
                </button>
              );
            })}
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
