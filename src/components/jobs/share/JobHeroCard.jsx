import { motion } from "motion/react";
import {
  MapPin,
  Briefcase,
  Monitor,
  Clock,
  DollarSign,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { toRelativeTime } from "@/lib/jobsUtils";

function formatSalary(salary) {
  if (!salary) return null;
  if (salary.raw) return salary.raw;
  const sym = salary.currency === "USD" ? "$" : salary.currency ? `${salary.currency} ` : "";
  const fmt = (n) => (n >= 1000 ? `${sym}${Math.round(n / 1000)}k` : `${sym}${n}`);
  if (salary.min && salary.max) return `${fmt(salary.min)} – ${fmt(salary.max)}`;
  return salary.min ? fmt(salary.min) : salary.max ? fmt(salary.max) : null;
}

function Pill({ icon: Icon, children }) {
  return (
    <span className="font-jetbrains inline-flex items-center gap-1.5 rounded-md bg-[#EAE5DF] px-2.5 py-1 text-[10px] font-semibold tracking-wide whitespace-nowrap text-[#3D3630] uppercase dark:bg-[#1F1C1C] dark:text-white/55">
      {Icon && <Icon className="h-3 w-3" />}
      {children}
    </span>
  );
}

export function JobHeroCard({ job, badge, authState, onApplyClick }) {
  const salaryLabel = formatSalary(job.salary);
  const postedLabel = job.postedAt ? toRelativeTime(job.postedAt) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-black/[0.05] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:border-[#302B28] dark:bg-[#28231E] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
    >
      {badge && <div className="mb-4">{badge}</div>}

      {/* Logo + title */}
      <div className="mb-5 flex items-center gap-4">
        {job.logoUrl ? (
          <img
            src={job.logoUrl}
            alt={job.company}
            className="h-12 w-12 shrink-0 rounded-xl border border-black/[0.05] bg-white object-contain dark:border-white/[0.05] dark:bg-[#1F1C1C]"
          />
        ) : (
          <div className="bg-foreground/[0.08] text-foreground/50 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold">
            {job.company?.[0]?.toUpperCase() || "?"}
          </div>
        )}
        <div className="min-w-0">
          <div className="text-foreground/40 mb-0.5 text-[11px] font-semibold tracking-widest uppercase">
            {job.company}
          </div>
          <h1 className="text-foreground truncate text-[22px] leading-tight font-semibold">
            {job.role}
          </h1>
        </div>
      </div>

      {/* Pills */}
      <div className="mb-5 flex flex-wrap gap-2">
        {salaryLabel && <Pill icon={DollarSign}>{salaryLabel}</Pill>}
        {job.location && <Pill icon={MapPin}>{job.location}</Pill>}
        {job.type && <Pill icon={Briefcase}>{job.type}</Pill>}
        {job.workMode && <Pill icon={Monitor}>{job.workMode}</Pill>}
        {job.yearsExp && <Pill icon={Clock}>{job.yearsExp}</Pill>}
        {postedLabel && <Pill icon={Calendar}>{postedLabel}</Pill>}
      </div>

      {/* Apply button */}
      <button
        className="flex h-10 items-center gap-2 rounded-full bg-[#1A1A1A] px-5 text-sm font-medium text-white transition-opacity hover:opacity-80 active:scale-[0.97] dark:bg-white dark:text-black"
        onClick={() => {
          if (authState === "new") {
            onApplyClick?.();
          } else {
            window.open(job.applyUrl, "_blank");
          }
        }}
      >
        Apply Now
        <ExternalLink className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}
