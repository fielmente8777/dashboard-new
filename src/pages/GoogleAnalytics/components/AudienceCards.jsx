import { Monitor, Smartphone, Tablet } from "lucide-react";
import { useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useAnalyticsReport } from "../../../components/Analytics/analyticsRange";
import { toDeviceSlices } from "../../../components/Analytics/deviceColors";
import DonutChart from "../../../components/Charts/DonutChart";
import { axisProps } from "../../../components/Charts/chartTheme";
import Icon from "../../../components/ui/Icon";
import ProgressList from "../../../components/ui/ProgressList";
import Segmented from "../../../components/ui/Segmented";
import {
  useGetDeviceAnalyticsQuery,
  useGetGeoAnalyticsQuery,
} from "../../../redux/api/analyticsApi";
import { flagEmoji, percent } from "../analyticsUtils";
import ChartTooltip from "./ChartTooltip";
import ReportCard from "./ReportCard";

const DEVICE_ICONS = { desktop: Monitor, mobile: Smartphone, tablet: Tablet };

// Users per device category: a donut and one tile per device.
export const DevicesCard = ({ className = "" }) => {
  const report = useAnalyticsReport(useGetDeviceAnalyticsQuery);
  const devices = toDeviceSlices(report.data?.devices || []);
  const total = devices.reduce((sum, d) => sum + d.value, 0);

  return (
    <ReportCard
      className={className}
      title="Devices"
      description="Users per device category"
      loading={report.isLoading}
      empty={!devices.length}
    >
      <DonutChart data={devices} centerLabel="Users" unit="users" height={180} />
      <ul className="mt-4 grid grid-cols-3 gap-2">
        {devices.slice(0, 3).map((device) => (
          <li
            key={device.name}
            className="rounded-lg border border-app-border! bg-app-surface-secondary/50 px-2 py-2.5 text-center"
          >
            <Icon
              icon={DEVICE_ICONS[device.name.toLowerCase()] || Monitor}
              size="md"
              className="mx-auto"
              color={device.color}
            />
            <p className="mt-1 text-lg font-semibold tabular-nums text-app-text">
              {percent(device.value, total).toFixed(0)}%
            </p>
            <p className="truncate text-[11px] capitalize text-app-text-muted">{device.name}</p>
          </li>
        ))}
      </ul>
    </ReportCard>
  );
};

const TECH_VIEWS = [
  { value: "browsers", label: "Browsers" },
  { value: "operatingSystems", label: "OS" },
];

// Users per browser or operating system.
export const TechnologyCard = ({ className = "" }) => {
  const report = useAnalyticsReport(useGetDeviceAnalyticsQuery);
  const [view, setView] = useState("browsers");
  const rows = (report.data?.[view] || []).slice(0, 7);
  const total = rows.reduce((sum, row) => sum + row.value, 0);

  return (
    <ReportCard
      className={className}
      title="Technology"
      description="What visitors browse with"
      loading={report.isLoading}
      empty={!report.data?.browsers?.length && !report.data?.operatingSystems?.length}
      actions={<Segmented label="Technology" options={TECH_VIEWS} value={view} onChange={setView} />}
    >
      <ProgressList
        showShare
        total={total}
        color="var(--chart-7)"
        items={rows.map((row) => ({ label: row.name, value: row.value }))}
      />
    </ReportCard>
  );
};

const GEO_VIEWS = [
  { value: "countries", label: "Countries" },
  { value: "cities", label: "Cities" },
];

// Where visitors are: a ranked list of countries, or a bar chart of cities.
export const LocationsCard = ({ className = "" }) => {
  const report = useAnalyticsReport(useGetGeoAnalyticsQuery);
  const [view, setView] = useState("countries");
  const countries = report.data?.countries || [];
  const cities = (report.data?.cities || []).slice(0, 8);
  const totalUsers = countries.reduce((sum, c) => sum + c.users, 0);

  return (
    <ReportCard
      className={className}
      title="Locations"
      description="Users by country and city"
      loading={report.isLoading}
      empty={!countries.length}
      actions={<Segmented label="Location" options={GEO_VIEWS} value={view} onChange={setView} />}
    >
      {view === "countries" ? (
        <ProgressList
          showShare
          total={totalUsers}
          items={countries.slice(0, 7).map((c) => ({
            label: c.country,
            value: c.users,
            prefix: <span className="text-base leading-none">{flagEmoji(c.countryCode)}</span>,
          }))}
        />
      ) : cities.length ? (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cities} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="city" type="category" width={92} {...axisProps} />
              <Tooltip
                cursor={{ fill: "rgba(127,127,127,0.08)" }}
                content={
                  <ChartTooltip
                    title={(payload) => {
                      const { city, country } = payload[0].payload;
                      return country ? `${city}, ${country}` : city;
                    }}
                    rows={(payload) => [
                      {
                        label: "Users",
                        value: payload[0].payload.users.toLocaleString(),
                        color: "var(--chart-1)",
                      },
                    ]}
                  />
                }
              />
              <Bar
                dataKey="users"
                fill="var(--chart-1)"
                radius={[0, 4, 4, 0]}
                barSize={14}
                animationDuration={500}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="py-10 text-center text-sm text-app-text-muted">No city data available.</p>
      )}
    </ReportCard>
  );
};
