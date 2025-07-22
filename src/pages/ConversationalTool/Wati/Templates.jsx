import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import "../../Style/WhatsAppComingSoon.css";
function formatTimestamp(timestamp) {
  const createdDate = new Date(timestamp);
  const formattedDate = createdDate.toLocaleString(); // Adjust the format as needed
  return formattedDate;
}
function DetailedTemplateModal(props) {
  if (props.data === null) {
    return <></>;
  }
  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Detailed Template Info
        </Modal.Title>
      </Modal.Header>
      <Modal.Body
        style={{ maxHeight: "calc(90vh - 230px)", overflowY: "auto" }}
      >
        <div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <div>Template Name</div>
              <div>{props.data.elementName}</div>
            </div>
            <div>
              <div>Category</div>
              <div>{props.data.category}</div>
            </div>
            <div>
              <div>Language</div>
              <div>{props.data.language.text}</div>
            </div>
          </div>
          <div><strong>Broadcast Title</strong></div>

          {props.data.header && props.data.header.typeString === "text" ? (
            <div>{props.data.header.headerOriginal}</div>
          ) : props.data.header && props.data.header.typeString === "image" ? (
            <img src={props.data.header.link} width="200px" height="px" />
          ) : props.data.header && props.data.header.typeString === "video" ? (
            <video
              src={props.data.header.link}
              width="250rem"
              height="250rem"
              controls
            />
          ) : props.data.header ? (
            <a href={props.data.header.link}>Link to Document</a>
          ) : (
            <div>No Title</div>
          )}
          <div>
            <div><strong>Body</strong></div>
            <div><textarea style={{width:"100%",height:"300px"}} value={props.data.body}></textarea></div>
          </div>
          <div className="mt-3">
            <div><strong>Footer</strong></div>
            <div><input style={{width:"100%"}} value={props.data.footer} /></div>
          </div>
          {/* <div>
            <div>Buttons</div>
            {props.data.buttons &&
              props.data.buttons.map((val, idx) =>
                val.type === "url" ? (
                  <div>
                    <div>
                      <div>Text </div>
                      <div>{val.parameter.text}</div>
                    </div>
                    <div>
                      <div>URL</div>
                      <div>{val.parameter.url}</div>
                    </div>
                    <div>
                      <div>URL TYPE</div>
                      <div>{val.parameter.urlType}</div>
                    </div>
                  </div>
                ) : val.type === "quick_reply" ? (
                  <div>
                    <div>
                      <div>Text</div>
                      <div>{val.parameter.text}</div>
                    </div>
                  </div>
                ) : val.type === "copy_offer_code" ? (
                  <div>
                    <div>
                      <div>Text</div>
                      <div>{val.parameter.text}</div>
                    </div>
                    <div>
                      <div>copyOfferCode</div>
                      <div>{val.parameter.copyOfferCode}</div>
                    </div>
                  </div>
                ) : val.type === "call" ? (
                  <div>
                    <div>
                      <div>Text</div>
                      <div>{val.parameter.text}</div>
                    </div>
                    <div>
                      <div>PhoneNumber</div>
                      <div>{val.parameter.phoneNumber}</div>
                    </div>
                  </div>
                ) : (
                  <div>No Button</div>
                )
              )}
          </div> */}
        </div>
      </Modal.Body>
    </Modal>
  );
}
function Templates(props) {
  const [detailedTemplate, setDetailedTemplate] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const handleClick = (data) => {
    setDetailedTemplate(true);
    setSelectedTemplate(data);
  };
  return (
    <>
      <Modal
        {...props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            TemplateMessages
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{ maxHeight: "calc(90vh - 230px)", overflowY: "auto" }}
        >
          <div>
            <table className="table">
              {" "}
              {/* Use React Bootstrap table class */}
              <thead>
                <tr>
                  <th>Template Name</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Language</th>
                  <th>Last Modified</th>
                </tr>
              </thead>
              <tbody>
                {props.data.length > 0 &&
                  props.data.map((data, index) => (
                    <tr key={index}>
                      <td onClick={() => handleClick(data)}>
                        {data.elementName}
                      </td>
                      <td>{data.category}</td>
                      <td>{data.status}</td>
                      <td>{data.language.text}</td>
                      <td>{formatTimestamp(data.lastModified)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Modal.Body>
      </Modal>
      <DetailedTemplateModal
        show={detailedTemplate}
        onHide={() => setDetailedTemplate(false)}
        data={selectedTemplate}
      />
    </>
  );
}

export default Templates;
