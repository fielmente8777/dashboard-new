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
];

const TemplateLibrary = ({ onSelectTemplate }) => {
  return (
    <div className="p-4 grid grid-cols-3 gap-4">
      {templates.map((template) => (
        <div
          key={template.id}
          className="border rounded-lg p-4 shadow hover:shadow-lg cursor-pointer transition"
          onClick={() => onSelectTemplate(template)}
        >
          <h3 className="font-semibold text-lg">{template.header}</h3>
          <p className="text-sm text-gray-600 mt-2">
            {template.body.slice(0, 80)}...
          </p>

          <div className="mt-3 flex justify-between items-center">
            <span className="text-xs px-2 py-1 bg-gray-200 rounded">
              {template.category}
            </span>

            <button className="text-blue-600 text-sm">Use Template →</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TemplateLibrary;
