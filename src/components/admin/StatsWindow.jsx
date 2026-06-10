import StatsCard from "./StatsCard";
import { Users, Globe, TrendingUp, UserX, IndianRupee } from "lucide-react";

function formatRevenue(revenue) {
  if (!revenue) return "—";
  const parts = [];
  if (revenue.INR) parts.push(`₹${Number(revenue.INR).toLocaleString("en-IN")}`);
  if (revenue.USD) parts.push(`$${Number(revenue.USD).toLocaleString("en-US")}`);
  return parts.join(" · ") || "—";
}

function activationSmartText(rate) {
  const n = Math.round(parseFloat(rate ?? 0) / 10);
  return `Roughly ${n} out of every 10 users publish a live portfolio`;
}

const ACTIVATION_INFO =
  "Out of everyone who has ever signed up, how many successfully published? Live Portfolios ÷ Total Users";

export default function StatsWindow({ title, description, data, isOverall = false, compact = false }) {
  const cards = isOverall
    ? [
      { label: "Total Users", value: data?.totalUsers ?? 0, icon: Users, className: "col-span-2" },
      { label: "Live Portfolios", value: data?.livePortfolios ?? 0, icon: Globe, className: "col-span-2" },
      { label: "Deleted Users", value: data?.deletedUsers ?? 0, icon: UserX, className: "col-span-2" },
      {
        label: "Activation Rate",
        value: data?.activationRate ?? "0.0",
        icon: TrendingUp,
        suffix: "%",
        info: ACTIVATION_INFO,
        smartText: activationSmartText(data?.activationRate),
        className: "col-span-3"
      },
      {
        label: "Total Revenue",
        value: formatRevenue(data?.revenue),
        icon: IndianRupee,
        subText: data?.proUsers != null ? `${data.proUsers} pro users` : undefined,
        className: "col-span-3"
      },
    ]
    : [
      { label: "New Users", value: data?.newUsers ?? 0, icon: Users },
      { label: "New Live Portfolios", value: data?.newLivePortfolios ?? 0, icon: Globe },
    ];

  const gridClass = isOverall ? "grid-cols-6" : "grid-cols-2";

  return (
    <div>
      <div className="mb-3">
        <h3 className="text-sm font-medium text-[#1A1A1A] dark:text-[#F0EDE7]">{title}</h3>
        {description && (
          <p className="text-xs text-[#7A736C] dark:text-[#B5AFA5] mt-0.5">{description}</p>
        )}
      </div>
      <div className={`grid gap-3 ${gridClass}`}>
        {cards.map((card, i) => (
          <div key={card.label} className={card.className ?? ""}>
            <StatsCard
              label={card.label}
              value={card.value}
              icon={card.icon}
              suffix={card.suffix}
              index={i}
              subText={card.subText}
              info={card.info}
              smartText={card.smartText}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
