import React, { useContext, useEffect, useState } from "react";
import Card from "react-bootstrap/Card";
import AuthContext from "../../Context/AuthProvider";
import Paytm from "../../Images/paytm.png";
import Razorpay from "../../Images/razorpay.avif";
import "../../Style/PaymentGateway.css";

function Payment() {
  const {
    fetchBookingDatatData,
    gateway,
    fetchRazorpayData,
    razorpayData,
    fetchByOrderid,
    fetchByPaymentid,
  } = useContext(AuthContext);
  useEffect(() => {
    fetchBookingDatatData();
    fetchRazorpayData("0");
  }, []);
  const [skip, setskip] = useState(0);
  const [id, setId] = useState("");

  const handlePrevClick = () => {
    let sk = Math.max(0, skip - 10);
    setskip(Math.max(0, skip - 10));
    fetchRazorpayData(String(sk));
  };

  const handleNextClick = () => {
    let sk = skip + 10;
    setskip(skip + 10);
    fetchRazorpayData(String(sk));
  };

  const handleOrderid = () => {
    console.log("Order ID:", id);
    fetchByOrderid(id);
  };

  const handlePaymentId = () => {
    fetchByPaymentid(id);
    console.log("Payment ID:", id);
  };
  return (
    <>
      <div className="paymentgateway">
        <div className="c-cards">
          <Card className="c-crd-inr">
            <Card.Img
              className="c-img p-0"
              variant="top"
              src={Razorpay}
              title="Razorpay"
            />
            {gateway.Type === "Razorpay" ? (
              <a>
                <button>Deactivate</button>
              </a>
            ) : (
              <a href=" https://payroll.razorpay.com/login" target="_blank">
                <button>Activate</button>
              </a>
            )}
          </Card>
        </div>
        <div className="c-cards">
          <Card className="c-crd-inr ">
            <Card.Img
              className="c-img"
              variant="top"
              src={
                "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/PhonePe_Logo.svg/2560px-PhonePe_Logo.svg.png"
              }
              title="PhonePe"
            />
            {gateway.Type === "PhonePe" ? (
              <a>
                <button>Deactivate</button>
              </a>
            ) : (
              <a href=" https://payroll.razorpay.com/login" target="_blank">
                <button>Activate</button>
              </a>
            )}
          </Card>
        </div>
        <div className="c-cards">
          <Card className="c-crd-inr">
            <Card.Img
              className="c-img"
              variant="top"
              src={Paytm}
              title="Make My Trip"
            />
            <button style={{ background: "red" }}>Coming Soon</button>
          </Card>
        </div>
        <div className="c-cards">
          <Card className="c-crd-inr">
            <Card.Img
              className="c-img"
              variant="top"
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/1200px-Stripe_Logo%2C_revised_2016.svg.png"
              title="Stripe"
            />
            <button style={{ background: "red" }}>Coming Soon</button>
          </Card>
        </div>
      </div>
      {gateway.Type === "Razorpay" ? (
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div className="button_prev_next" style={{ width: "33%" }}>
              <i
                className="fas fa-chevron-circle-left m-2"
                onClick={() => {
                  handlePrevClick();
                }}
                style={{ fontSize: "34px" }}
              ></i>
              {skip}
              <i
                className="fas fa-chevron-circle-right m-2"
                onClick={() => {
                  handleNextClick();
                }}
                style={{ fontSize: "34px" }}
              ></i>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", gap: "2rem" }}>
                <div>
                  <input
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    placeholder="Enter ID"
                  />
                </div>
                <div>
                  <button onClick={handleOrderid}>Search Order</button>
                </div>
              </div>
              <div style={{ display: "flex", gap: "2rem" }}>
                <div>
                  <button onClick={handlePaymentId}>Search Payment</button>
                </div>
              </div>
            </div>
          </div>

          <table className="usermanagementtable">
            <thead>
              <tr className="tablerow">
                {[
                  "Email",
                  "Contact",
                  "Vpa",
                  "Amount",
                  "Order Id",
                  "Pay Id",
                  "Status",
                ].map((headerLabel) => (
                  <th key={headerLabel}>{headerLabel}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {razorpayData.map((dt) => {
                return (
                  <tr>
                    <td>{dt.email}</td>
                    <td>{dt.contact}</td>
                    <td>{dt.vpa}</td>
                    <td>
                      {dt.amount / 100}-{dt.currency}
                    </td>
                    <td>{dt.order_id}</td>
                    <td>{dt.id}</td>
                    <td>
                      {dt.status === "captured" ? (
                        <span className="badge bg-success">Done</span>
                      ) : (
                        ""
                      )}
                      {dt.status === "pending" ? (
                        <span className="badge bg-warning">Pending</span>
                      ) : (
                        ""
                      )}
                      {dt.status === "failed" ? (
                        <span className="badge bg-danger">Failed</span>
                      ) : (
                        ""
                      )}
                      {dt.status === "refunded" ? (
                        <span className="badge bg-info">Refunded</span>
                      ) : (
                        ""
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        ""
      )}
    </>
  );
}

export default Payment;
