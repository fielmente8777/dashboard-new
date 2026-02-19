import React, { useEffect, useRef, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { formatDateTime } from "../../services/formateDate";
import { getWhatsappConversationMessages } from "../../services/api/whatsApp";
import { MessageSkeleton } from "../Skeltons/WhatsappChatSkelton";
import { NEW_BASE_URL } from "../../data/constant";
import { BsCheckAll } from "react-icons/bs";

const WhatsAppLeadPopup = ({
  isOpen,
  onClose,
  lead,
  onAddNote,
  onEditNote,
}) => {
  const bottomRef = useRef(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    setShowAdd(false);
    setEditId(null);
  }, [lead]);

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    onAddNote?.(newNote);
    setNewNote("");
    setShowAdd(false);
  };

  const handleSaveEdit = () => {
    onEditNote?.(editId, editText);
    setEditId(null);
    setEditText("");
  };

  const loadMessages = async (conversationId) => {
    setLoadingMessages(true);
    try {
      const response = await getWhatsappConversationMessages(conversationId);
      // setMessageList(response?.result?.messages)

      if (response?.success && response?.responseStatusCode === 200) {
        setMessageList(response?.result?.messages);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (lead?.conversationId) {
      loadMessages(lead?.conversationId);
    }
  }, [lead?.conversationId]);

  if (!isOpen || !lead) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-center items-center">
      <div className="bg-white w-full max-w-5xl rounded-lg shadow-lg relative">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <div className="flex gap-3">
            <button className="bg-[#0a3a75] text-white px-4 py-2 rounded">
              All Details
            </button>
            {/* <button className="text-gray-500">Call Details</button> */}
          </div>
          <button
            onClick={onClose}
            className="text-2xl font-semibold text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="grid grid-cols-2 gap-6 p-6 divide-x divide-red-500">
          {/* LEFT PANEL */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Customer Info</h3>

            <div className="space-y-2 text-sm">
              <p>
                <b>Name:</b> {lead.name || "-"}
              </p>
              <p>
                <b>Mobile Number:</b> +{lead.phone}
              </p>
              <p>
                <b>Source:</b> WhatsApp
              </p>
              <p className="text-gray-500">
                Created At: {formatDateTime(lead.createdAt)}
              </p>
            </div>

            {/* NOTES */}
            <div className="mt-6">
              <h4 className="font-semibold mb-3">Notes</h4>

              {/* Add Activity */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  onClick={() => setShowAdd(true)}
                  className="w-9 h-9 rounded-full border flex items-center justify-center cursor-pointer"
                >
                  <FaPlus className="text-teal-600" />
                </div>
                <span
                  onClick={() => setShowAdd(true)}
                  className="text-teal-600 font-medium cursor-pointer"
                >
                  Add Activity
                </span>
              </div>

              {showAdd && (
                <div className="mb-4">
                  <textarea
                    className="w-full border rounded p-2 text-sm"
                    placeholder="Write a note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleAddNote}
                      className="bg-green-600 text-white px-4 py-1 rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setShowAdd(false)}
                      className="border px-4 py-1 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Notes Timeline */}
              <div className="space-y-4">
                {lead.notes?.length > 0 ? (
                  lead.notes.map((note) => (
                    <div key={note._id} className="flex gap-3">
                      <span className="mt-1 w-3 h-3 bg-teal-500 rounded-full"></span>

                      <div className="flex-1">
                        {editId === note._id ? (
                          <>
                            <textarea
                              className="w-full border rounded p-2 text-sm"
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                            />
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={handleSaveEdit}
                                className="bg-green-600 text-white px-3 py-1 rounded"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditId(null)}
                                className="border px-3 py-1 rounded"
                              >
                                Cancel
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <p
                              className="text-sm cursor-pointer"
                              onClick={() => {
                                setEditId(note._id);
                                setEditText(note.text);
                              }}
                            >
                              {note?.message}
                            </p>
                            <span className="text-xs text-gray-500">
                              {formatDateTime(note?.createdAt)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400">No activity yet</p>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="shadow-sm">
            <h3 className="font-semibold text-lg mb-3">
              WhatsApp Conversation
            </h3>

            <div
              style={{
                backgroundImage:
                  "url('https://www.transparenttextures.com/patterns/cubes.png')",
              }}
              className="h-80 p-6 overflow-y-auto scrollbar-hidden "
            >
              {loadingMessages ? (
                <div className="space-y-4">
                  <MessageSkeleton align="left" />
                  <MessageSkeleton align="right" />
                </div>
              ) : (
                <>
                  {messageList?.length > 0 ? (
                    messageList.map((message, index) => {
                      const isMe = message.sender === "me";

                      return (
                        <div
                          key={index}
                          className={`flex ${isMe ? "justify-end" : "justify-start"} mb-2`}
                        >
                          <div
                            className={`max-w-xs  px-3 py-2 ${
                              isMe
                                ? "rounded-tl-xl border rounded-br-xl rounded-bl-lg bg-white"
                                : "bg-white border rounded-tr-xl rounded-br-lg rounded-bl-xl text-gray-700"
                            }`}
                          >
                            {/* TEXT */}
                            {message.messageType === "text" && message.body && (
                              <p className="text-sm whitespace-pre-wrap bg-white">
                                {message.body}
                              </p>
                            )}

                            {message.messageType === "template" &&
                              message.template.name && (
                                <div className="bg-green-100 px-4 py-2 rounded-lg max-w-xs">
                                  <p className="text-xs text-gray-500 mb-1 capitalize">
                                    {message.template?.name}
                                  </p>

                                  <p className="text-sm">
                                    {message.body ? (
                                      message.body
                                    ) : (
                                      <span className="text-xs text-zinc-400">
                                        No text defined
                                      </span>
                                    )}
                                  </p>
                                </div>
                              )}

                            {/* IMAGE */}
                            {message.messageType && message.media?.id && (
                              <img
                                src={`${NEW_BASE_URL}/api/v1/whatsapp/media/${message.media.id}?ndid=${localStorage.getItem("ndid")}`}
                                alt="WhatsApp"
                                className="mt-2 rounded-lg w-full"
                              />
                            )}

                            <div className="flex justify-end px-2 mt-1">
                              <div className="flex items-center gap-1.5">
                                <div className="text-[10px] text-right mt-1 opacity-70">
                                  {new Date(
                                    message.createdAt,
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </div>

                                {isMe && (
                                  <span className="text-xs flex justify-end mt-0.5">
                                    {message.status === "sent" && <BsCheckLg />}
                                    {message.status === "delivered" && (
                                      <BsCheckAll size={18} />
                                    )}{" "}
                                    {message.status === "read" && (
                                      <span className="text-blue-400">
                                        <BsCheckAll size={18} />
                                      </span>
                                    )}{" "}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-center text-gray-400">
                      No conversation yet
                    </p>
                  )}
                  <div ref={bottomRef} />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t">
          <button className="bg-red-700 text-white px-4 py-2 rounded">
            Delete
          </button>
          <button
            onClick={onClose}
            className="bg-[#0a3a75] text-white px-4 py-2 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppLeadPopup;
