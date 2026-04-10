const ActivityRow = ({ date,service, action, credits, status}) => {
    const statusLower = status?.toLowerCase();
return (
    <tr className="border-b">
        <td className="py-2">{date ||"_"}</td>
        <td>
  <span
    className={`px-2 py-1 rounded-full text-xs font-medium ${
      service === "AI"
        ? "bg-purple-100 text-purple-600"
        : service === "WhatsApp"
        ? "bg-green-100 text-green-600"
        : service === "Email"
        ? "bg-yellow-100 text-yellow-600"
        : service === "Campaigns"
        ? "bg-pink-100 text-pink-600"
        : "bg-gray-100 text-gray-600"
    }`}
  >
    {service}
  </span>
</td>
        <td>{action || "_"}</td>
        <td>{credits ?? 0}</td>
        <td>
            <span className={`px-2 py-1 rounded text-xs ${
                statusLower === "completed" ? "bg-green-100 text-green-600" 
                :statusLower === "pending" ? "bg-yellow-100 text-yellow-600"
                : "bg-red-100 text-red-600"
            }`}>
                {status || "Unknown"}
            </span>
        </td>
    </tr>

);
};
export default ActivityRow;