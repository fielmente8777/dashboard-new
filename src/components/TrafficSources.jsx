import React, { useState, useEffect } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { BASE_URL } from "../data/constant";

const CHANNEL_COLORS = {
  "Organic Search": "#1a73e8",
  "Direct": "#10b981",
  "Social": "#f97316",
  "Referral": "#8b5cf6",
  "Email": "#ec4899",
  "Paid Search": "#f59e0b",
  "Display": "#06b6d4",
  "Organic Social": "#ef4444",
  "Unassigned": "#9ca3af",
};

const  TrafficSources = () => {
  const [data, setData] = useState({ channels: [], sources: [] });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ start: "30daysAgo", end: "today" });

  const fetchData = async () => {
    const hid = localStorage.getItem("hid");
    if (!hid) return;
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${BASE_URL}/google/analytics-traffic-sources/${hid}?startDate=${dateRange.start}&endDate=${dateRange.end}`
      );
      setData({ channels: data.channels || [], sources: data.sources || [] });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [dateRange]);

  useEffect(() => {
    const handleDate = (e) => setDateRange(e.detail);
    const handleProp = () => fetchData();
    window.addEventListener("dashboard_date_changed", handleDate);
    window.addEventListener("dashboard_property_changed", handleProp);
    return () => {
      window.removeEventListener("dashboard_date_changed", handleDate);
      window.removeEventListener("dashboard_property_changed", handleProp);
    };
  }, []);

  if (loading) return null;
  if (data.channels.length === 0) return null;

  const totalSessions = data.channels.reduce((s, c) => s + c.sessions, 0);

  return (
    <div className="bg-white dark:bg-app-surface rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
      <h2 className="text-lg font-semibold text-app-text dark:text-app-text mb-6">Traffic Sources</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Donut Chart */}
        <div>
          <h3 className="text-sm font-medium text-app-text dark:text-app-text-muted mb-4">By Channel</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.channels}
                  dataKey="sessions"
                  nameKey="channel"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                >
                  {data.channels.map((entry, i) => (
                    <Cell key={i} fill={CHANNEL_COLORS[entry.channel] || "#9ca3af"} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: "10px", border: "1px solid #e5e7eb" }}
                  formatter={(v) => v.toLocaleString() + " sessions"}
                />
                <Legend
                  verticalAlign="middle"
                  align="right"
                  layout="vertical"
                  iconType="circle"
                  wrapperStyle={{ fontSize: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Channel List with bars */}
        <div>
          <h3 className="text-sm font-medium text-app-text dark:text-app-text-muted mb-4">Channel Performance</h3>
          <div className="space-y-3">
            {data.channels.slice(0, 6).map((ch, i) => {
              const pct = totalSessions ? (ch.sessions / totalSessions) * 100 : 0;
              return (
                <div key={i}>
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: CHANNEL_COLORS[ch.channel] || "#9ca3af" }}
                      />
                      <span className="text-sm font-medium text-app-text dark:text-app-text">{ch.channel}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-semibold text-gray-900">{ch.sessions.toLocaleString()}</span>
                      <span className="text-gray-400 ml-2 text-xs">{pct.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        background: CHANNEL_COLORS[ch.channel] || "#9ca3af",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Source/Medium table */}
      {data.sources.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-100">
          <h3 className="text-sm font-medium text-app-text dark:text-app-text mb-4">Top Source / Medium</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-app-text dark:text-app-text-muted border-b border-gray-100">
                  <th className="pb-2 font-semibold">Source</th>
                  <th className="pb-2 font-semibold">Medium</th>
                  <th className="pb-2 font-semibold text-right">Sessions</th>
                  <th className="pb-2 font-semibold text-right">Users</th>
                </tr>
              </thead>
              <tbody>
                {data.sources.slice(0, 6).map((s, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/20">
                    <td className="py-3 font-medium text-app-text dark:text-gray-400">{s.source}</td>
                    <td className="py-3 text-app-text dark:text-gray-400">{s.medium}</td>
                    <td className="py-3 text-right font-semibold text-app-text dark:text-gray-400">{s.sessions.toLocaleString()}</td>
                    <td className="py-3 text-right text-app-text dark:text-gray-400">{s.users.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrafficSources;




// import { Theme } from './ThemeProvider';

// export const lightTheme: Theme = {
//   // BASE
//   background: '#FFFFFF',
//   card: '#F8FAFC',
//   surface: '#FFFFFF',

//   // TEXT
//   text: '#111827',
//   textSecondary: '#6B7280',
//   textMuted: '#94A3B8',

//   // BRAND
//   primary: '#5B5CE6',
//   primaryLight: '#EEF2FF',
//   primaryDark: '#4338CA',

//   // STATUS
//   success: '#22C55E',
//   successLight: '#DCFCE7',

//   warning: '#F59E0B',
//   warningLight: '#FEF3C7',

//   error: '#EF4444',
//   errorLight: '#FEE2E2',

//   info: '#06B6D4',
//   infoLight: '#CFFAFE',

//   // BORDER
//   border: '#E2E8F0',
//   borderLight: '#F1F5F9',

//   // INPUT
//   inputBackground: '#FFFFFF',
//   inputBorder: '#CBD5E1',
//   placeholder: '#94A3B8',

//   // BUTTON
//   buttonPrimary: '#5B5CE6',
//   buttonSecondary: '#E2E8F0',
//   buttonDisabled: '#CBD5E1',

//   // TAB
//   tabBackground: '#FFFFFF',
//   tabActive: '#5B5CE6',
//   tabInactive: '#94A3B8',

//   // NAVIGATION
//   bottomTabBackground: '#FFFFFF',
//   bottomTabActive: '#5B5CE6',
//   bottomTabInactive: '#64748B',

//   // BADGES
//   badgeBackground: '#EEF2FF',
//   badgeText: '#5B5CE6',

//   // SHADOW
//   shadow: 'rgba(15, 23, 42, 0.08)',

//   // OVERLAY
//   overlay: 'rgba(15, 23, 42, 0.45)',

//   // ICONS
//   icon: '#334155',
//   iconSecondary: '#94A3B8',

//   // DIVIDER
//   divider: '#E2E8F0',

//   // SPECIAL
//   skeleton: '#E2E8F0',

//   // STATUS BAR
//   statusBar: '#FFFFFF',

//   // INDICATOR
//   indicatorColor: '#1E293B',

//   // MODE
//   isDark: false,
// };

// export const darkTheme: Theme = {
//   // BASE
//   background: '#0F172A',
//   card: '#1E293B',
//   surface: '#162033',

//   // TEXT
//   text: '#FFFFFF',
//   textSecondary: '#CBD5E1',
//   textMuted: '#94A3B8',

//   // BRAND
//   primary: '#6366F1',
//   primaryLight: '#312E81',
//   primaryDark: '#818CF8',

//   // STATUS
//   success: '#22C55E',
//   successLight: '#14532D',

//   warning: '#F59E0B',
//   warningLight: '#78350F',

//   error: '#EF4444',
//   errorLight: '#7F1D1D',

//   info: '#06B6D4',
//   infoLight: '#164E63',

//   // BORDER
//   border: '#334155',
//   borderLight: '#1E293B',

//   // INPUT
//   inputBackground: '#1E293B',
//   inputBorder: '#334155',
//   placeholder: '#64748B',

//   // BUTTON
//   buttonPrimary: '#6366F1',
//   buttonSecondary: '#334155',
//   buttonDisabled: '#475569',

//   // TAB
//   tabBackground: '#0F172A',
//   tabActive: '#6366F1',
//   tabInactive: '#64748B',

//   // NAVIGATION
//   bottomTabBackground: '#1E293B',
//   bottomTabActive: '#6366F1',
//   bottomTabInactive: '#94A3B8',

//   // BADGES
//   badgeBackground: '#312E81',
//   badgeText: '#C7D2FE',

//   // SHADOW
//   shadow: 'rgba(0,0,0,0.4)',

//   // OVERLAY
//   overlay: 'rgba(0,0,0,0.6)',

//   // ICONS
//   icon: '#E2E8F0',
//   iconSecondary: '#94A3B8',

//   // DIVIDER
//   divider: '#334155',

//   // SPECIAL
//   skeleton: '#1E293B',

//   // STATUS BAR
//   statusBar: '#0F172A',

//   // INDICATOR
//   indicatorColor: '#F3F4F6',

//   // MODE
//   isDark: true,
// };