import { motion } from "framer-motion";
import { MapPin, Briefcase, Monitor, Clock, DollarSign, Calendar, ExternalLink } from "lucide-react";
import { toRelativeTime } from "@/lib/jobsUtils";

function formatSalary(salary) {
  if (!salary) return null;
  if (salary.raw) return salary.raw;
  const sym = salary.currency === "USD" ? "$" : (salary.currency ? `${salary.currency} ` : "");
  const fmt = (n) => (n >= 1000 ? `${sym}${Math.round(n / 1000)}k` : `${sym}${n}`);
  if (salary.min && salary.max) return `${fmt(salary.min)} – ${fmt(salary.max)}`;
  return salary.min ? fmt(salary.min) : salary.max ? fmt(salary.max) : null;
}

function Pill({ icon: Icon, children }) {
  return (
    <span className="inline-flex items-center gap-1.5 font-jetbrains text-[10px] font-semibold uppercase tracking-wide text-[#3D3630] dark:text-white/55 bg-[#EAE5DF] dark:bg-[#1F1C1C] rounded-md px-2.5 py-1 whitespace-nowrap">
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </span>
  );
}

export function JobHeroCard({ job, badge }) {
  const salaryLabel = formatSalary(job.salary);
  const postedLabel = job.postedAt ? toRelativeTime(job.postedAt) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white dark:bg-[#28231E] rounded-2xl border border-black/[0.05] dark:border-[#302B28] shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)] p-6"
    >
      {badge && <div className="mb-4">{badge}</div>}

      {/* Logo + title */}
      <div className="flex items-center gap-4 mb-5">
        {job.logoUrl ? (
          <img
            src={job.logoUrl}
            alt={job.company}
            className="w-12 h-12 rounded-xl object-contain border border-black/[0.05] dark:border-white/[0.05] bg-white dark:bg-[#1F1C1C] flex-shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-foreground/[0.08] flex items-center justify-center text-foreground/50 font-bold text-lg flex-shrink-0">
            {job.company?.[0]?.toUpperCase() || "?"}
          </div>
        )}
        <div className="min-w-0">
          <div className="text-[11px] font-semibold text-foreground/40 uppercase tracking-widest mb-0.5">
            {job.company}
          </div>
          <h1 className="text-[22px] font-semibold text-foreground leading-tight truncate">
            {job.role}
          </h1>
        </div>
      </div>

      {/* Pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        {salaryLabel && <Pill icon={DollarSign}>{salaryLabel}</Pill>}
        {job.location && <Pill icon={MapPin}>{job.location}</Pill>}
        {job.type && <Pill icon={Briefcase}>{job.type}</Pill>}
        {job.workMode && <Pill icon={Monitor}>{job.workMode}</Pill>}
        {job.yearsExp && <Pill icon={Clock}>{job.yearsExp}</Pill>}
        {postedLabel && <Pill icon={Calendar}>{postedLabel}</Pill>}
      </div>

      {/* Apply button */}
      <button className="flex items-center gap-2 h-10 px-5 rounded-full bg-[#1A1A1A] dark:bg-white text-white dark:text-black text-sm font-medium hover:opacity-80 transition-opacity active:scale-[0.97]">
        Apply Now
        <ExternalLink className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}
