import { useEffect, useState } from "react";
import CustomDropdown from "../../../../components/ui/Dropdown";
import { TEMPLATE_FILTER } from "../../../../data/constant";

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
},
{
  id: 25,
  name: "otp_verification",
  category: "AUTHENTICATION",
  header: "OTP Verification",
  body: "Hi {{1}}, your OTP for verification is {{2}}. It is valid for {{3}} minutes.",
  footer: "Do not share this code with anyone",
  buttons: [],
},
{
  id: 26,
  name: "login_alert",
  category: "AUTHENTICATION",
  header: "New Login Detected",
  body: "Hi {{1}}, a new login to your account was detected from {{2}}.",
  footer: "If this wasn't you, please secure your account immediately",
  buttons: [],
},
{
  id: 27,
  name: "password_reset",
  category: "AUTHENTICATION",
  header: "Password Reset Request",
  body: "Hi {{1}}, use this OTP {{2}} to reset your password. Valid for {{3}} minutes.",
  footer: "If you didn’t request this, ignore this message",
  buttons: [],
},
{
  id: 28,
  name: "account_verification",
  category: "AUTHENTICATION",
  header: "Verify Your Account",
  body: "Hi {{1}}, please verify your account using code {{2}}.",
  footer: "Welcome aboard!",
  buttons: [],
},
{
  id: 29,
  name: "two_factor_auth",
  category: "AUTHENTICATION",
  header: "2-Step Verification",
  body: "Hi {{1}}, your 2FA code is {{2}}. It expires in {{3}} minutes.",
  footer: "Keep your account secure",
  buttons: [],
},
{
  id: 30,
  name: "email_verification",
  category: "AUTHENTICATION",
  header: "Email Verification",
  body: "Hi {{1}}, confirm your email using this code: {{2}}.",
  footer: "This helps us keep your account safe",
  buttons: [],
}
];



const TemplateLibrary = ({ onSelectTemplate }) => {

const [category,setCategory]= useState();
const [search, setSearch] = useState("");
const [filterData, setFilterData] = useState([]);

const handleFilter = () => {
  let data = templates;

  // Filter by category
  if (category) {
    data = data.filter(
      (template) =>
        template.category?.toUpperCase() === category?.toUpperCase()
    );
  }

  // Filter by search (name, header, body)
  if (search.trim()) {
    const searchValue = search.toLowerCase();

    data = data.filter((template) =>
      template.name?.toLowerCase().includes(searchValue) ||
      template.header?.toLowerCase().includes(searchValue) ||
      template.body?.toLowerCase().includes(searchValue)
    );
  }
  setFilterData(data);
};

  useEffect(()=>{
    handleFilter();
  },[search])

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center gap-2">
        <div>
          <input type="search"
          placeholder="Search template by name, header and body"
          className="bg-gray-50 border py-2 w-md text-sm px-3 outline-none rounded-lg"
          onChange={(e)=>setSearch(e.target.value)}
          />
        </div>
        <div>
          <CustomDropdown
            label="Category"
            options={TEMPLATE_FILTER}
            onChange={(value) => setCategory(value)}
          />
        </div>
        </div>

        {filterData.length>0?<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
          {filterData?.map((template) => (
            <div
              key={template.id}
              onClick={() => onSelectTemplate(template)}
              className="bg-white rounded-md border shadow-xs border-primary/10! p-5 flex flex-col justify-between min-h-45 hover:border-ternary/40 transition-all duration-300 cursor-pointer"
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
          :
      <div className="flex flex-col justify-center items-center  text-gray-500 gap-2">
        <span className="text-4xl">📄</span>
        <p className="text-lg font-medium">No Templates Yet</p>
        <p className="text-sm">Templates will be available soon.</p>
      </div>
    }
  </div>
  );
};

export default TemplateLibrary;
