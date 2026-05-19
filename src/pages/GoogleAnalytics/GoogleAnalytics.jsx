import React from 'react'
import GoogleAnalyticsChart from "../../components/GoogleAnalyticsChart"; 
import TopPagesTable from "../../components/TopPagesTable";
import TrafficSources from '../../components/TrafficSources';
import ConversionEvents from '../../components/ConversionEvent';
import DeviceAnalytics from '../../components/DeviceAnalytics';
import GeoAnalytics from '../../components/GeoAnalytics';
import AudienceInsights from '../../components/AudienceInsight';
const GoogleAnalytics = () => {
  return (
    <div className="w-full p-4">
        <div className="w-full space-y-6">
        <GoogleAnalyticsChart />
        <TrafficSources />
        <TopPagesTable />
        <ConversionEvents />
        <DeviceAnalytics />
        <GeoAnalytics />
        <AudienceInsights />
      </div>
      </div>
  )
}

export default GoogleAnalytics