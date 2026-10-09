import { Monitor, Smartphone, Tablet } from "lucide-react";
import { useGetDeviceAnalyticsQuery } from "../../redux/api/analyticsApi";
import Card from "../ui/Card";
import ProgressList from "../ui/ProgressList";
import { Skeleton } from "../ui/States";
import { useAnalyticsReport } from "./analyticsRange";
import { toDeviceSlices } from "./deviceColors";
import DonutChart from "../Charts/DonutChart";
import Icon from "../ui/Icon";

const DEVICE_ICONS = { desktop: Monitor, mobile: Smartphone, tablet: Tablet };

const toItems = (rows) =>
  rows.map((row) => ({ label: row.name, value: row.value }));

const DeviceAnalytics = () => {
  const report = useAnalyticsReport(useGetDeviceAnalyticsQuery);

  if (report.isLoading) return <Skeleton className="h-72" />;
  if (!report.data?.devices.length) return null;

  const { browsers, operatingSystems } = report.data;
  const devices = toDeviceSlices(report.data.devices);
  const totalUsers = devices.reduce((sum, device) => sum + device.value, 0);

  return (
    <div className="anim-stagger grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card title="Device category" description="Users per device type">
        <DonutChart data={devices} centerLabel="Users" unit="users" height={180} />
        <div className="mt-4">
          <ProgressList
            showShare
            total={totalUsers}
            items={devices.map((device) => {
              const icon = DEVICE_ICONS[device.name.toLowerCase()] || Monitor;

              return {
                label: device.name,
                value: device.value,
                color: device.color,
                prefix: <Icon icon={icon} size="sm" color={device.color} />,
              };
            })}
          />
        </div>
      </Card>

      <Card title="Top browsers" description="Users per browser">
        <ProgressList items={toItems(browsers)} />
      </Card>

      <Card title="Operating systems" description="Users per operating system">
        <ProgressList items={toItems(operatingSystems)} />
      </Card>
    </div>
  );
};

export default DeviceAnalytics;
