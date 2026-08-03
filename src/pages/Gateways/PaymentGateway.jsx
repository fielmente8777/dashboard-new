import React, { useContext, useEffect, useState } from "react";
import DataContext from "../../context/DataContext";
import { Link } from "react-router-dom";
import PaymentIntegrationPopup from "../../components/Popup/PaymentIntegrationPopup";
import axios from "axios";
import { BASE_URL } from "../../data/constant";
import handleLocalStorage from "../../utils/handleLocalStorage";
import { getBookingEngineDetails } from "../../services/api/bookingEngine";
import { useDispatch, useSelector } from "react-redux";
import { getEngineDetails } from "../../redux/slice/bookingEngineDetails";
import Swal from "sweetalert2";
import { FaChevronRight } from "react-icons/fa";

const PaymentGateway = () => {

  const dispatch = useDispatch();
  const { engineDetails, loading } = useSelector((state) => state?.engineDetails);

  useEffect(() => {
    getBookingEngineDetails()
    // fetchBookingDatatData();
    // fetchRazorpayData("0");
  }, []);

  const [dataloading, setDateLoading] = useState(false)
  const [title, setTitle] = useState("Razorpay");
  const [open, setOpen] = useState(false);
  const [skip, setskip] = useState(0);
  const [id, setId] = useState("");
  const [gateway, setgateway] = useState({
    Type: "Razorpay"
  });
  const [razorpayData, setrazorpayData] = useState([]);
  const [activeGateway, setActiveGateway] = useState({
    Razorpay: true,
    Phonepe: false,
    Payment: false
  })

  const fetchRazorpayData = async (skip) => {
    setDateLoading(true)
    try {
      const response = await fetch(`${BASE_URL}/razorpay/v1/payments`, {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, /",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: handleLocalStorage("token"),
          hId: String(handleLocalStorage("hid")),
          skip: skip,
        }),
      });

      const json = await response.json();
      // console.log(json)
      if (json.status) {
        setrazorpayData(json.Details.items);
      }
    } catch (error) {
      console.error("Error fetching data", error)
      // alert("Some Problem update token");
    } finally {
      setDateLoading(false)
    }
  };
  const fetchByOrderid = async (orderId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/razorpay/v1/filtered/orders`,
        {
          method: "POST",
          headers: {
            Accept: "application/json, text/plain, /",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: handleLocalStorage("token"),
            hId: String(handleLocalStorage("hid")),
            orderid: orderId,
          }),
        }
      );

      const json = await response.json();
      // console.log(json)
      if (json.status) {
        // console.log(json.Details);
        setrazorpayData([json.Details]);
      } else {
        setrazorpayData([]);
      }
    } catch {
      // alert("Some Problem update token");
    }
  };
  const fetchByPaymentid = async (paymentId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/razorpay/v1/filtered/payments`,
        {
          method: "POST",
          headers: {
            Accept: "application/json, text/plain, /",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: handleLocalStorage("token"),
            hId: String(handleLocalStorage("hid")),
            payid: paymentId,
          }),
        }
      );

      const json = await response.json();
      // console.log(json)
      if (json.status) {
        // console.log(json.Details);
        setrazorpayData([json.Details]);
      } else {
        setrazorpayData([]);
      }
    } catch {
      // alert("Some Problem update token");
    }
  };

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
    fetchByOrderid(id);
  };

  const handlePaymentId = () => {
    fetchByPaymentid(id);
  };

  const handleOnConfirm = async (title, apiKey, secretkey) => {

    // console.log(title, apiKey, secretkey);
    if (title === "Razorpay") {
      if (!apiKey || !secretkey) {
        Swal.fire({
          icon: "warning",
          titleText: "Warning",
          text: "Please fill all the fields",
          confirmButtonText: "Ok"
        })
        return "Please fill all the fields";
      }

      const response = await axios.post(`${BASE_URL}/razorpay/edit/gateway`, {
        Token: handleLocalStorage("token"),
        hId: handleLocalStorage("hid"),
        type: title,
        API_KEY: apiKey,
        SECRET_KEY: secretkey,
      })

      // console.log(response);
    }
    alert("Payment Gateway Activated");
    setOpen(false);
  }

  const handleOnCancel = () => {
    setOpen(false);
  }

  useEffect(() => {
    dispatch(getEngineDetails());
    fetchRazorpayData("0");
  }, [])
  return (
    <div className="p-4">
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
      </div>
      {gateway?.Type === "Razorpay" ? (
        <div className="mt-5">
          <div className="flex justify-between items-center py-2">

            <div className="flex gap-5 items-center">
              <FaChevronRight onClick={() => handlePrevClick()} className="rotate-180" />

              <p className="text-2xl">{skip}</p>

              <FaChevronRight onClick={() => handleNextClick()} className="" />

            </div>

            <div className="flex gap-2">
              <input
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="Enter ID"
                className="px-2 py-2 outline-none rounded-sm"
              />
              <button className="py-2 bg-primary px-3 rounded-sm text-white font-medium" onClick={handleOrderid}>Search Order</button>
              <button className="py-2 bg-primary px-3 rounded-sm text-white font-medium" onClick={handlePaymentId}>Search Payment</button>

            </div>

          </div>

          {!dataloading ? (
            <table className="w-full text-left bg-primary text-white/90 rounded-sm shadow-black/20">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-4 text-[14px] font-medium capitalize">
                    Email-Id
                  </th>
                  <th className="py-3 px-4 text-[14px] font-medium capitalize">
                    Contact
                  </th>
                  <th className="py-3 px-4 text-[14px] font-medium capitalize">
                    Vpa
                  </th>
                  <th className="py-3 px-4 text-[14px] font-medium capitalize">
                    Amount
                  </th>
                  <th className="py-3 px-4 text-[14px] font-medium capitalize whitespace-nowrap">
                    Order Id
                  </th>
                  <th className="py-3 px-4 text-[14px] font-medium capitalize whitespace-nowrap">
                    Payment Id
                  </th>
                  <th className="py-3 px-4 text-[14px] font-medium capitalize whitespace-nowrap">
                    Method
                  </th>
                  <th className="py-3 px-4 text-[14px] font-medium capitalize whitespace-nowrap">
                    Status
                  </th>

                </tr>
              </thead>

              <tbody>
                {razorpayData?.length > 0 ? (
                  razorpayData
                    ?.map((row, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className="py-1  border-bodd:bg-app-surface even:bg-app-surface border-app-border  text-app-text dark:text-app-text-faint   hover:bg-blue-50 transition-colors cursor-pointer"
                      >
                        <td
                          className="py-3 px-4 text-[14px] text-purple-500 font-semibold"
                        >
                          {row?.email}
                        </td>
                        <td
                          className="py-3 px-4 text-[14px] text-gray-500  font-semibold"
                        >
                          {row?.contact}
                        </td>
                        <td
                          className="py-3 px-4 text-[14px] text-gray-500  font-semibold"
                        >
                          {row?.vpa}
                        </td>
                        <td
                          className="py-3 px-4 text-[14px] text-gray-500  font-semibold"
                        >
                          {row?.amount}- {row?.currency}
                        </td>
                        <td
                          className="py-3 px-4 text-[14px] text-gray-500  font-semibold"
                        >
                          {row?.order_id}
                        </td>
                        <td
                          className="py-3 px-4 text-[14px] text-gray-500  font-semibold"
                        >
                          {row?.id}
                        </td>
                        <td
                          className="py-3 px-4 text-[14px] text-gray-500 uppercase  font-semibold"
                        >
                          {row?.method}
                        </td>

                        <td
                          className="py-3 px-4 text-[14px] text-gray-500  font-semibold"
                        >
                          {row?.status === "captured" ? "Done" : row?.status}
                        </td>

                      </tr>
                    ))
                    .reverse()
                ) : (
                  <tr className="border text-center bg-app-surface-secondary text-gray-500">
                    <td colSpan={10} className="py-2">
                      No data found!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5, 6, 7].map((index) => (
                <div key={index}>
                  <p className="py-5 animate-pulse bg-gray-100"></p>
                </div>
              ))}
            </div>
          )}


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
      className={`relative border px-5 h-[200px] bg-white rounded-md`}
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
