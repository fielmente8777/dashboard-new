import React, { useState, useContext, useEffect } from "react";
import "../../Style/WhatsAppComingSoon.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserCircle,
  faPaperPlane,
  faArrowUp,
} from "@fortawesome/free-solid-svg-icons";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";

import WatiChat from "./WatiChatMain";
import AuthContext from "../../Context/AuthProvider";
import { toast } from "react-toastify";

function Sender({ contact }) {
  useEffect(() => {
    setSendTemplate(false);
    setSelectedTemplate("Select Template");
    FetchTemplateMessagesWati();
    setBroadCastName("");
  }, [contact]);
  const {
    SendWatiSessionMessage,
    templateMessagesWati,
    FetchTemplateMessagesWati,
    watiSelectedContact,
    sendTemplateMessageWati,
  } = useContext(AuthContext);
  const [sendtemplate, setSendTemplate] = useState(false);
  const [broadCastName, setBroadCastName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("Select Template");
  const [message, setMessage] = useState("");
  const handleSendMessageWati = () => {
    if (message && contact.wAid) {
      SendWatiSessionMessage(message, contact.wAid);
      setMessage("");
    }
  };

  const handleSendTempalteMessageWati = async () => {
    if (selectedTemplate === "Select Template" || broadCastName === "") {
      alert("Enter required values");
      return;
    }
    const data = {
      parameters: watiSelectedContact.customParams,
      broadcast_name: broadCastName,
      template_name: selectedTemplate,
    };
    const prop = {
      body: data,
      phoneNumber: watiSelectedContact.wAid,
    };

    const resp = await sendTemplateMessageWati(prop);
    if (resp) {
      toast.success("Message sent successfully");
    } else {
      toast.error("Some error occured");
    }
    setSendTemplate(false);
  };
  const nameStyle = {
    fontWeight: "bold",
    fontSize: "1.2rem",
    marginBottom: "5px",
  };

  const wAidStyle = {
    color: "#888",
  };

  const imageStyle = {
    width: "60px",
    height: "60px",
    marginRight: "10px",
  };

  return sendtemplate ? (
    <div
      style={{
        height: "8rem",
        width: "55.8rem",
        position: "absolute",
        overflowY: "auto",
        backgroundColor: "red",
        top: "46rem",
        zIndex: 100, // Ensure it appears above the content of the div above
      }}
    >
      <div
        style={{
          position: "sticky",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          top: 0,
          backgroundColor: "white",
        }}
      >
        <div>Send Template Message</div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <div>
            <button
              style={{
                height: "2rem",
                display: "flex",
                alignContent: "center",
                justifyContent: "center",
                alignItems: "center",
              }}
              type="button"
              class="btn btn-success"
              onClick={() => handleSendTempalteMessageWati()}
            >
              Send
            </button>
          </div>
          <div>
            <button
              style={{
                height: "2rem",
                display: "flex",
                alignContent: "center",
                justifyContent: "center",
                alignItems: "center",
              }}
              type="button"
              class="btn btn-danger"
              onClick={() => setSendTemplate(false)}
            >
              Close
            </button>
          </div>
        </div>
      </div>
      <div
        style={{
          overflowY: "auto",
          height: "calc(100% - 2rem)",
          paddingTop: "1rem",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-evenly" }}>
          <div>
            <div>Template Name</div>
            <DropdownButton id="dropdown-basic-button" title={selectedTemplate}>
              {templateMessagesWati.map((val, idx) =>
                val.status === "APPROVED" ? (
                  <Dropdown.Item
                    onClick={() => setSelectedTemplate(val.elementName)}
                  >
                    {val.elementName}
                  </Dropdown.Item>
                ) : (
                  <></>
                )
              )}
            </DropdownButton>
          </div>

          <div>
            <div>BroadCastName</div>
            <input
              value={broadCastName}
              onChange={(e) => setBroadCastName(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div>
      <div className="input-group mb-3">
        <textarea
          className="form-control"
          placeholder="Send Message"
          aria-label="Recipient's username"
          aria-describedby="basic-addon2"
          style={{ resize: "none" }}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <div className="input-group-append">
          <button
            className="btn btn-outline-secondary"
            type="button"
            onClick={handleSendMessageWati}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="50"
              height="50"
            >
              <path fill="none" d="M0 0h24v24H0z" />
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
        <div className="input-group-append">
          <button
            className="btn btn-outline-secondary"
            type="button"
            style={{ height: "4rem", width: "5rem" }}
            onClick={() => setSendTemplate(true)}
          >
            <FontAwesomeIcon icon={faArrowUp} />{" "}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Sender;
