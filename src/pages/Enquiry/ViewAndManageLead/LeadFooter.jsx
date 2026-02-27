import { FaWhatsapp } from "react-icons/fa";

const LeadFooter = ({ lead }) => (
  <div className="mt-6 flex justify-between items-center">
    <select className="border rounded-md px-4 py-2">
      <option>Potential For Later</option>
      <option>Hot</option>
      <option>Converted</option>
    </select>
  </div>
);

export default LeadFooter;
