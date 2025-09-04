import React from "react";
import { MdClose } from "react-icons/md";

const BookingDetailsPopup = ({
  infoData,
  openInfoPopUpIII,
  setopenInfoPopUpIII,
}) => {
  if (!openInfoPopUpIII || !infoData) return null;

  const handleClosePopup = () => {
    setopenInfoPopUpIII(false);
  };

  return (
    <div className="bg-black/50 fixed inset-0 flex justify-center items-center z-50 overflow-auto px-4">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <header className="bg-primary text-white flex justify-between items-center px-4 py-3">
          <h2 className="text-lg font-semibold">
            Booking ID: {infoData?.bookingId}
          </h2>
          <button onClick={handleClosePopup}>
            <MdClose size={24} />
          </button>
        </header>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Guest Info */}
          <section>
            <h3 className="text-gray-700 font-semibold mb-3">Guest Info</h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <p>
                <span className="font-medium">Name:</span>{" "}
                {infoData?.guestInfo?.guestName}
              </p>
              <p>
                <span className="font-medium">Email:</span>{" "}
                {infoData?.guestInfo?.EmailId}
              </p>
              <p>
                <span className="font-medium">Phone:</span>{" "}
                {infoData?.guestInfo?.Phone}
              </p>
              <p>
                <span className="font-medium">City:</span>{" "}
                {infoData?.guestInfo?.City || "-"}
              </p>
              <p>
                <span className="font-medium">Country:</span>{" "}
                {infoData?.guestInfo?.Country?.label || "-"}
              </p>
              <p>
                <span className="font-medium">Address:</span>{" "}
                {infoData?.guestInfo?.address || "-"}
              </p>
            </div>
          </section>

          {/* Booking Details */}
          <section>
            <h3 className="text-gray-700 font-semibold mb-3">
              Booking Details
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <p>
                <span className="font-medium">Check-In:</span>{" "}
                {infoData?.checkIn}
              </p>
              <p>
                <span className="font-medium">Check-Out:</span>{" "}
                {infoData?.checkOut}
              </p>
              <p>
                <span className="font-medium">Adults:</span> {infoData?.Adults}
              </p>
              <p>
                <span className="font-medium">Kids:</span> {infoData?.Kids}
              </p>
              <p>
                <span className="font-medium">Checked In:</span>{" "}
                {infoData?.checked_in ? "Yes" : "No"}
              </p>
              <p>
                <span className="font-medium">Checked Out:</span>{" "}
                {infoData?.checked_out ? "Yes" : "No"}
              </p>
            </div>
          </section>

          {/* Room Bookings */}
          <section>
            <h3 className="text-gray-700 font-semibold mb-3">Rooms</h3>
            <div className="space-y-2">
              {infoData?.Bookings?.map((room, idx) => (
                <div
                  key={idx}
                  className="border rounded-lg p-3 text-sm text-gray-700 bg-gray-50"
                >
                  <p>
                    <span className="font-medium">Room Type:</span>{" "}
                    {room.RoomType}
                  </p>
                  <p>
                    <span className="font-medium">Quantity:</span> {room.Qty}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Price */}
          <section>
            <h3 className="text-gray-700 font-semibold mb-3">Price</h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <p>
                <span className="font-medium">Principal:</span> ₹
                {infoData?.price?.Principal}
              </p>
              <p>
                <span className="font-medium">Tax:</span> ₹
                {infoData?.price?.Tax}
              </p>
              <p>
                <span className="font-medium">Total:</span> ₹
                {infoData?.price?.Total}
              </p>
              <p>
                <span className="font-medium">Amount Payable:</span> ₹
                {infoData?.price?.amountPay}
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsPopup;
