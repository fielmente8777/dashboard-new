import { useCallback, useEffect, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import { v4 as uuidv4 } from "uuid";

import Sidebar from "./Sidebar";
import SendMessageNode from "./nodes/SendMessageNode";
import SettingsPanel from "./SettingsPanel";
import ButtonsNode from "./nodes/ButtonNodes";
import ListNode from "./nodes/ListNode";
import QuestionNode from "./nodes/QuestionNode";
import { NEW_BASE_URL } from "../../data/constant";
import { getWhatsAppFlows } from "../../services/api/whatsApp";
import Loader from "../Loader";
import CarouselNode from "./nodes/CarouselNode";
import WhatsAppFlowsBuilder from "./WhtasAppFlowBuilder";

const nodeTypes = {
  sendMessage: SendMessageNode,
  button: ButtonsNode,
  list: ListNode,
  question: QuestionNode,
  carousel: CarouselNode,
};

export default function FlowBuilder() {
  // const { project, getViewport } = useReactFlow();
  const { screenToFlowPosition } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [filesMap, setFilesMap] = useState({});
  const [filesMapCarousel, setFilesMapCarousel] = useState({});
  const [loading, setLoading] = useState(false);

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

    Object.entries(filesMap).forEach(([blockId, file]) => {
      formData.append(`file_${blockId}`, file);
    });

    try {
      await fetch(
        `${NEW_BASE_URL}/api/v1/whatsapp/flow?hid=${localStorage.getItem("hid")}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        },
      );
    } catch (error) {
      console.error(error);
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

  useEffect(() => {
    fetchFlows();
  }, []);

  console.log(nodes);

  return (
    <div className="bg-white relative w-full">
      <div className="flex justify-end absolute right-2 top-2 px-2 z-50">
        <button
          onClick={() => handlePublish()}
          className="bg-primary px-4 py-1 text-white flex items-center gap-1 rounded-sm"
        >
          Publish {loading && <Loader color="#fefefe" />}
        </button>
      </div>

      <div className="relative">
        <div className="flex h-[82vh]">
          <Sidebar addNode={addNode} addSendMessageNode={addSendMessageNode} />

          <div className="flex-1 bg-gray-200">
            <ReactFlow
              nodes={nodes?.map((node) => ({
                ...node,
                data: {
                  ...node.data,
                  filesMap,
                  filesMapCarousel,
                  setFilesMap,
                  setFilesMapCarousel,
                },
              }))}
              edges={edges}
              nodeTypes={nodeTypes}
              onConnect={onConnect}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={onNodeClick}
              onEdgeClick={onEdgeClick}
              connectionLineType="smoothstep"
            >
              <Background />
              <Controls />
              <MiniMap
                position="bottom-right"
                zoomable
                pannable
                nodeStrokeWidth={3}
              />
            </ReactFlow>
          </div>
          {/* <WhatsAppFlowsBuilder /> */}

          {selectedNode && (
            <SettingsPanel
              node={selectedNode}
              setSelectedNode={setSelectedNode}
              setNode={setNodes}
            />
          )}
        </div>
      </div>
    </div>
  );
}
