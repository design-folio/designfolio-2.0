import { useRef, useState, useEffect, startTransition } from "react";
import { useTheme } from "next-themes";
import {
  MapPin,
  Briefcase,
  Monitor,
  Clock,
  Calendar,
  DollarSign,
  ChevronRight,
  FileText,
  PenLine,
  ExternalLink,
  X,
  Loader2,
  Copy,
  Check,
  Clapperboard,
  Crosshair,
  Zap,
  Sparkles,
  Link2,
} from "lucide-react";
import { useGlobalContext } from "@/context/globalContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CompanyLogo } from "./CompanyLogo";
import { MatchBreakdown } from "./MatchBreakdown";
import {
  _postJobsInteract,
  _postJobsCustomizeResume,
  _postJobsCoverLetter,
  _postJobsFitAnalysis,
} from "@/network/jobs";
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
  const sym = salary.currency === "USD" ? "$" : salary.currency ? `${salary.currency} ` : "";
  const fmt = (n) => (n >= 1000 ? `${sym}${Math.round(n / 1000)}k` : `${sym}${n}`);
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
    ALLOWED_TAGS: [
      "p",
      "br",
      "ul",
      "ol",
      "li",
      "a",
      "strong",
      "em",
      "b",
      "i",
      "h1",
      "h2",
      "h3",
      "h4",
      "span",
      "div",
    ],
    ALLOWED_ATTR: ["href"],
  });
  DOMPurify.removeHook("afterSanitizeAttributes");
  return clean;
}

const MD_COMPONENTS = {
  p: ({ children }) => (
    <p className="text-foreground/75 mb-3 text-sm leading-[1.7] last:mb-0">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="text-foreground/75 mb-3 list-disc space-y-1 pl-5 text-sm">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="text-foreground/75 mb-3 list-decimal space-y-1 pl-5 text-sm">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-[1.6]">{children}</li>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-foreground/60 hover:text-foreground underline underline-offset-2 transition-colors"
    >
      {children}
    </a>
  ),
  strong: ({ children }) => (
    <strong className="text-foreground/85 font-semibold">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  h3: ({ children }) => (
    <h3 className="text-foreground/70 mt-4 mb-1.5 text-sm font-semibold">{children}</h3>
  ),
  h2: ({ children }) => (
    <h2 className="text-foreground/75 mt-4 mb-2 text-sm font-semibold">{children}</h2>
  ),
  h1: ({ children }) => (
    <h1 className="text-foreground/80 mt-4 mb-2 text-base font-semibold">{children}</h1>
  ),
};

function AiResultPanel({ title, onClose, children }) {
  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-black/[0.08] bg-black/[0.02] dark:border-white/[0.07] dark:bg-white/[0.02]">
      <div className="flex items-center justify-between border-b border-black/[0.06] px-4 py-3 dark:border-white/[0.05]">
        <span className="text-foreground/60 text-[12px] font-semibold">{title}</span>
        <button
          onClick={onClose}
          className="text-foreground/30 hover:text-foreground transition-colors"
        >
          <X className="h-3.5 w-3.5" />
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
      className="text-foreground/40 hover:text-foreground flex items-center gap-1 text-[11px] transition-colors"
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function CreditBadge({ count }) {
  if (count === null) return null;
  return (
    <span className="flex shrink-0 items-center gap-0.5 rounded-full border border-amber-300/60 bg-amber-100 px-1.5 py-0.5 dark:border-amber-400/30 dark:bg-amber-400/20">
      <Zap className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
      <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">{count}</span>
    </span>
  );
}

function ComingSoonBadge() {
  return (
    <span className="relative flex shrink-0 cursor-not-allowed items-center gap-0.5 overflow-hidden rounded-full border border-violet-200/60 bg-violet-50 px-1.5 py-0.5 dark:border-violet-400/20 dark:bg-violet-500/10">
      {/* sweep shimmer */}
      <span
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-violet-300/25 to-transparent dark:via-violet-400/15"
        style={{ animation: "comingSoonShimmer 2.4s ease-in-out infinite" }}
      />
      <Sparkles className="relative z-10 h-2 w-2 cursor-not-allowed text-violet-400 dark:text-violet-400" />
      <span className="relative z-10 cursor-not-allowed text-[9.5px] font-semibold tracking-tight text-violet-500 dark:text-violet-400">
        Soon
      </span>
    </span>
  );
}

export function JobDetailSheet({
  job,
  open,
  onClose,
  profileId,
  pastReports = [],
  onViewReport,
  onCreditUsed,
  onStartMockInterview,
}) {
  const { userDetails, setShowUpgradeModal, setUpgradeModalSource, setUpgradeModalJob } =
    useGlobalContext();
  const [displayJob, setDisplayJob] = useState(() => job ?? null);
  useEffect(() => {
    if (job != null) startTransition(() => setDisplayJob(job));
  }, [job]);

  const openJobUpgradeModal = (source) => {
    setUpgradeModalSource(source);
    setUpgradeModalJob({
      role: displayJob.role,
      company: displayJob.company,
      logoUrl: displayJob.logoUrl ?? null,
    });
    setShowUpgradeModal(true);
  };

  const scrollRef = useRef(null);
  const mockInterviewsRef = useRef(null);

  const scrollToMockInterviews = () => {
    if (scrollRef.current && mockInterviewsRef.current) {
      const container = scrollRef.current;
      const target = mockInterviewsRef.current;
      const targetTop =
        target.getBoundingClientRect().top -
        container.getBoundingClientRect().top +
        container.scrollTop -
        12;
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
      .then((res) => {
        if (!cancelled) setQuota(res.data?.quota ?? null);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [open, quotaKey]);

  const bumpQuota = () => {
    setQuotaKey((k) => k + 1);
    onCreditUsed?.();
  };

  const featureRemaining = (key) => {
    if (!quota) return undefined;
    const base = quota[key] ?? { limit: 0, used: 0 };
    const topup = quota.topup?.[key] ?? { limit: 0, used: 0 };
    if (base.limit === null) return null; // unlimited — hide badge
    return Math.max(0, base.limit - base.used + ((topup.limit ?? 0) - (topup.used ?? 0)));
  };

  useEffect(() => {
    if (!job) return;
    startTransition(() => {
      setResumeResult(null);
      setLetterResult(null);
      setFitResult(null);
    });
    scrollRef.current?.scrollTo({ top: 0 });
  }, [job]);

  // Load this job's saved documents (refreshes when the studio closes / after mutations).
  useEffect(() => {
    if (!open || !job?.id || studio.open) return;
    let cancelled = false;
    _getDocuments({ jobId: job.id })
      .then((res) => {
        if (!cancelled) setJobDocs(res.data || []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
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
        className={`inset-y-0 right-0 h-full w-full rounded-none sm:inset-y-3 sm:right-3 sm:h-[calc(100vh-24px)] sm:rounded-2xl ${studio.open ? "sm:w-[920px] sm:max-w-[calc(100vw-24px)]" : "sm:w-[560px] sm:max-w-[560px]"} flex flex-col overflow-hidden !border border-black/[0.09] bg-white p-0 shadow-2xl dark:border-white/[0.09] dark:bg-[#2A2520] [&>button:last-child]:hidden`}
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
              if (job?.id)
                _getDocuments({ jobId: job.id })
                  .then((res) => setJobDocs(res.data || []))
                  .catch(() => {});
            }}
          />
        ) : (
          <>
            {/* Header */}
            <SheetHeader className="m-0 flex h-[65px] shrink-0 flex-row items-center justify-between space-y-0 border-b border-black/10 px-5 py-4 dark:border-white/10">
              <SheetTitle className="m-0 truncate text-base font-semibold text-[#1A1A1A] dark:text-[#F0EDE7]">
                {displayJob.role}
              </SheetTitle>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={handleShare}
                  aria-label="Copy share link"
                  className={`flex h-7 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-all duration-150 ${
                    copiedShare
                      ? "border-green-200 bg-green-50 text-green-600 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-400"
                      : "border-black/[0.08] bg-black/[0.04] text-black/50 hover:bg-black/[0.08] hover:text-black dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white/50 dark:hover:bg-white/[0.10] dark:hover:text-white"
                  }`}
                >
                  {copiedShare ? (
                    <>
                      <Check className="h-3 w-3" strokeWidth={2.5} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Link2 className="h-3 w-3" strokeWidth={2} />
                      Share
                    </>
                  )}
                </button>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-black/[0.06] text-black/40 transition-colors hover:bg-black/[0.10] hover:text-black dark:bg-white/[0.08] dark:text-white/40 dark:hover:bg-white/[0.14] dark:hover:text-white"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={2.5} />
                </button>
              </div>
            </SheetHeader>

            {/* Scrollable body */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto">
              {/* Company hero */}
              <div className="border-b border-black/[0.06] px-5 py-5 dark:border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <CompanyLogo
                    logoUrl={displayJob.logoUrl}
                    company={displayJob.company}
                    size={40}
                  />
                  <div>
                    <div className="text-foreground text-base font-semibold">
                      {displayJob.company}
                    </div>
                    <div className="text-foreground/50 mt-0.5 flex items-center gap-1 text-sm">
                      <MapPin className="h-3.5 w-3.5" />
                      {displayJob.location}
                    </div>
                  </div>
                </div>

                {/* Property rows */}
                <div className="mt-5 space-y-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex w-[124px] shrink-0 items-center gap-2">
                      <Calendar className="text-foreground/30 h-4 w-4" />
                      <span className="text-foreground/40 text-sm">Posted</span>
                    </div>
                    <span className="text-foreground/65 inline-flex items-center rounded-md border border-black/[0.09] px-2.5 py-0.5 text-sm dark:border-white/[0.09]">
                      {toRelativeTime(displayJob.postedAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex w-[124px] shrink-0 items-center gap-2">
                      <Briefcase className="text-foreground/30 h-4 w-4" />
                      <span className="text-foreground/40 text-sm">Type</span>
                    </div>
                    <span className="text-foreground/65 inline-flex items-center rounded-md border border-black/[0.09] px-2.5 py-0.5 text-sm dark:border-white/[0.09]">
                      {displayJob.type}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex w-[124px] shrink-0 items-center gap-2">
                      <Monitor className="text-foreground/30 h-4 w-4" />
                      <span className="text-foreground/40 text-sm">Work mode</span>
                    </div>
                    <span className="text-foreground/65 inline-flex items-center rounded-md border border-black/[0.09] px-2.5 py-0.5 text-sm dark:border-white/[0.09]">
                      {displayJob.workMode}
                    </span>
                  </div>

                  {displayJob.yearsExp && (
                    <div className="flex items-center gap-3">
                      <div className="flex w-[124px] shrink-0 items-center gap-2">
                        <Clock className="text-foreground/30 h-4 w-4" />
                        <span className="text-foreground/40 text-sm">Experience</span>
                      </div>
                      <span className="text-foreground/65 inline-flex items-center rounded-md border border-black/[0.09] px-2.5 py-0.5 text-sm dark:border-white/[0.09]">
                        {displayJob.yearsExp}
                      </span>
                    </div>
                  )}

                  {formatSalary(displayJob.salary) && (
                    <div className="flex items-center gap-3">
                      <div className="flex w-[124px] shrink-0 items-center gap-2">
                        <DollarSign className="text-foreground/30 h-4 w-4" />
                        <span className="text-foreground/40 text-sm">Salary</span>
                      </div>
                      <span className="text-foreground/65 inline-flex items-center rounded-md border border-black/[0.09] px-2.5 py-0.5 text-sm dark:border-white/[0.09]">
                        {formatSalary(displayJob.salary)}
                      </span>
                    </div>
                  )}

                  {/* Match breakdown */}
                  <MatchBreakdown job={displayJob} open={open} />

                  {/* AI actions card */}
                  <div className="overflow-hidden rounded-2xl border border-black/[0.08] bg-gradient-to-b from-black/[0.02] to-transparent dark:border-white/[0.07] dark:from-white/[0.03] dark:to-transparent">
                    {/* Mock interview — primary recommended action */}
                    <button
                      data-testid="button-jump-mock-interviews"
                      onClick={() => {
                        if (featureRemaining("mockInterview") === 0) {
                          openJobUpgradeModal("mock-interview");
                          return;
                        }
                        scrollToMockInterviews();
                        onStartMockInterview?.();
                      }}
                      className="group flex w-full cursor-pointer items-center gap-2.5 border-b border-black/[0.05] px-4 py-3 text-left transition-colors hover:bg-black/[0.03] dark:border-white/[0.05] dark:hover:bg-white/[0.03]"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-black/[0.05] transition-colors group-hover:bg-black/[0.07] dark:bg-white/[0.06] dark:group-hover:bg-white/[0.09]">
                        <Clapperboard className="text-foreground/55 h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1 cursor-pointer">
                        <div className="flex cursor-pointer items-center gap-2">
                          <span className="text-foreground/80 group-hover:text-foreground cursor-pointer text-[13px] leading-none font-semibold transition-colors">
                            Practice with a mock interview
                          </span>
                          <span className="text-foreground/35 cursor-pointer text-[9.5px] leading-none font-medium whitespace-nowrap">
                            ✦ Recommended
                          </span>
                        </div>
                        <div className="text-foreground/40 mt-1 cursor-pointer text-[11px] leading-snug">
                          AI-guided session + actionable debrief
                        </div>
                      </div>
                      <CreditBadge count={featureRemaining("mockInterview")} />
                    </button>

                    {/* 3-column split: resume | cover letter | fit analysis */}
                    <div className="grid grid-cols-3 divide-x divide-black/[0.05] dark:divide-white/[0.05]">
                      {/* Tailor resume */}
                      <button
                        onClick={() => {
                          if (featureRemaining("resumeCustomize") === 0) {
                            openJobUpgradeModal("resume");
                            return;
                          }
                          setStudio({ open: true, type: "resume", docId: null });
                        }}
                        className="group flex flex-col items-start gap-2 px-3.5 py-3 text-left transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
                      >
                        <div className="flex w-full items-center justify-between">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-black/[0.05] transition-colors group-hover:bg-black/[0.07] dark:bg-white/[0.06] dark:group-hover:bg-white/[0.09]">
                            <FileText className="text-foreground/45 h-3 w-3" />
                          </div>
                          <CreditBadge count={featureRemaining("resumeCustomize")} />
                        </div>
                        <div className="text-foreground/70 group-hover:text-foreground/90 text-[11.5px] leading-snug font-semibold transition-colors">
                          Tailor resume
                        </div>
                      </button>

                      {/* Cover letter */}
                      <button
                        onClick={() => {
                          if (featureRemaining("coverLetter") === 0) {
                            openJobUpgradeModal("cover-letter");
                            return;
                          }
                          setStudio({ open: true, type: "coverLetter", docId: null });
                        }}
                        className="group flex flex-col items-start gap-2 px-3.5 py-3 text-left transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
                      >
                        <div className="flex w-full items-center justify-between">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-black/[0.05] transition-colors group-hover:bg-black/[0.07] dark:bg-white/[0.06] dark:group-hover:bg-white/[0.09]">
                            <PenLine className="text-foreground/45 h-3 w-3" />
                          </div>
                          <CreditBadge count={featureRemaining("coverLetter")} />
                        </div>
                        <div className="text-foreground/70 group-hover:text-foreground/90 text-[11.5px] leading-snug font-semibold transition-colors">
                          Cover letter
                        </div>
                      </button>

                      {/* Fit analysis */}
                      <button
                        onClick={() => {
                          if (featureRemaining("fitAnalysis") === 0) {
                            openJobUpgradeModal("fit-analysis");
                            return;
                          }
                          handleFitAnalysis();
                        }}
                        disabled={fitLoading}
                        className="group flex flex-col items-start gap-2 px-3.5 py-3 text-left transition-colors hover:bg-black/[0.03] disabled:opacity-60 dark:hover:bg-white/[0.03]"
                      >
                        <div className="flex w-full items-center justify-between">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-black/[0.05] transition-colors group-hover:bg-black/[0.07] dark:bg-white/[0.06] dark:group-hover:bg-white/[0.09]">
                            {fitLoading ? (
                              <Loader2 className="text-foreground/40 h-3 w-3 animate-spin" />
                            ) : (
                              <Crosshair className="text-foreground/45 h-3 w-3" />
                            )}
                          </div>
                          {!fitLoading && <CreditBadge count={featureRemaining("fitAnalysis")} />}
                        </div>
                        <div className="text-foreground/70 group-hover:text-foreground/90 text-[11.5px] leading-snug font-semibold transition-colors">
                          {fitLoading ? "Analysing…" : "Fit analysis"}
                        </div>
                      </button>
                    </div>

                    {/* Saved documents for this job (versions) */}
                    {jobDocs.length > 0 && (
                      <div className="space-y-1 border-t border-black/[0.05] px-3.5 py-3 dark:border-white/[0.05]">
                        <p className="text-foreground/35 mb-1 text-[10px] font-semibold tracking-widest uppercase">
                          Saved documents
                        </p>
                        {jobDocs.map((d) => (
                          <button
                            key={d._id}
                            onClick={() => setStudio({ open: true, type: d.type, docId: d._id })}
                            className="group flex w-full items-center gap-2 py-1.5 text-left"
                          >
                            {d.type === "resume" ? (
                              <FileText className="text-foreground/40 h-3 w-3 shrink-0" />
                            ) : (
                              <PenLine className="text-foreground/40 h-3 w-3 shrink-0" />
                            )}
                            <span className="text-foreground/65 group-hover:text-foreground/90 text-[12px] transition-colors">
                              {d.type === "resume" ? "Tailored resume" : "Cover letter"}
                            </span>
                            <span className="text-foreground/30 ml-auto text-[10.5px]">
                              {new Date(d.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* AI result panels */}
                    {resumeResult &&
                      (resumeResult.error ? (
                        <p className="px-1 text-[12px] text-red-500/80">{resumeResult.error}</p>
                      ) : (
                        <AiResultPanel
                          title="Customized Resume"
                          onClose={() => setResumeResult(null)}
                        >
                          <div className="text-foreground/75 max-h-56 overflow-y-auto text-[12px] leading-relaxed whitespace-pre-wrap">
                            {resumeResult.customizedResume}
                          </div>
                          <div className="mt-2 flex justify-end">
                            <CopyButton text={resumeResult.customizedResume ?? ""} />
                          </div>
                        </AiResultPanel>
                      ))}

                    {letterResult &&
                      (letterResult.error ? (
                        <p className="px-1 text-[12px] text-red-500/80">{letterResult.error}</p>
                      ) : (
                        <AiResultPanel title="Cover Letter" onClose={() => setLetterResult(null)}>
                          <div className="text-foreground/75 max-h-56 overflow-y-auto text-[12px] leading-relaxed whitespace-pre-wrap">
                            {letterResult.coverLetter}
                          </div>
                          <div className="mt-2 flex justify-end">
                            <CopyButton text={letterResult.coverLetter} />
                          </div>
                        </AiResultPanel>
                      ))}

                    {fitResult &&
                      (fitResult.error ? (
                        <p className="px-1 text-[12px] text-red-500/80">{fitResult.error}</p>
                      ) : (
                        <AiResultPanel title="Fit Analysis" onClose={() => setFitResult(null)}>
                          {fitResult.overallVerdict && (
                            <div className="text-foreground/80 mb-3 rounded-lg bg-black/[0.04] px-3 py-2 text-[12px] font-semibold dark:bg-white/[0.04]">
                              {fitResult.overallVerdict}
                            </div>
                          )}
                          {fitResult.strengths?.length > 0 && (
                            <div className="mb-3">
                              <p className="mb-1.5 text-[10px] font-semibold tracking-widest text-emerald-600 uppercase dark:text-emerald-400">
                                Strengths
                              </p>
                              <ul className="space-y-1.5">
                                {fitResult.strengths.map((s, i) => (
                                  <li
                                    key={i}
                                    className="text-foreground/70 flex items-start gap-2 text-[12px]"
                                  >
                                    <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-emerald-500" />
                                    {s}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {fitResult.gaps?.length > 0 && (
                            <div>
                              <p className="mb-1.5 text-[10px] font-semibold tracking-widest text-amber-600 uppercase dark:text-amber-400">
                                Gaps
                              </p>
                              <ul className="space-y-1.5">
                                {fitResult.gaps.map((g, i) => (
                                  <li
                                    key={i}
                                    className="text-foreground/70 flex items-start gap-2 text-[12px]"
                                  >
                                    <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-amber-500" />
                                    {g}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </AiResultPanel>
                      ))}
                  </div>
                </div>
              </div>

              {/* Description — old DB records are raw HTML; newer LinkedIn scrapes are markdown */}
              {displayJob.description && (
                <div className="border-b border-black/[0.06] px-5 py-5 dark:border-white/[0.06]">
                  <h3 className="text-foreground mb-3 text-sm font-semibold tracking-widest uppercase opacity-70">
                    About the role
                  </h3>
                  {isHtmlDescription(displayJob.description) ? (
                    <div
                      className="job-description text-foreground/75 text-sm"
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
                <div className="border-b border-black/[0.06] px-5 py-5 dark:border-white/[0.06]">
                  <h3 className="text-foreground/40 mb-3 text-sm font-semibold tracking-widest uppercase">
                    Requirements
                  </h3>
                  <ul className="space-y-2.5">
                    {displayJob.requirements.map((req, i) => (
                      <li
                        key={i}
                        className="text-foreground/75 flex items-start gap-2.5 text-sm leading-[1.6]"
                      >
                        <span className="bg-foreground/25 mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Mock interviews */}
              <div ref={mockInterviewsRef} className="px-5 py-5 pb-8">
                <div className="mb-1 flex items-baseline justify-between gap-2">
                  <span className="text-foreground/35 text-[11px] font-semibold tracking-widest uppercase">
                    Mock interviews
                  </span>
                  {pastReports.length > 0 && (
                    <span className="text-foreground/35 text-[11px]">
                      {pastReports.length} session{pastReports.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <div className="mb-0 h-px bg-black/[0.06] dark:bg-white/[0.06]" />

                {pastReports.length === 0 ? (
                  <div className="flex items-center gap-3 py-4">
                    <div className="bg-foreground/[0.04] flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                      <Clapperboard className="text-foreground/25 h-3.5 w-3.5" />
                    </div>
                    <p className="text-foreground/35 text-[13px] leading-snug">
                      No mock sessions yet. Take one to get an actionable debrief.
                    </p>
                  </div>
                ) : (
                  <div>
                    {pastReports.map((entry, i) => {
                      const d = new Date(entry.date);
                      const dateStr = d.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      });
                      const timeStr = d.toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      });
                      const score = entry.report.communicationScore;
                      const scoreColor =
                        score >= 80
                          ? "text-emerald-600 dark:text-emerald-400"
                          : score >= 65
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-red-500 dark:text-red-400";
                      return (
                        <div key={i}>
                          <button
                            data-testid={`button-view-report-${displayJob.id}-${i}`}
                            onClick={() => onViewReport?.(entry)}
                            className="group flex w-full items-center justify-between gap-3 py-3 text-left"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="bg-foreground/[0.04] group-hover:bg-foreground/[0.07] flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors">
                                <Clapperboard className="text-foreground/35 h-3.5 w-3.5" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-foreground/75 text-[13px] leading-none font-medium">
                                  Session {pastReports.length - i}
                                </div>
                                <div className="text-foreground/35 mt-0.5 text-[11px]">
                                  {dateStr} · {timeStr}
                                </div>
                              </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                              <span className={`text-[15px] font-bold ${scoreColor}`}>{score}</span>
                              <span className="text-foreground/30 text-[11px]">/100</span>
                              <ChevronRight className="text-foreground/20 group-hover:text-foreground/45 h-3.5 w-3.5 transition-colors" />
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
            <div className="shrink-0 border-t border-black/[0.06] px-5 py-4 dark:border-white/[0.06]">
              <button
                data-testid={`button-apply-${displayJob.id}`}
                onClick={handleApply}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-full bg-[#1A1A1A] text-sm font-medium text-white transition-opacity hover:opacity-80 dark:bg-white dark:text-black"
              >
                Apply on {getSourceLabel(displayJob.source)}
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
