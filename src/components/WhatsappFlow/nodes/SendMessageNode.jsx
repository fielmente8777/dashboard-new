import { useState } from "react";
import {
  FaImage,
  FaVideo,
  FaMusic,
  FaFileAlt,
  FaTrash,
  FaEllipsisV,
  FaCommentDots,
} from "react-icons/fa";
import { Handle, Position, useReactFlow } from "reactflow";

export default function SendMessageNode({ id, data }) {
  const { setNodes } = useReactFlow();
  const [blocks, setBlocks] = useState(data?.blocks || []);

  const { setFilesMap } = data;

  /* ---------------- UPDATE NODE ---------------- */

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

  /* ---------------- ADD BLOCK ---------------- */

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

  /* ---------------- UPDATE TITLE ---------------- */

  const updateTitle = (id, value) => {
    const updated = blocks.map((b) =>
      b.id === id ? { ...b, title: value } : b,
    );

    setBlocks(updated);
    updateNodeData(updated);
  };

  /* ---------------- FILE UPLOAD ---------------- */

  const handleFile = (e, blockId) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);

    // ✅ store file separately
    setFilesMap((prev) => ({
      ...prev,
      [blockId]: file,
    }));

    // ❌ DO NOT store file in node
    const updated = blocks.map((b) =>
      b.id === blockId
        ? { ...b, file: true, url } // just flag
        : b,
    );

    setBlocks(updated);
    updateNodeData(updated);
  };

  /* ---------------- DELETE ---------------- */

  const removeBlock = (blockId) => {
    const updated = blocks.filter((b) => b.id !== blockId);

    setBlocks(updated);
    updateNodeData(updated);
  };

  /* ---------------- ACCEPT TYPES ---------------- */

  const getAccept = (type) => {
    if (type === "image") return "image/*";
    if (type === "video") return "video/* ";
    if (type === "audio") return "audio/*";
    return ".pdf,.doc,.docx,.txt";
  };

  const getIcon = (type) => {
    if (type === "image") return <FaImage />;
    if (type === "video") return <FaVideo />;
    if (type === "audio") return <FaMusic />;
    return <FaFileAlt />;
  };

  return (
    <div className="w-[320px] rounded-xl shadow-lg bg-white border relative">
      {/* Header */}
      <div className="bg-red-500 text-white flex items-center justify-between px-4 py-3 rounded-t-xl">
        <div className="flex items-center gap-2 font-semibold">
          <FaCommentDots />
          Send Message
        </div>

        <FaEllipsisV />
      </div>

      <div className="p-4 space-y-4">
        {/* BLOCKS */}

        {blocks.map((block) => (
          <div
            key={block.id}
            className="border rounded-lg p-3 space-y-3 relative"
          >
            {/* Caption input for supported types */}
            {(block.type === "text" || block.type === "image") && (
              <input
                value={block.title}
                onChange={(e) => updateTitle(block.id, e.target.value)}
                placeholder={
                  block.type === "text"
                    ? "Enter message..."
                    : "Enter caption..."
                }
                className="w-full border rounded-md p-2 text-sm"
              />
            )}

            {/* Upload */}
            {block.type !== "text" && !block.file && (
              <label
                htmlFor={`file-${block.id}`}
                className="border-2 border-green-400 rounded-md p-4 flex flex-col items-center gap-2 cursor-pointer"
              >
                {getIcon(block.type)}
                <span className="text-sm text-green-600">
                  Upload {block.type}
                </span>
              </label>
            )}

            {/* Preview */}

            {block.file && block.type === "image" && (
              <img src={block.url} className="w-full rounded-md" />
            )}

            {block.file && block.type === "video" && (
              <video controls className="w-full rounded-md">
                <source src={block.url} />
              </video>
            )}

            {block.file && block.type === "audio" && (
              <audio controls className="w-full">
                <source src={block.url} />
              </audio>
            )}

            {block.file && block.type === "document" && (
              <div className="flex items-center gap-2 text-sm">
                <FaFileAlt />
                {block.file.name}
              </div>
            )}

            {/* Hidden file input */}

            {block.type !== "text" && (
              <input
                id={`file-${block.id}`}
                type="file"
                className="hidden"
                accept={getAccept(block.type)}
                onChange={(e) => handleFile(e, block.id)}
              />
            )}

            {/* Delete */}

            <button
              onClick={() => removeBlock(block.id)}
              className="absolute top-2 right-2 text-red-500"
            >
              <FaTrash size={14} />
            </button>
          </div>
        ))}

        {/* SMALL ACTION BUTTONS */}

        <div className="flex flex-wrap gap-2 pt-2">
          <SmallButton label="Message" onClick={() => addBlock("text")} />
          <SmallButton label="Image" onClick={() => addBlock("image")} />
          <SmallButton label="Video" onClick={() => addBlock("video")} />
          <SmallButton label="Audio" onClick={() => addBlock("audio")} />
          <SmallButton label="Document" onClick={() => addBlock("document")} />
        </div>
      </div>

      {/* React Flow Handles */}

      <Handle
        type="target"
        position={Position.Left}
        className="bg-slate-800 w-3 h-3 rounded-full top-1/2"
      />

      <Handle
        type="source"
        position={Position.Right}
        className="bg-slate-800 w-3 h-3 rounded-full top-1/2"
      />
    </div>
  );
}

function SmallButton({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="border border-green-400 text-green-600 px-3 py-1 rounded-md text-sm hover:bg-green-50"
    >
      {label}
    </button>
  );
}

// import { useState } from "react";
// import {
//   FaImage,
//   FaVideo,
//   FaMusic,
//   FaFileAlt,
//   FaTrash,
//   FaEllipsisV,
//   FaCommentDots,
// } from "react-icons/fa";
// import { Handle, Position, useReactFlow } from "reactflow";

// export default function SendMessageNode({ id, data }) {
//   const { setNodes } = useReactFlow();

//   const [message, setMessage] = useState("");
//   const [blocks, setBlocks] = useState(data?.blocks || []);

//   /* ---------------- UPDATE NODE DATA ---------------- */

//   const updateNodeData = (updatedBlocks) => {
//     setNodes((nodes) =>
//       nodes.map((node) =>
//         node.id === id
//           ? {
//               ...node,
//               data: {
//                 ...node.data,
//                 blocks: updatedBlocks,
//               },
//             }
//           : node,
//       ),
//     );
//   };

//   /* ---------------- MESSAGE INPUT ---------------- */

//   const handleMessageChange = (e) => {
//     setMessage(e.target.value);

//     if (blocks.length === 0) {
//       const firstBlock = {
//         id: Date.now(),
//         title: e.target.value,
//         type: "text",
//         url: null,
//         file: null,
//       };

//       setBlocks([firstBlock]);
//       updateNodeData([firstBlock]);
//     } else {
//       const updated = blocks.map((b, i) =>
//         i === 0 ? { ...b, title: e.target.value } : b,
//       );

//       setBlocks(updated);
//       updateNodeData(updated);
//     }
//   };

//   /* ---------------- ADD MEDIA ---------------- */

//   const addMediaBlock = (type) => {
//     // FIRST MEDIA
//     if (blocks.length === 0) {
//       const firstBlock = {
//         id: Date.now(),
//         title: message,
//         type,
//         url: null,
//         file: null,
//       };

//       setBlocks([firstBlock]);
//       updateNodeData([firstBlock]);
//       return;
//     }

//     // NEXT MEDIA
//     const newBlock = {
//       id: Date.now(),
//       title: "",
//       type,
//       url: null,
//       file: null,
//     };

//     const updated = [...blocks, newBlock];

//     setBlocks(updated);
//     updateNodeData(updated);
//   };

//   /* ---------------- TITLE CHANGE ---------------- */

//   const handleTitleChange = (blockId, value) => {
//     const updated = blocks.map((b) =>
//       b.id === blockId ? { ...b, title: value } : b,
//     );

//     setBlocks(updated);
//     updateNodeData(updated);
//   };

//   /* ---------------- FILE UPLOAD ---------------- */

//   const handleFile = (e, blockId) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const url = URL.createObjectURL(file);

//     const updated = blocks.map((b) =>
//       b.id === blockId ? { ...b, file, url } : b,
//     );

//     setBlocks(updated);
//     updateNodeData(updated);
//   };

//   /* ---------------- DELETE BLOCK ---------------- */

//   const removeBlock = (blockId) => {
//     const updated = blocks.filter((b) => b.id !== blockId);

//     setBlocks(updated);
//     updateNodeData(updated);
//   };

//   /* ---------------- HELPERS ---------------- */

//   const getAccept = (type) => {
//     if (type === "image") return "image/*";
//     if (type === "video") return "video/*";
//     if (type === "audio") return "audio/*";
//     return ".pdf,.doc,.docx,.txt";
//   };

//   const getIcon = (type) => {
//     if (type === "image") return <FaImage />;
//     if (type === "video") return <FaVideo />;
//     if (type === "audio") return <FaMusic />;
//     return <FaFileAlt />;
//   };

//   /* ---------------- UI ---------------- */

//   return (
//     <div className="w-[320px] rounded-xl shadow-lg bg-white border relative">
//       {/* Header */}
//       <div className="bg-red-500 text-white flex items-center justify-between px-4 py-3 rounded-t-xl">
//         <div className="flex items-center gap-2 font-semibold">
//           <FaCommentDots />
//           Send a message
//         </div>

//         <FaEllipsisV className="cursor-pointer" />
//       </div>

//       <div className="p-4 space-y-4">
//         {/* MESSAGE INPUT */}
//         <input
//           value={message}
//           onChange={handleMessageChange}
//           placeholder="Type message..."
//           className="w-full border rounded-md p-2 text-sm outline-none focus:ring-2 focus:ring-green-400"
//         />

//         {/* MEDIA BLOCKS */}
//         {blocks.map((block, index) => (
//           <div
//             key={block.id}
//             className="border rounded-lg p-3 space-y-3 relative"
//           >
//             {/* Title input only for second block onwards */}
//             {index !== 0 && (
//               <input
//                 value={block.title}
//                 onChange={(e) => handleTitleChange(block.id, e.target.value)}
//                 placeholder="Enter title..."
//                 className="w-full border rounded-md p-2 text-sm"
//               />
//             )}

//             {/* Upload block */}
//             {!block.file && (
//               <label
//                 htmlFor={`file-${block.id}`}
//                 className="border-2 border-green-400 rounded-md p-4 flex flex-col items-center gap-2 text-gray-600 hover:bg-gray-50 cursor-pointer"
//               >
//                 <div className="text-xl">{getIcon(block.type)}</div>

//                 <span className="text-sm text-green-600 font-medium">
//                   Upload {block.type}
//                 </span>
//               </label>
//             )}

//             {/* Preview */}

//             {block.file && block.type === "image" && (
//               <img src={block.url} className="w-full rounded-md" />
//             )}

//             {block.file && block.type === "video" && (
//               <video controls className="w-full rounded-md">
//                 <source src={block.url} />
//               </video>
//             )}

//             {block.file && block.type === "audio" && (
//               <audio controls className="w-full">
//                 <source src={block.url} />
//               </audio>
//             )}

//             {block.file && block.type === "document" && (
//               <div className="flex items-center gap-2 text-sm">
//                 <FaFileAlt />
//                 {block.file.name}
//               </div>
//             )}

//             {/* Hidden file input */}
//             <input
//               id={`file-${block.id}`}
//               type="file"
//               className="hidden"
//               accept={getAccept(block.type)}
//               onChange={(e) => handleFile(e, block.id)}
//             />

//             {/* Delete */}
//             <button
//               onClick={() => removeBlock(block.id)}
//               className="absolute top-2 right-2 text-red-500"
//             >
//               <FaTrash size={14} />
//             </button>
//           </div>
//         ))}

//         {/* MEDIA BUTTONS */}
//         <div className="flex flex-wrap gap-2 pt-2">
//           <SmallButton
//             label="Message"
//             onClick={() => addMediaBlock("message")}
//           />
//           <SmallButton label="Image" onClick={() => addMediaBlock("image")} />
//           <SmallButton label="Video" onClick={() => addMediaBlock("video")} />
//           <SmallButton label="Audio" onClick={() => addMediaBlock("audio")} />
//           <SmallButton
//             label="Document"
//             onClick={() => addMediaBlock("document")}
//           />
//         </div>
//       </div>

//       {/* React Flow Handles */}

//       <Handle
//         type="target"
//         position={Position.Left}
//         className="bg-slate-800 w-3 h-3 rounded-full top-1/2"
//       />

//       <Handle
//         type="source"
//         position={Position.Right}
//         className="bg-slate-800 w-3 h-3 rounded-full top-1/2"
//       />
//     </div>
//   );
// }

// function SmallButton({ label, onClick }) {
//   return (
//     <button
//       onClick={onClick}
//       className="border border-green-400 text-green-600 px-3 py-1 rounded-md text-sm hover:bg-green-50"
//     >
//       {label}
//     </button>
//   );
// }
