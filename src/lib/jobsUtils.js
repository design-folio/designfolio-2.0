// ── Relative time from postedAt ISO string ─────────────────────────────────

export const toRelativeTime = (iso) => {
  if (!iso) return "Recently";
  const ms = Date.now() - new Date(iso).getTime();
  const days = Math.floor(ms / 86_400_000);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  if (ms < 3_600_000) return "Just now";
  if (days < 1) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  if (weeks === 1) return "1 week ago";
  if (weeks < 4) return `${weeks} weeks ago`;
  if (months === 1) return "1 month ago";
  return `${months} months ago`;
};

// ── Source domain → readable label ─────────────────────────────────────────

const SOURCE_LABELS = {
  "linkedin.com": "LinkedIn",
  "indeed.com": "Indeed",
  "glassdoor.com": "Glassdoor",
  "lever.co": "Lever",
  "greenhouse.io": "Greenhouse",
  "workday.com": "Workday",
  "naukri.com": "Naukri",
  "internshala.com": "Internshala",
  "wellfound.com": "Wellfound",
  "unstop.com": "Unstop",
};

export const getSourceLabel = (source = "") =>
  SOURCE_LABELS[source] ?? (source || "Job Board");

// ── Salary display ──────────────────────────────────────────────────────────

export const formatSalary = (salary) => {
  if (!salary || (!salary.min && !salary.max)) return null;
  const currency = salary.currency ?? "";
  const period = salary.period ? `/ ${salary.period}` : "";
  if (salary.min && salary.max)
    return `${currency}${salary.min.toLocaleString()} – ${currency}${salary.max.toLocaleString()} ${period}`.trim();
  if (salary.min)
    return `From ${currency}${salary.min.toLocaleString()} ${period}`.trim();
  if (salary.max)
    return `Up to ${currency}${salary.max.toLocaleString()} ${period}`.trim();
  return salary.raw ?? null;
};
