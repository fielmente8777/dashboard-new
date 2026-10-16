import { useGetAudienceQuery } from "../../redux/api/analyticsApi";
import Card from "../ui/Card";
import ProgressList from "../ui/ProgressList";
import { Skeleton } from "../ui/States";
import { useAnalyticsReport } from "./analyticsRange";
import { toDeviceSlices } from "./deviceColors";
import DonutChart from "../Charts/DonutChart";

const AudienceInsights = () => {
  const report = useAnalyticsReport(useGetAudienceQuery);

  if (report.isLoading) return <Skeleton className="h-72" />;

  const { devices = [], countries = [] } = report.data || {};
  if (devices.length === 0 && countries.length === 0) return null;

  const slices = toDeviceSlices(devices);
  const totalUsers = slices.reduce((sum, slice) => sum + slice.value, 0);

  return (
    <div className="anim-stagger grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card title="Users by device">
        <DonutChart data={slices} centerLabel="Users" unit="users" />
        <ul className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2">
          {slices.map((slice) => (
            <li
              key={slice.name}
              className="flex items-center gap-2 text-xs text-app-text"
            >
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: slice.color }}
              />
              <span className="capitalize">{slice.name}</span>
              <span className="font-semibold tabular-nums">
                {totalUsers ? Math.round((slice.value / totalUsers) * 100) : 0}%
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Users by country">
        <ProgressList
          items={countries.map((country) => ({
            label: country.name,
            value: country.users,
          }))}
        />
      </Card>
    </div>
  );
};

export default AudienceInsights;
