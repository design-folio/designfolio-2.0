import { useRef } from "react";
import {
  MapPin, Briefcase, Monitor, Clock, Calendar, Sparkles,
  ChevronRight, FileText, PenLine, ThumbsUp, Mail, ExternalLink,
} from "lucide-react";
import { FaLinkedin } from "react-icons/fa";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Gauge } from "@/components/ui/gauge-1";
import { MatchGlowCard } from "@/components/ui/glowing-card";
import { _postJobsInteract } from "@/network/jobs";
import { toRelativeTime, getSourceLabel, formatSalary } from "@/lib/jobsUtils";

// NOTE: APIS TO BE INTEGRATED HERE — contacts section is always empty from JSearch.
// GET /jobs/:id/contacts would need a separate data source (LinkedIn scraping, etc.)

// NOTE: APIS TO BE INTEGRATED HERE — AI agent actions (Customize Resume, Cover Letter,
// Fit Analysis) require backend endpoints:
//   POST /jobs/customize-resume { jobId, recommendationId }
//   POST /jobs/cover-letter { jobId, recommendationId }
//   POST /jobs/fit-analysis { jobId, recommendationId }

export function JobDetailSheet({ job, open, onClose, recommendationId }) {
  const lastJobRef = useRef(null);
  if (job) lastJobRef.current = job;
  const displayJob = job ?? lastJobRef.current;
  if (!displayJob) return null;

  const salaryText = formatSalary(displayJob.salary);

  const handleApply = () => {
    if (displayJob.applyUrl) {
      window.open(displayJob.applyUrl, "_blank", "noopener,noreferrer");
    }
    _postJobsInteract(recommendationId, displayJob.id, "applied");
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()} modal={false}>
      <SheetContent
        className="inset-y-3 right-3 h-[calc(100vh-24px)] rounded-2xl shadow-2xl !border border-black/[0.09] dark:border-white/[0.09] bg-white dark:bg-[#2A2520] p-0 flex flex-col w-[560px] sm:max-w-[560px] overflow-hidden"
        hasOverlay={false}
        onInteractOutside={(e) => e.preventDefault()}
      >
        {/* Header */}
        <SheetHeader className="px-5 py-4 border-b border-black/10 dark:border-white/10 flex-shrink-0 flex flex-row items-center m-0 space-y-0 h-[65px]">
          <SheetTitle className="text-[#1A1A1A] dark:text-[#F0EDE7] text-base font-semibold m-0 truncate pr-10">
            {displayJob.role}
          </SheetTitle>
        </SheetHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {/* Company hero */}
          <div className="px-5 py-5 border-b border-black/[0.06] dark:border-white/[0.06]">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-sm font-bold"
                  style={{ backgroundColor: displayJob.logoColor }}
                >
                  {displayJob.logoLetter}
                </div>
                <div>
                  <div className="text-base font-semibold text-foreground">{displayJob.company}</div>
                  <div className="flex items-center gap-1 mt-0.5 text-sm text-foreground/50">
                    <MapPin className="w-3.5 h-3.5" />
                    {displayJob.location}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center flex-shrink-0">
                <Gauge
                  value={displayJob.match}
                  size={48}
                  strokeWidth={8}
                  gapPercent={3}
                  primary="success"
                  secondary="rgba(0,0,0,0.06)"
                  showValue={true}
                  showPercentage={false}
                  className={{ textClassName: "fill-emerald-600 dark:fill-emerald-400" }}
                />
                <span className="text-sm text-foreground/40 mt-0.5">match</span>
              </div>
            </div>

            {/* Property rows */}
            <div className="mt-5 space-y-3.5">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 w-[124px] flex-shrink-0">
                  <Calendar className="w-4 h-4 text-foreground/30" />
                  <span className="text-sm text-foreground/40">Posted</span>
                </div>
                <span className="text-sm text-foreground/70">
                  {toRelativeTime(displayJob.postedAt)}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 w-[124px] flex-shrink-0">
                  <Briefcase className="w-4 h-4 text-foreground/30" />
                  <span className="text-sm text-foreground/40">Type</span>
                </div>
                <span className="inline-flex items-center text-sm text-foreground/65 border border-black/[0.09] dark:border-white/[0.09] rounded-md px-2.5 py-0.5">
                  {displayJob.type}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 w-[124px] flex-shrink-0">
                  <Monitor className="w-4 h-4 text-foreground/30" />
                  <span className="text-sm text-foreground/40">Work mode</span>
                </div>
                <span className="inline-flex items-center text-sm text-foreground/65 border border-black/[0.09] dark:border-white/[0.09] rounded-md px-2.5 py-0.5">
                  {displayJob.workMode}
                </span>
              </div>

              {displayJob.yearsExp && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 w-[124px] flex-shrink-0">
                    <Clock className="w-4 h-4 text-foreground/30" />
                    <span className="text-sm text-foreground/40">Experience</span>
                  </div>
                  <span className="inline-flex items-center text-sm text-foreground/65 border border-black/[0.09] dark:border-white/[0.09] rounded-md px-2.5 py-0.5">
                    {displayJob.yearsExp}
                  </span>
                </div>
              )}

              {salaryText && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 w-[124px] flex-shrink-0">
                    <span className="text-foreground/30 text-[13px] font-medium ml-0.5">₹/$</span>
                    <span className="text-sm text-foreground/40">Salary</span>
                  </div>
                  <span className="text-sm text-foreground/70">{salaryText}</span>
                </div>
              )}

              {/* AI Agent card */}
              <div className="pt-1">
                <div className="rounded-2xl border border-black/[0.08] dark:border-white/[0.07] overflow-hidden bg-gradient-to-b from-black/[0.02] to-transparent dark:from-white/[0.03] dark:to-transparent">
                  <div className="flex items-center gap-2 px-4 pt-3.5 pb-3">
                    <div className="w-5 h-5 rounded-md bg-foreground/[0.08] flex items-center justify-center">
                      <Sparkles className="w-3 h-3 fill-foreground/50 text-foreground/50" />
                    </div>
                    <span className="text-[12px] font-semibold text-foreground/65 tracking-tight">
                      AI Agent
                    </span>
                    <span className="ml-auto text-[10px] font-medium text-foreground/30 bg-foreground/[0.05] rounded-full px-2 py-0.5">
                      3 actions
                    </span>
                  </div>

                  <div className="h-px bg-black/[0.05] dark:bg-white/[0.05]" />
                  {/* NOTE: APIS TO BE INTEGRATED HERE — POST /jobs/customize-resume { jobId, recommendationId } */}
                  <button className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors group text-left">
                    <div className="w-9 h-9 rounded-xl bg-foreground/[0.08] group-hover:bg-foreground/[0.11] transition-colors flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-foreground/55" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-foreground/80 leading-none">
                        Customize Your Resume
                      </div>
                      <div className="text-[11px] text-foreground/40 mt-1 leading-snug">
                        AI rewrites your CV to match this role&apos;s exact requirements
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-foreground/20 group-hover:text-foreground/45 transition-colors flex-shrink-0" />
                  </button>

                  <div className="h-px bg-black/[0.05] dark:bg-white/[0.05]" />
                  <div className="grid grid-cols-2 divide-x divide-black/[0.05] dark:divide-white/[0.05]">
                    {/* NOTE: APIS TO BE INTEGRATED HERE — POST /jobs/cover-letter { jobId, recommendationId } */}
                    <button className="flex items-start gap-2.5 px-4 py-3.5 hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors group text-left">
                      <PenLine className="w-3.5 h-3.5 text-foreground/35 flex-shrink-0 mt-0.5 group-hover:text-foreground/55 transition-colors" />
                      <div>
                        <div className="text-[12px] font-semibold text-foreground/70 leading-none">
                          Cover Letter
                        </div>
                        <div className="text-[10px] text-foreground/35 mt-1 leading-snug">
                          Drafted in seconds
                        </div>
                      </div>
                    </button>
                    {/* NOTE: APIS TO BE INTEGRATED HERE — POST /jobs/fit-analysis { jobId, recommendationId } */}
                    <button className="flex items-start gap-2.5 px-4 py-3.5 hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors group text-left">
                      <ThumbsUp className="w-3.5 h-3.5 text-foreground/35 flex-shrink-0 mt-0.5 group-hover:text-foreground/55 transition-colors" />
                      <div>
                        <div className="text-[12px] font-semibold text-foreground/70 leading-none">
                          Fit Analysis
                        </div>
                        <div className="text-[10px] text-foreground/35 mt-1 leading-snug">
                          Strengths &amp; gaps
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Insider connections — only shown if contacts exist */}
              {(displayJob.contacts ?? []).length > 0 && (
                <div className="pt-1">
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-foreground/35">
                      Insider connections
                    </span>
                    <span className="text-[11px] text-foreground/35">
                      Email gets{" "}
                      <span className="font-medium text-foreground/50">3× more replies</span>
                    </span>
                  </div>
                  <div className="h-px bg-black/[0.06] dark:bg-white/[0.06] mb-0" />
                  {displayJob.contacts.map((c, i) => (
                    <div key={c.name}>
                      <div className="flex items-center justify-between gap-3 py-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-foreground/[0.08] flex items-center justify-center text-[10px] font-semibold text-foreground/50 flex-shrink-0">
                            {c.initials}
                          </div>
                          <div className="min-w-0">
                            <div className="text-[13px] font-medium text-foreground/80 leading-none">
                              {c.name}
                            </div>
                            <div className="text-[11px] text-foreground/35 mt-0.5">
                              {displayJob.company}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <a
                            href={`mailto:${c.name.toLowerCase().replace(" ", ".")}@${displayJob.company.toLowerCase()}.com`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[11px] font-medium text-foreground/50 hover:text-foreground/80 hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-all"
                          >
                            <Mail className="w-3 h-3" />
                            Email
                          </a>
                          <a
                            href={`https://linkedin.com/in/${c.name.toLowerCase().replace(" ", "-")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[11px] font-medium text-foreground/50 hover:text-[#0077B5] hover:bg-[#0077B5]/[0.07] transition-all"
                          >
                            <FaLinkedin className="w-3 h-3" />
                            LinkedIn
                          </a>
                        </div>
                      </div>
                      {i < displayJob.contacts.length - 1 && (
                        <div className="h-px bg-black/[0.04] dark:bg-white/[0.04]" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <MatchGlowCard reason={displayJob.reason} className="mt-4" />
          </div>

          {/* Description */}
          {displayJob.description && (
            <div className="px-5 py-5 border-b border-black/[0.06] dark:border-white/[0.06]">
              <h3 className="text-sm font-semibold text-foreground/40 uppercase tracking-widest mb-3">
                About the role
              </h3>
              {displayJob.description.split("\n\n").map((para, i) => (
                <p key={i} className="text-sm text-foreground/75 leading-[1.7] mb-3 last:mb-0">
                  {para}
                </p>
              ))}
            </div>
          )}

          {/* Requirements — only shown if non-empty */}
          {(displayJob.requirements ?? []).length > 0 && (
            <div className="px-5 py-5 pb-8">
              <h3 className="text-sm font-semibold text-foreground/40 uppercase tracking-widest mb-3">
                Requirements
              </h3>
              <ul className="space-y-2.5">
                {displayJob.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/75 leading-[1.6]">
                    <span className="mt-[5px] w-1.5 h-1.5 rounded-full bg-foreground/25 flex-shrink-0" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="px-5 py-4 border-t border-black/[0.06] dark:border-white/[0.06] flex-shrink-0">
          <button
            data-testid={`button-apply-${displayJob.id}`}
            onClick={handleApply}
            className="w-full flex items-center justify-center gap-2 h-10 rounded-full bg-[#1A1A1A] dark:bg-white text-white dark:text-black text-sm font-medium hover:opacity-80 transition-opacity"
          >
            Apply on {getSourceLabel(displayJob.source)}
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
