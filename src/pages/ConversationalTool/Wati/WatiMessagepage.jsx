import React, { useContext, useEffect } from "react";
import AuthContext from "../../Context/AuthProvider";
import "../../Style/WhatsAppComingSoon.css";
import Messaging from "./Messaging";
import ProfileNavbar from "./ProfileNavbar";
import Sender from "./Sender";
const watiMessageOfSelected = [
  {
    eventDescription:
      "Chat is now assigned to divyanshu@eazotel.com. Automation will not work unless it's assigned back to Bot",
    type: 1,
    actor: "divyanshu@eazotel.com",
    assignee: "divyanshu@eazotel.com",
    topicName: null,
    id: "65d8a959875e7f613593099a",
    created: "2024-02-23T14:19:05.033Z",
    conversationId: "65d5d368e224bf08bcdd5c9b",
    ticketId: "65d84b6cec3f1b73cf34098a",
    eventType: "ticket",
  },
  {
    replySourceMessage: null,
    messageReferral: null,
    text: "what ",
    type: "text",
    data: null,
    timestamp: "1708688786",
    owner: true,
    statusString: "READ",
    avatarUrl: null,
    assignedId: "65cc8805601e37c05d87a6bf",
    operatorName: null,
    localMessageId: null,
    failedDetail: "",
    referenceOrderId: null,
    contacts: null,
    messageProducts: null,
    orderProducts: null,
    interactiveData: null,
    orderDetailsViewModel: null,
    id: "65d885939a7171d6f4f93d23",
    created: "2024-02-23T11:46:26.453Z",
    conversationId: "65d5d368e224bf08bcdd5c9b",
    ticketId: "65d84b6cec3f1b73cf34098a",
    eventType: "message",
  },
  {
    replySourceMessage: null,
    messageReferral: null,
    text: "Testing with dv",
    type: "text",
    data: null,
    timestamp: "1708688734",
    owner: false,
    statusString: "SENT",
    avatarUrl: null,
    assignedId: null,
    operatorName: null,
    localMessageId: null,
    failedDetail: null,
    referenceOrderId: null,
    contacts: null,
    messageProducts: null,
    orderProducts: null,
    interactiveData: null,
    orderDetailsViewModel: null,
    id: "65d8855f283506e41731ad38",
    created: "2024-02-23T11:45:35.665Z",
    conversationId: "65d5d368e224bf08bcdd5c9b",
    ticketId: "65d84b6cec3f1b73cf34098a",
    eventType: "message",
  },
  {
    replySourceMessage: null,
    messageReferral: null,
    text: "testing",
    type: "text",
    data: null,
    timestamp: "1708673901",
    owner: true,
    statusString: "READ",
    avatarUrl: null,
    assignedId: "65cc8805601e37c05d87a6bf",
    operatorName: null,
    localMessageId: null,
    failedDetail: "",
    referenceOrderId: null,
    contacts: null,
    messageProducts: null,
    orderProducts: null,
    interactiveData: null,
    orderDetailsViewModel: null,
    id: "65d84b6e2116ec5235655cd5",
    created: "2024-02-23T07:38:21.532Z",
    conversationId: "65d5d368e224bf08bcdd5c9b",
    ticketId: "65d84b6cec3f1b73cf34098a",
    eventType: "message",
  },
  {
    eventDescription: "The ticket status has been set as Open by agent Bot",
    type: 1,
    actor: "Bot",
    assignee: "Bot",
    topicName: null,
    id: "65d84b6dec3f1b73cf34099a",
    created: "2024-02-23T07:38:21.35Z",
    conversationId: "65d5d368e224bf08bcdd5c9b",
    ticketId: "65d84b6cec3f1b73cf34098a",
    eventType: "ticket",
  },
  {
    replySourceMessage: null,
    messageReferral: null,
    text: "Test",
    type: "text",
    data: null,
    timestamp: "1708673899",
    owner: false,
    statusString: "SENT",
    avatarUrl: null,
    assignedId: null,
    operatorName: null,
    localMessageId: null,
    failedDetail: null,
    referenceOrderId: null,
    contacts: null,
    messageProducts: null,
    orderProducts: null,
    interactiveData: null,
    orderDetailsViewModel: null,
    id: "65d84b6cec3f1b73cf34098d",
    created: "2024-02-23T07:38:20.666Z",
    conversationId: "65d5d368e224bf08bcdd5c9b",
    ticketId: "65d84b6cec3f1b73cf34098a",
    eventType: "message",
  },
  {
    eventDescription:
      "The chat has been initialized by contact John (919140823654)",
    type: 0,
    actor: null,
    assignee: null,
    topicName: "General Enquiry",
    id: "65d84b6cec3f1b73cf34098b",
    created: "2024-02-23T07:38:20.639Z",
    conversationId: "65d5d368e224bf08bcdd5c9b",
    ticketId: "65d84b6cec3f1b73cf34098a",
    eventType: "ticket",
  },
  {
    eventDescription: "The chat has been closed by Bot",
    type: 2,
    actor: null,
    assignee: null,
    topicName: null,
    id: "65d726f9865775f3242c2271",
    created: "2024-02-22T10:50:33.67Z",
    conversationId: "65d5d368e224bf08bcdd5c9b",
    ticketId: "65d5d52e681ca9a09b7fc5a9",
    eventType: "ticket",
  },
  {
    replySourceMessage: null,
    messageReferral: null,
    text: "helllo",
    type: "text",
    data: null,
    timestamp: "1708512562",
    owner: true,
    statusString: "READ",
    avatarUrl: null,
    assignedId: "65cc8805601e37c05d87a6bf",
    operatorName: null,
    localMessageId: null,
    failedDetail: "",
    referenceOrderId: null,
    contacts: null,
    messageProducts: null,
    orderProducts: null,
    interactiveData: null,
    orderDetailsViewModel: null,
    id: "65d5d532a118601e0c471158",
    created: "2024-02-21T10:49:22.229Z",
    conversationId: "65d5d368e224bf08bcdd5c9b",
    ticketId: "65d5d52e681ca9a09b7fc5a9",
    eventType: "message",
  },
  {
    eventDescription: "The ticket status has been set as Open by agent Bot",
    type: 1,
    actor: "Bot",
    assignee: "Bot",
    topicName: null,
    id: "65d5d52e681ca9a09b7fc5b2",
    created: "2024-02-21T10:49:18.705Z",
    conversationId: "65d5d368e224bf08bcdd5c9b",
    ticketId: "65d5d52e681ca9a09b7fc5a9",
    eventType: "ticket",
  },
  {
    replySourceMessage: null,
    messageReferral: null,
    text: "Test",
    type: "text",
    data: null,
    timestamp: "1708512557",
    owner: false,
    statusString: "SENT",
    avatarUrl: null,
    assignedId: null,
    operatorName: null,
    localMessageId: null,
    failedDetail: null,
    referenceOrderId: null,
    contacts: null,
    messageProducts: null,
    orderProducts: null,
    interactiveData: null,
    orderDetailsViewModel: null,
    id: "65d5d52e681ca9a09b7fc5ac",
    created: "2024-02-21T10:49:18.626Z",
    conversationId: "65d5d368e224bf08bcdd5c9b",
    ticketId: "65d5d52e681ca9a09b7fc5a9",
    eventType: "message",
  },
  {
    eventDescription:
      "The chat has been initialized by contact John (919140823654)",
    type: 0,
    actor: null,
    assignee: null,
    topicName: "General Enquiry",
    id: "65d5d52e681ca9a09b7fc5aa",
    created: "2024-02-21T10:49:18.606Z",
    conversationId: "65d5d368e224bf08bcdd5c9b",
    ticketId: "65d5d52e681ca9a09b7fc5a9",
    eventType: "ticket",
  },
  {
    template: null,
    eventDescription:
      'Broadcast message with using "website_lead" template was received 21|02|2024',
    finalText:
      "I appreciate your interest in Eazotel a product by fielmente - a leading Hospitality Website Development Company based in Gurugram and London.\n\nWe understand the importance of a strong online presence and offer comprehensive website development, booking engine, hosting, email service, a dashboard to manage room rates and bookings\n\nWe appreciate you filling out our contact form. Please let us know your available time to schedule a call and take this journey ahead.\n\nThank you!",
    thumbnailProduct: null,
    mediaHeaderLink: null,
    statusString: "READ",
    failedDetail: "",
    localMessageId: null,
    id: "65d5d448e224bf08bcdd625b",
    created: "2024-02-21T10:45:28.579Z",
    conversationId: "65d5d368e224bf08bcdd5c9b",
    ticketId: null,
    eventType: "broadcastMessage",
  },
  {
    template: null,
    eventDescription:
      'Broadcast message with using "website_lead" template was received 21|02|2024',
    finalText:
      "I appreciate your interest in Eazotel a product by fielmente - a leading Hospitality Website Development Company based in Gurugram and London.\n\nWe understand the importance of a strong online presence and offer comprehensive website development, booking engine, hosting, email service, a dashboard to manage room rates and bookings\n\nWe appreciate you filling out our contact form. Please let us know your available time to schedule a call and take this journey ahead.\n\nThank you!",
    thumbnailProduct: null,
    mediaHeaderLink: null,
    statusString: "READ",
    failedDetail: "",
    localMessageId: null,
    id: "65d5d368681ca9a09b7fb889",
    created: "2024-02-21T10:41:44.754Z",
    conversationId: "65d5d368e224bf08bcdd5c9b",
    ticketId: null,
    eventType: "broadcastMessage",
  },
];
function WatiMessagePage() {
  const {
    setWatiSelectedContact,
    watiSelectedContact,
    watiSelectedContactMessage,
  } = useContext(AuthContext);
  useEffect(() => {
    setWatiSelectedContact(watiSelectedContact);
  }, [watiSelectedContact]);
  return (
    <>
      {watiSelectedContact === "None" ? (
        <>
          <div
            style={{
              height: "100vh",
              overflow: "auto",
              // backgroundColor: "red",
              width: "70%",
            }}
          >
            <div
              style={{
                height: "70vh",
                flex: "1",
                display: "flex",
                flexDirection: "column", // Change flex direction to column for vertical centering
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <i
                className="fa-solid fa-comments"
                style={{
                  fontSize: "25rem",
                  color: "#4CAF50",
                  marginBottom: "1rem",
                }} // Add margin bottom for spacing
              ></i>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                Click any chat to open the message
              </p>
            </div>
          </div>
        </>
      ) : (
        <div style={{ width: "70%" }}>
          <ProfileNavbar contact={watiSelectedContact} />
          <Messaging messages={watiSelectedContactMessage} />
          <Sender contact={watiSelectedContact} />
        </div>
      )}
    </>
  );
}

export default WatiMessagePage;
