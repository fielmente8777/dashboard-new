// import { useMemo, useState } from "react";
// import JoditEditor from "jodit-react";

// function ComposeEmail({ onClose }) {
//   const [to, setTo] = useState("");
//   const [cc, setCc] = useState("");
//   const [bcc, setBcc] = useState("");
//   const [subject, setSubject] = useState("");
//   const [body, setBody] = useState("");

//   const config = useMemo(
//     () => ({
//       readonly: false,
//       height: 260,
//       placeholder: "Write your message...",
//       toolbarAdaptive: false,

//       buttons: [
//         "bold",
//         "italic",
//         "underline",
//         "|",
//         "fontsize",
//         "brush",
//         "|",
//         "ul",
//         "ol",
//         "|",
//         "link",
//         "image",
//         "|",
//         "align",
//         "|",
//         "undo",
//         "redo",
//       ],

//       // Make typed text black by default
//       style: {
//         color: "#111827",
//         fontSize: "14px",
//       },

//       uploader: {
//         insertImageAsBase64URI: true,
//       },
//     }),
//     []
//   );

//   const handleSend = () => {
//     if (!to.trim()) {
//       alert("Please enter recipient email");
//       return;
//     }

//     if (!subject.trim()) {
//       alert("Please enter subject");
//       return;
//     }

//     if (!body.trim() || body === "<p><br></p>") {
//       alert("Please write your message");
//       return;
//     }

//     console.log({
//       to,
//       cc,
//       bcc,
//       subject,
//       body,
//     });

//     // API will be connected here later
//   };

//   return (
//     <div className="fixed bottom-0 right-8 w-[520px] bg-white rounded-t-xl shadow-2xl border border-gray-200 z-[9999]">

//       {/* Header */}
//       <div className="flex items-center justify-between px-4 py-3 bg-gray-100 rounded-t-xl">
//         <h2 className="text-sm font-semibold text-gray-800">
//           New Message
//         </h2>

//         <button
//           type="button"
//           onClick={onClose}
//           className="text-gray-500 hover:text-gray-800"
//           aria-label="Close compose email"
//         >
//           ✕
//         </button>
//       </div>

//       {/* Email fields */}
//       <div className="px-4">

//         {/* To */}
//         <div className="flex items-center border-b py-2">
//           <span className="text-sm text-gray-500 w-12">
//             To
//           </span>

//           <input
//             type="email"
//             value={to}
//             onChange={(e) => setTo(e.target.value)}
//             placeholder="Recipients"
//             className="flex-1 outline-none text-sm text-gray-900"
//           />
//         </div>

//         {/* CC */}
//         <div className="flex items-center border-b py-2">
//           <span className="text-sm text-gray-500 w-12">
//             Cc
//           </span>

//           <input
//             type="text"
//             value={cc}
//             onChange={(e) => setCc(e.target.value)}
//             placeholder="Cc"
//             className="flex-1 outline-none text-sm text-gray-900"
//           />
//         </div>

//         {/* BCC */}
//         <div className="flex items-center border-b py-2">
//           <span className="text-sm text-gray-500 w-12">
//             Bcc
//           </span>

//           <input
//             type="text"
//             value={bcc}
//             onChange={(e) => setBcc(e.target.value)}
//             placeholder="Bcc"
//             className="flex-1 outline-none text-sm text-gray-900"
//           />
//         </div>

//         {/* Subject */}
//         <div className="border-b py-2">
//           <input
//             type="text"
//             value={subject}
//             onChange={(e) => setSubject(e.target.value)}
//             placeholder="Subject"
//             className="w-full outline-none text-sm text-gray-900"
//           />
//         </div>

//         {/* Rich text editor */}
//         <div className="py-3">
//           <JoditEditor
//             value={body}
//             config={config}
//             onBlur={(newContent) => setBody(newContent)}
//           />
//         </div>
//       </div>

//       {/* Footer */}
//       <div className="flex items-center justify-between px-4 py-3 border-t">

//         <button
//           type="button"
//           onClick={handleSend}
//           className="px-5 py-2 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700"
//         >
//           Send
//         </button>

//         <button
//           type="button"
//           onClick={onClose}
//           className="text-gray-500 hover:text-red-500"
//           aria-label="Delete draft"
//         >
//           🗑
//         </button>

//       </div>
//     </div>
//   );
// }

// export default ComposeEmail;


"use client";

import { useEffect, useMemo, useState } from "react";
import JoditEditor from "jodit-react";

import {
  FiX,
  FiTrash2,
  FiSend,
  FiMinus,
  FiMaximize2,
} from "react-icons/fi";

function ComposeEmail({
  onClose,
  recipients = [],
  isBroadcast = false,
}) {
  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    setTo(
      recipients.length > 0
        ? recipients.join(", ")
        : ""
    );
  }, [recipients]);

  const config = useMemo(
    () => ({
      readonly: false,

      height: 220,

      minHeight: 160,

      placeholder: "Write your message...",

      toolbarAdaptive: true,

      toolbarSticky: false,

      showCharsCounter: false,

      showWordsCounter: false,

      showXPathInStatusbar: false,

      buttons: [
        "bold",
        "italic",
        "underline",
        "|",
        "fontsize",
        "brush",
        "|",
        "ul",
        "ol",
        "|",
        "link",
        "image",
        "|",
        "align",
        "|",
        "undo",
        "redo",
      ],

      style: {
        color: "#111827",
        fontSize: "14px",
      },

      uploader: {
        insertImageAsBase64URI: true,
      },
    }),
    []
  );

  const handleSend = () => {
    if (!to.trim()) {
      alert("Please enter recipient email");
      return;
    }

    if (!subject.trim()) {
      alert("Please enter subject");
      return;
    }

    if (
      !body.trim() ||
      body === "<p><br></p>"
    ) {
      alert("Please write your message");
      return;
    }

    const payload = {
      to,
      cc,
      bcc,
      subject,
      body,
    };

    console.log("EMAIL PAYLOAD:", payload);

    alert("Email data ready to send");

    onClose();
  };

  return (
    <div
      className={`
        fixed
        z-[99999]
        overflow-hidden
        border
        border-gray-200
        bg-white
        shadow-2xl

        ${
          minimized
            ? `
              bottom-0
              right-2
              w-[280px]
              rounded-t-xl
              sm:right-5
            `
            : `
              bottom-0
              left-0
              right-0
              w-full
              rounded-t-xl

              sm:left-auto
              sm:right-4
              sm:w-[520px]
            `
        }
      `}
    >
      {/* Header */}
      <div
        className="
          flex
          h-12
          items-center
          justify-between
          bg-gray-100
          px-3
          sm:px-4
        "
      >
        <div className="flex min-w-0 items-center gap-2">
          <h2 className="truncate text-sm font-semibold text-gray-800">
            {isBroadcast
              ? "Broadcast Message"
              : "New Message"}
          </h2>

          {isBroadcast && (
            <span
              className="
                shrink-0
                rounded-full
                bg-blue-100
                px-2
                py-0.5
                text-[10px]
                font-medium
                text-blue-700
              "
            >
              {recipients.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() =>
              setMinimized((prev) => !prev)
            }
            className="
              hidden
              h-8
              w-8
              items-center
              justify-center
              rounded
              text-gray-500
              hover:bg-gray-200
              sm:flex
            "
          >
            {minimized ? (
              <FiMaximize2 size={15} />
            ) : (
              <FiMinus size={16} />
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded
              text-gray-500
              hover:bg-gray-200
            "
          >
            <FiX size={18} />
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          <div
            className="
              max-h-[calc(100vh-110px)]
              overflow-y-auto
            "
          >
            <div className="px-3 sm:px-4">
              {/* To */}
              <div className="border-b py-2.5">
                <div className="flex items-start gap-3">
                  <span className="w-8 shrink-0 pt-1 text-sm text-gray-500">
                    To
                  </span>

                  <textarea
                    value={to}
                    onChange={(e) =>
                      setTo(e.target.value)
                    }
                    rows={
                      recipients.length > 5
                        ? 3
                        : 1
                    }
                    placeholder="Recipients"
                    className="
                      min-h-[26px]
                      flex-1
                      resize-none
                      overflow-y-auto
                      bg-transparent
                      text-sm
                      leading-6
                      text-gray-900
                      outline-none
                      placeholder:text-gray-400
                    "
                  />
                </div>
              </div>

              {/* Cc */}
              <div className="border-b py-2.5">
                <div className="flex items-center gap-3">
                  <span className="w-8 shrink-0 text-sm text-gray-500">
                    Cc
                  </span>

                  <input
                    type="text"
                    value={cc}
                    onChange={(e) =>
                      setCc(e.target.value)
                    }
                    placeholder="Cc"
                    className="
                      min-w-0
                      flex-1
                      bg-transparent
                      text-sm
                      outline-none
                    "
                  />
                </div>
              </div>

              {/* Bcc */}
              <div className="border-b py-2.5">
                <div className="flex items-center gap-3">
                  <span className="w-8 shrink-0 text-sm text-gray-500">
                    Bcc
                  </span>

                  <input
                    type="text"
                    value={bcc}
                    onChange={(e) =>
                      setBcc(e.target.value)
                    }
                    placeholder="Bcc"
                    className="
                      min-w-0
                      flex-1
                      bg-transparent
                      text-sm
                      outline-none
                    "
                  />
                </div>
              </div>

              {/* Subject */}
              <div className="border-b py-2.5">
                <input
                  type="text"
                  value={subject}
                  onChange={(e) =>
                    setSubject(e.target.value)
                  }
                  placeholder="Subject"
                  className="
                    w-full
                    bg-transparent
                    text-sm
                    text-gray-900
                    outline-none
                    placeholder:text-gray-400
                  "
                />
              </div>

              {/* Editor */}
              <div className="py-3">
                <JoditEditor
                  value={body}
                  config={config}
                  onBlur={(content) =>
                    setBody(content)
                  }
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            className="
              flex
              items-center
              justify-between
              border-t
              border-gray-200
              px-3
              py-3
              sm:px-4
            "
          >
            <button
              type="button"
              onClick={handleSend}
              className="
                flex
                items-center
                gap-2
                rounded-full
                bg-blue-600
                px-5
                py-2
                text-sm
                font-medium
                text-white
                hover:bg-blue-700
              "
            >
              <FiSend size={15} />
              Send
            </button>

            <button
              type="button"
              onClick={onClose}
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                text-gray-500
                hover:bg-red-50
                hover:text-red-500
              "
            >
              <FiTrash2 size={17} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default ComposeEmail;