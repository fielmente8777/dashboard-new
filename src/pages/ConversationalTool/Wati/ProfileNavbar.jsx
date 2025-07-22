import { faUserCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AuthContext from "../../Context/AuthProvider";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import "../../Style/WhatsAppComingSoon.css";

function MyVerticallyCenteredModal(props) {
  const { UpdateParamsWati, watiSelectedContact } = useContext(AuthContext);
  const [params, setParams] = useState([]);

  useEffect(() => {
    setParams(props.data);
  }, [props.data]);

  const handleChange = (index, e) => {
    const updatedParams = [...params];
    updatedParams[index].value = e.target.value;
    setParams(updatedParams);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const phoneIndex = params.findIndex((data) => data.name === "phone");

    // Store the value of the element with name "phone" in a variable
    const phoneValue = params[phoneIndex].value;

    // Remove the element with name "phone" from the params array
    const updatedParams = params.filter((data) => data.name !== "phone");

    const data = {
      phoneNumber: phoneValue,
      customParams: updatedParams,
    };
    console.log(data);
    const res = await UpdateParamsWati(data);
    if (res) {
      toast.success("Param Updated Successfully");
    } else {
      toast.error("Param Updation failed");
    }
    setParams([]);

    props.onHide();
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
            {params.map((data, index) =>
              data.name !== "phone" ? (
                <React.Fragment key={index}>
                  <Form.Label>{data.name}</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder={`Enter ${data.name}`}
                    value={data.value}
                    onChange={(e) => handleChange(index, e)}
                    required
                  />
                </React.Fragment>
              ) : (
                ""
              )
            )}
          </Form.Group>
          <div style={{ display: "flex" }}>
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
function ProfileNavbar({ contact }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [changeParamModal, setChangeParamModal] = useState(false);
  const nameStyle = {
    fontWeight: "bold",
    fontSize: "1.2rem",
    marginBottom: "5px",
  };

  const wAidStyle = {
    color: "white",
  };
  const imageStyle = {
    width: "60px",
    height: "60px",
    marginRight: "10px",
  };
  const containerStyle = {
    display: "flex",
    backgroundColor: "#128c7e",
    height: "5rem",
    alignItems: "center",
    position: "relative", // Add position relative
  };

  const threeDotsStyle = {
    position: "absolute",
    top: "1rem",
    right: "1rem",
    cursor: "pointer",
    color: "white",
    fontSize: "30px",
  };

  const dropdownContentStyle = {
    position: "absolute",
    top: "100%",
    right: 0,
    backgroundColor: "#f9f9f9",
    padding: "10px",
    display: isDropdownOpen ? "block" : "none",
    zIndex: 1,
    cursor: "pointer",
  };

  const openChangeName = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const ChangeNameopenDrop = () => {
    toast.success("Coming Soon");
    setChangeParamModal(true);
    setIsDropdownOpen(false); // Close the dropdown
  };
  return (
    <div style={containerStyle}>
      <div style={{ marginLeft: "1rem" }}>
        {contact.photo ? (
          <img src={contact.photo} alt={contact.wAid} style={imageStyle} />
        ) : (
          <FontAwesomeIcon icon={faUserCircle} size="lg" style={imageStyle} />
        )}
      </div>
      <div>
        <div style={nameStyle}>{contact.fullName}</div>
        <div style={wAidStyle}>{contact.wAid}</div>
      </div>
      {/* Three dots */}
      <div
        style={threeDotsStyle}
        onClick={() => {
          openChangeName();
        }}
      >
        ...
      </div>
      <div style={dropdownContentStyle}>
        <div onClick={() => ChangeNameopenDrop()}>Change Params</div>

        {/* <div onClick={() => handleDropdownOptionClick("Option 2")}>Option 2</div>
        <div onClick={() => handleDropdownOptionClick("Option 3")}>Option 3</div> */}
        {/* Add more options as needed */}
      </div>
      <MyVerticallyCenteredModal
        show={changeParamModal}
        data={contact.customParams}
        onHide={() => setChangeParamModal(false)}
      />
    </div>
  );
}

export default ProfileNavbar;
