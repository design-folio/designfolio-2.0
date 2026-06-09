import StatsCard from "./StatsCard";
import { Users, Globe, TrendingUp } from "lucide-react";

export default function StatsWindow({ title, description, data, isOverall = false }) {
  const cards = isOverall
    ? [
        { label: "Total Users", value: data?.totalUsers ?? 0, icon: Users },
        { label: "Live Portfolios", value: data?.livePortfolios ?? 0, icon: Globe },
        {
          label: "Activation Rate",
          value: data?.activationRate ?? "0.0",
          icon: TrendingUp,
          suffix: "%",
        },
      ]
    : [
        { label: "New Users", value: data?.newUsers ?? 0, icon: Users },
        { label: "New Live Portfolios", value: data?.newLivePortfolios ?? 0, icon: Globe },
        {
          label: "Activation Rate",
          value: data?.activationRate ?? "0.0",
          icon: TrendingUp,
          suffix: "%",
        },
      ];

  return (
    <div>
      <div className="mb-3">
        <h3 className="text-sm font-medium text-[#1A1A1A] dark:text-[#F0EDE7]">{title}</h3>
        {description && (
          <p className="text-xs text-[#7A736C] dark:text-[#B5AFA5] mt-0.5">{description}</p>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {cards.map((card, i) => (
          <StatsCard
            key={card.label}
            label={card.label}
            value={card.value}
            icon={card.icon}
            suffix={card.suffix}
            index={i}
          />
        ))}
      </div>
    </div>
  );
}
