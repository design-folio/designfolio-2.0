import { useRef, useState } from "react";
import {
  MapPin, Briefcase, Monitor, Clock, Calendar, Sparkles,
  ChevronRight, FileText, PenLine, ThumbsUp, Mail, ExternalLink,
  X, Loader2, Copy, Check,
} from "lucide-react";
import { FaLinkedin } from "react-icons/fa";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Gauge } from "@/components/ui/gauge-1";
import { MatchGlowCard } from "@/components/ui/glowing-card";
import { _postJobsInteract, _postJobsCustomizeResume, _postJobsCoverLetter, _postJobsFitAnalysis } from "@/network/jobs";
import { toRelativeTime, getSourceLabel, formatSalary } from "@/lib/jobsUtils";

// NOTE: APIS TO BE INTEGRATED HERE — contacts section is always empty from JSearch.
// GET /jobs/:id/contacts would need a separate data source (LinkedIn scraping, etc.)

// ── Small result panel shown below AI buttons ──────────────────────────────
function AiResultPanel({ title, onClose, children }) {
  return (
    <div className="mt-3 rounded-2xl border border-black/[0.08] dark:border-white/[0.07] bg-black/[0.02] dark:bg-white/[0.02] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-black/[0.06] dark:border-white/[0.05]">
        <span className="text-[12px] font-semibold text-foreground/60">{title}</span>
        <button onClick={onClose} className="text-foreground/30 hover:text-foreground transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="px-4 py-3">{children}</div>
    </div>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 text-[11px] text-foreground/40 hover:text-foreground transition-colors"
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export function JobDetailSheet({ job, open, onClose, recommendationId }) {
  const lastJobRef = useRef(null);
  if (job) lastJobRef.current = job;
  const displayJob = job ?? lastJobRef.current;

  // ── AI Agent state — all hooks must be declared before any early return ──
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeResult,  setResumeResult]  = useState(null); // { customizedResume, changes }

  const [letterLoading, setLetterLoading] = useState(false);
  const [letterResult,  setLetterResult]  = useState(null); // { coverLetter }

  const [fitLoading, setFitLoading] = useState(false);
  const [fitResult,  setFitResult]  = useState(null); // { strengths, gaps, overallVerdict }

  if (!displayJob) return null;

  const salaryText = formatSalary(displayJob.salary);

  const handleCustomizeResume = async () => {
    if (resumeLoading) return;
    setResumeResult(null);
    setResumeLoading(true);
    try {
      const res = await _postJobsCustomizeResume(displayJob.id, recommendationId);
      setResumeResult(res.data);
    } catch {
      setResumeResult({ error: "Could not generate resume. Please try again." });
    } finally {
      setResumeLoading(false);
    }
  };

  const handleCoverLetter = async () => {
    if (letterLoading) return;
    setLetterResult(null);
    setLetterLoading(true);
    try {
      const res = await _postJobsCoverLetter(displayJob.id, recommendationId);
      setLetterResult(res.data);
    } catch {
      setLetterResult({ error: "Could not generate cover letter. Please try again." });
    } finally {
      setLetterLoading(false);
    }
  };

  const handleFitAnalysis = async () => {
    if (fitLoading) return;
    setFitResult(null);
    setFitLoading(true);
    try {
      const res = await _postJobsFitAnalysis(displayJob.id, recommendationId);
      setFitResult(res.data);
    } catch {
      setFitResult({ error: "Could not generate fit analysis. Please try again." });
    } finally {
      setFitLoading(false);
    }
  };

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

                  {/* Customize Resume */}
                  <button
                    onClick={handleCustomizeResume}
                    disabled={resumeLoading}
                    className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors group text-left disabled:opacity-60"
                  >
                    <div className="w-9 h-9 rounded-xl bg-foreground/[0.08] group-hover:bg-foreground/[0.11] transition-colors flex items-center justify-center flex-shrink-0">
                      {resumeLoading ? (
                        <Loader2 className="w-4 h-4 text-foreground/55 animate-spin" />
                      ) : (
                        <FileText className="w-4 h-4 text-foreground/55" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-foreground/80 leading-none">
                        Customize Your Resume
                      </div>
                      <div className="text-[11px] text-foreground/40 mt-1 leading-snug">
                        {resumeLoading ? "Generating tailored resume…" : "AI rewrites your CV to match this role's exact requirements"}
                      </div>
                    </div>
                    {!resumeLoading && (
                      <ChevronRight className="w-4 h-4 text-foreground/20 group-hover:text-foreground/45 transition-colors flex-shrink-0" />
                    )}
                  </button>

                  {/* Resume Result */}
                  {resumeResult && (
                    <div className="px-4 pb-3">
                      {resumeResult.error ? (
                        <p className="text-[12px] text-red-500/80">{resumeResult.error}</p>
                      ) : (
                        <AiResultPanel title="Tailored Resume" onClose={() => setResumeResult(null)}>
                          {resumeResult.changes?.length > 0 && (
                            <ul className="space-y-1.5 mb-3">
                              {resumeResult.changes.map((c, i) => (
                                <li key={i} className="flex items-start gap-2 text-[12px] text-foreground/70">
                                  <span className="mt-1 w-1 h-1 rounded-full bg-emerald-500 flex-shrink-0" />
                                  {c}
                                </li>
                              ))}
                            </ul>
                          )}
                          <div className="rounded-lg bg-black/[0.04] dark:bg-white/[0.04] p-3 text-[12px] text-foreground/75 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                            {resumeResult.customizedResume}
                          </div>
                          <div className="flex justify-end mt-2">
                            <CopyButton text={resumeResult.customizedResume} />
                          </div>
                        </AiResultPanel>
                      )}
                    </div>
                  )}

                  <div className="h-px bg-black/[0.05] dark:bg-white/[0.05]" />
                  <div className="grid grid-cols-2 divide-x divide-black/[0.05] dark:divide-white/[0.05]">
                    {/* Cover Letter */}
                    <button
                      onClick={handleCoverLetter}
                      disabled={letterLoading}
                      className="flex items-start gap-2.5 px-4 py-3.5 hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors group text-left disabled:opacity-60"
                    >
                      {letterLoading ? (
                        <Loader2 className="w-3.5 h-3.5 text-foreground/35 flex-shrink-0 mt-0.5 animate-spin" />
                      ) : (
                        <PenLine className="w-3.5 h-3.5 text-foreground/35 flex-shrink-0 mt-0.5 group-hover:text-foreground/55 transition-colors" />
                      )}
                      <div>
                        <div className="text-[12px] font-semibold text-foreground/70 leading-none">
                          Cover Letter
                        </div>
                        <div className="text-[10px] text-foreground/35 mt-1 leading-snug">
                          {letterLoading ? "Drafting…" : "Drafted in seconds"}
                        </div>
                      </div>
                    </button>

                    {/* Fit Analysis */}
                    <button
                      onClick={handleFitAnalysis}
                      disabled={fitLoading}
                      className="flex items-start gap-2.5 px-4 py-3.5 hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors group text-left disabled:opacity-60"
                    >
                      {fitLoading ? (
                        <Loader2 className="w-3.5 h-3.5 text-foreground/35 flex-shrink-0 mt-0.5 animate-spin" />
                      ) : (
                        <ThumbsUp className="w-3.5 h-3.5 text-foreground/35 flex-shrink-0 mt-0.5 group-hover:text-foreground/55 transition-colors" />
                      )}
                      <div>
                        <div className="text-[12px] font-semibold text-foreground/70 leading-none">
                          Fit Analysis
                        </div>
                        <div className="text-[10px] text-foreground/35 mt-1 leading-snug">
                          {fitLoading ? "Analysing…" : "Strengths & gaps"}
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* Cover Letter Result */}
                  {letterResult && (
                    <div className="px-4 pb-3">
                      {letterResult.error ? (
                        <p className="text-[12px] text-red-500/80">{letterResult.error}</p>
                      ) : (
                        <AiResultPanel title="Cover Letter" onClose={() => setLetterResult(null)}>
                          <div className="text-[12px] text-foreground/75 leading-relaxed whitespace-pre-wrap max-h-56 overflow-y-auto">
                            {letterResult.coverLetter}
                          </div>
                          <div className="flex justify-end mt-2">
                            <CopyButton text={letterResult.coverLetter} />
                          </div>
                        </AiResultPanel>
                      )}
                    </div>
                  )}

                  {/* Fit Analysis Result */}
                  {fitResult && (
                    <div className="px-4 pb-3">
                      {fitResult.error ? (
                        <p className="text-[12px] text-red-500/80">{fitResult.error}</p>
                      ) : (
                        <AiResultPanel title="Fit Analysis" onClose={() => setFitResult(null)}>
                          {fitResult.overallVerdict && (
                            <div className="text-[12px] font-semibold text-foreground/80 mb-3 px-3 py-2 rounded-lg bg-black/[0.04] dark:bg-white/[0.04]">
                              {fitResult.overallVerdict}
                            </div>
                          )}
                          {fitResult.strengths?.length > 0 && (
                            <div className="mb-3">
                              <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1.5">Strengths</p>
                              <ul className="space-y-1.5">
                                {fitResult.strengths.map((s, i) => (
                                  <li key={i} className="flex items-start gap-2 text-[12px] text-foreground/70">
                                    <span className="mt-1 w-1 h-1 rounded-full bg-emerald-500 flex-shrink-0" />
                                    {s}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {fitResult.gaps?.length > 0 && (
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-1.5">Gaps</p>
                              <ul className="space-y-1.5">
                                {fitResult.gaps.map((g, i) => (
                                  <li key={i} className="flex items-start gap-2 text-[12px] text-foreground/70">
                                    <span className="mt-1 w-1 h-1 rounded-full bg-amber-500 flex-shrink-0" />
                                    {g}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </AiResultPanel>
                      )}
                    </div>
                  )}
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
