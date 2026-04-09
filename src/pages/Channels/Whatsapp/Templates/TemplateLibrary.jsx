import React from "react";

const templates = [
  {
    id: 1,
    name: "booking_confirmation",
    category: "UTILITY",
    header: "Booking Confirmed",
    body: "Hi {{1}}, your booking at {{2}} is confirmed from {{3}} to {{4}}.",
    footer: "We look forward to hosting you!",
    buttons: [{ type: "URL", text: "View Booking", url: "{{5}}" }],
  },
  {
    id: 2,
    name: "pre_arrival",
    category: "UTILITY",
    header: "Welcome Soon",
    body: "Hi {{1}}, we are excited to welcome you to {{2}} tomorrow.",
    footer: "Safe travels!",
    buttons: [{ type: "QUICK_REPLY", text: "Share Arrival Time" }],
  },
  {
    id: 3,
    name: "welcome_message",
    category: "UTILITY",
    header: "Welcome",
    body: "Welcome {{1}} to {{2}}. Let us know if you need anything.",
    footer: "Enjoy your stay!",
    buttons: [],
  },
  {
    id: 4,
    name: "upsell_services",
    category: "MARKETING",
    header: "Enhance Stay",
    body: "Hi {{1}}, explore spa, dining & tours at {{2}}.",
    footer: "Limited time offers",
    buttons: [{ type: "URL", text: "Explore Offers", url: "{{3}}" }],
  },
  {
    id: 5,
    name: "restaurant_offer",
    category: "MARKETING",
    header: "Special Dining Offer",
    body: "Enjoy {{1}} at {{2}}. Book your table now.",
    footer: "Limited seats available",
    buttons: [{ type: "URL", text: "Reserve Table", url: "{{3}}" }],
  },
  {
    id: 6,
    name: "seasonal_offer",
    category: "MARKETING",
    header: "Exclusive Deal",
    body: "Get {{1}} off on your next stay at {{2}}.",
    footer: "Valid till {{3}}",
    buttons: [{ type: "URL", text: "Book Now", url: "{{4}}" }],
  },
  {
    id: 7,
    name: "checkout_reminder",
    category: "UTILITY",
    header: "Checkout Reminder",
    body: "Hi {{1}}, your checkout time is {{2}}.",
    footer: "Thank you!",
    buttons: [],
  },
  {
    id: 8,
    name: "feedback_request",
    category: "UTILITY",
    header: "Feedback",
    body: "Hi {{1}}, please share your experience at {{2}}.",
    footer: "We value your feedback",
    buttons: [{ type: "URL", text: "Give Feedback", url: "{{3}}" }],
  },
  {
    id: 9,
    name: "re_engagement",
    category: "MARKETING",
    header: "We Miss You",
    body: "Hi {{1}}, enjoy {{2}} on your next visit to {{3}}.",
    footer: "Come back soon!",
    buttons: [{ type: "URL", text: "Book Again", url: "{{4}}" }],
  },
  {
    id: 10,
    name: "event_promotion",
    category: "MARKETING",
    header: "Celebrate With Us",
    body: "Plan your {{1}} at {{2}} with exclusive packages.",
    footer: "Make it memorable",
    buttons: [{ type: "CALL", text: "Call Us", phone: "{{3}}" }],
  },
{
    id: 11,
    name: "early_checkin_offer",
    category: "MARKETING",
    header: "Early Check-in",
    body: "Hi {{1}}, start your stay earlier at {{2}} with early check-in access.",
    footer: "Limited availability",
    buttons: [{ type: "URL", text: "Request Now", url: "{{3}}" }],
  },
  {
    id: 12,
    name: "room_upgrade",
    category: "MARKETING",
    header: "Upgrade Your Room",
    body: "Hi {{1}}, move to a premium room at {{2}} for enhanced comfort.",
    footer: "Upgrade your experience",
    buttons: [{ type: "URL", text: "Upgrade", url: "{{3}}" }],
  },
  {
    id: 13,
    name: "checkin_reminder",
    category: "UTILITY",
    header: "Check-in Reminder",
    body: "Hi {{1}}, your check-in at {{2}} is scheduled for {{3}}.",
    footer: "See you soon",
    buttons: [],
  },
  {
    id: 14,
    name: "payment_confirmation",
    category: "UTILITY",
    header: "Payment Received",
    body: "Hi {{1}}, your payment of {{2}} has been successfully processed.",
    footer: "Thank you",
    buttons: [],
  },
  {
    id: 15,
    name: "cancellation_confirmation",
    category: "UTILITY",
    header: "Booking Cancelled",
    body: "Hi {{1}}, your reservation at {{2}} has been cancelled successfully.",
    footer: "Hope to host you again",
    buttons: [],
  },
  {
    id: 16,
    name: "loyalty_reward",
    category: "MARKETING",
    header: "Reward Unlocked",
    body: "Hi {{1}}, you've unlocked exclusive rewards after your stay at {{2}}.",
    footer: "Enjoy your benefits",
    buttons: [{ type: "URL", text: "View Rewards", url: "{{3}}" }],
  },
  {
    id: 17,
    name: "festival_offer",
    category: "MARKETING",
    header: "Festive Experience",
    body: "Celebrate {{1}} at {{2}} with special themed experiences.",
    footer: "Celebrate in style",
    buttons: [{ type: "URL", text: "Explore", url: "{{3}}" }],
  },
  {
    id: 18,
    name: "housekeeping_request",
    category: "UTILITY",
    header: "Housekeeping Service",
    body: "Hi {{1}}, request housekeeping service at {{2}} anytime.",
    footer: "We’re here to help",
    buttons: [{ type: "QUICK_REPLY", text: "Request" }],
  },
  {
    id: 19,
    name: "wifi_details",
    category: "UTILITY",
    header: "WiFi Access",
    body: "Hi {{1}}, connect to WiFi at {{2}} using provided credentials.",
    footer: "Stay connected",
    buttons: [],
  },
  {
    id: 20,
    name: "transport_service",
    category: "MARKETING",
    header: "Travel Assistance",
    body: "Hi {{1}}, arrange your transport to or from {{2}} easily.",
    footer: "Travel made simple",
    buttons: [{ type: "URL", text: "Book Ride", url: "{{3}}" }],
  },
  {
  id: 21,
  name: "late_checkout_offer",
  category: "MARKETING",
  header: "Late Checkout Option",
  body: "Hi {{1}}, enjoy extra time at {{2}} with our late checkout option.",
  footer: "Relax a little longer",
  buttons: [{ type: "URL", text: "Request Late Checkout", url: "{{3}}" }],
},
{
  id: 22,
  name: "room_service_order",
  category: "UTILITY",
  header: "Room Service Update",
  body: "Hi {{1}}, your room service order at {{2}} is being prepared.",
  footer: "Will be delivered shortly",
  buttons: [],
},
{
  id: 23,
  name: "maintenance_alert",
  category: "UTILITY",
  header: "Maintenance Notice",
  body: "Hi {{1}}, scheduled maintenance at {{2}} may affect some services.",
  footer: "We appreciate your patience",
  buttons: [],
},

{
  id: 24,
  name: "lost_and_found",
  category: "UTILITY",
  header: "Lost & Found Update",
  body: "Hi {{1}}, an item matching your description was found at {{2}}.",
  footer: "Contact us to claim",
  buttons: [{ type: "CALL", text: "Call Reception", phone: "{{3}}" }],
}
];

const TemplateLibrary = ({ onSelectTemplate }) => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      <div>
        jkhjghc
      </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {templates.map((template) => (
        <div
          key={template.id}
          onClick={() => onSelectTemplate(template)}
          className="bg-white rounded-md border shadow-xs border-primary/10! p-5 flex flex-col justify-between min-h-[180px] hover:border-ternary/40 transition-all duration-300 cursor-pointer"
        >
          {/* Header */}
          <div>
            <h3 className="font-semibold text-lg text-primary mb-2 hover:text-ternary transition-colors">
              {template.header}
            </h3>

            <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
              {template.body}
            </p>
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-between items-center">
            <span className="text-xs px-3 py-1 bg-gray-100 text-primary border border-gray-200 rounded-md font-medium uppercase tracking-wide">
              {template.category}
            </span>

            <button className="text-ternary text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
              Use Template →
            </button>
          </div>

          {/* Accent line */}
          <div className="absolute inset-x-0 bottom-0 h-1 bg-ternary scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-b-2xl"></div>
        </div>
      ))}
    </div>
  </div>
  );
};

export default TemplateLibrary;
