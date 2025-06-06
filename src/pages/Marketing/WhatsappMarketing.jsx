import CommanHeader from "../../components/Navbar/CommanHeader";

const WhatsappMarketing = () => {
  return (
    <div className="p-4 bg-white">
      <CommanHeader serviceName="WhatsApp Marketing" />
      <hr className="mt-3" />
      <p className="text-gray-600 mb-4 mt-2">
        Use WhatsApp as a direct channel to connect with guests, promote offers, and send booking confirmations.
      </p>
      <ul className="list-disc pl-6 text-gray-600 space-y-1">
        <li>Broadcast campaign setup</li>
        <li>Quick replies and automation templates</li>
        <li>Link integration for direct bookings</li>
      </ul>
    </div>
  );
};

export default WhatsappMarketing;
