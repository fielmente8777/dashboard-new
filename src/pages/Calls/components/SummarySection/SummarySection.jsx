import {
  BadgeCheck,
  CalendarDays,
  Clock3,
  Phone,
  PhoneCall,
  PhoneMissed,
  PhoneOff,
  Timer,
} from "lucide-react";

import SummaryCard from "./SummaryCard";

const SummarySection = ({ summary }) => {
  const cards = [
    {
      title: "Total Calls",
      metric: summary.totalCalls,
      icon: Phone,
      bg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Successful Calls",
      metric: summary.successfulCalls,
      icon: PhoneCall,
      bg: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      title: "Missed Calls",
      metric: summary.missedCalls,
      icon: PhoneMissed,
      bg: "bg-red-50",
      iconColor: "text-red-600",
      reverseTrend: true,
    },
    {
      title: "Follow Ups",
      metric: summary.followUps,
      icon: CalendarDays,
      bg: "bg-orange-50",
      iconColor: "text-orange-600",
    },
    {
      title: "Talk Time",
      metric: summary.totalTalkTime,
      icon: Timer,
      bg: "bg-purple-50",
      iconColor: "text-purple-600",
      formatter: (value) => `${Math.floor(value / 60)}m ${value % 60}s`,
    },
    {
      title: "Average Duration",
      metric: summary.averageDuration,
      icon: Clock3,
      bg: "bg-indigo-50",
      iconColor: "text-indigo-600",
      formatter: (value) => `${value}s`,
    },
    {
      title: "Success Rate",
      metric: {
        value: `${summary.successRate}%`,
      },
      // metric: summary.successRate,
      icon: BadgeCheck,
      bg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },

    {
      title: "Missed Rate",
      metric: {
        value: `${summary.missedRate}%`,
      },
      // metric: summary.successRate,
      icon: PhoneOff,
      bg: "bg-red-50",
      iconColor: "text-red-600",
    },
  ];

  return (
    <section>
      <div className="flex flex-wrap gap-4 items-stretch">
        {cards.map((card) => (
          <div className="flex-1">
            <SummaryCard key={card.title} {...card} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default SummarySection;

// grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5
