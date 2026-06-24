import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

function relativeTime(date) {
  const now = Date.now();
  const diff = now - date.getTime();
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (diff < 60_000) return "just now";
  if (mins < 60) return `${mins} minute${mins !== 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  if (days < 30) return `${days} day${days !== 1 ? "s" : ""} ago`;
  if (months < 12) return `${months} month${months !== 1 ? "s" : ""} ago`;
  return `${years} year${years !== 1 ? "s" : ""} ago`;
}

export default function TimestampCell({ date: dateStr }) {
  const date = new Date(dateStr);
  if (isNaN(date.getTime()))
    return <span className="text-[#7A736C] dark:text-[#B5AFA5] text-sm">—</span>;

  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const fmt = (timeZone) =>
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);

  const rows = [
    { label: tz, value: fmt(tz) },
    { label: "UTC", value: fmt("UTC") },
    { label: "Relative", value: relativeTime(date) },
    { label: "Timestamp", value: String(date.getTime()) },
  ];

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="text-sm text-[#7A736C] dark:text-[#B5AFA5] tabular-nums cursor-default">
            {relativeTime(date)}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="p-0 bg-foreground border-0 shadow-none">
          <div className="bg-[#231F1A] text-[#F0EDE7] rounded-md p-3 min-w-[280px] space-y-1.5 border border-white/10 shadow-lg">
            {rows.map(({ label, value }) => (
              <div key={label} className="flex items-baseline justify-between gap-4">
                <span className="text-[10px] font-mono text-[#B5AFA5] shrink-0">{label}:</span>
                <span className="text-[11px] font-mono text-right">{value}</span>
              </div>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
