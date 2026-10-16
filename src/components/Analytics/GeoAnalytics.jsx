import { useState } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useGetGeoAnalyticsQuery } from "../../redux/api/analyticsApi";
import { axisProps, tooltipProps } from "../Charts/chartTheme";
import Card from "../ui/Card";
import { Select } from "../ui/Field";
import ProgressList from "../ui/ProgressList";
import { Skeleton } from "../ui/States";
import { useAnalyticsReport } from "./analyticsRange";

// "IN" -> 🇮🇳
const flagEmoji = (code) => {
  if (!code || code.length !== 2) return "🌍";
  return String.fromCodePoint(
    ...[...code.toUpperCase()].map((char) => 0x1f1a5 + char.charCodeAt(0)),
  );
};

const GeoAnalytics = () => {
  const report = useAnalyticsReport(useGetGeoAnalyticsQuery);
  const [selectedCountry, setSelectedCountry] = useState(null);

  if (report.isLoading) return <Skeleton className="h-72" />;
  if (!report.data?.countries.length) return null;

  const { countries, cities } = report.data;
  const totalUsers = countries.reduce((sum, c) => sum + c.users, 0);
  const cityCountries = [...new Set(cities.map((city) => city.country))];
  // the top country until another one is picked (or if the pick has no data now)
  const country = cityCountries.includes(selectedCountry)
    ? selectedCountry
    : countries[0].country;
  const countryCities = cities
    .filter((city) => city.country === country)
    .slice(0, 8);

  return (
    <div className="anim-stagger grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card title="Top countries" description="Where your visitors come from">
        <ProgressList
          showShare
          total={totalUsers}
          items={countries.slice(0, 8).map((item) => ({
            label: item.country,
            value: item.users,
            prefix: (
              <span className="text-base leading-none">
                {flagEmoji(item.countryCode)}
              </span>
            ),
          }))}
        />
      </Card>

      <Card
        title="Top cities"
        description={`Users per city in ${country}`}
        actions={
          cityCountries.length > 0 && (
            <div className="w-44">
              <Select
                aria-label="Country"
                value={country}
                onChange={(e) => setSelectedCountry(e.target.value)}
                options={cityCountries.map((name) => ({
                  value: name,
                  label: name,
                }))}
              />
            </div>
          )
        }
      >
        <div className="h-64">
          {countryCities.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={countryCities}
                layout="vertical"
                margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
              >
                <XAxis type="number" hide />
                <YAxis dataKey="city" type="category" width={96} {...axisProps} />
                <Tooltip {...tooltipProps} />
                <Bar
                  name="Users"
                  dataKey="users"
                  fill="var(--chart-1)"
                  radius={[0, 4, 4, 0]}
                  barSize={16}
                  animationDuration={500}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="flex h-full items-center justify-center text-sm text-app-text-muted">
              No city data available.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default GeoAnalytics;
