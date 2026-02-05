import { faCheckDouble } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useRef } from "react";
import { useContext } from "react";
import AuthContext from "../../Context/AuthProvider";
import "../../Style/WhatsAppComingSoon.css";
function formatTimestamp(timestamp) {
  const createdDate = new Date(timestamp);
  const formattedDate = createdDate.toLocaleString(); // Adjust the format as needed
  return formattedDate;
}

function Messaging({ messages }) {
  // console.log(messages);
  const { watiCred } = useContext(AuthContext);
  const messagesContainerRef = useRef();
  useEffect(() => {
    // Scroll to the bottom when messages change
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    // Ensure the ref and container exist
    if (messagesContainerRef.current) {
      // Scroll to the bottom
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };
  const senderStyle = {
    width: "auto",
    border: "2px solid #ccc",
    borderRadius: "20px 20px 0 20px", // Scooped corners for sender
    padding: "10px",
    marginBottom: "10px",
    background: "#dcf8c6",
    color: "black",
  };

  const receiverStyle = {
    width: "auto",
    border: "2px solid #ccc",
    borderRadius: "20px 20px 20px 0", // Scooped corners for receiver
    padding: "10px",
    marginBottom: "10px",
    background: "#ece5dd",
  };

  const notifStyle = {
    flexDirection: "column",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "60%",
    border: "2px solid #ccc", // Green border color
    borderRadius: "10px",
    padding: "10px",
    marginBottom: "10px",
    color: "white",
  };

  return (
    <div
      className="whatsapp_bg_image"
      ref={messagesContainerRef}
      style={{
        position: "relative",
        height: "34rem",
        overflow: "hidden",
        overflowY: "scroll",
        padding: "10px",
        // background:"red"
        // color:"white"
      }}
    >
      {messages &&
        messages.length > 0 &&
        messages
          .slice()
          .reverse()
          .map((prop, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                margin: "5px",
                justifyContent:
                  prop.owner === true
                    ? "flex-end"
                    : prop.owner === false
                    ? "flex-start"
                    : "center",
              }}
            >
              {prop.statusString === "DELIVERED" && prop.text !== undefined ? (
                <div style={senderStyle}>
                  {prop.type === "text" ? (
                    prop.text
                  ) : prop.type === "image" ? (
                    <img
                      width="200px"
                      height="300px"
                      src={`${watiCred.tenantId}/api/file/showFile?fileName=${prop.data}&token=${watiCred.watiAccessToken}`}
                    />
                  ) : prop.type === "video" ? (
                    <video
                      width="200px"
                      height="300px"
                      controls
                      src={`${watiCred.tenantId}/api/file/showFile?fileName=${prop.data}&token=${watiCred.watiAccessToken}`}
                    />
                  ) : prop.type === "sticker" ? (
                    <img
                      width="200px"
                      height="200px"
                      src={`${watiCred.tenantId}/api/file/showFile?fileName=${prop.data}&token=${watiCred.watiAccessToken}`}
                    />
                  ) : (
                    ""
                  )}
                  <div>
                    <FontAwesomeIcon
                      style={{ color: "grey" }}
                      icon={faCheckDouble}
                    />
                    {formatTimestamp(prop.created)}
                  </div>
                </div>
              ) : prop.statusString === "DELIVERED" &&
                prop.finalText !== undefined ? (
                <div style={senderStyle}>
                  {prop.finalText}
                  <div>
                    <FontAwesomeIcon
                      style={{ color: "grey" }}
                      icon={faCheckDouble}
                    />
                    {formatTimestamp(prop.created)}
                  </div>
                </div>
              ) : prop.statusString === "READ" && prop.text !== undefined ? (
                <div style={senderStyle}>
                  {prop.type === "text" ? (
                    prop.text
                  ) : prop.type === "image" ? (
                    <img
                      width="200px"
                      height="300px"
                      src={`${watiCred.tenantId}/api/file/showFile?fileName=${prop.data}&token=${watiCred.watiAccessToken}`}
                    />
                  ) : prop.type === "video" ? (
                    <video
                      width="200px"
                      height="300px"
                      controls
                      src={`${watiCred.tenantId}/api/file/showFile?fileName=${prop.data}&token=${watiCred.watiAccessToken}`}
                    />
                  ) : prop.type === "sticker" ? (
                    <img
                      width="200px"
                      height="200px"
                      src={`${watiCred.tenantId}/api/file/showFile?fileName=${prop.data}&token=${watiCred.watiAccessToken}`}
                    />
                  ) : (
                    ""
                  )}
                  <div>
                    <FontAwesomeIcon
                      style={{ color: "blue" }}
                      icon={faCheckDouble}
                    />
                    {formatTimestamp(prop.created)}
                  </div>
                </div>
              ) : prop.statusString === "READ" &&
                prop.finalText !== undefined ? (
                <div style={senderStyle}>
                  {" "}
                  {prop.finalText}
                  <div>
                    <FontAwesomeIcon
                      style={{ color: "blue" }}
                      icon={faCheckDouble}
                    />
                    {formatTimestamp(prop.created)}
                  </div>
                </div>
              ) : prop.statusString === "SENT" && prop.owner === false ? (
                <div style={receiverStyle}>
                  {prop.type === "text" ? (
                    prop.text
                  ) : prop.type === "image" ? (
                    <img
                      width="200px"
                      height="300px"
                      src={`${watiCred.tenantId}/api/file/showFile?fileName=${prop.data}&token=${watiCred.watiAccessToken}`}
                    />
                  ) : prop.type === "video" ? (
                    <video
                      width="200px"
                      height="300px"
                      controls
                      src={`${watiCred.tenantId}/api/file/showFile?fileName=${prop.data}&token=${watiCred.watiAccessToken}`}
                    />
                  ) : prop.type === "sticker" ? (
                    <img
                      width="200px"
                      height="200px"
                      src={`${watiCred.tenantId}/api/file/showFile?fileName=${prop.data}&token=${watiCred.watiAccessToken}`}
                    />
                  ) : (
                    ""
                  )}
                  <div>{formatTimestamp(prop.created)}</div>
                </div>
              ) : prop.statusString === "SENT" && prop.owner === true ? (
                <div style={senderStyle}>
                  {prop.type === "text" ? (
                    prop.text
                  ) : prop.type === "image" ? (
                    <img
                      width="200px"
                      height="300px"
                      src={`${watiCred.tenantId}/api/file/showFile?fileName=${prop.data}&token=${watiCred.watiAccessToken}`}
                    />
                  ) : prop.type === "video" ? (
                    <video
                      width="200px"
                      height="300px"
                      controls
                      src={`${watiCred.tenantId}/api/file/showFile?fileName=${prop.data}&token=${watiCred.watiAccessToken}`}
                    />
                  ) : prop.type === "sticker" ? (
                    <img
                      width="200px"
                      height="200px"
                      src={`${watiCred.tenantId}/api/file/showFile?fileName=${prop.data}&token=${watiCred.watiAccessToken}`}
                    />
                  ) : (
                    ""
                  )}
                  <div>{formatTimestamp(prop.created)}</div>
                </div>
              ) : (
                <div style={notifStyle}>
                  {prop.eventDescription}
                  <div>{formatTimestamp(prop.created)}</div>
                </div>
              )}
            </div>
          ))}
    </div>
  );
}

export default Messaging;
