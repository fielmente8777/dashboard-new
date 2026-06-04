import axios from "axios";
import { useEffect, useState } from "react";
import { BASE_URL } from "../../../data/constant";
import { addReservation } from "../../../services/api/bookingEngine";

const ROOM_TYPES = [
  { id: "deluxe", name: "Deluxe Room", price: 298 },
  { id: "superior", name: "Superior Room", price: 0 },
  { id: "suite", name: "Suite", price: 0 },
  { id: "presidential", name: "Presidential Suite", price: 0 },
];

const MEAL_PLANS = [
  { id: "none", name: "No Meal", price: 0 },
  // { id: "cp", name: "CP – Breakfast", price: 400 },
  // { id: "map", name: "MAP – Breakfast + Dinner", price: 900 },
  // { id: "ap", name: "AP – All Meals", price: 1400 },
];

export default function ReservationForm({ openReservationForm, setOpenReservationForm, lead }) {

  const [rooms,setRooms]=useState([]);
  const [form, setForm] = useState({
    name: lead?.Name || "",
    phone: lead?.Contact || "",
    email: lead?.Email || "",
    address: lead?.Address || "",
    checkIn: lead?.check_in||"",
    checkOut: lead?.check_out||"",
    guests: 1,
    rooms: 1,
    roomType: "",
    mealPlan: "none",
    specialRequests: "",
    payTo: lead?.Phone || "",
    paymentMode: "full",
  });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const selectedRoom = rooms.find((r) => r.roomType === form.roomType);
  // console.log("selectedRoom", selectedRoom, form?.roomType, rooms)
  const selectedMeal = MEAL_PLANS.find((m) => m.id === form.mealPlan);

  const nights = (() => {
    if (!form.checkIn || !form.checkOut) return 0;
    const n = Math.round((new Date(form.checkOut) - new Date(form.checkIn)) / 86400000);
    return n > 0 ? n : 0;
  })();

  const roomCharge = selectedRoom ? selectedRoom.price * form.rooms * nights : 0;
  // console.log("roomCharge", roomCharge, selectedRoom, form.rooms, nights)
  const mealCharge = selectedMeal ? selectedMeal.price * form.guests * nights : 0;
  const subtotal = roomCharge + mealCharge;
  const cgst = Math.round(subtotal * 0.06);
  const sgst = Math.round(subtotal * 0.06); 
  const totalGst = cgst + sgst;
  const grandTotal = subtotal + totalGst;
  const amountDue = form.paymentMode === "half" ? Math.round(grandTotal / 2) : grandTotal;

  const handleSend = async() => {
    if (!form.name || !form.phone) return alert("Name and phone are required.");

    try {
      const response = await addReservation(
        {
          guestName:form.name, 
          emailId:form.email,
          phone:form?.phone,
          city: "",
          address: form.address,
          label: "",
          value: "",
          checkIn: form.checkIn,
          checkOut: form.checkOut,
          adults:form.guests,
          room_type:form.roomType,
          quantity:form.rooms,
          // Package & promo
          package_id: "",
          package_name: form.mealPlan,
          package_price: 0,
          package_type: "",
          code: "",
          promo_id: "",
          discount: 0,
          ref_no: "",
          payment_provider: "Stripe",
          mode: "Credit Card",
          status: "Pending",
          pay_id: "",
          total:subtotal,
          tax:totalGst,
          amountPay:grandTotal,
          special_request:form.specialRequests,
          checked_in: false,
          checked_out: false,
        });


      setOpenReservationForm(false)


      console.log("response",response.data)
    } catch (error) {
      console.error("Error creating reservation", error)
    }


    // setLoading(true);
    // setTimeout(() => { setLoading(false); setSent(true); }, 1500);
  };



  const fetchRoom=async()=>{
    // console.log("jahjvg")
    try {
      const response= await axios.get(`${BASE_URL}/room/${localStorage.getItem("token")}/${localStorage.getItem("hid")}`)
      // console.log("Response", response.data)
      setRooms(response.data?.data)
    } catch (error) {
      console.log("Error",error)
    }
  }

  useEffect(()=>{
    fetchRoom()
  },[])

  // console.log("sdfns", grandTotal,rooms)
  // console.log("form", form)
  if (!openReservationForm) return null;

  const inp = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-app-surface";

  return (
    <div className="fixed inset-0 z-99999 bg-black/60 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-app-surface-secondary rounded-2xl w-full max-w-2xl shadow-2xl my-6">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <p className="text-xs text-app-text dark: text-app-text uppercase tracking-widest mb-0.5">Lead → Booking</p>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-app-text-faint">New Reservation</h2>
          </div>
          <button onClick={() => setOpenReservationForm(false)} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
        </div>

        <div className="px-6 py-5 space-y-6">

          {/* Guest Details */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Guest Details</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 dark:text-app-text-muted mb-1 block">Full Name *</label>
                <input className={inp} placeholder="Rahul Sharma" value={form.name} onChange={(e) => set("name", e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-app-text-muted mb-1 block">Phone *</label>
                <input className={inp} placeholder="9876543210" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-app-text-muted mb-1 block">Email</label>
                <input className={inp} placeholder="rahul@email.com" value={form.email} onChange={(e) => set("email", e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-app-text-muted mb-1 block">Address / City</label>
                <input className={inp} placeholder="Delhi" value={form.address} onChange={(e) => set("address", e.target.value)} />
              </div>
            </div>
          </div>

          {/* Stay Details */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Stay Details</p>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Check-in</label>
                <input type="date" className={inp} value={form.checkIn}  onChange={(e) => set("checkIn", e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Check-out</label>
                <input type="date" className={inp} value={form.checkOut}  onChange={(e) => set("checkOut", e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-app-text-muted mb-1 block">Adults</label>
                <input type="number" min="1" className={inp} value={form.guests} onChange={(e) => set("guests", parseInt(e.target.value) || 1)} />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-app-text-muted mb-1 block">Rooms</label>
                <input type="number" min="1" className={inp} value={form.rooms} onChange={(e) => set("rooms", parseInt(e.target.value) || 1)} />
              </div>
            </div>

            {/* Nights badge */}
            {nights > 0 && (
              <div className="mt-2 inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 text-xs font-medium px-3 py-1 rounded-full">
                <span>🌙</span> {nights} night{nights > 1 ? "s" : ""}
              </div>
            )}
          </div>

          {/* Room & Meal */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Room & Meal Plan</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 dark:text-app-text-muted mb-1 block">Room Type</label>
                <select className={inp} value={form.roomType} onChange={(e) => set("roomType", e.target.value)}>
                  {rooms?.map((r) => (
                    <option key={r.roomType} value={r.roomType}>{r.roomName} — ₹{r.price.toLocaleString()}/night</option>
                  ))}
                </select>
              </div>
              {/* <div>
                <label className="text-xs text-gray-500 mb-1 block">Meal Plan</label>
                <select className={inp} value={form.mealPlan} onChange={(e) => set("mealPlan", e.target.value)}>
                  {MEAL_PLANS?.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}{m.price > 0 ? ` — ₹${m.price}/guest/night` : ""}</option>
                  ))}
                </select>
              </div> */}
              <div className="col-span-2">
                <label className="text-xs text-gray-500 dark:text-app-text-muted mb-1 block">Special Requests</label>
                <textarea rows={2} className={inp + " resize-none"} placeholder="Early check-in, high floor, extra pillows…" value={form.specialRequests} onChange={(e) => set("specialRequests", e.target.value)} />
              </div>
            </div>
          </div>

          {/* Price Breakdown — full GST */}
          {nights > 0 && (
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Price Breakdown</p>
              </div>
              <div className="divide-y divide-gray-50">
                <div className="flex justify-between px-4 py-2.5 text-sm text-gray-600">
                  <span>{selectedRoom?.roomName} × {form.rooms} × {nights} night{nights > 1 ? "s" : ""}</span>
                  <span>₹{roomCharge.toLocaleString("en-IN")}</span>
                </div>
                {mealCharge > 0 && (
                  <div className="flex justify-between px-4 py-2.5 text-sm text-gray-600">
                    <span>{selectedMeal?.name} × {form.guests} guest{form.guests > 1 ? "s" : ""} × {nights} night{nights > 1 ? "s" : ""}</span>
                    <span>₹{mealCharge.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between px-4 py-2.5 text-sm text-gray-500">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between px-4 py-2 text-sm text-gray-400">
                  <span>CGST @ 6%</span>
                  <span>₹{cgst.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between px-4 py-2 text-sm text-gray-400">
                  <span>SGST @ 6%</span>
                  <span>₹{sgst.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between px-4 py-2.5 text-sm text-gray-500">
                  <span>Total GST (12%)</span>
                  <span>₹{totalGst.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between px-4 py-3 text-base font-semibold text-gray-900 bg-gray-50">
                  <span>Grand Total</span>
                  <span>₹{grandTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          )}

          {/* Payment */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Payment</p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <button
                onClick={() => set("paymentMode", "full")}
                className={`border rounded-lg px-4 py-2.5 text-sm text-left transition-all ${form.paymentMode === "full" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
              >
                <div className="font-medium">Full Payment</div>
                {nights > 0 && <div className="text-xs mt-0.5 opacity-70">₹{grandTotal.toLocaleString("en-IN")} now</div>}
              </button>
              <button
                onClick={() => set("paymentMode", "half")}
                className={`border rounded-lg px-4 py-2.5 text-sm text-left transition-all ${form.paymentMode === "half" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
              >
                <div className="font-medium">50% Advance</div>
                {nights > 0 && <div className="text-xs mt-0.5 opacity-70">₹{Math.round(grandTotal / 2).toLocaleString("en-IN")} now</div>}
              </button>
            </div>

            {nights > 0 && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-2.5 mb-3 flex justify-between items-center">
                <span className="text-sm text-blue-700 font-medium">Amount to collect now</span>
                <span className="text-base font-bold text-blue-700">₹{amountDue.toLocaleString("en-IN")}</span>
              </div>
            )}

            {/* <div className="flex gap-2">
              <input
                className={inp + " flex-1"}
                placeholder="Phone or email for payment link"
                value={form.payTo}
                onChange={(e) => set("payTo", e.target.value)}
              />
              <button
                onClick={handleSend}
                disabled={loading || sent || nights === 0}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
              >
                {loading ? "Sending…" : sent ? "✓ Sent" : "Send via Razorpay"}
              </button>
            </div>
            {sent && (
              <p className="text-xs text-green-600 mt-2 font-medium">
                ✓ Payment link of ₹{amountDue.toLocaleString("en-IN")} sent to {form.payTo}
              </p>
            )} */}
          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100">
          <button onClick={() => setOpenReservationForm(false)} className="text-sm text-gray-400 hover:text-gray-600">
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={loading || sent || nights === 0}
            className="bg-gray-900 hover:bg-gray-700 disabled:opacity-50 text-white text-sm font-medium px-6 py-2 rounded-lg transition-colors"
          >
            {sent ? "✓ Booking Confirmed" : "Create Booking"}
          </button>
        </div>

      </div>
    </div>
  );
}