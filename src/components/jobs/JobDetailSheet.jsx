import { useRef, useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  MapPin, Briefcase, Monitor, Clock, Calendar, DollarSign,
  ChevronRight, FileText, PenLine, ExternalLink,
  X, Loader2, Copy, Check, Clapperboard, Crosshair, Zap, Sparkles, Link2,
} from "lucide-react";
import { useGlobalContext } from "@/context/globalContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CompanyLogo } from "./CompanyLogo";
import { MatchBreakdown } from "./MatchBreakdown";
import { _postJobsInteract, _postJobsCustomizeResume, _postJobsCoverLetter, _postJobsFitAnalysis } from "@/network/jobs";
import { _getUserQuota } from "@/network/get-request";
import { _getDocuments } from "@/network/documents";
import DocumentStudio from "./documents/DocumentStudio";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import DOMPurify from "dompurify";
import { toRelativeTime, getSourceLabel } from "@/lib/jobsUtils";

// Descriptions from old DB records are raw HTML; newer LinkedIn scrapes are markdown.
// Detect by presence of block-level HTML tags.
const HTML_TAG_RE = /<(p|div|ul|ol|li|h[1-6]|br|span|a|strong)\b/i;

function formatSalary(salary) {
  if (!salary) return null;
  if (salary.raw) return salary.raw;
  const sym = salary.currency === "USD" ? "$" : (salary.currency ? `${salary.currency} ` : "");
  const fmt = (n) => n >= 1000 ? `${sym}${Math.round(n / 1000)}k` : `${sym}${n}`;
  if (salary.min && salary.max) return `${fmt(salary.min)} – ${fmt(salary.max)}`;
  return salary.min ? fmt(salary.min) : salary.max ? fmt(salary.max) : null;
}
const isHtmlDescription = (str) => HTML_TAG_RE.test(str);

function sanitizeJobHtml(html) {
  if (typeof window === "undefined") return html;
  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    if (node.tagName === "A") {
      node.setAttribute("target", "_blank");
      node.setAttribute("rel", "noopener noreferrer");
    }
  });
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["p","br","ul","ol","li","a","strong","em","b","i","h1","h2","h3","h4","span","div"],
    ALLOWED_ATTR: ["href"],
  });
  DOMPurify.removeHook("afterSanitizeAttributes");
  return clean;
}

const MD_COMPONENTS = {
  p:      ({ children }) => <p className="text-sm text-foreground/75 leading-[1.7] mb-3 last:mb-0">{children}</p>,
  ul:     ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1 text-sm text-foreground/75">{children}</ul>,
  ol:     ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1 text-sm text-foreground/75">{children}</ol>,
  li:     ({ children }) => <li className="leading-[1.6]">{children}</li>,
  a:      ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer"
       className="underline underline-offset-2 text-foreground/60 hover:text-foreground transition-colors">
      {children}
    </a>
  ),
  strong: ({ children }) => <strong className="font-semibold text-foreground/85">{children}</strong>,
  em:     ({ children }) => <em className="italic">{children}</em>,
  h3:     ({ children }) => <h3 className="text-sm font-semibold text-foreground/70 mt-4 mb-1.5">{children}</h3>,
  h2:     ({ children }) => <h2 className="text-sm font-semibold text-foreground/75 mt-4 mb-2">{children}</h2>,
  h1:     ({ children }) => <h1 className="text-base font-semibold text-foreground/80 mt-4 mb-2">{children}</h1>,
};

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

function CreditBadge({ count }) {
  if (count === null) return null;
  return (
    <span className="flex items-center gap-0.5 bg-amber-100 dark:bg-amber-400/20 border border-amber-300/60 dark:border-amber-400/30 rounded-full px-1.5 py-0.5 flex-shrink-0">
      <Zap className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
      <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">{count}</span>
    </span>
  );
}

function ComingSoonBadge() {
  return (
    <span className="relative flex items-center gap-0.5 bg-violet-50 dark:bg-violet-500/10 border border-violet-200/60 dark:border-violet-400/20 rounded-full px-1.5 py-0.5 flex-shrink-0 overflow-hidden cursor-not-allowed">
      {/* sweep shimmer */}
      <span
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-violet-300/25 dark:via-violet-400/15 to-transparent"
        style={{ animation: "comingSoonShimmer 2.4s ease-in-out infinite" }}
      />
      <Sparkles className="w-2 h-2 text-violet-400 dark:text-violet-400 relative z-10 cursor-not-allowed" />
      <span className="text-[9.5px] font-semibold text-violet-500 dark:text-violet-400 tracking-tight relative z-10 cursor-not-allowed">Soon</span>
    </span>
  );
}

export function JobDetailSheet({ job, open, onClose, profileId, pastReports = [], onViewReport, onCreditUsed, onStartMockInterview }) {
  const { userDetails } = useGlobalContext();
  const lastJobRef = useRef(null);
  if (job) lastJobRef.current = job;
  const displayJob = job ?? lastJobRef.current;

  const scrollRef = useRef(null);
  const mockInterviewsRef = useRef(null);

  const scrollToMockInterviews = () => {
    if (scrollRef.current && mockInterviewsRef.current) {
      const container = scrollRef.current;
      const target = mockInterviewsRef.current;
      const targetTop = target.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop - 12;
      container.scrollTo({ top: targetTop, behavior: "smooth" });
    }
  };

  const [copiedShare, setCopiedShare] = useState(false);

  const handleShare = () => {
    if (!displayJob) return;
    const ref = userDetails?.username ? `?ref=${userDetails.username}` : "";
    const url = `${window.location.origin}/jobs/share/${displayJob.id}${ref}`;
    try {
      navigator.clipboard.writeText(url);
    } catch {
      // fallback for older browsers
      const el = document.createElement("textarea");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeResult, setResumeResult] = useState(null);

  const [letterLoading, setLetterLoading] = useState(false);
  const [letterResult, setLetterResult] = useState(null);

  const [fitLoading, setFitLoading] = useState(false);
  const [fitResult, setFitResult] = useState(null);

  // Tailored documents (resume / cover letter) — full-screen studio + per-job versions.
  const [studio, setStudio] = useState({ open: false, type: "resume", docId: null });
  const [jobDocs, setJobDocs] = useState([]);

  const [quota, setQuota] = useState(null);
  const [quotaKey, setQuotaKey] = useState(0);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    _getUserQuota()
      .then((res) => { if (!cancelled) setQuota(res.data?.quota ?? null); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [open, quotaKey]);

  const bumpQuota = () => { setQuotaKey((k) => k + 1); onCreditUsed?.(); };

  const featureRemaining = (key) => {
    if (!quota) return undefined;
    const base  = quota[key]        ?? { limit: 0, used: 0 };
    const topup = quota.topup?.[key] ?? { limit: 0, used: 0 };
    if (base.limit === null) return null; // unlimited — hide badge
    return Math.max(0, (base.limit - base.used) + ((topup.limit ?? 0) - (topup.used ?? 0)));
  };

  useEffect(() => {
    if (!job) return;
    setResumeResult(null);
    setLetterResult(null);
    setFitResult(null);
    scrollRef.current?.scrollTo({ top: 0 });
  }, [job?.id]);

  // Load this job's saved documents (refreshes when the studio closes / after mutations).
  useEffect(() => {
    if (!open || !job?.id || studio.open) return;
    let cancelled = false;
    _getDocuments({ jobId: job.id })
      .then((res) => { if (!cancelled) setJobDocs(res.data || []); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [open, job?.id, studio.open]);

  if (!displayJob) return null;

  const handleCustomizeResume = async () => {
    if (resumeLoading) return;
    setResumeResult(null);
    setResumeLoading(true);
    try {
      const res = await _postJobsCustomizeResume(displayJob.id, profileId);
      setResumeResult(res.data);
      bumpQuota();
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
      const res = await _postJobsCoverLetter(displayJob.id, profileId);
      setLetterResult(res.data);
      bumpQuota();
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
      const res = await _postJobsFitAnalysis(displayJob.id, profileId);
      setFitResult(res.data);
      bumpQuota();
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
    _postJobsInteract(profileId, displayJob.id, "applied");
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()} modal={false}>
      <SheetContent
        className={`inset-y-0 right-0 h-full w-full rounded-none sm:inset-y-3 sm:right-3 sm:h-[calc(100vh-24px)] sm:rounded-2xl ${studio.open ? "sm:w-[920px] sm:max-w-[calc(100vw-24px)]" : "sm:w-[560px] sm:max-w-[560px]"} shadow-2xl !border border-black/[0.09] dark:border-white/[0.09] bg-white dark:bg-[#2A2520] p-0 flex flex-col overflow-hidden [&>button:last-child]:hidden`}
        hasOverlay={false}
        onInteractOutside={(e) => e.preventDefault()}
      >
        {studio.open ? (
          /* Document editor takes over the sheet panel (back button returns to the job) */
          <DocumentStudio
            open
            onClose={() => setStudio((s) => ({ ...s, open: false }))}
            type={studio.type}
            job={displayJob}
            profileId={profileId}
            docId={studio.docId}
            onChange={() => {
              bumpQuota();
              if (job?.id) _getDocuments({ jobId: job.id }).then((res) => setJobDocs(res.data || [])).catch(() => {});
            }}
          />
        ) : (
        <>
        {/* Header */}
        <SheetHeader className="px-5 py-4 border-b border-black/10 dark:border-white/10 flex-shrink-0 flex flex-row items-center justify-between m-0 space-y-0 h-[65px]">
          <SheetTitle className="text-[#1A1A1A] dark:text-[#F0EDE7] text-base font-semibold m-0 truncate">
            {displayJob.role}
          </SheetTitle>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleShare}
              aria-label="Copy share link"
              className={`flex items-center gap-1.5 px-3 h-7 rounded-full border text-xs font-medium transition-all duration-150 ${
                copiedShare
                  ? "bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/30 text-green-600 dark:text-green-400"
                  : "bg-black/[0.04] dark:bg-white/[0.06] border-black/[0.08] dark:border-white/[0.10] text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white hover:bg-black/[0.08] dark:hover:bg-white/[0.10]"
              }`}
            >
              {copiedShare
                ? <><Check className="w-3 h-3" strokeWidth={2.5} />Copied!</>
                : <><Link2 className="w-3 h-3" strokeWidth={2} />Share</>
              }
            </button>
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-7 h-7 flex items-center justify-center rounded-full bg-black/[0.06] dark:bg-white/[0.08] text-black/40 dark:text-white/40 hover:bg-black/[0.10] dark:hover:bg-white/[0.14] hover:text-black dark:hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" strokeWidth={2.5} />
            </button>
          </div>
        </SheetHeader>

        {/* Scrollable body */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto">

          {/* Company hero */}
          <div className="px-5 py-5 border-b border-black/[0.06] dark:border-white/[0.06]">
            <div className="flex items-center gap-3">
              <CompanyLogo logoUrl={displayJob.logoUrl} company={displayJob.company} size={40} />
              <div>
                <div className="text-base font-semibold text-foreground">{displayJob.company}</div>
                <div className="flex items-center gap-1 mt-0.5 text-sm text-foreground/50">
                  <MapPin className="w-3.5 h-3.5" />
                  {displayJob.location}
                </div>
              </div>
            </div>

            {/* Property rows */}
            <div className="mt-5 space-y-3.5">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 w-[124px] flex-shrink-0">
                  <Calendar className="w-4 h-4 text-foreground/30" />
                  <span className="text-sm text-foreground/40">Posted</span>
                </div>
                <span className="inline-flex items-center text-sm text-foreground/65 border border-black/[0.09] dark:border-white/[0.09] rounded-md px-2.5 py-0.5">
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

              {formatSalary(displayJob.salary) && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 w-[124px] flex-shrink-0">
                    <DollarSign className="w-4 h-4 text-foreground/30" />
                    <span className="text-sm text-foreground/40">Salary</span>
                  </div>
                  <span className="inline-flex items-center text-sm text-foreground/65 border border-black/[0.09] dark:border-white/[0.09] rounded-md px-2.5 py-0.5">
                    {formatSalary(displayJob.salary)}
                  </span>
                </div>
              )}

              {/* Match breakdown */}
              <MatchBreakdown job={displayJob} open={open} />

              {/* AI actions card */}
              <div className="rounded-2xl border border-black/[0.08] dark:border-white/[0.07] overflow-hidden bg-gradient-to-b from-black/[0.02] to-transparent dark:from-white/[0.03] dark:to-transparent">

                {/* Mock interview — primary recommended action */}
                <button
                  data-testid="button-jump-mock-interviews"
                  onClick={() => { scrollToMockInterviews(); onStartMockInterview?.(); }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors group text-left border-b border-black/[0.05] dark:border-white/[0.05] cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-black/[0.05] dark:bg-white/[0.06] group-hover:bg-black/[0.07] dark:group-hover:bg-white/[0.09] transition-colors flex items-center justify-center flex-shrink-0">
                    <Clapperboard className="w-3.5 h-3.5 text-foreground/55" />
                  </div>
                  <div className="flex-1 min-w-0 cursor-pointer">
                    <div className="flex items-center gap-2 cursor-pointer">
                      <span className="text-[13px] font-semibold text-foreground/80 group-hover:text-foreground transition-colors leading-none cursor-pointer">Practice with a mock interview</span>
                      <span className="text-[9.5px] font-medium text-foreground/35 leading-none whitespace-nowrap cursor-pointer">✦ Recommended</span>
                    </div>
                    <div className="text-[11px] text-foreground/40 mt-1 leading-snug cursor-pointer">AI-guided session + actionable debrief</div>
                  </div>
                  <CreditBadge count={featureRemaining("mockInterview")} />
                </button>

                {/* 3-column split: resume | cover letter | fit analysis */}
                <div className="grid grid-cols-3 divide-x divide-black/[0.05] dark:divide-white/[0.05]">
                  {/* Tailor resume */}
                  <button
                    onClick={() => setStudio({ open: true, type: "resume", docId: null })}
                    className="flex flex-col items-start gap-2 px-3.5 py-3 hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors group text-left"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="w-6 h-6 rounded-lg bg-black/[0.05] dark:bg-white/[0.06] group-hover:bg-black/[0.07] dark:group-hover:bg-white/[0.09] transition-colors flex items-center justify-center flex-shrink-0">
                        <FileText className="w-3 h-3 text-foreground/45" />
                      </div>
                      <CreditBadge count={featureRemaining("resumeCustomize")} />
                    </div>
                    <div className="text-[11.5px] font-semibold text-foreground/70 group-hover:text-foreground/90 transition-colors leading-snug">
                      Tailor resume
                    </div>
                  </button>

                  {/* Cover letter */}
                  <button
                    onClick={() => setStudio({ open: true, type: "coverLetter", docId: null })}
                    className="flex flex-col items-start gap-2 px-3.5 py-3 hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors group text-left"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="w-6 h-6 rounded-lg bg-black/[0.05] dark:bg-white/[0.06] group-hover:bg-black/[0.07] dark:group-hover:bg-white/[0.09] transition-colors flex items-center justify-center flex-shrink-0">
                        <PenLine className="w-3 h-3 text-foreground/45" />
                      </div>
                      <CreditBadge count={featureRemaining("coverLetter")} />
                    </div>
                    <div className="text-[11.5px] font-semibold text-foreground/70 group-hover:text-foreground/90 transition-colors leading-snug">
                      Cover letter
                    </div>
                  </button>

                  {/* Fit analysis */}
                  <button
                    onClick={handleFitAnalysis}
                    disabled={fitLoading}
                    className="flex flex-col items-start gap-2 px-3.5 py-3 hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors group text-left disabled:opacity-60"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="w-6 h-6 rounded-lg bg-black/[0.05] dark:bg-white/[0.06] group-hover:bg-black/[0.07] dark:group-hover:bg-white/[0.09] transition-colors flex items-center justify-center flex-shrink-0">
                        {fitLoading
                          ? <Loader2 className="w-3 h-3 text-foreground/40 animate-spin" />
                          : <Crosshair className="w-3 h-3 text-foreground/45" />
                        }
                      </div>
                      {!fitLoading && <CreditBadge count={featureRemaining("fitAnalysis")} />}
                    </div>
                    <div className="text-[11.5px] font-semibold text-foreground/70 group-hover:text-foreground/90 transition-colors leading-snug">
                      {fitLoading ? "Analysing…" : "Fit analysis"}
                    </div>
                  </button>
                </div>

                {/* Saved documents for this job (versions) */}
                {jobDocs.length > 0 && (
                  <div className="px-3.5 py-3 border-t border-black/[0.05] dark:border-white/[0.05] space-y-1">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-foreground/35 mb-1">Saved documents</p>
                    {jobDocs.map((d) => (
                      <button
                        key={d._id}
                        onClick={() => setStudio({ open: true, type: d.type, docId: d._id })}
                        className="w-full flex items-center gap-2 py-1.5 text-left group"
                      >
                        {d.type === "resume"
                          ? <FileText className="w-3 h-3 text-foreground/40 flex-shrink-0" />
                          : <PenLine className="w-3 h-3 text-foreground/40 flex-shrink-0" />}
                        <span className="text-[12px] text-foreground/65 group-hover:text-foreground/90 transition-colors">
                          {d.type === "resume" ? "Tailored resume" : "Cover letter"} · v{d.version}
                        </span>
                        <span className="ml-auto text-[10.5px] text-foreground/30">
                          {new Date(d.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* AI result panels */}
                {resumeResult && (
                  resumeResult.error
                    ? <p className="text-[12px] text-red-500/80 px-1">{resumeResult.error}</p>
                    : <AiResultPanel title="Customized Resume" onClose={() => setResumeResult(null)}>
                        <div className="text-[12px] text-foreground/75 leading-relaxed whitespace-pre-wrap max-h-56 overflow-y-auto">
                          {resumeResult.customizedResume}
                        </div>
                        <div className="flex justify-end mt-2">
                          <CopyButton text={resumeResult.customizedResume ?? ""} />
                        </div>
                      </AiResultPanel>
                )}

                {letterResult && (
                  letterResult.error
                    ? <p className="text-[12px] text-red-500/80 px-1">{letterResult.error}</p>
                    : <AiResultPanel title="Cover Letter" onClose={() => setLetterResult(null)}>
                        <div className="text-[12px] text-foreground/75 leading-relaxed whitespace-pre-wrap max-h-56 overflow-y-auto">
                          {letterResult.coverLetter}
                        </div>
                        <div className="flex justify-end mt-2">
                          <CopyButton text={letterResult.coverLetter} />
                        </div>
                      </AiResultPanel>
                )}

                {fitResult && (
                  fitResult.error
                    ? <p className="text-[12px] text-red-500/80 px-1">{fitResult.error}</p>
                    : <AiResultPanel title="Fit Analysis" onClose={() => setFitResult(null)}>
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
            </div>
          </div>

          {/* Description — old DB records are raw HTML; newer LinkedIn scrapes are markdown */}
          {displayJob.description && (
            <div className="px-5 py-5 border-b border-black/[0.06] dark:border-white/[0.06]">
              <h3 className="text-sm font-semibold text-foreground opacity-70 uppercase tracking-widest mb-3">About the role</h3>
              {isHtmlDescription(displayJob.description) ? (
                <div
                  className="job-description text-sm text-foreground/75"
                  dangerouslySetInnerHTML={{ __html: sanitizeJobHtml(displayJob.description) }}
                />
              ) : (
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD_COMPONENTS}>
                  {displayJob.description}
                </ReactMarkdown>
              )}
            </div>
          )}

          {/* Requirements */}
          {(displayJob.requirements ?? []).length > 0 && (
            <div className="px-5 py-5 border-b border-black/[0.06] dark:border-white/[0.06]">
              <h3 className="text-sm font-semibold text-foreground/40 uppercase tracking-widest mb-3">Requirements</h3>
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

          {/* Mock interviews */}
          <div ref={mockInterviewsRef} className="px-5 py-5 pb-8">
            <div className="flex items-baseline justify-between gap-2 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-foreground/35">Mock interviews</span>
              {pastReports.length > 0 && (
                <span className="text-[11px] text-foreground/35">
                  {pastReports.length} session{pastReports.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            <div className="h-px bg-black/[0.06] dark:bg-white/[0.06] mb-0" />

            {pastReports.length === 0 ? (
              <div className="flex items-center gap-3 py-4">
                <div className="w-8 h-8 rounded-lg bg-foreground/[0.04] flex items-center justify-center flex-shrink-0">
                  <Clapperboard className="w-3.5 h-3.5 text-foreground/25" />
                </div>
                <p className="text-[13px] text-foreground/35 leading-snug">No mock sessions yet. Take one to get an actionable debrief.</p>
              </div>
            ) : (
              <div>
                {pastReports.map((entry, i) => {
                  const d = new Date(entry.date);
                  const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                  const timeStr = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
                  const score = entry.report.communicationScore;
                  const scoreColor = score >= 80
                    ? "text-emerald-600 dark:text-emerald-400"
                    : score >= 65
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-red-500 dark:text-red-400";
                  return (
                    <div key={i}>
                      <button
                        data-testid={`button-view-report-${displayJob.id}-${i}`}
                        onClick={() => onViewReport?.(entry)}
                        className="w-full flex items-center justify-between gap-3 py-3 group text-left"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-foreground/[0.04] group-hover:bg-foreground/[0.07] transition-colors flex items-center justify-center flex-shrink-0">
                            <Clapperboard className="w-3.5 h-3.5 text-foreground/35" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-[13px] font-medium text-foreground/75 leading-none">Session {pastReports.length - i}</div>
                            <div className="text-[11px] text-foreground/35 mt-0.5">{dateStr} · {timeStr}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-[15px] font-bold ${scoreColor}`}>{score}</span>
                          <span className="text-[11px] text-foreground/30">/100</span>
                          <ChevronRight className="w-3.5 h-3.5 text-foreground/20 group-hover:text-foreground/45 transition-colors" />
                        </div>
                      </button>
                      {i < pastReports.length - 1 && (
                        <div className="h-px bg-black/[0.04] dark:bg-white/[0.04]" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
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
        </>
        )}
      </SheetContent>
    </Sheet>
  );
}
