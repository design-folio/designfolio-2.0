import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function fillDates(series, days = 30) {
  const map = Object.fromEntries(series.map((d) => [d.date, d.count]));
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    result.push({ date: key, count: map[key] ?? 0 });
  }
  return result;
}

function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function GrowthChart({ timeSeries }) {
  const prefersReducedMotion =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  const userGrowth = fillDates(timeSeries?.userGrowth ?? []);
  const portfolioPublished = fillDates(timeSeries?.portfolioPublished ?? []);

  // Merge into one dataset
  const data = userGrowth.map((entry, i) => ({
    date: entry.date,
    "New Users": entry.count,
    "Portfolios Published": portfolioPublished[i]?.count ?? 0,
  }));

  // Show every 5th tick to avoid crowding
  const xTicks = data.filter((_, i) => i % 5 === 0 || i === data.length - 1).map((d) => d.date);

  return (
    <figure>
      <h3 className="text-sm font-manrope font-medium text-[#1A1A1A] dark:text-[#F0EDE7] mb-4">
        Growth — Last 30 Days
      </h3>
      <figcaption className="sr-only">
        Area chart showing new user signups and portfolio publications over the last 30 days.
      </figcaption>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="grad-users" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.2} />
                <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="grad-portfolios" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.2} />
                <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="date"
              ticks={xTicks}
              tickFormatter={formatDate}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
                color: "hsl(var(--foreground))",
              }}
              labelFormatter={formatDate}
            />
            <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }} />
            <Area
              type="monotone"
              dataKey="New Users"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              fill="url(#grad-users)"
              dot={false}
              isAnimationActive={!prefersReducedMotion}
            />
            <Area
              type="monotone"
              dataKey="Portfolios Published"
              stroke="hsl(var(--chart-2))"
              strokeWidth={2}
              fill="url(#grad-portfolios)"
              dot={false}
              isAnimationActive={!prefersReducedMotion}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}
