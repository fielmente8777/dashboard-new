import React, { useContext, useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AuthContext from "../../Context/AuthProvider";
import "../../Style/WhatsAppComingSoon.css";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import WatiChatMain from "./WatiChatMain";
import Templates from "./Templates";
function Landing() {
  const {
    FetchWatiCred,
    watiCred,
    AddWatiCred,
    AddWatiContact,
    FetchContactListWati,
    templateMessagesWati,
    FetchTemplateMessagesWati,
  } = useContext(AuthContext);
  const [apiendpoint, setApiendpoint] = useState("");
  const [addContactModal, setAddContactModal] = useState(false);
  const [accesstoken, setAccessToken] = useState("");
  const [templates, setTemplates] = useState(false);
  useEffect(() => {
    FetchWatiCred();
    FetchContactListWati();
    FetchTemplateMessagesWati();
    // FetchSpreadSheetFromDb()
  }, []);
  const handleClickSubmit = () => {
    // Validation or any logic before submission
    if (!apiendpoint || !accesstoken) {
      alert("Both API endpoint and access token are required.");
      return;
    }
    AddWatiCred({
      tenantId: apiendpoint,
      watiAccessToken: accesstoken,
    });
  };
  function MyVerticallyCenteredModal(props) {
    const [contactName, setContactName] = useState("");
    const [contactNumber, setContactNumber] = useState("");
    const [dynamicAttributes, setDynamicAttributes] = useState([]);
    const [dynamicCount, setDynamicCount] = useState(1);
    const handleAddAttribute = () => {
      const newAttribute = {
        id: dynamicCount,
        name: "",
        value: "",
      };
      setDynamicCount(dynamicCount + 1);
      setDynamicAttributes([...dynamicAttributes, newAttribute]);
    };

    const handleRemoveAttribute = (id) => {
      setDynamicAttributes(
        dynamicAttributes.filter((attribute) => attribute.id !== id)
      );
    };

    const handleChangeAttributeKey = (id, newKey) => {
      const newAttributes = dynamicAttributes.map((attribute) => {
        if (attribute.id === id) {
          return { ...attribute, name: newKey };
        }
        return attribute;
      });
      setDynamicAttributes(newAttributes);
    };

    const handleChangeAttributeValue = (id, newValue) => {
      const newAttributes = dynamicAttributes.map((attribute) => {
        if (attribute.id === id) {
          return { ...attribute, value: newValue };
        }
        return attribute;
      });
      setDynamicAttributes(newAttributes);
    };

    const handleSubmit = async (event) => {
      event.preventDefault();
      const attributesWithoutId = dynamicAttributes.map(
        ({ id, name, value }) => ({
          name: name,
          value: value,
        })
      );

      const data = {
        name: contactName,
        phoneNumber: contactNumber,
        customParams: attributesWithoutId,
      };
      const res = await AddWatiContact(data);
      props.onHide();
      if (res) {
        toast.success("Contact added successfully");
      } else {
        toast.error("Contact not added");
      }
    };

    return (
      <Modal
        {...props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Contact Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{ maxHeight: "calc(90vh - 230px)", overflowY: "auto" }}
        >
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter contact name"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Contact Number</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter contact number"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                required
              />
            </Form.Group>
            {dynamicAttributes.map((attribute, index) => (
              <div key={attribute.id} style={{ marginBottom: "10px" }}>
                <div style={{ display: "flex", gap: "3rem" }}>
                  <Form.Group className="mb-3">
                    <Form.Label>{`Param ${index + 1} Name`}</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder={`Param ${index + 1} Name`}
                      value={attribute.key}
                      onChange={(e) =>
                        handleChangeAttributeKey(attribute.id, e.target.value)
                      }
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>{`Param ${index + 1} Value`}</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder={`Param ${index + 1} Value`}
                      value={attribute.value}
                      onChange={(e) =>
                        handleChangeAttributeValue(attribute.id, e.target.value)
                      }
                      required
                    />
                  </Form.Group>
                </div>
                <Button
                  variant="danger"
                  onClick={() => handleRemoveAttribute(attribute.id)}
                >
                  Remove
                </Button>
              </div>
            ))}
            <div style={{ display: "flex" }}>
              <Button
                variant="primary"
                onClick={handleAddAttribute}
                style={{
                  marginRight: "5px",
                  marginBottom: "10px",
                }}
              >
                Add Attribute
              </Button>
              <Button
                variant="success"
                type="submit"
                style={{ marginRight: "5px", marginBottom: "10px" }}
              >
                Save Contact
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    );
  }

  return (
    <div style={{ height: "60vh" }}>
      <ToastContainer />
      {watiCred === "None" ? (
        <div className="whatsapp-coming-soon-container">
          <div className="whatsapp-coming-soon-content">
            <img
              className="whatsappicon"
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/WhatsApp_icon.png/479px-WhatsApp_icon.png"
            />
            <h1>Please Create Whatsapp Credentials</h1>
            <div>
              If Credential Already exist then please enter the required fields
              and click on submit button
            </div>
            <div>
              <input
                placeholder="API Endpoint"
                style={{
                  margin: "5px 0 ",
                  width: "100%",
                  padding: "5px 5px",
                  borderRadius: "5px",
                  border: "2px solid #ccc",
                }}
                value={apiendpoint}
                onChange={(e) => setApiendpoint(e.target.value)}
              />
            </div>
            <div>
              <input
                placeholder="access token"
                style={{
                  margin: "5px 0 ",
                  width: "100%",
                  padding: "5px 5px",
                  borderRadius: "5px",
                  border: "2px solid #ccc",
                }}
                value={accesstoken}
                onChange={(e) => setAccessToken(e.target.value)}
              />
            </div>
            <div>
              <button
                onClick={handleClickSubmit}
                style={{
                  margin: "5px 0 ",
                  width: "50%",
                  padding: "7px 7px",
                  borderRadius: "5px",
                  border: "2px solid #ccc",
                  background: "#0A3A75",
                  color: "white",
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div>
            {" "}
            <button
              onClick={() => {
                setAddContactModal(true);
              }}
              style={{
                margin: "5px 0 ",
                width: "13%",
                padding: "7px 7px",
                borderRadius: "5px",
                border: "2px solid #ccc",
                background: "rgb(18, 140, 126)",
                color: "white",
              }}
            >
              + Add new Contact
            </button>
            <button
              onClick={() => {
                setTemplates(true);
              }}
              style={{
                margin: "5px 0 ",
                width: "13%",
                padding: "7px 7px",
                borderRadius: "5px",
                border: "2px solid #ccc",
                background: "rgb(18, 140, 126)",
                color: "white",
              }}
            >
              Templates Messages
            </button>
          </div>
          <div style={{ height: "84vh", overflow: "hidden" }}>
            <WatiChatMain />
          </div>
          <MyVerticallyCenteredModal
            show={addContactModal}
            onHide={() => setAddContactModal(false)}
          />
          <Templates
            show={templates}
            onHide={() => setTemplates(false)}
            data={templateMessagesWati}
          />
        </>
      )}
    </div>
  );
}

export default Landing;
