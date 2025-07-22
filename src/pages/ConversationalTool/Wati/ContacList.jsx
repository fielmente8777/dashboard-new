import { faUserCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext, useEffect, useState } from "react";
import AuthContext from "../../Context/AuthProvider";

function ContactList(props) {
  // setwatiSelectedContact
  const {
    setWatiSelectedContact,
    GetMessagesWati,
    setWatiSelectedContactMessage,
    watiSelectedContact,
  } = useContext(AuthContext);
  const [selectedContactId, setSelectedContactId] = useState(null);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedContactId(null); // Reset selected contact on "Esc" key press
        setWatiSelectedContact(watiSelectedContact);
        setWatiSelectedContactMessage([]);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [watiSelectedContact]);

  const imageStyle = {
    width: "50px",
    height: "50px",
    marginRight: "10px",
  };

  const nameStyle = {
    fontWeight: "bold",
    fontSize: "1.2rem",
    marginBottom: "5px",
  };

  const wAidStyle = {
    color: "#888",
  };

  const handleClick = (contact) => {
    const id = contact.id;
    console.log(contact.wAid);
    setWatiSelectedContact(contact);
    GetMessagesWati(contact.wAid);
    setSelectedContactId(id === selectedContactId ? null : id);
  };

  return (
    <div>
      {props.data.map((contact, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            alignItems: "center",
            padding: "0.8rem 1rem", // Adjust padding to trim borderBottom
            borderBottom: "1px solid #ccc",
            cursor: "pointer",
            backgroundColor:
              selectedContactId === contact.id ? "#128c7e" : "#FFFFFF",
          }}
          onClick={() => handleClick(contact)}
        >
          <div>
            {contact.photo ? (
              <img src={contact.photo} alt={contact.wAid} style={imageStyle} />
            ) : (
              <FontAwesomeIcon
                icon={faUserCircle}
                size="lg"
                style={imageStyle}
              />
            )}
          </div>
          <div>
            <div style={nameStyle}>{contact.fullName}</div>
            <div style={wAidStyle}>{contact.wAid}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ContactList;
