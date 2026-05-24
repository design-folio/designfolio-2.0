import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import axios from "axios";
import Head from "next/head";
import Link from "next/link";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Briefcase, Monitor, Clock, DollarSign,
  Check, BookmarkPlus, ArrowRight, Rocket,
  Cpu, LayoutDashboard, FileText, Clapperboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { _getJobsHistory, _postJobsAddFromShare } from "@/network/jobs";
import { toRelativeTime } from "@/lib/jobsUtils";
import { getUserAvatarImage } from "@/lib/getAvatarUrl";
import MemoDFLogoV2 from "@/components/icons/DFLogoV2";
import { AvatarDropdown } from "@/components/loggedInHeader/avatar-dropdown";

// ── Motion constants (Emil Kowalski principles) ───────────────────────────────
// Strong ease-out: immediate start → responsive feel
const EASE_OUT = [0.23, 1, 0.32, 1];

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: EASE_OUT } },
};

// ── Salary formatter ──────────────────────────────────────────────────────────
function formatSalary(salary) {
  if (!salary) return null;
  if (salary.raw) return salary.raw;
  const sym = salary.currency === "USD" ? "$" : (salary.currency ? `${salary.currency} ` : "");
  const fmt = (n) => (n >= 1000 ? `${sym}${Math.round(n / 1000)}k` : `${sym}${n}`);
  if (salary.min && salary.max) return `${fmt(salary.min)} – ${fmt(salary.max)}`;
  return salary.min ? fmt(salary.min) : salary.max ? fmt(salary.max) : null;
}

// ── Markdown renderer (matches JobDetailSheet exactly) ────────────────────────
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

// ── Tag pill ──────────────────────────────────────────────────────────────────
function Tag({ icon: Icon, label, accent, delay = 0 }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.22, ease: EASE_OUT, delay }}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
        accent
          ? "bg-[#FF553E]/[0.08] border-[#FF553E]/[0.15] text-[#FF553E]"
          : "bg-card border-border text-foreground/60"
      }`}
    >
      {Icon && <Icon className="w-3 h-3" />}
      {label}
    </motion.span>
  );
}

// ── Minimal fixed nav — suppresses the global LoggedInHeader on this page ─────
function ShareNav({ authState }) {
  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.28, ease: EASE_OUT }}
      className="fixed top-0 left-0 right-0 z-50 h-14 bg-background/90 backdrop-blur-md border-b border-border"
    >
      <div className="max-w-[960px] mx-auto px-5 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0 flex items-center">
          <MemoDFLogoV2 />
        </Link>

        {/* Right side — auth-aware */}
        <AnimatePresence mode="wait">
          {authState === "loading" && (
            <motion.div
              key="nav-skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="h-8 w-20 rounded-full bg-foreground/[0.06] animate-pulse"
            />
          )}

          {authState === "new" && (
            <motion.div
              key="nav-new"
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -4 }}
              transition={{ duration: 0.22, ease: EASE_OUT }}
              className="flex items-center gap-2"
            >
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="h-8 rounded-full px-4 text-sm text-foreground/65 hover:text-foreground transition-all duration-[160ms] active:scale-[0.97]"
              >
                <Link href="/login">Sign in</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="h-8 rounded-full px-4 text-sm bg-[#FF553E] hover:bg-[#e64d38] text-white border-transparent transition-all duration-[160ms] active:scale-[0.97]"
              >
                <Link href="/signup">Get started</Link>
              </Button>
            </motion.div>
          )}

          {(authState === "loggedin" || authState === "saved") && (
            <motion.div
              key="nav-auth"
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -4 }}
              transition={{ duration: 0.22, ease: EASE_OUT }}
              className="flex items-center gap-2"
            >
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="h-8 rounded-full px-4 text-sm text-foreground/65 hover:text-foreground transition-all duration-[160ms] active:scale-[0.97]"
              >
                <Link href="/jobs">My board</Link>
              </Button>
              {/* Same AvatarDropdown used in the main navbar — no portfolio builder */}
              <AvatarDropdown />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}

// ── SharerBadge ───────────────────────────────────────────────────────────────
function SharerBadge({ sharer, sharerUsername }) {
  const [imgBroken, setImgBroken] = useState(false);
  const name = sharer
    ? [sharer.firstName, sharer.lastName].filter(Boolean).join(" ") || sharerUsername
    : null;
  if (!name) return null;
  const avatarUrl = sharer ? getUserAvatarImage(sharer) : null;
  return (
    <motion.div variants={fadeUp} className="mb-7">
      <div className="inline-flex items-center gap-2 bg-card border border-border rounded-full px-3.5 py-1.5">
        {avatarUrl && !imgBroken ? (
          <img
            src={avatarUrl}
            alt={name}
            className="w-5 h-5 rounded-full object-cover flex-shrink-0"
            onError={() => setImgBroken(true)}
          />
        ) : (
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#FF553E] to-[#a855f7] flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">
            {name[0]?.toUpperCase()}
          </div>
        )}
        <span className="text-xs text-foreground/60">
          <span className="font-medium text-foreground/80">{name}</span> shared this with you
        </span>
      </div>
    </motion.div>
  );
}

// ── JobHeader ─────────────────────────────────────────────────────────────────
function JobHeader({ job }) {
  return (
    <motion.div variants={fadeUp} className="flex items-start gap-4 mb-5">
      {job.logoUrl ? (
        <img
          src={job.logoUrl}
          alt={job.company}
          className="w-14 h-14 rounded-2xl object-contain border border-border bg-card flex-shrink-0"
        />
      ) : (
        <div className="w-14 h-14 rounded-2xl bg-foreground/[0.06] border border-border flex items-center justify-center text-foreground/40 font-bold text-xl flex-shrink-0">
          {job.company?.[0]?.toUpperCase() || "?"}
        </div>
      )}
      <div className="min-w-0 pt-1">
        <h1 className="text-[26px] font-bold tracking-tight text-foreground leading-tight mb-1">
          {job.role}
        </h1>
        <p className="text-base text-foreground/55">{job.company}</p>
      </div>
    </motion.div>
  );
}

// ── JobMeta ───────────────────────────────────────────────────────────────────
function JobMeta({ job }) {
  const salaryLabel = formatSalary(job.salary);
  const postedLabel = job.postedAt ? toRelativeTime(job.postedAt) : null;
  const tags = [
    salaryLabel  && { icon: DollarSign, label: salaryLabel,            accent: true  },
    job.workMode && { icon: Monitor,    label: job.workMode,            accent: false },
    job.type     && { icon: Briefcase,  label: job.type,                accent: false },
    job.location && { icon: MapPin,     label: job.location,            accent: false },
    job.yearsExp && { icon: Clock,      label: job.yearsExp,            accent: false },
    postedLabel  && { icon: Clock,      label: `Posted ${postedLabel}`, accent: false },
  ].filter(Boolean);
  return (
    <motion.div variants={fadeUp} className="flex flex-wrap gap-2 mb-8">
      {tags.map((t, i) => (
        <Tag key={i} icon={t.icon} label={t.label} accent={t.accent} delay={i * 0.04} />
      ))}
    </motion.div>
  );
}

// ── JobDescription ────────────────────────────────────────────────────────────
function JobDescription({ description }) {
  if (!description) return null;
  return (
    <motion.div variants={fadeUp}>
      <h2 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/35 mb-4">
        About the role
      </h2>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD_COMPONENTS}>
        {description}
      </ReactMarkdown>
    </motion.div>
  );
}

// ── Designfolio features ──────────────────────────────────────────────────────
const DF_FEATURES = [
  { icon: Cpu,             label: "AI job matching",  desc: "Personalized picks based on your profile" },
  { icon: LayoutDashboard, label: "Kanban board",     desc: "Track every application stage visually"   },
  { icon: FileText,        label: "Resume tailoring", desc: "One-click resume for each role"           },
  { icon: Clapperboard,    label: "Mock interviews",  desc: "AI-guided sessions with debrief"          },
];

// ── SidebarFeatures ───────────────────────────────────────────────────────────
function SidebarFeatures() {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 mt-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-foreground/35 mb-3">
        What you get
      </p>
      <ul className="space-y-3">
        {DF_FEATURES.map(({ icon: Icon, label, desc }) => (
          <li key={label} className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-md bg-foreground/[0.05] flex items-center justify-center flex-shrink-0 mt-0.5">
              <Icon className="w-3.5 h-3.5 text-foreground/45" />
            </div>
            <div>
              <p className="text-xs font-medium text-foreground/80 leading-none mb-0.5">{label}</p>
              <p className="text-[11px] text-foreground/45 leading-snug">{desc}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── FooterPitch — shown below description for unauthenticated visitors ────────
function FooterPitch({ jobId }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28, ease: EASE_OUT }}
      className="rounded-2xl border border-border bg-card p-6 mt-8"
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-foreground/35 mb-4">
        Why Designfolio
      </p>
      <div className="grid grid-cols-2 gap-3 mb-5">
        {DF_FEATURES.map(({ icon: Icon, label, desc }) => (
          <div key={label} className="flex flex-col gap-1.5">
            <div className="w-7 h-7 rounded-lg bg-foreground/[0.05] flex items-center justify-center">
              <Icon className="w-3.5 h-3.5 text-foreground/50" />
            </div>
            <p className="text-xs font-semibold text-foreground/75 leading-tight">{label}</p>
            <p className="text-[11px] text-foreground/40 leading-snug">{desc}</p>
          </div>
        ))}
      </div>
      <Button
        asChild
        className="w-full bg-[#FF553E] hover:bg-[#e64d38] text-white border-transparent transition-all duration-[160ms] active:scale-[0.97]"
      >
        <Link href={`/signup?job=${jobId || ""}`}>
          <Rocket className="w-4 h-4" />
          Apply &amp; Track — it&apos;s free
        </Link>
      </Button>
      <p className="text-center text-[11px] text-foreground/35 mt-2.5">
        Free account · No credit card required
      </p>
    </motion.div>
  );
}

// ── CTA loading skeleton ──────────────────────────────────────────────────────
function CTASkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
      <div className="h-9 rounded-full bg-foreground/[0.06] animate-pulse" />
      <div className="h-3 w-2/3 mx-auto rounded-full bg-foreground/[0.04] animate-pulse" />
    </div>
  );
}

// ── ApplyCTA — three auth states ──────────────────────────────────────────────
// SECURITY: applyUrl is intentionally absent — the actual apply URL requires login
function ApplyCTA({ authState, isSaving, onSave, salary, jobId }) {
  const salaryLabel = formatSalary(salary);
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      {salaryLabel && (
        <div className="flex items-baseline gap-1.5 mb-4 pb-4 border-b border-border">
          <DollarSign className="w-4 h-4 text-foreground/40 self-center" />
          <span className="text-xl font-bold tracking-tight text-foreground">{salaryLabel}</span>
          <span className="text-sm text-foreground/40">/yr</span>
        </div>
      )}

      <AnimatePresence mode="wait">
        {authState === "new" && (
          <motion.div
            key="cta-new"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: EASE_OUT }}
            className="space-y-2"
          >
            <Button
              asChild
              className="w-full bg-[#FF553E] hover:bg-[#e64d38] text-white border-transparent transition-all duration-[160ms] active:scale-[0.97]"
            >
              <Link href={`/signup?job=${jobId}`}>
                <Rocket className="w-4 h-4" />
                Apply &amp; Track this Job
              </Link>
            </Button>
            <p className="text-center text-[11px] text-foreground/40">
              Free account · No credit card ·{" "}
              <Link href="/login" className="text-[#FF553E] hover:underline">Sign in</Link>
            </p>
          </motion.div>
        )}

        {authState === "loggedin" && (
          <motion.div
            key="cta-loggedin"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: EASE_OUT }}
            className="space-y-2"
          >
            <Button
              variant="default"
              className="w-full transition-all duration-[160ms] active:scale-[0.97]"
              onClick={onSave}
              disabled={isSaving}
            >
              <BookmarkPlus className="w-4 h-4" />
              {isSaving ? "Saving…" : "Save to my board"}
            </Button>
            <p className="text-center text-[11px] text-foreground/40">
              Adds to your <span className="font-medium text-foreground/60">Saved</span> column
            </p>
          </motion.div>
        )}

        {authState === "saved" && (
          <motion.div
            key="cta-saved"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: EASE_OUT }}
            className="space-y-2"
          >
            <Button variant="secondary" className="w-full pointer-events-none opacity-60" disabled>
              <Check className="w-4 h-4" />
              Already saved
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full transition-all duration-[160ms] active:scale-[0.97]"
            >
              <Link href="/jobs">
                Go to my board
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── ShareFooter ───────────────────────────────────────────────────────────────
function ShareFooter() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: EASE_OUT, delay: 0.45 }}
      className="border-t border-border"
    >
      <div className="max-w-[960px] mx-auto px-5 py-7 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <MemoDFLogoV2 />
          <span className="text-sm text-foreground/45">The job tracker for designers</span>
        </div>
        <nav className="flex items-center gap-5">
          {[
            { label: "Privacy",     href: "/privacy-policy"        },
            { label: "Terms",       href: "/terms-and-conditions"  },
            { label: "Designfolio", href: "/"                      },
          ].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="text-xs text-foreground/40 hover:text-foreground/70 transition-colors duration-150"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </motion.footer>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function SharedJobPage({ job, sharer, sharerUsername }) {
  // "loading" | "new" | "loggedin" | "saved"
  const [authState, setAuthState] = useState("loading");
  const [isSaving, setIsSaving] = useState(false);

  // Canvas theme: warm beige bg in light, sepia dark
  useEffect(() => {
    document.documentElement.dataset.template = "canvas";
    return () => document.documentElement.removeAttribute("data-template");
  }, []);

  // Auth detection — checks cookie, then job history to see if already saved
  useEffect(() => {
    const token = Cookies.get("df-token");
    if (!token) { setAuthState("new"); return; }
    _getJobsHistory()
      .then(({ data }) => {
        const p = data?.columns;
        const allIds = [
          ...(p?.saved     || []),
          ...(p?.applied   || []),
          ...(p?.interview || []),
          ...(p?.offer     || []),
          ...(p?.archived  || []),
        ];
        setAuthState(allIds.includes(job.id) ? "saved" : "loggedin");
      })
      .catch(() => setAuthState("loggedin"));
  }, [job.id]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await _postJobsAddFromShare(job.id);
      setAuthState("saved");
    } catch { /* axiosInstance surfaces a toast */ }
    finally { setIsSaving(false); }
  };

  return (
    <>
      <Head>
        <title>{job.role} at {job.company} · Designfolio</title>
        <meta
          name="description"
          content={`${job.role} at ${job.company}${job.location ? ` — ${job.location}` : ""}. Track your application with Designfolio.`}
        />
      </Head>

      {/* bg-background → canvas warm beige (light) / sepia dark via data-template */}
      <div className="min-h-screen bg-background flex flex-col">

        {/* Fixed nav — replaces the global LoggedInHeader (suppressed via hideHeader) */}
        <ShareNav authState={authState} />

        {/* Content — pt-20 = 56px nav + 24px breathing room */}
        <div className="flex-1 max-w-[960px] mx-auto w-full px-5 pt-20 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_268px] gap-7 items-start">

            {/* ── Left: job details ───────────────────────────────────────── */}
            <motion.div variants={stagger} initial="hidden" animate="visible">
              <SharerBadge sharer={sharer} sharerUsername={sharerUsername} />
              <JobHeader job={job} />
              <JobMeta job={job} />

              {/* Mobile-only CTA card */}
              <motion.div variants={fadeUp} className="mb-8 md:hidden space-y-3">
                {authState === "loading" ? <CTASkeleton /> : (
                  <ApplyCTA
                    authState={authState}
                    isSaving={isSaving}
                    onSave={handleSave}
                    salary={job.salary}
                    jobId={job.id}
                  />
                )}
                {authState === "new" && <SidebarFeatures />}
              </motion.div>

              <JobDescription description={job.description} />

              {/* Footer pitch — only for unauthenticated visitors */}
              <AnimatePresence>
                {authState === "new" && <FooterPitch key="pitch" jobId={job.id} />}
              </AnimatePresence>
            </motion.div>

            {/* ── Right: sticky sidebar (desktop only) ────────────────────── */}
            {/* top-20 matches pt-20 so it's flush with content start */}
            <motion.div
              className="hidden md:flex flex-col gap-3 sticky top-20"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, ease: EASE_OUT, delay: 0.16 }}
            >
              {authState === "loading" ? <CTASkeleton /> : (
                <ApplyCTA
                  authState={authState}
                  isSaving={isSaving}
                  onSave={handleSave}
                  salary={job.salary}
                  jobId={job.id}
                />
              )}
              <SidebarFeatures />
            </motion.div>

          </div>
        </div>

        {/* Footer */}
        <ShareFooter />
      </div>
    </>
  );
}

// ── Server side ───────────────────────────────────────────────────────────────
// Strips raw HTML to readable plain text so the client only ever gets
// safe Markdown/text for ReactMarkdown — no dangerouslySetInnerHTML needed.
function stripHtmlToText(raw) {
  if (!raw) return raw;
  const HTML_TAG_RE_SSR = /<(p|div|ul|ol|li|h[1-6]|br|span|a|strong)\b/i;
  if (!HTML_TAG_RE_SSR.test(raw)) return raw;
  return raw
    .replace(/<br\s*\/?>/gi,    "\n")
    .replace(/<\/p>/gi,         "\n\n")
    .replace(/<\/li>/gi,        "\n")
    .replace(/<\/h[1-6]>/gi,    "\n\n")
    .replace(/<[^>]+>/g,        "")
    .replace(/&amp;/g,          "&")
    .replace(/&lt;/g,           "<")
    .replace(/&gt;/g,           ">")
    .replace(/&quot;/g,         '"')
    .replace(/&#39;/g,          "'")
    .replace(/&nbsp;/g,         " ")
    .replace(/\n{3,}/g,         "\n\n")
    .trim();
}

export async function getServerSideProps({ params, query }) {
  const { jobId } = params;
  const { ref }   = query;
  const baseUrl   = process.env.NEXT_PUBLIC_BASE_URL;

  try {
    const [jobRes, sharerRes] = await Promise.all([
      axios.get(`${baseUrl}/jobs/public/${jobId}`),
      ref
        ? axios.get(`${baseUrl}/user/public/${ref}`).catch(() => null)
        : Promise.resolve(null),
    ]);

    const job = jobRes.data.job;
    if (job.description) job.description = stripHtmlToText(job.description);

    return {
      props: {
        job,
        sharer:        sharerRes?.data ?? null,
        sharerUsername: ref ?? null,
        // Suppress the global LoggedInHeader — this page has its own ShareNav
        hideHeader: true,
      },
    };
  } catch {
    return { notFound: true };
  }
}
