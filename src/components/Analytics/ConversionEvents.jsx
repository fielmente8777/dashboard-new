import { useGetConversionsQuery } from "../../redux/api/analyticsApi";
import Card from "../ui/Card";
import ProgressList from "../ui/ProgressList";
import { Skeleton } from "../ui/States";
import { useAnalyticsReport } from "./analyticsRange";

const ConversionEvents = () => {
  const report = useAnalyticsReport(useGetConversionsQuery);

  if (report.isLoading) return <Skeleton className="h-72" />;
  if (!report.data?.events.length) return null;

  const { events, conversions } = report.data;

  return (
    <div className="anim-stagger grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card title="Top events" description="Most triggered events">
        <ProgressList
          color="var(--chart-2)"
          items={events.slice(0, 8).map((event) => ({
            label: event.eventName,
            value: event.eventCount,
          }))}
        />
      </Card>

      <Card title="Conversion events" description="Marked as key events">
        {conversions.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-app-text">
              No conversion events configured.
            </p>
            <p className="mt-1 text-xs text-app-text-muted">
              Mark events as &quot;Key Events&quot; in GA4 to track them here.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {conversions.map((conversion) => (
              <li
                key={conversion.eventName}
                className="flex items-center justify-between gap-3 rounded-lg bg-app-surface-secondary p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-app-text">
                    {conversion.eventName}
                  </p>
                  <p className="mt-0.5 text-xs text-app-text-muted">
                    {conversion.users.toLocaleString()} users
                  </p>
                </div>
                <p className="text-xl font-semibold tabular-nums text-app-text">
                  {conversion.conversions.toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
};

export default ConversionEvents;
