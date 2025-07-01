import React, { useContext, useEffect, useState } from "react";
import DataContext from "../../context/DataContext";
import { Link } from "react-router-dom";
import PaymentIntegrationPopup from "../../components/Popup/PaymentIntegrationPopup";

const PaymentGateway = () => {
  const {
    fetchBookingDatatData,
    gateway,
    fetchRazorpayData,
    razorpayData,
    fetchByOrderid,
    fetchByPaymentid,
  } = useContext(DataContext);
  useEffect(() => {
    // fetchBookingDatatData();
    // fetchRazorpayData("0");
  }, []);

  const [title, setTitle] = useState("Razorpay");
  const [open, setOpen] = useState(false);
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


  const handleOnConfirm = (title, apiKey, secretkey) => {
    // console.log(title, apiKey, secretkey);

    alert("Payment Gateway Activated");
    setOpen(false);
  }

  const handleOnCancel = () => {
    alert("Payment Gateway Activation Cancelled");
    setOpen(false);
  }
  return (
    <div>
      {/* <iframe
        src="https://hotels.travelnet.in/booking/976-panagad"
        // style={{ width: "1200px", height: "500px" }}
      >
        Your browser doesn't support iframes.
      </iframe> */}
      <div className="grid grid-cols-4 gap-5">
        <PaymentCard
          gateway={gateway}
          image={
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOTyQr77jTaet0ai9jeKErezXc7uqzGDKIhQ&s"
          }
          paymentMethod={"Razorpay"}
          setOpen={setOpen}
          open={open}
          setTitle={setTitle}
        />
        <PaymentCard
          gateway={gateway}
          image={
            "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/PhonePe_Logo.svg/2560px-PhonePe_Logo.svg.png"
          }
          paymentMethod={"PhonePe"}
          setOpen={setOpen}
          open={open}
          setTitle={setTitle}
        />
        <PaymentCard
          color={"#00296F"}
          gateway={gateway}
          image={
            "https://pwebassets.paytm.com/commonwebassets/ir/images/press-kit/brand.png"
          }
          paymentMethod={"paytm"}
          setOpen={setOpen}
          open={open}
          setTitle={setTitle}
          status={"deactivated"}
        />
        {/* <PaymentCard gateway={gateway} image={"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOTyQr77jTaet0ai9jeKErezXc7uqzGDKIhQ&s"} paymentMethod={"Razorpay"} /> */}

        {/* <div className="relative border px-5 bg-white h-[200px]">
          <div className=" border-2 flex items-center justify-center aspect-4/2 p">
            <img
              className=""
              srcSet="https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/PhonePe_Logo.svg/2560px-PhonePe_Logo.svg.png"
              alt="razorpay"
            />
            <div className="absolute bottom-2 right-2">
              {gateway?.Type === "PhonePe" ? (
                <button>Deactivate</button>
              ) : (
                <a className="bg-green-600 px-2 py-1 rounded-md text-white" href="https://payroll.razorpay.com/login" target="_blank">
                  <button>Activate</button>
                </a>
              )}
            </div>
          </div>
        </div> */}
        <div className="c-cards">
          {/* <Card className="c-crd-inr ">
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
          </Card> */}
        </div>
        <div className="c-cards">
          {/* <Card className="c-crd-inr">
            <Card.Img
              className="c-img"
              variant="top"
              src={Paytm}
              title="Make My Trip"
            />
            <button style={{ background: "red" }}>Coming Soon</button>
          </Card> */}
        </div>
        <div className="c-cards">
          {/* <Card className="c-crd-inr">
            <Card.Img
              className="c-img"
              variant="top"
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/1200px-Stripe_Logo%2C_revised_2016.svg.png"
              title="Stripe"
            />
            <button style={{ background: "red" }}>Coming Soon</button>
          </Card> */}
        </div>
      </div>
      {gateway?.Type === "Razorpay" ? (
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

      <PaymentIntegrationPopup
        title={title}
        open={open}
        setOpen={setOpen}
        onCancel={handleOnCancel}
        onConfirm={(title, apiKey, secretkey) => {
          handleOnConfirm(title, apiKey, secretkey)
        }}
      />
    </div>
  );
};

export default PaymentGateway;

const PaymentCard = ({ setOpen, setTitle, open, gateway, image, paymentMethod, color, status }) => {
  return (
    <div
      style={{
        backgroundColor: color ? color : "#fff",
      }}
      className={`relative border-2 px-5 h-[200px] shadow-lg bg-white rounded-md`}
    >
      <img
        className="w-full h-full object-contain"
        src={image}
        alt="razorpay"
      />

      <div className="absolute bottom-2 right-2">
        {status === "deactivated" ? (
          <button className="bg-red-600 text-white px-2 py-1 rounded-md">
            Deactivate
          </button>
        ) : (
          <button
            className="bg-green-600 px-2 py-1 rounded-md text-white"
            onClick={() => {
              setOpen(true)
              setTitle(paymentMethod)
            }}
            target="_blank"
          >
            <button>Activate</button>
          </button>
        )}
      </div>

      {/* <div className="absolute bottom-2 right-2">
        {gateway?.Type === paymentMethod ? (
          <button>Deactivate</button>
        ) : (
          <Link
            className="bg-green-600 px-2 py-1 rounded-md text-white"
            to="https://payroll.razorpay.com/login"
            target="_blank"
          >
            <button>Activate</button>
          </Link>
        )}
      </div> */}
    </div>
  );
};
