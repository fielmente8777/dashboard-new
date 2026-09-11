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

// import { useState } from "react";
// import { FiX, FiSend, FiMinus, FiUsers } from "react-icons/fi";

// const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

// export default function ComposeEmail({
//   onClose,
//   isBroadcast = false,
//   recipientCount = 0,
//   onSend,
//   isSubmitting = false,
// }) {
//   const [toInput, setToInput] = useState("");
//   const [subject, setSubject] = useState("");
//   const [fromName, setFromName] = useState("");
//   const [fromEmail, setFromEmail] = useState("");
//   const [body, setBody] = useState("");
//   const [isMinimized, setIsMinimized] = useState(false);
//   const [error, setError] = useState("");

//   const parseTypedRecipients = () => [
//     ...new Set(
//       toInput
//         .split(/[,;\s]+/)
//         .map((e) => e.trim().toLowerCase())
//         .filter((e) => e && EMAIL_REGEX.test(e)),
//     ),
//   ];

//   const handleSubmit = async () => {
//     setError("");

//     const toEmails = isBroadcast ? [] : parseTypedRecipients();

//     if (!isBroadcast && toEmails.length === 0) {
//       setError("Enter at least one valid recipient email.");
//       return;
//     }

//     if (isBroadcast && recipientCount === 0) {
//       setError("No recipients found for this broadcast.");
//       return;
//     }

//     if (!subject.trim()) {
//       setError("Subject is required.");
//       return;
//     }

//     if (!body.trim()) {
//       setError("Message body is required.");
//       return;
//     }

//     const html = body
//       .split("\n")
//       .map((line) => `<p>${line || "&nbsp;"}</p>`)
//       .join("");

//     try {
//       await onSend({
//         toEmails,
//         subject: subject.trim(),
//         html,
//         text: body,
//         fromName: fromName.trim(),
//         fromEmail: fromEmail.trim(),
//       });
//     } catch (err) {
//       console.error("Send failed:", err);
//       setError("Something went wrong while sending. Please try again.");
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-[100000] flex items-end justify-end bg-black/20 p-0 sm:items-end sm:justify-end sm:p-6">
//       <div
//         className={`flex w-full flex-col overflow-hidden rounded-t-2xl border border-gray-200 bg-white shadow-2xl transition-all sm:w-[520px] sm:rounded-2xl ${
//           isMinimized ? "h-14" : "h-[85vh] sm:h-[600px]"
//         }`}
//       >
//         {/* HEADER */}
//         <div className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-gray-50 px-4">
//           <div className="flex min-w-0 items-center gap-2">
//             <span className="truncate text-sm font-semibold text-gray-800">
//               {isBroadcast ? "New broadcast" : "New message"}
//             </span>

//             {isBroadcast && (
//               <span className="flex shrink-0 items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-medium text-blue-700">
//                 <FiUsers size={12} />
//                 {recipientCount.toLocaleString()}
//               </span>
//             )}
//           </div>

//           <div className="flex items-center gap-1">
//             <button
//               type="button"
//               onClick={() => setIsMinimized((prev) => !prev)}
//               className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-200"
//               aria-label={isMinimized ? "Expand" : "Minimize"}
//             >
//               <FiMinus size={16} />
//             </button>

//             <button
//               type="button"
//               onClick={onClose}
//               className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-200"
//               aria-label="Close"
//             >
//               <FiX size={17} />
//             </button>
//           </div>
//         </div>

//         {!isMinimized && (
//           <>
//             {/* BODY */}
//             <div className="min-h-0 flex-1 overflow-y-auto">
//               {/* Recipients */}
//               <div className="border-b border-gray-100 px-4 py-2.5">
//                 {isBroadcast ? (
//                   <div className="flex flex-wrap items-center gap-1 text-sm text-gray-600">
//                     <span className="shrink-0 text-xs font-medium text-gray-400">
//                       To
//                     </span>
//                     <span className="truncate">
//                       {recipientCount.toLocaleString()} recipient
//                       {recipientCount === 1 ? "" : "s"} — broadcast list
//                     </span>
//                   </div>
//                 ) : (
//                   <div className="flex items-center gap-2">
//                     <span className="shrink-0 text-xs font-medium text-gray-400">
//                       To
//                     </span>
//                     <input
//                       type="text"
//                       value={toInput}
//                       onChange={(e) => setToInput(e.target.value)}
//                       placeholder="name@example.com, name2@example.com"
//                       className="min-w-0 flex-1 border-none bg-transparent py-1 text-sm text-gray-800 outline-none placeholder:text-gray-400"
//                     />
//                   </div>
//                 )}
//               </div>

//               {/* From name / From email */}
//               <div className="flex flex-col gap-2.5 border-b border-gray-100 px-4 py-2.5 sm:flex-row sm:items-center sm:gap-4">
//                 <div className="flex flex-1 items-center gap-2">
//                   <span className="shrink-0 text-xs font-medium text-gray-400">
//                     From
//                   </span>
//                   <input
//                     type="text"
//                     value={fromName}
//                     onChange={(e) => setFromName(e.target.value)}
//                     placeholder="Display name (optional)"
//                     className="min-w-0 flex-1 border-none bg-transparent py-1 text-sm text-gray-800 outline-none placeholder:text-gray-400"
//                   />
//                 </div>

//                 <div className="flex flex-1 items-center gap-2">
//                   <input
//                     type="email"
//                     value={fromEmail}
//                     onChange={(e) => setFromEmail(e.target.value)}
//                     placeholder="sender@yourdomain.com"
//                     className="min-w-0 flex-1 border-none bg-transparent py-1 text-sm text-gray-800 outline-none placeholder:text-gray-400"
//                   />
//                 </div>
//               </div>

//               {/* Subject */}
//               <div className="border-b border-gray-100 px-4 py-2.5">
//                 <input
//                   type="text"
//                   value={subject}
//                   onChange={(e) => setSubject(e.target.value)}
//                   placeholder="Subject"
//                   className="w-full border-none bg-transparent py-1 text-sm font-medium text-gray-800 outline-none placeholder:text-gray-400"
//                 />
//               </div>

//               {/* Body */}
//               <div className="px-4 py-3">
//                 <textarea
//                   value={body}
//                   onChange={(e) => setBody(e.target.value)}
//                   placeholder="Write your message..."
//                   rows={14}
//                   className="w-full resize-none border-none bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
//                 />
//               </div>

//               {error && (
//                 <div className="px-4 pb-3">
//                   <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
//                     {error}
//                   </p>
//                 </div>
//               )}
//             </div>

//             {/* FOOTER */}
//             <div className="flex shrink-0 items-center justify-between border-t border-gray-200 bg-white px-4 py-3">
//               <button
//                 type="button"
//                 onClick={onClose}
//                 disabled={isSubmitting}
//                 className="rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
//               >
//                 Discard
//               </button>

//               <button
//                 type="button"
//                 onClick={handleSubmit}
//                 disabled={isSubmitting}
//                 className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60"
//               >
//                 <FiSend size={15} />
//                 {isSubmitting
//                   ? "Sending..."
//                   : isBroadcast
//                     ? "Send broadcast"
//                     : "Send"}
//               </button>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

import { useEffect, useMemo, useState } from "react";
import JoditEditor from "jodit-react";
import { FiX, FiTrash2, FiSend, FiMinus, FiMaximize2 } from "react-icons/fi";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

function ComposeEmail({
  onClose,
  recipients = [],
  recipientCount = 0,
  isBroadcast = false,
  onSend,
  isSubmitting = false,
}) {
  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [minimized, setMinimized] = useState(false);

  /*
   * ---------------------------------------------------------
   * SET RECIPIENTS
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (recipients?.length > 0) {
      setTo(recipients.join(", "));
    }
  }, [recipients]);

  /*
   * ---------------------------------------------------------
   * JODIT CONFIG
   * ---------------------------------------------------------
   */

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
    [],
  );

  /*
   * ---------------------------------------------------------
   * PARSE EMAILS
   * ---------------------------------------------------------
   */

  const parseEmails = (value) => {
    return [
      ...new Set(
        String(value || "")
          .split(/[,\n;]/)
          .map((email) => email.trim().toLowerCase())
          .filter(Boolean),
      ),
    ];
  };

  /*
   * ---------------------------------------------------------
   * SEND
   * ---------------------------------------------------------
   */

  const handleSend = async () => {
    if (isSubmitting) {
      return;
    }

    /*
     * Parse To
     */
    const toEmails = parseEmails(to);

    if (recipientCount === 0) {
      alert("Please enter at least one recipient email.");
      return;
    }

    /*
     * Validate To
     */
    const invalidToEmails = toEmails.filter(
      (email) => !EMAIL_REGEX.test(email),
    );

    if (invalidToEmails.length > 0) {
      alert(`Invalid recipient email:\n\n${invalidToEmails.join("\n")}`);
      return;
    }

    /*
     * Parse CC
     */
    const ccEmails = parseEmails(cc);

    const invalidCcEmails = ccEmails.filter(
      (email) => !EMAIL_REGEX.test(email),
    );

    if (invalidCcEmails.length > 0) {
      alert(`Invalid CC email:\n\n${invalidCcEmails.join("\n")}`);
      return;
    }

    /*
     * Parse BCC
     */
    const bccEmails = parseEmails(bcc);

    const invalidBccEmails = bccEmails.filter(
      (email) => !EMAIL_REGEX.test(email),
    );

    if (invalidBccEmails.length > 0) {
      alert(`Invalid BCC email:\n\n${invalidBccEmails.join("\n")}`);
      return;
    }

    /*
     * Subject
     */
    if (!subject.trim()) {
      alert("Please enter subject.");
      return;
    }

    /*
     * Body
     */
    const cleanedBody = body?.trim();

    if (
      !cleanedBody ||
      cleanedBody === "<p><br></p>" ||
      cleanedBody === "<p></p>"
    ) {
      alert("Please write your message.");
      return;
    }

    /*
     * -------------------------------------------------------
     * Convert HTML to simple text
     * -------------------------------------------------------
     */

    const temporaryDiv = document.createElement("div");
    temporaryDiv.innerHTML = body;

    const text = temporaryDiv.textContent || temporaryDiv.innerText || "";

    /*
     * -------------------------------------------------------
     * SEND DATA TO PARENT
     *
     * Parent will:
     *
     * 1. Create recipient batch if needed
     * 2. Create campaign
     * 3. Call sendEmailCampaign()
     * -------------------------------------------------------
     */

    try {
      await onSend({
        toEmails,
        ccEmails,
        bccEmails,
        subject: subject.trim(),
        html: body,
        text: text.trim(),
      });
    } catch (error) {
      console.error("Compose email send error:", error);
    }
  };

  /*
   * ---------------------------------------------------------
   * RENDER
   * ---------------------------------------------------------
   */

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
      {/* =====================================================
          HEADER
      ===================================================== */}

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
            {isBroadcast ? "Broadcast Message" : "New Message"}
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
              {recipientCount || recipients.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Minimize */}

          <button
            type="button"
            onClick={() => setMinimized((prev) => !prev)}
            disabled={isSubmitting}
            className="
              hidden
              h-8
              w-8
              items-center
              justify-center
              rounded
              text-gray-500
              hover:bg-gray-200
              disabled:cursor-not-allowed
              disabled:opacity-50
              sm:flex
            "
          >
            {minimized ? <FiMaximize2 size={15} /> : <FiMinus size={16} />}
          </button>

          {/* Close */}

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded
              text-gray-500
              hover:bg-gray-200
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <FiX size={18} />
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          {/* =================================================
              BODY
          ================================================= */}

          <div
            className="
              max-h-[calc(100vh-110px)]
              overflow-y-auto
            "
          >
            <div className="px-3 sm:px-4">
              {/* =================================================
                  TO
              ================================================= */}

              <div className="border-b py-2.5">
                <div className="flex items-start gap-3">
                  <span className="w-8 shrink-0 pt-1 text-sm text-gray-500">
                    To
                  </span>

                  <textarea
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    rows={to.split(/[,;\n]/).length > 5 ? 3 : 1}
                    placeholder={
                      isBroadcast
                        ? `${recipientCount} recipients selected — add more emails if needed`
                        : "Recipients"
                    }
                    disabled={isSubmitting}
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
        disabled:cursor-not-allowed
        disabled:opacity-60
      "
                  />
                </div>

                {isBroadcast && recipientCount > 0 && (
                  <div className="ml-11 mt-1 text-xs text-gray-500">
                    {recipientCount} broadcast recipient
                    {recipientCount !== 1 ? "s" : ""} selected
                  </div>
                )}
              </div>

              {/* =================================================
                  CC
              ================================================= */}

              <div className="border-b py-2.5">
                <div className="flex items-center gap-3">
                  <span className="w-8 shrink-0 text-sm text-gray-500">Cc</span>

                  <input
                    type="text"
                    value={cc}
                    onChange={(e) => setCc(e.target.value)}
                    placeholder="Cc"
                    disabled={isSubmitting}
                    className="
                      min-w-0
                      flex-1
                      bg-transparent
                      text-sm
                      outline-none
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  />
                </div>
              </div>

              {/* =================================================
                  BCC
              ================================================= */}

              <div className="border-b py-2.5">
                <div className="flex items-center gap-3">
                  <span className="w-8 shrink-0 text-sm text-gray-500">
                    Bcc
                  </span>

                  <input
                    type="text"
                    value={bcc}
                    onChange={(e) => setBcc(e.target.value)}
                    placeholder="Bcc"
                    disabled={isSubmitting}
                    className="
                      min-w-0
                      flex-1
                      bg-transparent
                      text-sm
                      outline-none
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  />
                </div>
              </div>

              {/* =================================================
                  SUBJECT
              ================================================= */}

              <div className="border-b py-2.5">
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Subject"
                  disabled={isSubmitting}
                  className="
                    w-full
                    bg-transparent
                    text-sm
                    text-gray-900
                    outline-none
                    placeholder:text-gray-400
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                />
              </div>

              {/* =================================================
                  EDITOR
              ================================================= */}

              <div className="py-3">
                <JoditEditor
                  value={body}
                  config={{
                    ...config,
                    disabled: isSubmitting,
                  }}
                  onBlur={(content) => setBody(content)}
                />
              </div>
            </div>
          </div>

          {/* =================================================
              FOOTER
          ================================================= */}

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
              disabled={isSubmitting}
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
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              <FiSend size={15} />

              {isSubmitting ? "Sending..." : "Send"}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
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
                disabled:cursor-not-allowed
                disabled:opacity-50
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

// function ComposeEmail({ onClose, recipients = [], isBroadcast = false }) {
//   const [to, setTo] = useState("");
//   const [cc, setCc] = useState("");
//   const [bcc, setBcc] = useState("");
//   const [subject, setSubject] = useState("");
//   const [body, setBody] = useState("");

//   const [minimized, setMinimized] = useState(false);

//   useEffect(() => {
//     setTo(recipients.length > 0 ? recipients.join(", ") : "");
//   }, [recipients]);

//   const config = useMemo(
//     () => ({
//       readonly: false,

//       height: 220,

//       minHeight: 160,

//       placeholder: "Write your message...",

//       toolbarAdaptive: true,

//       toolbarSticky: false,

//       showCharsCounter: false,

//       showWordsCounter: false,

//       showXPathInStatusbar: false,

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

//       style: {
//         color: "#111827",
//         fontSize: "14px",
//       },

//       uploader: {
//         insertImageAsBase64URI: true,
//       },
//     }),
//     [],
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

//     const payload = {
//       to,
//       cc,
//       bcc,
//       subject,
//       body,
//     };

//     console.log("EMAIL PAYLOAD:", payload);

//     alert("Email data ready to send");

//     onClose();
//   };

//   return (
//     <div
//       className={`
//         fixed
//         z-[99999]
//         overflow-hidden
//         border
//         border-gray-200
//         bg-white
//         shadow-2xl

//         ${
//           minimized
//             ? `
//               bottom-0
//               right-2
//               w-[280px]
//               rounded-t-xl
//               sm:right-5
//             `
//             : `
//               bottom-0
//               left-0
//               right-0
//               w-full
//               rounded-t-xl

//               sm:left-auto
//               sm:right-4
//               sm:w-[520px]
//             `
//         }
//       `}
//     >
//       {/* Header */}
//       <div
//         className="
//           flex
//           h-12
//           items-center
//           justify-between
//           bg-gray-100
//           px-3
//           sm:px-4
//         "
//       >
//         <div className="flex min-w-0 items-center gap-2">
//           <h2 className="truncate text-sm font-semibold text-gray-800">
//             {isBroadcast ? "Broadcast Message" : "New Message"}
//           </h2>

//           {isBroadcast && (
//             <span
//               className="
//                 shrink-0
//                 rounded-full
//                 bg-blue-100
//                 px-2
//                 py-0.5
//                 text-[10px]
//                 font-medium
//                 text-blue-700
//               "
//             >
//               {recipients.length}
//             </span>
//           )}
//         </div>

//         <div className="flex items-center gap-1">
//           <button
//             type="button"
//             onClick={() => setMinimized((prev) => !prev)}
//             className="
//               hidden
//               h-8
//               w-8
//               items-center
//               justify-center
//               rounded
//               text-gray-500
//               hover:bg-gray-200
//               sm:flex
//             "
//           >
//             {minimized ? <FiMaximize2 size={15} /> : <FiMinus size={16} />}
//           </button>

//           <button
//             type="button"
//             onClick={onClose}
//             className="
//               flex
//               h-8
//               w-8
//               items-center
//               justify-center
//               rounded
//               text-gray-500
//               hover:bg-gray-200
//             "
//           >
//             <FiX size={18} />
//           </button>
//         </div>
//       </div>

//       {!minimized && (
//         <>
//           <div
//             className="
//               max-h-[calc(100vh-110px)]
//               overflow-y-auto
//             "
//           >
//             <div className="px-3 sm:px-4">
//               {/* To */}
//               <div className="border-b py-2.5">
//                 <div className="flex items-start gap-3">
//                   <span className="w-8 shrink-0 pt-1 text-sm text-gray-500">
//                     To
//                   </span>

//                   <textarea
//                     value={to}
//                     onChange={(e) => setTo(e.target.value)}
//                     rows={recipients.length > 5 ? 3 : 1}
//                     placeholder="Recipients"
//                     className="
//                       min-h-[26px]
//                       flex-1
//                       resize-none
//                       overflow-y-auto
//                       bg-transparent
//                       text-sm
//                       leading-6
//                       text-gray-900
//                       outline-none
//                       placeholder:text-gray-400
//                     "
//                   />
//                 </div>
//               </div>

//               {/* Cc */}
//               <div className="border-b py-2.5">
//                 <div className="flex items-center gap-3">
//                   <span className="w-8 shrink-0 text-sm text-gray-500">Cc</span>

//                   <input
//                     type="text"
//                     value={cc}
//                     onChange={(e) => setCc(e.target.value)}
//                     placeholder="Cc"
//                     className="
//                       min-w-0
//                       flex-1
//                       bg-transparent
//                       text-sm
//                       outline-none
//                     "
//                   />
//                 </div>
//               </div>

//               {/* Bcc */}
//               <div className="border-b py-2.5">
//                 <div className="flex items-center gap-3">
//                   <span className="w-8 shrink-0 text-sm text-gray-500">
//                     Bcc
//                   </span>

//                   <input
//                     type="text"
//                     value={bcc}
//                     onChange={(e) => setBcc(e.target.value)}
//                     placeholder="Bcc"
//                     className="
//                       min-w-0
//                       flex-1
//                       bg-transparent
//                       text-sm
//                       outline-none
//                     "
//                   />
//                 </div>
//               </div>

//               {/* Subject */}
//               <div className="border-b py-2.5">
//                 <input
//                   type="text"
//                   value={subject}
//                   onChange={(e) => setSubject(e.target.value)}
//                   placeholder="Subject"
//                   className="
//                     w-full
//                     bg-transparent
//                     text-sm
//                     text-gray-900
//                     outline-none
//                     placeholder:text-gray-400
//                   "
//                 />
//               </div>

//               {/* Editor */}
//               <div className="py-3">
//                 <JoditEditor
//                   value={body}
//                   config={config}
//                   onBlur={(content) => setBody(content)}
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Footer */}
//           <div
//             className="
//               flex
//               items-center
//               justify-between
//               border-t
//               border-gray-200
//               px-3
//               py-3
//               sm:px-4
//             "
//           >
//             <button
//               type="button"
//               onClick={handleSend}
//               className="
//                 flex
//                 items-center
//                 gap-2
//                 rounded-full
//                 bg-blue-600
//                 px-5
//                 py-2
//                 text-sm
//                 font-medium
//                 text-white
//                 hover:bg-blue-700
//               "
//             >
//               <FiSend size={15} />
//               Send
//             </button>

//             <button
//               type="button"
//               onClick={onClose}
//               className="
//                 flex
//                 h-9
//                 w-9
//                 items-center
//                 justify-center
//                 rounded-lg
//                 text-gray-500
//                 hover:bg-red-50
//                 hover:text-red-500
//               "
//             >
//               <FiTrash2 size={17} />
//             </button>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }

// export default ComposeEmail;
