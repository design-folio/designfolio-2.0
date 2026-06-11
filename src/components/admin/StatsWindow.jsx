import StatsCard from "./StatsCard";
import { Users, Globe, TrendingUp, IndianRupee, Crown, User } from "lucide-react";

function formatRevenue(revenue) {
  if (!revenue) return "—";
  const parts = [];
  if (revenue.INR) parts.push(`₹${Number(revenue.INR).toLocaleString("en-IN")}`);
  if (revenue.USD) parts.push(`$${Number(revenue.USD).toLocaleString("en-US")}`);
  return parts.join(" · ") || "—";
}

function activationSmartText(rate) {
  const n = Math.round(parseFloat(rate ?? 0) / 10);
  return `~${n} in 10 users publish a live portfolio`;
}

const ACTIVATION_INFO =
  "Percentage of all signed-up users who have a live portfolio. Live Portfolios ÷ Total Users.";

function calcDelta(curr, prev) {
  if (prev == null || prev === 0) return null;
  return ((curr - prev) / prev) * 100;
}

export default function StatsWindow({ title, description, data, isOverall = false, prevData, deltaLabel }) {
  const cards = isOverall
    ? [
      {
        label: "Total Users",
        value: data?.totalUsers ?? 0,
        icon: Users,
        subText: data?.deletedUsers ? `incl. ${data.deletedUsers} deleted` : undefined,
        info: `Every account ever registered — active and soft-deleted combined. Deleted accounts are excluded from most other counts but are still included here.`,
      },
      {
        label: "Free Users",
        value: data?.freeUsers ?? 0,
        icon: User,
        info: "Total Users minus Active Pro users. Includes anyone without a currently valid paid plan — trial, expired, or never upgraded.",
      },
      {
        label: "Active Pro",
        value: data?.proUsers ?? 0,
        icon: Crown,
        info: "Distinct users with at least one paid/active order that hasn't expired yet. Lifetime, monthly, quarterly, and yearly plans all count.",
      },
      {
        label: "Live Portfolios",
        value: data?.livePortfolios ?? 0,
        icon: Globe,
        info: "Users who have published their portfolio at least once — i.e. a live URL exists on their account.",
      },
      {
        label: "Activation Rate",
        value: data?.activationRate ?? "0.0",
        icon: TrendingUp,
        suffix: "%",
        info: ACTIVATION_INFO,
        smartText: activationSmartText(data?.activationRate),
      },
      {
        label: "Total Revenue",
        value: formatRevenue(data?.revenue),
        icon: IndianRupee,
        info: "All-time sum of every paid order (INR and USD shown separately). Includes one-time and recurring payments. Does not subtract refunds.",
        colSpan: "lg:col-span-3",
        wide: true,
      },
    ]
    : [
      {
        label: "New Users",
        value: data?.newUsers ?? 0,
        icon: Users,
        delta: prevData ? calcDelta(data?.newUsers ?? 0, prevData.newUsers) : undefined,
      },
      {
        label: "New Live Portfolios",
        value: data?.newLivePortfolios ?? 0,
        icon: Globe,
        delta: prevData ? calcDelta(data?.newLivePortfolios ?? 0, prevData.newLivePortfolios) : undefined,
      },
    ];

  const gridClass = isOverall ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-1";

  return (
    <div>
      {(title || description) && (
        <div className="mb-3">
          <h3 className="text-sm font-medium text-[#1A1A1A] dark:text-[#F0EDE7]">{title}</h3>
          {description && (
            <p className="text-xs text-[#7A736C] dark:text-[#B5AFA5] mt-0.5">{description}</p>
          )}
        </div>
      )}
      <div className={`grid gap-3 ${gridClass}`}>
        {cards.map((card, i) => (
          <div key={card.label} className={card.colSpan || ""}>
            <StatsCard
              label={card.label}
              value={card.value}
              icon={card.icon}
              suffix={card.suffix}
              index={i}
              subText={card.subText}
              info={card.info}
              smartText={card.smartText}
              wide={card.wide}
              delta={card.delta}
              deltaLabel={deltaLabel}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
