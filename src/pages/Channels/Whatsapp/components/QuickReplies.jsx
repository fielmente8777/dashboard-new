import React, { useState, useRef, useEffect } from "react";
import {
  Plus,
  Search,
  Image as ImageIcon,
  Video as VideoIcon,
  FileText,
  MessageSquare,
  Upload,
  Edit,
  Trash2,
  X,
  Paperclip,
} from "lucide-react";
import { NEW_BASE_URL } from "../../../../data/constant";
import { useToast } from "../../../../context/ToastContext";
import Loader from "../../../../components/Loader";
import { useConfirm } from "../../../../context/ConfirmContext";

/**
 * WhatsApp limits (used for client-side validation before upload):
 * image  -> 5 MB   (jpg/png/webp)
 * video  -> 16 MB  (mp4/3gp)
 * document -> 100 MB (pdf/doc/docx/xls/xlsx/ppt/pptx)
 * caption/text -> 1024 chars when attached to media, 4096 for text-only
 */
const LIMITS = {
  image: {
    max: 5 * 1024 * 1024,
    accept: "image/jpeg,image/png,image/PNG, image/jpg",
    label: "5MB per image",
  },
  video: { max: 10 * 1024 * 1024, accept: "video/*", label: "10MB per video" },
  document: {
    max: 5 * 1024 * 1024,
    accept: ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx",
    label: "5MB per document",
  },
};

const emptyForm = () => ({
  id: null,
  title: "",
  text: "",
  images: [],
  videos: [],
  documents: [],
});

const fileId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const formatBytes = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const seedReplies = [
  {
    id: 1,
    title: "Welcome",
    text: "Hello 👋 Welcome to Eazotel! Here's a quick look at our property.",
    images: [
      { id: "seed-1", name: "lobby.jpg", size: 812000, url: null },
      { id: "seed-2", name: "room-101.jpg", size: 640000, url: null },
    ],
    videos: [],
    documents: [{ id: "seed-3", name: "brochure.pdf", size: 2_400_000 }],
  },
  {
    id: 2,
    title: "Booking Confirmation",
    text: "Your booking is confirmed. See attached voucher and directions video.",
    images: [],
    videos: [{ id: "seed-4", name: "directions.mp4", size: 9_400_000 }],
    documents: [{ id: "seed-5", name: "voucher.pdf", size: 340000 }],
  },
];

const AttachmentThumb = ({ file, kind, onRemove }) => (
  <div className="relative group flex items-center gap-2 border rounded-lg p-2 pr-3 bg-white">
    <div className="w-9 h-9 rounded-md bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
      {kind === "image" && file.url ? (
        <img
          src={file.url}
          alt={file.name}
          className="w-full h-full object-cover"
        />
      ) : kind === "image" ? (
        <ImageIcon size={16} className="text-gray-400" />
      ) : kind === "video" ? (
        <VideoIcon size={16} className="text-gray-400" />
      ) : (
        <FileText size={16} className="text-gray-400" />
      )}
    </div>
    <div className="min-w-0">
      <p className="text-sm font-medium truncate max-w-[140px]">{file.name}</p>
      <p className="text-xs text-gray-400">{formatBytes(file.size)}</p>
    </div>
    {onRemove && (
      <button
        onClick={onRemove}
        className="absolute -top-2 -right-2 bg-white border rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Remove"
      >
        <X size={14} className="text-red-500" />
      </button>
    )}
  </div>
);

const UploadZone = ({ kind, onFiles }) => {
  const inputRef = useRef(null);
  const { accept, label } = LIMITS[kind];
  const icon =
    kind === "image" ? (
      <ImageIcon size={18} />
    ) : kind === "video" ? (
      <VideoIcon size={18} />
    ) : (
      <FileText size={18} />
    );

  const handleChange = (e) => {
    const files = Array.from(e.target.files || []);
    onFiles(files);
    e.target.value = "";
  };

  return (
    <div>
      <button
        onClick={() => inputRef.current?.click()}
        className="w-full border-2 border-dashed rounded-lg p-4 flex items-center justify-center gap-2 text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
      >
        {icon}
        <span className="text-sm font-medium">Add {kind}</span>
        <span className="text-xs text-gray-400">({label})</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        hidden
        accept={accept}
        onChange={handleChange}
      />
    </div>
  );
};

const QuickReplies = () => {
  const { confirm } = useConfirm();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("list");
  const [replies, setReplies] = useState([]);
  const [form, setForm] = useState(emptyForm());
  const [search, setSearch] = useState("");
  const [fileError, setFileError] = useState("");

  const [creating, setCreating] = useState(false);

  const totalAttachments = (r) =>
    r.images.length + r.videos.length + r.documents.length;

  const startCreate = () => {
    setForm(emptyForm());
    setFileError("");
    setActiveTab("create");
  };

  const startEdit = (reply) => {
    setForm({ ...reply });
    setFileError("");
    setActiveTab("create");
  };

  const removeReply = async (id) => {
    const isConfirmed = await confirm(
      `Are you sure you want to delete this quick reply`,
    );

    if (!isConfirmed) return;

    try {
      const response = await fetch(
        `${NEW_BASE_URL}/api/v1/quick-reply/${id}?hid=${localStorage.getItem("hid")}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      const data = await response.json();

      if (data?.success) {
        showToast({
          message: data?.responseMessage || "Quick reply deleted successfully",
          type: "success",
        });

        // setReplies((prev) => prev.filter((r) => r._id !== id));
        return;
      }

      showToast({
        message: data?.responseMessage || "Failed to delete quick reply",
        type: "error",
      });
    } catch (error) {
      showToast({
        message: error?.message || "Failed to delete quick reply",
        type: "error",
      });
    }
  };

  const addFiles = (kind, incoming) => {
    const { max } = LIMITS[kind];
    const key =
      kind === "image" ? "images" : kind === "video" ? "videos" : "documents";
    const tooBig = incoming.filter((f) => f.size > max);
    const ok = incoming.filter((f) => f.size <= max);

    if (tooBig.length) {
      setFileError(
        `${tooBig.map((f) => f.name).join(", ")} exceed${tooBig.length === 1 ? "s" : ""} the ${LIMITS[kind].label} limit and was skipped.`,
      );
    } else {
      setFileError("");
    }

    const mapped = ok.map((f) => ({
      id: fileId(),
      name: f.name,
      size: f.size,
      file: f,
      url: kind === "image" ? URL.createObjectURL(f) : undefined,
    }));

    setForm((prev) => ({ ...prev, [key]: [...prev[key], ...mapped] }));
  };

  const removeFile = (kind, id) => {
    const key =
      kind === "image" ? "images" : kind === "video" ? "videos" : "documents";
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].filter((f) => f.id !== id),
    }));
  };

  const charLimit =
    form.images.length + form.videos.length + form.documents.length > 0
      ? 1024
      : 4096;

  const canSave =
    form.title.trim().length > 0 &&
    (form.text.trim().length > 0 || totalAttachments(form) > 0);

  const handleSave = async () => {
    if (!canSave) return;
    setCreating(true);

    try {
      const payload = new FormData();

      payload.append("title", form.title);
      payload.append("text", form.text);

      [...form.images, ...form.videos, ...form.documents].forEach((item) => {
        payload.append("file", item.file);
      });

      // let type = "";

      // if (form.images.length > 0) {
      //   type = "image";

      //   form.images.forEach((img) => {
      //     payload.append("file", img.file);
      //   });
      // } else if (form.videos.length > 0) {
      //   type = "video";

      //   form.videos.forEach((video) => {
      //     payload.append("file", video.file);
      //   });
      // } else if (form.documents.length > 0) {
      //   type = "document";

      //   form.documents.forEach((doc) => {
      //     payload.append("file", doc.file);
      //   });
      // }

      // payload.append("type", type);
      payload.append("shortcut", form.shortcut || "");

      const response = await fetch(
        `${NEW_BASE_URL}/api/v1/quick-reply?hid=${localStorage.getItem("hid")}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: payload,
        },
      );

      const data = await response.json();
      console.log(data);
      if (data?.success) {
        showToast({
          message: data?.message || "Reply created successfully",
          type: "success",
        });

        return;
      }

      showToast({
        message: data?.responseMessage || "Failed to create reply",
        type: "error",
      });
    } catch (error) {
      console.log(error);
      showToast("error", error?.message || "Failed to create reply");
    } finally {
      setCreating(false);
    }
  };

  // const handleSave = async () => {
  //   if (!canSave) return;
  //   // if (form.id) {
  //   //   setReplies((prev) =>
  //   //     prev.map((r) => (r.id === form.id ? { ...form } : r)),
  //   //   );
  //   // } else {
  //   //   setReplies((prev) => [...prev, { ...form, id: Date.now() }]);
  //   // }

  //   console.log(form);

  //   const payload = new FormData();
  //   payload.append("title", form.title);
  //   payload.append("text", form.text);

  //   // const testPayload = {
  //   //   title:"",
  //   //   type:"img",
  //   //   media:[],
  //   //   text:""
  //   // }

  //   // console.log()
  //   // payload.append("type", img.file);
  //   form.images.forEach((img) => payload.append("file", img.file));
  //   // form.videos.forEach((vid) => payload.append("file", vid.file));
  //   // form.documents.forEach((doc) => payload.append("file", doc.file));

  //   const response = await fetch(
  //     `${NEW_BASE_URL}/api/v1/quick-reply?hid=${localStorage.getItem("hid")}`,
  //     {
  //       method: "POST",
  //       headers: {
  //         Authorization: `Bearer ${localStorage.getItem("token")}`,
  //       },
  //       body: payload,
  //     },
  //   );

  //   console.log(response);

  //   // axios.post("/api/quick-replies", payload, {
  //   //   headers: { "Content-Type": "multipart/form-data" },
  //   // });

  //   // setActiveTab("list");
  // };

  const fetchReplies = async () => {
    const response = await fetch(
      `${NEW_BASE_URL}/api/v1/quick-reply?hid=${localStorage.getItem("hid")}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    const data = await response.json();

    if (data?.success) {
      setReplies(data?.result?.docs);
    }
  };

  useEffect(() => {
    fetchReplies();
  }, []);

  // const filteredReplies = replies.filter((r) =>
  //   r.title.toLowerCase().includes(search.toLowerCase()),
  // );

  return (
    <div className="py-4 ">
      <div className="bg-white">
        {/* Header */}
        <div className="flex justify-between items-center border-b p-5">
          <div>
            <h2 className="text-xl font-bold">Quick Replies</h2>
            <p className="text-gray-500 text-sm">
              Build reusable templates with text, images, videos and documents
            </p>
          </div>

          <button
            onClick={startCreate}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-lg hover:bg-primary/90 transition"
          >
            <Plus size={18} />
            New Reply
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("list")}
            className={`px-6 py-3 ${
              activeTab === "list"
                ? "border-b-2 border-blue-600 font-semibold text-blue-600"
                : "text-gray-500"
            }`}
          >
            Existing Replies
          </button>
          <button
            onClick={() => setActiveTab("create")}
            className={`px-6 py-3 ${
              activeTab === "create"
                ? "border-b-2 border-blue-600 font-semibold text-blue-600"
                : "text-gray-500"
            }`}
          >
            {form.id ? "Edit Reply" : "Create Reply"}
          </button>
        </div>

        {/* Existing Replies */}
        {activeTab === "list" && (
          <div className="p-6">
            <div className="relative mb-5">
              <Search
                className="absolute left-3 top-3 text-gray-400"
                size={18}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search replies..."
                className="w-full border rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {replies.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                No quick replies yet. Create one to get started.
              </div>
            ) : (
              <div className="space-y-4">
                {replies &&
                  replies.length > 0 &&
                  replies?.map((item) => {
                    const textItem = item.items?.find((i) => i.type === "text");

                    const mediaItem = item.items.find((i) =>
                      ["image", "video", "document"].includes(i.type),
                    );

                    const mediaCount = mediaItem?.media?.length || 0;

                    return (
                      <div key={item._id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start gap-4">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold">{item.title}</h3>

                            {textItem?.text && (
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {textItem.text}
                              </p>
                            )}

                            {mediaItem && (
                              <div className="flex flex-wrap gap-2 mt-3">
                                {mediaItem.type === "image" && (
                                  <span className="flex items-center gap-1 text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full">
                                    <ImageIcon size={12} />
                                    {mediaCount} Image
                                    {mediaCount > 1 ? "s" : ""}
                                  </span>
                                )}

                                {mediaItem.type === "video" && (
                                  <span className="flex items-center gap-1 text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded-full">
                                    <VideoIcon size={12} />
                                    {mediaCount} Video
                                    {mediaCount > 1 ? "s" : ""}
                                  </span>
                                )}

                                {mediaItem.type === "document" && (
                                  <span className="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full">
                                    <FileText size={12} />
                                    {mediaCount} Document
                                    {mediaCount > 1 ? "s" : ""}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2 shrink-0">
                            {/* <button
                              onClick={() => startEdit(item)}
                              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button> */}

                            <button
                              onClick={() => removeReply(item._id)}
                              className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            {/* {filteredReplies.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                No quick replies yet. Create one to get started.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReplies.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="min-w-0">
                        <h3 className="font-semibold">{item.title}</h3>
                        {item.text && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {item.text}
                          </p>
                        )}

                        {totalAttachments(item) > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {item.images.length > 0 && (
                              <span className="flex items-center gap-1 text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full">
                                <ImageIcon size={12} /> {item.images.length}{" "}
                                image
                                {item.images.length > 1 ? "s" : ""}
                              </span>
                            )}
                            {item.videos.length > 0 && (
                              <span className="flex items-center gap-1 text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded-full">
                                <VideoIcon size={12} /> {item.videos.length}{" "}
                                video
                                {item.videos.length > 1 ? "s" : ""}
                              </span>
                            )}
                            {item.documents.length > 0 && (
                              <span className="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full">
                                <FileText size={12} /> {item.documents.length}{" "}
                                doc
                                {item.documents.length > 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => startEdit(item)}
                          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => removeReply(item.id)}
                          className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )} */}
          </div>
        )}

        {/* Create / Edit */}
        {activeTab === "create" && (
          <div className="p-6 space-y-6">
            <div>
              <label className="block mb-2 font-medium">Reply Name</label>
              <input
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Welcome Message"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="font-medium">Message text</label>
                <span
                  className={`text-xs ${
                    form.text.length > charLimit
                      ? "text-red-500"
                      : "text-gray-400"
                  }`}
                >
                  {form.text.length}/{charLimit}
                </span>
              </div>
              <textarea
                rows={4}
                maxLength={charLimit}
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type your quick reply... (sent as a caption if attachments are included)"
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Paperclip size={16} className="text-gray-400" />
                <label className="font-medium">Attachments</label>
                <span className="text-xs text-gray-400">
                  Mix and match — this reply will send as{" "}
                  {Math.max(1, totalAttachments(form))} message
                  {totalAttachments(form) > 1 ? "s" : ""} on WhatsApp
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <UploadZone
                  kind="image"
                  onFiles={(f) => addFiles("image", f)}
                />
                <UploadZone
                  kind="video"
                  onFiles={(f) => addFiles("video", f)}
                />
                <UploadZone
                  kind="document"
                  onFiles={(f) => addFiles("document", f)}
                />
              </div>

              {fileError && (
                <p className="text-sm text-red-500 mb-3">{fileError}</p>
              )}

              {totalAttachments(form) > 0 && (
                <div className="space-y-3">
                  {form.images.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {form.images.map((f) => (
                        <AttachmentThumb
                          key={f.id}
                          file={f}
                          kind="image"
                          onRemove={() => removeFile("image", f.id)}
                        />
                      ))}
                    </div>
                  )}
                  {form.videos.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {form.videos.map((f) => (
                        <AttachmentThumb
                          key={f.id}
                          file={f}
                          kind="video"
                          onRemove={() => removeFile("video", f.id)}
                        />
                      ))}
                    </div>
                  )}
                  {form.documents.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {form.documents.map((f) => (
                        <AttachmentThumb
                          key={f.id}
                          file={f}
                          kind="document"
                          onRemove={() => removeFile("document", f.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t">
              <button
                onClick={() => setActiveTab("list")}
                className="px-5 py-3 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!canSave || creating}
                className="bg-primary/80 text-white px-6 py-3 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary flex items-center gap-1.5"
              >
                Save Reply {creating && <Loader size={22} color="#fefefe" />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickReplies;
