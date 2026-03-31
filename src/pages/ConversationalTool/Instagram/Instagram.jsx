import React, { useState } from "react";
import FlowBuilder from "../../../components/WhatsappFlow/FlowBuilder";
import axios from "axios";

const Instagram = () => {

  const [number, setNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const startCall = async () => {
    try {
      setLoading(true);

      // 🎤 Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // 🌐 Create WebRTC connection
      const pc = new RTCPeerConnection();

      // Add audio tracks
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // Create SDP offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      console.log("SDP Offer created:", offer.sdp);
      // 📡 Send SDP to backend
      const res = await axios.post(`http://localhost:8000/api/v1/whatsapp/make-call?ndid=${localStorage.getItem("ndid")}&hid=${localStorage.getItem("hid")}`,
        
        {
          to: number,
          sdp: offer.sdp,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        },

    );

      console.log("Call initiated:", res.data);

      // ⚠️ Next step (not implemented yet):
      // You need to handle ANSWER SDP from backend via webhook

    } catch (err) {
      console.error("Call error:", err);
      alert("Call failed");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="p-4">
      comming soon


       <h2>WhatsApp Call</h2>

      <input
        type="text"
        placeholder="+919528295631"
        value={number}
        onChange={(e) => setNumber(e.target.value)}
        style={{ padding: "10px", width: "250px", marginRight: "10px" }}
      />

      <button onClick={startCall} disabled={loading}>
        {loading ? "Calling..." : "Start Call"}
      </button>
    </div>
  );
};

export default Instagram;
