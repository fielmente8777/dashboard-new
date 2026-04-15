import ActivityRow from "./ActivityRow";

const ActivityTable = ({ data }) => {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>

      <table className="w-full text-left">
        <thead>
          <tr>
            <th>Date</th>
            <th>Service</th>
            <th>Action</th>
            <th>Credits</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item) => (
            <ActivityRow key={item.id} {...item} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ActivityTable;