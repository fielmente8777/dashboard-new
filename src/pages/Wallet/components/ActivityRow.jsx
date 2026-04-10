const ActivityRow = ({ date,service, action, credits, status}) => {
    const statusLower = status?.toLowerCase();
return (
    <tr className="border-b">
        <td className="py-2">{date ||"_"}</td>
        <td>{service || "_"}</td>
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