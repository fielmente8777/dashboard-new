import { useState } from "react";
import { FileText, Image, Music, Trash2, Type, Upload, Video } from "lucide-react";
import { Handle, Position, useReactFlow } from "reactflow";
import { NEW_BASE_URL } from "../../../data/constant";
import Icon from "../../ui/Icon";
import NodeShell from "../NodeShell";

// the pieces a message can be made of, in the order of the add buttons
const PARTS = [
  { type: "text", label: "Text", icon: Type },
  { type: "image", label: "Image", icon: Image },
  { type: "video", label: "Video", icon: Video },
  { type: "audio", label: "Audio", icon: Music },
  { type: "document", label: "Document", icon: FileText },
];

const fieldClass =
  "nodrag w-full resize-y rounded-lg border border-app-border! bg-app-surface px-2.5 py-2 text-sm text-app-text outline-none placeholder:text-app-text-faint focus:border-blue-500! focus:ring-1 focus:ring-blue-500";

export default function SendMessageNode({ id, data, selected }) {
  const { getNodes, getEdges, setNodes, setEdges } = useReactFlow();
  const nodes = getNodes();
  const [blocks, setBlocks] = useState(data?.blocks || []);

  const { setFilesMap } = data;

  const updateNodeData = (updated) => {
    setNodes((nodes) =>
      nodes.map((n) =>
        n.id === id
          ? {
              ...n,
              data: { ...n.data, blocks: updated },
            }
          : n,
      ),
    );
  };

  const addBlock = (type) => {
    const newBlock = {
      id: Date.now(),
      type,
      title: "",
      file: null,
      url: null,
    };

    const updated = [...blocks, newBlock];

    setBlocks(updated);
    updateNodeData(updated);
  };

  const updateTitle = (id, value) => {
    const updated = blocks.map((b) =>
      b.id === id ? { ...b, title: value } : b,
    );

    setBlocks(updated);
    updateNodeData(updated);
  };

  const handleFile = (e, blockId) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);

    // the file itself is kept apart from the node (sent on publish)
    setFilesMap((prev) => ({
      ...prev,
      [blockId]: file,
    }));

    // the node only keeps a flag and the preview url
    const updated = blocks.map((b) =>
      b.id === blockId
        ? { ...b, file: true, url }
        : b,
    );

    setBlocks(updated);
    updateNodeData(updated);
  };

  const removeBlock = (blockId) => {
    const updated = blocks.filter((b) => b.id !== blockId);

    setBlocks(updated);
    updateNodeData(updated);
  };

  const getAccept = (type) => {
    if (type === "image") return "image/jpeg, image/png, image/jpg";
    if (type === "video") return "video/* ";
    if (type === "audio") return "audio/*";
    return ".pdf,.doc,.docx,.txt";
  };

  const partOf = (type) => PARTS.find((p) => p.type === type) ?? PARTS[4];

  const removeNode = () => {
    const updatedNodes = nodes.filter((node) => node.id !== id);

    const updatedEdges = getEdges().filter(
      (edge) => edge.source !== id && edge.target !== id,
    );

    setNodes(updatedNodes);
    setEdges(updatedEdges);
  };

  return (
    <NodeShell type="sendMessage" width="w-80" selected={selected} onRemove={removeNode}>
      <div className="space-y-2.5 p-3">
        {blocks.length === 0 && (
          <p className="rounded-lg border border-dashed border-app-border! px-3 py-4 text-center text-xs text-app-text-faint">
            Add text or media below. Each piece is sent as its own message.
          </p>
        )}

        {blocks.map((block) => {
          const mediaId = block.media ? block?.media?.mediaId : null;
          const part = partOf(block.type);

          return (
            <div
              key={block.id}
              className="space-y-2 rounded-lg border border-app-border! bg-app-surface-secondary p-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-app-text-faint">
                  <Icon icon={part.icon} size="xs" />
                  {part.label}
                </span>
                <button
                  type="button"
                  aria-label={`Remove ${part.label.toLowerCase()}`}
                  title="Remove"
                  onClick={() => removeBlock(block.id)}
                  className="nodrag flex size-6 items-center justify-center rounded-md text-app-text-faint transition hover:bg-red-500/10 hover:text-red-500"
                >
                  <Icon icon={Trash2} size="xs" />
                </button>
              </div>

              {/* text, or the caption of an image */}
              {(block.type === "text" || block.type === "image") && (
                <textarea
                  value={block.title}
                  onChange={(e) => updateTitle(block.id, e.target.value)}
                  placeholder={
                    block.type === "text"
                      ? "Type your message..."
                      : "Caption (optional)"
                  }
                  rows={block.type === "text" ? 3 : 2}
                  className={fieldClass}
                />
              )}

              {/* upload */}
              {block.type !== "text" && !block.file && (
                <label
                  htmlFor={`file-${block.id}`}
                  className="nodrag flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border-2 border-dashed border-app-border! bg-app-surface px-3 py-4 text-app-text-muted transition hover:border-blue-500! hover:text-blue-500"
                >
                  <Icon icon={Upload} size="md" />
                  <span className="text-xs font-medium">Upload {part.label.toLowerCase()}</span>
                </label>
              )}

              {/* preview */}
              {block.file && block.type === "image" && (
                <img
                  src={
                    mediaId
                      ? `${NEW_BASE_URL}/api/v1/whatsapp/media/${mediaId}?ndid=${localStorage.getItem("ndid")}`
                      : block.url
                  }
                  alt=""
                  className="w-full rounded-lg border border-app-border!"
                />
              )}

              {block.file && block.type === "video" && (
                <video controls className="nodrag w-full rounded-lg">
                  <source src={block.url} />
                </video>
              )}

              {block.file && block.type === "audio" && (
                <audio controls className="nodrag w-full">
                  <source src={block.url} />
                </audio>
              )}

              {block.file && block.type === "document" && (
                <div className="flex items-center gap-2 rounded-lg bg-app-surface px-2.5 py-2 text-sm text-app-text">
                  <Icon icon={FileText} size="sm" tone="muted" />
                  <span className="truncate">{block.file.name}</span>
                </div>
              )}

              {block.type !== "text" && (
                <input
                  id={`file-${block.id}`}
                  type="file"
                  className="hidden"
                  accept={getAccept(block.type)}
                  onChange={(e) => handleFile(e, block.id)}
                />
              )}
            </div>
          );
        })}

        <div>
          <p className="mb-1.5 text-[11px] font-medium text-app-text-faint">Add to this message</p>
          <div className="flex flex-wrap gap-1.5">
            {PARTS.map((part) => (
              <button
                key={part.type}
                type="button"
                onClick={() => addBlock(part.type)}
                className="nodrag inline-flex items-center gap-1 rounded-md border border-app-border! bg-app-surface px-2 py-1 text-xs font-medium text-app-text-muted transition hover:border-emerald-500! hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                <Icon icon={part.icon} size="xs" />
                {part.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Handle type="target" position={Position.Left} className="eaz-handle-in" />
      <Handle type="source" position={Position.Right} className="eaz-handle-out" />
    </NodeShell>
  );
}
