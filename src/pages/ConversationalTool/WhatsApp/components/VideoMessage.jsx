import React from "react";

const VideoMessage = ({ src, caption, isMe }) => {
  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-2`}>
      <div
        className={`max-w-xs rounded-xl overflow-hidden shadow ${
          isMe ? "bg-green-100" : "bg-white"
        }`}
      >
        {/* Video */}
        <video
          src={src}
          controls
          autoPlay
          className="w-full h-auto max-h-64 object-cover"
        />

        {/* Caption (optional) */}
        {caption && <div className="p-2 text-sm text-gray-800">{caption}</div>}
      </div>
    </div>
  );
};

export default VideoMessage;
