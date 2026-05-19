import React from 'react'
import GoogleAnalyticsChart from "../../components/GoogleAnalyticsChart"; 
import TopPagesTable from "../../components/TopPagesTable";
const GoogleAnalytics = () => {
  return (
    <div className="w-full p-4">
        <GoogleAnalyticsChart />
        <TopPagesTable />
      </div>
  )
}

export default GoogleAnalytics