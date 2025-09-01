import React, { useState, useMemo } from "react";
import { extractBookingDates } from "../../utils/dateExtract";
import { formatToDateInput } from "../../utils/formatDateInput";
import { addReservation } from "../../services/api/bookingEngine";

export default function ReservationForm({ data }) {
  console.log(data);
  // const [form, setForm] = useState({
  //   firstName: data?.Name,
  //   lastName: "",
  //   email: data?.Email,
  //   phone: data?.Contact,
  //   checkIn: formatToDateInput(extractBookingDates(data?.Message)?.checkIn),
  //   checkOut: formatToDateInput(extractBookingDates(data?.Message)?.checkOut),
  //   arrivalTime: "",
  //   adults: 1,
  //   children: 0,
  //   rooms: 1,
  //   roomType: "Deluxe",
  //   ratePlan: "BAR",
  //   ratePerNight: 5000,
  //   currency: "INR",
  //   paymentMethod: "Pay at Hotel",
  //   depositCollected: 0,
  //   idType: "",
  //   idNumber: "",
  //   company: "",
  //   gstVat: "",
  //   address: "",
  //   specialRequests: "",
  //   airportPickup: false,
  //   marketingOptIn: true,
  // });

  const [form, setForm] = useState({
    // Guest details
    guestName: data?.Name || "",
    emailId: data?.Email || "",
    phone: data?.Contact || "",
    city: "",
    address: "",
    label: "",
    value: "",

    // Stay details
    checkIn: "",
    checkOut: "",
    adults: 2,
    kids: 0,
    roomNumbers: [],
    room_type: "Deluxe Suite",
    quantity: 1,

    // Package & promo
    package_id: "",
    package_name: "",
    package_price: 0,
    package_type: "",
    code: "",
    promo_id: "",
    discount: 0,

    // Payment
    ref_no: "",
    payment_provider: "Stripe",
    mode: "Credit Card",
    status: data?.Status || "Pending",
    pay_id: "",

    // Pricing
    principal: 0,
    total: 0,
    tax: 0,
    amountPay: 0,

    // Preferences
    special_request: "",
    checked_in: false,
    checked_out: false,
  });
  const [submitted, setSubmitted] = useState(null);

  const nights = useMemo(() => {
    if (!form.checkIn || !form.checkOut) return 0;
    const ci = new Date(form.checkIn);
    const co = new Date(form.checkOut);
    const diff = (co.getTime() - ci.getTime()) / (1000 * 60 * 60 * 24);
    return diff > 0 ? diff : 0;
  }, [form.checkIn, form.checkOut]);

  const subtotal = useMemo(
    () => form.ratePerNight * form.rooms * nights,
    [form.ratePerNight, form.rooms, nights]
  );
  const taxes = Math.round(subtotal * 0.12);
  const total = subtotal + taxes;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      nights,
      pricing: { subtotal, taxes, total, currency: form.currency },
      createdAt: new Date().toISOString(),
    };

    try {
      const response = await addReservation(form);
      console.log(response);
    } catch (error) {}
    // setSubmitted(payload);
    // console.log("Reservation submitted", payload);
  };

  const handleReset = () => {
    setForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      checkIn: "",
      checkOut: "",
      arrivalTime: "",
      adults: 2,
      children: 0,
      rooms: 1,
      roomType: "Deluxe",
      ratePlan: "BAR",
      ratePerNight: 5000,
      currency: "INR",
      paymentMethod: "Pay at Hotel",
      depositCollected: 0,
      idType: "",
      idNumber: "",
      company: "",
      gstVat: "",
      address: "",
      specialRequests: "",
      airportPickup: false,
      marketingOptIn: true,
    });
    setSubmitted(null);
  };

  console.log(form);

  return (
    <div className="min-h-screen w-full bg-slate-50 p-6 md:p-10">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
              New Reservation
            </h1>
            <p className="text-slate-600 mt-1">
              Fill guest and stay details below. Fields marked with * are
              required.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 border rounded-md hover:bg-slate-100"
            >
              Reset
            </button>
            <button
              form="reservation-form"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save Reservation
            </button>
          </div>
        </header>

        <form
          id="reservation-form"
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* LEFT SIDE */}
          <div className="lg:col-span-2 space-y-6">
            {/* Guest Details */}
            <div className="bg-white shadow-sm rounded-md p-4 space-y-4">
              <h2 className="font-semibold text-lg">Guest Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  required
                  name="guestName"
                  placeholder="Guest Name *"
                  value={form.guestName}
                  onChange={handleChange}
                  className="border p-2 rounded"
                />
                <input
                  required
                  name="emailId"
                  type="email"
                  placeholder="Email *"
                  value={form.emailId}
                  onChange={handleChange}
                  className="border p-2 rounded"
                />
                <input
                  required
                  name="phone"
                  placeholder="Phone *"
                  value={form.phone}
                  onChange={handleChange}
                  className="border p-2 rounded"
                />
                <input
                  name="city"
                  placeholder="City"
                  value={form.city}
                  onChange={handleChange}
                  className="border p-2 rounded"
                />
                <input
                  name="address"
                  placeholder="Address"
                  value={form.address}
                  onChange={handleChange}
                  className="border p-2 rounded md:col-span-2"
                />
              </div>
            </div>

            {/* Stay Details */}
            <div className="bg-white shadow-sm rounded-md p-4 space-y-4">
              <h2 className="font-semibold text-lg">Stay Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  required
                  name="checkIn"
                  type="date"
                  value={form.checkIn}
                  onChange={handleChange}
                  className="border p-2 rounded"
                />
                <input
                  required
                  name="checkOut"
                  type="date"
                  value={form.checkOut}
                  onChange={handleChange}
                  className="border p-2 rounded"
                />
                <input
                  type="number"
                  name="adults"
                  min={1}
                  value={form.adults}
                  onChange={handleChange}
                  className="border p-2 rounded"
                />
                <input
                  type="number"
                  name="kids"
                  min={0}
                  value={form.kids}
                  onChange={handleChange}
                  className="border p-2 rounded"
                />
                <input
                  type="text"
                  name="roomNumbers"
                  placeholder="Room Numbers (comma separated)"
                  value={form.roomNumbers}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      roomNumbers: e.target.value.split(","),
                    }))
                  }
                  className="border p-2 rounded md:col-span-2"
                />
                <input
                  name="room_type"
                  placeholder="Room Type"
                  value={form.room_type}
                  onChange={handleChange}
                  className="border p-2 rounded"
                />
                <input
                  type="number"
                  name="quantity"
                  min={1}
                  value={form.quantity}
                  onChange={handleChange}
                  className="border p-2 rounded"
                />
              </div>
            </div>

            {/* Package & Promo */}
            <div className="bg-white shadow-sm rounded-md p-4 space-y-4">
              <h2 className="font-semibold text-lg">Package & Promo</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  name="package_id"
                  placeholder="Package ID"
                  value={form.package_id}
                  onChange={handleChange}
                  className="border p-2 rounded"
                />
                <input
                  name="package_name"
                  placeholder="Package Name"
                  value={form.package_name}
                  onChange={handleChange}
                  className="border p-2 rounded"
                />
                <input
                  type="number"
                  name="package_price"
                  placeholder="Package Price"
                  value={form.package_price}
                  onChange={handleChange}
                  className="border p-2 rounded"
                />
                <input
                  name="package_type"
                  placeholder="Package Type"
                  value={form.package_type}
                  onChange={handleChange}
                  className="border p-2 rounded"
                />
                <input
                  name="code"
                  placeholder="Promo Code"
                  value={form.code}
                  onChange={handleChange}
                  className="border p-2 rounded"
                />
                <input
                  name="promo_id"
                  placeholder="Promo ID"
                  value={form.promo_id}
                  onChange={handleChange}
                  className="border p-2 rounded"
                />
                <input
                  type="number"
                  name="discount"
                  placeholder="Discount (%)"
                  value={form.discount}
                  onChange={handleChange}
                  className="border p-2 rounded"
                />
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white shadow-sm rounded-md p-4 space-y-4">
              <h2 className="font-semibold text-lg">Payment</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  name="ref_no"
                  placeholder="Reference No"
                  value={form.ref_no}
                  onChange={handleChange}
                  className="border p-2 rounded"
                />
                <input
                  name="payment_provider"
                  placeholder="Payment Provider"
                  value={form.payment_provider}
                  onChange={handleChange}
                  className="border p-2 rounded"
                />
                <input
                  name="mode"
                  placeholder="Mode"
                  value={form.mode}
                  onChange={handleChange}
                  className="border p-2 rounded"
                />
                <input
                  name="status"
                  placeholder="Status"
                  value={form.status}
                  onChange={handleChange}
                  className="border p-2 rounded"
                />
                <input
                  name="pay_id"
                  placeholder="Payment ID"
                  value={form.pay_id}
                  onChange={handleChange}
                  className="border p-2 rounded"
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white shadow-sm rounded-md p-4 space-y-4">
              <h2 className="font-semibold text-lg">Pricing</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="number"
                  name="principal"
                  placeholder="Principal"
                  value={form.principal}
                  onChange={handleChange}
                  className="border p-2 rounded"
                />
                <input
                  type="number"
                  name="tax"
                  placeholder="Tax"
                  value={form.tax}
                  onChange={handleChange}
                  className="border p-2 rounded"
                />
                <input
                  type="number"
                  name="total"
                  placeholder="Total"
                  value={form.total}
                  onChange={handleChange}
                  className="border p-2 rounded"
                />
                <input
                  type="number"
                  name="amountPay"
                  placeholder="Amount Pay"
                  value={form.amountPay}
                  onChange={handleChange}
                  className="border p-2 rounded"
                />
              </div>
            </div>

            {/* Preferences */}
            <div className="bg-white shadow-sm rounded-md p-4 space-y-4">
              <h2 className="font-semibold text-lg">Preferences</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <textarea
                  name="special_request"
                  placeholder="Special Requests"
                  value={form.special_request}
                  onChange={handleChange}
                  className="border p-2 rounded md:col-span-2"
                />
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="checked_in"
                    checked={form.checked_in}
                    onChange={handleChange}
                  />
                  Checked In
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="checked_out"
                    checked={form.checked_out}
                    onChange={handleChange}
                  />
                  Checked Out
                </label>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="space-y-6">
            <div className="bg-white shadow-sm rounded-md p-4">
              <h2 className="font-semibold text-lg mb-2">Submission Preview</h2>
              {submitted ? (
                <pre className="text-xs whitespace-pre-wrap bg-slate-950 text-slate-50 p-3 rounded-lg max-h-[400px] overflow-auto">
                  {JSON.stringify(submitted, null, 2)}
                </pre>
              ) : (
                <p className="text-slate-600 text-sm">
                  Fill the form and click <b>Save Reservation</b> to see a JSON
                  payload.
                </p>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// import React, { useMemo, useState } from "react";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
// import { Select } from "@/components/ui/select";

// const schema = z.object({
//   firstName: z.string().min(1, "Required"),
//   lastName: z.string().min(1, "Required"),
//   email: z.string().email("Invalid email"),
//   phone: z.string().min(7, "Too short"),

//   checkIn: z.string().min(1, "Required"),
//   checkOut: z.string().min(1, "Required"),
//   arrivalTime: z.string().optional().default(""),

//   adults: z.coerce.number().min(1).max(8),
//   children: z.coerce.number().min(0).max(8),
//   rooms: z.coerce.number().min(1).max(10),
//   roomType: z.string().min(1, "Required"),
//   ratePlan: z.string().min(1, "Required"),
//   ratePerNight: z.coerce.number().min(0),
//   currency: z.string().min(1),

//   paymentMethod: z.string().min(1),
//   depositCollected: z.coerce.number().min(0).optional().default(0),

//   idType: z.string().optional().default(""),
//   idNumber: z.string().optional().default(""),

//   company: z.string().optional().default(""),
//   gstVat: z.string().optional().default(""),
//   address: z.string().optional().default(""),

//   specialRequests: z.string().optional().default(""),
//   airportPickup: z.boolean().optional().default(false),
//   marketingOptIn: z.boolean().optional().default(false),
// });

// export default function ReservationForm() {
//   const [submitted, setSubmitted] = useState(null);

//   const {
//     register,
//     handleSubmit,
//     watch,
//     reset,
//     formState: { errors },
//   } = useForm({
//     resolver: zodResolver(schema),
//     defaultValues: {
//       firstName: "",
//       lastName: "",
//       email: "",
//       phone: "",
//       checkIn: "",
//       checkOut: "",
//       arrivalTime: "",
//       adults: 2,
//       children: 0,
//       rooms: 1,
//       roomType: "Deluxe",
//       ratePlan: "BAR",
//       ratePerNight: 5000,
//       currency: "INR",
//       paymentMethod: "Pay at Hotel",
//       depositCollected: 0,
//       idType: "",
//       idNumber: "",
//       company: "",
//       gstVat: "",
//       address: "",
//       specialRequests: "",
//       airportPickup: false,
//       marketingOptIn: true,
//     },
//   });

//   const checkIn = watch("checkIn");
//   const checkOut = watch("checkOut");
//   const ratePerNight = watch("ratePerNight");
//   const rooms = watch("rooms");
//   const currency = watch("currency");

//   const nights = useMemo(() => {
//     if (!checkIn || !checkOut) return 0;
//     const ci = new Date(checkIn);
//     const co = new Date(checkOut);
//     const diff = (co - ci) / (1000 * 60 * 60 * 24);
//     return Number.isFinite(diff) && diff > 0 ? diff : 0;
//   }, [checkIn, checkOut]);

//   const subtotal = useMemo(() => {
//     const r = Number(ratePerNight) || 0;
//     const rm = Number(rooms) || 0;
//     return r * rm * nights;
//   }, [ratePerNight, rooms, nights]);

//   const taxes = useMemo(() => Math.round(subtotal * 0.12), [subtotal]); // 12% GST example
//   const total = useMemo(() => subtotal + taxes, [subtotal, taxes]);

//   function onSubmit(values) {
//     const payload = {
//       ...values,
//       nights,
//       pricing: { subtotal, taxes, total, currency },
//       createdAt: new Date().toISOString(),
//     };
//     setSubmitted(payload);
//     console.log("Reservation submitted", payload);
//   }

//   return (
//     <div className="min-h-screen w-full bg-slate-50 p-6 md:p-10">
//       <div className="mx-auto max-w-6xl space-y-6">
//         <header className="flex items-end justify-between">
//           <div>
//             <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
//               New Reservation
//             </h1>
//             <p className="text-slate-600 mt-1">
//               Fill guest and stay details below. All fields marked with * are
//               required.
//             </p>
//           </div>
//           <div className="text-right">
//             <Button variant="outline" onClick={() => reset()} className="mr-2">
//               Reset
//             </Button>
//             <Button onClick={handleSubmit(onSubmit)}>Save Reservation</Button>
//           </div>
//         </header>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Left: Form */}
//           <div className="lg:col-span-2 space-y-6">
//             {/* Guest Details */}
//             <Card className="shadow-sm">
//               <CardHeader>
//                 <CardTitle className="text-lg">Guest Details</CardTitle>
//               </CardHeader>
//               <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <Label htmlFor="firstName">First Name *</Label>
//                   <Input
//                     id="firstName"
//                     placeholder="e.g., Riya"
//                     {...register("firstName")}
//                   />
//                   {errors.firstName && (
//                     <p className="text-red-600 text-sm mt-1">
//                       {errors.firstName.message}
//                     </p>
//                   )}
//                 </div>
//                 <div>
//                   <Label htmlFor="lastName">Last Name *</Label>
//                   <Input
//                     id="lastName"
//                     placeholder="e.g., Sharma"
//                     {...register("lastName")}
//                   />
//                   {errors.lastName && (
//                     <p className="text-red-600 text-sm mt-1">
//                       {errors.lastName.message}
//                     </p>
//                   )}
//                 </div>
//                 <div>
//                   <Label htmlFor="email">Email *</Label>
//                   <Input
//                     id="email"
//                     type="email"
//                     placeholder="guest@example.com"
//                     {...register("email")}
//                   />
//                   {errors.email && (
//                     <p className="text-red-600 text-sm mt-1">
//                       {errors.email.message}
//                     </p>
//                   )}
//                 </div>
//                 <div>
//                   <Label htmlFor="phone">Phone *</Label>
//                   <Input
//                     id="phone"
//                     type="tel"
//                     placeholder="+91 9XXXXXXXXX"
//                     {...register("phone")}
//                   />
//                   {errors.phone && (
//                     <p className="text-red-600 text-sm mt-1">
//                       {errors.phone.message}
//                     </p>
//                   )}
//                 </div>
//                 <div className="md:col-span-2">
//                   <Label htmlFor="address">Address</Label>
//                   <Input
//                     id="address"
//                     placeholder="Street, City, State, ZIP"
//                     {...register("address")}
//                   />
//                 </div>
//                 <div>
//                   <Label htmlFor="company">Company</Label>
//                   <Input
//                     id="company"
//                     placeholder="If corporate booking"
//                     {...register("company")}
//                   />
//                 </div>
//                 <div>
//                   <Label htmlFor="gstVat">GST/VAT Number</Label>
//                   <Input
//                     id="gstVat"
//                     placeholder="Optional"
//                     {...register("gstVat")}
//                   />
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Stay Details */}
//             <Card className="shadow-sm">
//               <CardHeader>
//                 <CardTitle className="text-lg">Stay Details</CardTitle>
//               </CardHeader>
//               <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div>
//                   <Label htmlFor="checkIn">Check-in *</Label>
//                   <Input id="checkIn" type="date" {...register("checkIn")} />
//                   {errors.checkIn && (
//                     <p className="text-red-600 text-sm mt-1">
//                       {errors.checkIn.message}
//                     </p>
//                   )}
//                 </div>
//                 <div>
//                   <Label htmlFor="checkOut">Check-out *</Label>
//                   <Input id="checkOut" type="date" {...register("checkOut")} />
//                   {errors.checkOut && (
//                     <p className="text-red-600 text-sm mt-1">
//                       {errors.checkOut.message}
//                     </p>
//                   )}
//                 </div>
//                 <div>
//                   <Label>Nights</Label>
//                   <Input value={nights} readOnly className="bg-slate-100" />
//                 </div>
//                 <div>
//                   <Label htmlFor="adults">Adults</Label>
//                   <Input
//                     id="adults"
//                     type="number"
//                     min={1}
//                     max={8}
//                     {...register("adults", { valueAsNumber: true })}
//                   />
//                 </div>
//                 <div>
//                   <Label htmlFor="children">Children</Label>
//                   <Input
//                     id="children"
//                     type="number"
//                     min={0}
//                     max={8}
//                     {...register("children", { valueAsNumber: true })}
//                   />
//                 </div>
//                 <div>
//                   <Label htmlFor="arrivalTime">Estimated Arrival</Label>
//                   <Input
//                     id="arrivalTime"
//                     type="time"
//                     {...register("arrivalTime")}
//                   />
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Room & Rate */}
//             <Card className="shadow-sm">
//               <CardHeader>
//                 <CardTitle className="text-lg">Room & Rate</CardTitle>
//               </CardHeader>
//               <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div>
//                   <Label htmlFor="roomType">Room Type *</Label>
//                   <select
//                     id="roomType"
//                     className="w-full h-10 rounded-md border border-slate-300 bg-white px-3"
//                     {...register("roomType")}
//                   >
//                     <option>Deluxe</option>
//                     <option>Suite</option>
//                     <option>Villa</option>
//                     <option>Standard</option>
//                   </select>
//                   {errors.roomType && (
//                     <p className="text-red-600 text-sm mt-1">
//                       {errors.roomType.message}
//                     </p>
//                   )}
//                 </div>
//                 <div>
//                   <Label htmlFor="rooms">Rooms</Label>
//                   <Input
//                     id="rooms"
//                     type="number"
//                     min={1}
//                     max={10}
//                     {...register("rooms", { valueAsNumber: true })}
//                   />
//                 </div>
//                 <div>
//                   <Label htmlFor="ratePlan">Rate Plan *</Label>
//                   <select
//                     id="ratePlan"
//                     className="w-full h-10 rounded-md border border-slate-300 bg-white px-3"
//                     {...register("ratePlan")}
//                   >
//                     <option value="BAR">BAR (Best Available)</option>
//                     <option value="NRF">Non-Refundable</option>
//                     <option value="CORP">Corporate</option>
//                     <option value="PKG">Package</option>
//                   </select>
//                 </div>
//                 <div>
//                   <Label htmlFor="ratePerNight">Rate / Night</Label>
//                   <Input
//                     id="ratePerNight"
//                     type="number"
//                     step="0.01"
//                     {...register("ratePerNight", { valueAsNumber: true })}
//                   />
//                 </div>
//                 <div>
//                   <Label htmlFor="currency">Currency</Label>
//                   <select
//                     id="currency"
//                     className="w-full h-10 rounded-md border border-slate-300 bg-white px-3"
//                     {...register("currency")}
//                   >
//                     <option value="INR">INR</option>
//                     <option value="USD">USD</option>
//                     <option value="EUR">EUR</option>
//                     <option value="AED">AED</option>
//                   </select>
//                 </div>
//                 <div>
//                   <Label htmlFor="depositCollected">Deposit Collected</Label>
//                   <Input
//                     id="depositCollected"
//                     type="number"
//                     step="0.01"
//                     {...register("depositCollected", { valueAsNumber: true })}
//                   />
//                 </div>
//               </CardContent>
//             </Card>

//             {/* ID & Preferences */}
//             <Card className="shadow-sm">
//               <CardHeader>
//                 <CardTitle className="text-lg">ID & Preferences</CardTitle>
//               </CardHeader>
//               <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div>
//                   <Label htmlFor="idType">ID Type</Label>
//                   <select
//                     id="idType"
//                     className="w-full h-10 rounded-md border border-slate-300 bg-white px-3"
//                     {...register("idType")}
//                   >
//                     <option value="">Select</option>
//                     <option value="Aadhaar">Aadhaar</option>
//                     <option value="Passport">Passport</option>
//                     <option value="DL">Driver's Licence</option>
//                     <option value="PAN">PAN</option>
//                   </select>
//                 </div>
//                 <div>
//                   <Label htmlFor="idNumber">ID Number</Label>
//                   <Input
//                     id="idNumber"
//                     placeholder="Enter ID no."
//                     {...register("idNumber")}
//                   />
//                 </div>
//                 <div>
//                   <Label htmlFor="paymentMethod">Payment Method</Label>
//                   <select
//                     id="paymentMethod"
//                     className="w-full h-10 rounded-md border border-slate-300 bg-white px-3"
//                     {...register("paymentMethod")}
//                   >
//                     <option>Pay at Hotel</option>
//                     <option>Credit Card</option>
//                     <option>UPI</option>
//                     <option>Bank Transfer</option>
//                   </select>
//                 </div>
//                 <div className="md:col-span-3">
//                   <Label htmlFor="specialRequests">Special Requests</Label>
//                   <Textarea
//                     id="specialRequests"
//                     placeholder="e.g., High floor, twin beds, allergy info"
//                     {...register("specialRequests")}
//                   />
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <input
//                     id="airportPickup"
//                     type="checkbox"
//                     className="h-4 w-4"
//                     {...register("airportPickup")}
//                   />
//                   <Label htmlFor="airportPickup">Need Airport Pickup</Label>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <input
//                     id="marketingOptIn"
//                     type="checkbox"
//                     className="h-4 w-4"
//                     {...register("marketingOptIn")}
//                   />
//                   <Label htmlFor="marketingOptIn">
//                     Opt-in to updates & offers
//                   </Label>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Right: Pricing Summary + Preview */}
//           <div className="space-y-6">
//             <Card className="shadow-sm sticky top-6">
//               <CardHeader>
//                 <CardTitle className="text-lg">Pricing Summary</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-2 text-sm">
//                 <div className="flex justify-between">
//                   <span>Nights</span>
//                   <span>{nights}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Rooms</span>
//                   <span>{rooms}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Rate / Night</span>
//                   <span>
//                     {currency} {Number(ratePerNight || 0).toLocaleString()}
//                   </span>
//                 </div>
//                 <hr className="my-2" />
//                 <div className="flex justify-between font-medium">
//                   <span>Subtotal</span>
//                   <span>
//                     {currency} {subtotal.toLocaleString()}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Taxes (12%)</span>
//                   <span>
//                     {currency} {taxes.toLocaleString()}
//                   </span>
//                 </div>
//                 <div className="flex justify-between text-base font-semibold">
//                   <span>Total</span>
//                   <span>
//                     {currency} {total.toLocaleString()}
//                   </span>
//                 </div>
//                 <p className="text-xs text-slate-500 pt-2">
//                   * Taxes and fees shown as example (12% GST). Adjust in code as
//                   per your local rules.
//                 </p>
//               </CardContent>
//             </Card>

//             <Card className="shadow-sm">
//               <CardHeader>
//                 <CardTitle className="text-lg">Submission Preview</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 {submitted ? (
//                   <pre className="text-xs whitespace-pre-wrap bg-slate-950 text-slate-50 p-3 rounded-lg max-h-[400px] overflow-auto">
//                     {JSON.stringify(submitted, null, 2)}
//                   </pre>
//                 ) : (
//                   <p className="text-slate-600 text-sm">
//                     Fill the form and click <b>Save Reservation</b> to see a
//                     JSON payload you can send to your backend.
//                   </p>
//                 )}
//               </CardContent>
//             </Card>
//           </div>
//         </div>

//         <footer className="text-center text-xs text-slate-500 pt-4">
//           Designed with React + Tailwind. Replace inputs with your design system
//           or connect to your API.
//         </footer>
//       </div>
//     </div>
//   );
// }

// import React from "react";

// const ReservationForm = () => {
//   return <div>hotel_reservation_form_react_frontend</div>;
// };

// export default ReservationForm;
