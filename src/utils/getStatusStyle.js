export const getStatusStyle = (status) => {
  switch (status) {
    case "completed":
      return "bg-green-200 text-green-800";

    case "sending":
    case "inprogress":
    case "in-progress":
      return "bg-orange-100 text-orange-600 border border-indigo-200";

    case "scheduled":
      return "bg-yellow-100 text-yellow-700";

    case "failed":
      return "bg-red-100 text-red-700";

    default:
      return "bg-gray-100 text-gray-600";
  }
};
