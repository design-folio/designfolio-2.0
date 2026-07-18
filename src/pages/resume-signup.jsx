import { useGoogleLogin } from "@react-oauth/google";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Clock,
  Eye,
  EyeOff,
  Lock,
  Monitor,
  Moon,
  Sparkles,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/router";
import { useEffect, useState, startTransition } from "react";
import { useDebouncedCallback } from "use-debounce";

import Seo from "@/components/seo";
import { Button } from "@/components/ui/button";
import { Gauge } from "@/components/ui/gauge-1";
import { GoogleButton } from "@/components/ui/google-button";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { usePostHogEvent } from "@/hooks/usePostHogEvent";
import { usePostHogIdentify } from "@/hooks/usePostHogIdentify";
import { setToken } from "@/lib/cooikeManager";
import { POSTHOG_EVENT_NAMES } from "@/lib/posthogEventNames";
import { _checkUsername, _signupEmail, _signupGmail } from "@/network/post-request";
import { _postResumeApply } from "@/network/resume";

// ── Animated tabs (app design system) ────────────────────────────────────────
function Tabs({ tabs, active, onChange }) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-full bg-black/[0.07] p-1 dark:bg-white/[0.08]">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={`relative rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors duration-200 ${
            active === t ? "text-foreground" : "text-foreground/40 hover:text-foreground/65"
          }`}
        >
          {active === t && (
            <motion.span
              layoutId="tab-pill"
              className="dark:bg-card absolute inset-0 rounded-full bg-white shadow-sm"
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
            />
          )}
          <span className="relative z-10">{t}</span>
        </button>
      ))}
    </div>
  );
}

// Placeholder thumbnail images for projects without images
const PLACEHOLDER_THUMBNAILS = ["/previewproject/Thumbnail1.png", "/previewproject/Thumbnail2.png"];

// ── Canvas template preview (self-contained, no globalContext needed) ─────────
function CanvasPreview({ parsed }) {
  const name = parsed?.name || "Your Name";
  const bio = parsed?.bio || "Product designer crafting purposeful digital experiences.";
  const intro = parsed?.introduction || "";
  const rawSkills = parsed?.skills || [];
  const exp = parsed?.experience || [];
  const projs = parsed?.projects || [];

  const skills = rawSkills
    .map((s) => ({
      label: typeof s === "string" ? s : s?.label || s?.name || "",
    }))
    .filter((s) => s.label);

  const repeatedSkills =
    skills.length > 0 ? [...skills, ...skills, ...skills, ...skills, ...skills] : [];

  const visibleExp = exp.slice(0, 4);
  const MOCK_PROJECTS = [
    { title: "Case Study", description: "End-to-end redesign with user research and prototyping." },
    { title: "Design System", description: "Component library built for scale and consistency." },
  ];
  const visibleProjs = projs.slice(0, 6);
  const displayProjs = visibleProjs.length > 0 ? visibleProjs : MOCK_PROJECTS;

  return (
    <div className="mx-auto flex w-full max-w-[848px] flex-col gap-3 pb-24">
      {/* ── Profile card with skills strip ── */}
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 12, delay: 0.15 }}
        className="flex w-full flex-col overflow-hidden rounded-[26px] border border-[#E5D7C4] bg-white dark:border-white/10 dark:bg-[#2A2520]"
      >
        <div className="flex flex-col items-start gap-8 p-5 md:flex-row md:items-center md:p-6">
          <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-black/5 bg-[#F0EDE7] shadow-sm dark:border-white/10 dark:bg-[#3A352E]">
            <img src="/previewproject/avatar.png" alt="avatar" />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-[24px] leading-tight font-semibold tracking-tight text-pretty text-[#1A1A1A] dark:text-[#F0EDE7]">
              {`Hey, I'm ${name}`}
            </h1>
            <p className="text-[16px] leading-relaxed text-pretty text-[#7A736C] dark:text-[#B5AFA5]">
              {bio}
            </p>
          </div>
        </div>
        {skills.length > 0 && (
          <div className="relative w-full overflow-hidden rounded-b-[26px] border-t border-[#E5D7C4] bg-linear-to-b from-[#EEE9E3] to-[#F4F1EC] py-2 shadow-[inset_0_1px_3px_rgba(0,0,0,0.04),inset_0_-1px_1px_rgba(255,255,255,0.45)] dark:border-white/10 dark:from-[#252119] dark:to-[#2B2620] dark:shadow-[inset_0_1px_3px_rgba(0,0,0,0.15)]">
            <div className="absolute top-0 bottom-0 left-0 z-10 w-12 bg-linear-to-r from-[#F0EBE5] to-transparent dark:from-[#272219]" />
            <div className="bg-linaer-to-l absolute top-0 right-0 bottom-0 z-10 w-12 from-[#F0EBE5] to-transparent dark:from-[#272219]" />
            <motion.div
              className="flex gap-4 whitespace-nowrap"
              animate={{ x: [0, "-50%"] }}
              transition={{ ease: "linear", duration: 20, repeat: Infinity }}
            >
              {repeatedSkills.map((skill, idx) => (
                <div key={idx} className="flex shrink-0 items-center gap-4">
                  <span className="text-[12px] font-medium tracking-wider text-[#7A736C] uppercase dark:text-[#B5AFA5]">
                    {skill.label}
                  </span>
                  <div className="h-3 w-3 shrink-0 text-[#1A1A1A] dark:text-[#F0EDE7]">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0l2 9 9 2-9 2-2 9-2-9-9-2 9-2 2-9z" />
                    </svg>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        )}
      </motion.div>

      {/* ── Projects section — mirrors CanvasProjectsSection ── */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 12, delay: 0.3 }}
        className="w-full rounded-[26px] border border-[#E5D7C4] bg-white p-4 md:p-6 dark:border-white/10 dark:bg-[#2A2520]"
      >
        <h2 className="font-dm-mono mb-3 text-[14px] font-medium text-[#7A736C] dark:text-[#B5AFA5]">
          PROJECTS
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {displayProjs.map((p, i) => (
            <div key={i} className="group/card flex flex-col gap-4">
              {/* 16:9 placeholder thumbnail */}
              <div className="aspect-[3/2] overflow-hidden rounded-2xl border border-black/5 bg-[#F5F5F5] dark:border-white/10 dark:bg-[#1A1A1A]">
                <img
                  src={PLACEHOLDER_THUMBNAILS[i % PLACEHOLDER_THUMBNAILS.length]}
                  alt={p.title || "Project"}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover/card:scale-105"
                />
              </div>
              {/* Title + description */}
              <div>
                <h3 className="mb-1 line-clamp-2 text-base leading-snug font-medium text-[#1A1A1A] dark:text-[#F0EDE7]">
                  {p.title}
                </h3>
                {p.description && (
                  <p className="line-clamp-2 text-sm leading-relaxed text-[#7A736C] dark:text-[#B5AFA5]">
                    {p.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Career ladder — mirrors CanvasCareerLadder with actual ladder visual ── */}
      {visibleExp.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 12, delay: 0.45 }}
          className="w-full rounded-[26px] border border-[#E5D7C4] bg-white p-4 md:p-6 dark:border-white/10 dark:bg-[#2A2520]"
        >
          <h2 className="font-dm-mono mb-6 text-[14px] font-medium text-[#7A736C] dark:text-[#B5AFA5]">
            CAREER LADDER
          </h2>

          <div className="relative flex">
            {/* Ladder structure — only shown when more than 1 experience */}
            {visibleExp.length > 1 && (
              <>
                {/* Climbing character at top */}
                <div className="absolute left-px z-20 h-[54px] w-[40px]" style={{ top: 0 }}>
                  <img
                    src="/assets/svgs/character-me.svg"
                    alt="Character climbing"
                    className="h-full w-full object-contain"
                  />
                </div>
                {/* Ladder rails + rungs */}
                <div className="absolute top-3 bottom-0 left-0 flex w-[42px] flex-col items-start justify-between border-x-[5px] border-[#F0EDE7] bg-transparent py-1 dark:border-[#3A352E]">
                  {[...Array(30)].map((_, i) => (
                    <div key={i} className="h-[5px] w-full bg-[#F0EDE7] dark:bg-[#3A352E]" />
                  ))}
                </div>
              </>
            )}

            {/* Experience entries */}
            <div
              className={`space-y-6 ${visibleExp.length > 1 ? "pl-16" : ""} relative z-10 w-full pt-1 pb-2`}
            >
              {visibleExp.map((e, i) => (
                <div
                  key={i}
                  className="-mx-4 rounded-2xl p-4 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <div className="mb-2 flex flex-col justify-between gap-2 sm:flex-row sm:items-center sm:gap-0">
                    <h3 className="text-base font-semibold text-[#1A1A1A] dark:text-[#F0EDE7]">
                      {e.role}
                      {e.company ? ` @ ${e.company}` : ""}
                    </h3>
                    {(() => {
                      const start = [e.startMonth, e.startYear].filter(Boolean).join(" ");
                      const end = e.currentlyWorking
                        ? "Present"
                        : [e.endMonth, e.endYear].filter(Boolean).join(" ");
                      const label = start && end ? `${start} — ${end}` : start || end || "";
                      return label ? (
                        <div className="w-fit rounded-full bg-[#F0EDE7] px-3 py-1 text-[13px] whitespace-nowrap text-[#1A1A1A] dark:bg-[#3A352E] dark:text-[#F0EDE7]">
                          {label}
                        </div>
                      ) : null;
                    })()}
                  </div>
                  {e.description && (
                    <p className="line-clamp-3 text-[15px] leading-relaxed text-[#7A736C] dark:text-[#B5AFA5]">
                      {e.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ── Jobs preview — real-looking cards, locked gate ────────────────────────────
function JobsPreview({ parsed }) {
  const baseRole = parsed?.experience?.[0]?.role || "Product Designer";

  // Personalized teasers using parsed role — clearly preview state
  const teasers = [
    {
      company: "Series B SaaS",
      role: baseRole,
      workMode: "Remote",
      type: "Full-Time",
      yearsExp: "4+ yrs",
      location: "Remote",
      logoColor: "#5E6AD2",
      logoLetter: "S",
    },
    {
      company: "Growth-stage tech",
      role: `Senior ${baseRole}`,
      workMode: "Hybrid",
      type: "Full-Time",
      yearsExp: "5+ yrs",
      location: "Hybrid",
      logoColor: "#171717",
      logoLetter: "G",
    },
    {
      company: "Established product",
      role: baseRole,
      workMode: "On-site",
      type: "Full-Time",
      yearsExp: "3+ yrs",
      location: "San Francisco",
      logoColor: "#0F9D58",
      logoLetter: "E",
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-[580px] flex-col gap-3 pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 16 }}
        className="mb-1 flex items-center gap-2"
      >
        <Sparkles className="text-foreground/40 h-3.5 w-3.5" />
        <span className="text-foreground/40 text-[12px] font-bold tracking-[0.1em] uppercase">
          AI Picks · Based on your resume
        </span>
      </motion.div>

      {/* Teaser job cards — styled identically to real JobCard */}
      {teasers.map((job, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 14, delay: i * 0.07 }}
          className="dark:bg-background dark:border-border flex flex-col gap-3 rounded-lg border border-black/[0.06] bg-white p-3 select-none"
          style={
            i >= 1
              ? {
                  filter: `blur(${1.5 + (i - 1) * 2}px)`,
                  opacity: Math.max(0.65 - (i - 1) * 0.2, 0.3),
                  pointerEvents: "none",
                  userSelect: "none",
                }
              : undefined
          }
        >
          {/* Row 1: Logo + company/location + match gauge */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2.5">
              <div
                className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-lg text-[15px] font-bold text-white"
                style={{ backgroundColor: job.logoColor }}
              >
                {job.logoLetter}
              </div>
              <div className="min-w-0">
                <div className="text-foreground/70 truncate text-[13px] font-medium">
                  {job.company}
                </div>
                <div className="text-foreground/40 truncate text-[12px]">{job.location}</div>
              </div>
            </div>
            {i === 0 && (
              <div className="shrink-0">
                <Gauge
                  value={94}
                  size={42}
                  strokeWidth={8}
                  gapPercent={3}
                  primary="success"
                  secondary="rgba(0,0,0,0.06)"
                  showValue={true}
                  showPercentage={false}
                  transition={{ delay: 200 }}
                  className={{ textClassName: "fill-emerald-600 dark:fill-emerald-400" }}
                />
              </div>
            )}
          </div>

          {/* Row 2: Title */}
          <p className="text-foreground text-[15px] leading-snug font-semibold">{job.role}</p>

          {/* Row 3: Pills */}
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-foreground/55 inline-flex items-center gap-1 rounded-md bg-black/[0.05] px-1.5 py-0.5 text-[11px] font-medium dark:bg-white/[0.06]">
              <Briefcase className="h-2.5 w-2.5 shrink-0" />
              {job.type}
            </span>
            <span className="text-foreground/55 inline-flex items-center gap-1 rounded-md bg-black/[0.05] px-1.5 py-0.5 text-[11px] font-medium dark:bg-white/[0.06]">
              <Monitor className="h-2.5 w-2.5 shrink-0" />
              {job.workMode}
            </span>
            <span className="text-foreground/55 inline-flex items-center gap-1 rounded-md bg-black/[0.05] px-1.5 py-0.5 text-[11px] font-medium dark:bg-white/[0.06]">
              <Clock className="h-2.5 w-2.5 shrink-0" />
              {job.yearsExp}
            </span>
          </div>
        </motion.div>
      ))}

      {/* Lock gate */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 14, delay: 0.28 }}
        className="dark:border-border dark:bg-background relative -mt-1 flex flex-col items-center gap-3 rounded-xl border border-black/[0.06] bg-white p-6 text-center"
      >
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full"
          style={{ background: "rgba(229,77,46,0.10)" }}
        >
          <Lock className="h-4 w-4" style={{ color: "#e54d2e" }} />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-foreground text-[14px] font-semibold">
            Real matches unlock after signup
          </p>
          <p className="text-foreground/50 max-w-[260px] text-[12px] leading-relaxed">
            AI scans thousands of live jobs, scores each against your resume, and surfaces the best
            fits — in seconds.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// ── Right preview panel — defined outside component to avoid remount on every keystroke ──
function PreviewContent({ tab, onTabChange, parsed }) {
  return (
    <div className="relative flex h-full flex-1 flex-col overflow-hidden bg-[#EFECE6] dark:bg-[#141414]">
      {/* Top fade */}
      <div className="from-background pointer-events-none absolute top-0 right-0 left-0 z-20 h-20 bg-linear-to-b to-transparent" />

      {/* Floating tabs */}
      <div className="pointer-events-auto absolute top-4 right-0 left-0 z-30 flex justify-center">
        <Tabs tabs={["My Portfolio", "My Jobs"]} active={tab} onChange={onTabChange} />
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {tab === "My Portfolio" ? (
          <motion.div
            key="portfolio"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="flex-1 overflow-y-auto px-6 pt-20 pb-8"
            style={{ scrollbarWidth: "none" }}
          >
            <CanvasPreview parsed={parsed} />
          </motion.div>
        ) : (
          <motion.div
            key="jobs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="flex-1 overflow-y-auto px-6 pt-20 pb-8"
            style={{ scrollbarWidth: "none" }}
          >
            <JobsPreview parsed={parsed} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom fade */}
      <div className="from-background pointer-events-none absolute right-0 bottom-0 left-0 h-16 bg-linear-to-t to-transparent" />
    </div>
  );
}

// ── Field wrapper ─────────────────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="dark:text-foreground/60 text-[11px] font-bold tracking-[0.1em] text-[#1A1A1A]/60 uppercase">
        {label}
      </Label>
      {children}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ResumeSignup() {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const event = usePostHogEvent();
  const identify = usePostHogIdentify();

  const [parsed, setParsed] = useState(null);
  const [mounted, setMounted] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Domain check
  const [domainAvail, setDomainAvail] = useState(false);
  const [domainLoading, setDomainLoading] = useState(false);
  const [domainTouched, setDomainTouched] = useState(false);
  const [domainError, setDomainError] = useState("");

  // Preview tabs
  const [activeTab, setActiveTab] = useState("My Portfolio");
  const [showMobileSheet, setShowMobileSheet] = useState(false);
  const [mobileTab, setMobileTab] = useState("My Portfolio");

  const debouncedCheck = useDebouncedCallback(async (val) => {
    if (!val) return;
    setDomainLoading(true);
    try {
      const res = await _checkUsername({ username: val });
      setDomainAvail(res?.data?.available ?? false);
      setDomainError(res?.data?.available ? "" : `${val}.designfolio.me is taken`);
    } catch {
      setDomainAvail(false);
    } finally {
      setDomainLoading(false);
    }
  }, 600);

  useEffect(() => {
    startTransition(() => setMounted(true));
    try {
      const raw = sessionStorage.getItem("df_parsed_resume");
      if (!raw) {
        router.replace("/claim-link");
        return;
      }
      const data = JSON.parse(raw);
      startTransition(() => {
        setParsed(data);
        if (data.name) setName(data.name);
        if (data.email) setEmail(data.email);
      });
      const slug = (data.name || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      if (slug) {
        startTransition(() => setDomain(slug));
        debouncedCheck(slug);
      }
      const jobId = router.query.job || sessionStorage.getItem("df_pending_job_id") || "";
      event(POSTHOG_EVENT_NAMES.RESUME_SIGNUP_VIEWED, {
        signup_flow: "job_share_resume",
        job_id: jobId || null,
        resume_has_name: !!data.name,
        resume_has_email: !!data.email,
        resume_has_skills: Array.isArray(data.skills) && data.skills.length > 0,
        resume_has_experience: Array.isArray(data.experience) && data.experience.length > 0,
      });
    } catch {
      router.replace("/claim-link");
    }
  }, [debouncedCheck, event, router, setMounted, setParsed, setName, setEmail, setDomain]);

  const handleDomainChange = (e) => {
    const raw = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setDomain(raw);
    setDomainTouched(true);
    setDomainAvail(false);
    setDomainError("");
    if (raw.length < 3) {
      setDomainError(raw ? "Minimum 3 characters" : "");
      return;
    }
    setDomainLoading(true);
    debouncedCheck(raw);
  };

  const handleNameChange = (val) => {
    setName(val);
    if (!domainTouched) {
      const slug = val
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      setDomain(slug);
      if (slug.length >= 3) {
        setDomainLoading(true);
        debouncedCheck(slug);
      }
    }
  };

  const applyResume = async () => {
    try {
      const raw = sessionStorage.getItem("df_parsed_resume");
      if (!raw) return;
      // Create resume case studies in immersive mode, matching manual/AI creation.
      await _postResumeApply({ ...JSON.parse(raw), heroView: "immersive" });
      sessionStorage.removeItem("df_parsed_resume");
    } catch {
      /* silent */
    }
  };

  const canSubmit =
    name.trim() && domain.length >= 3 && domainAvail && email.trim() && password.length >= 8;

  const pendingJobId =
    router.query.job ||
    (typeof window !== "undefined" ? sessionStorage.getItem("df_pending_job_id") : "") ||
    "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const { data } = await _signupEmail({
        username: domain,
        loginMethod: 0,
        firstName: name.split(" ")[0] || name,
        lastName: name.split(" ").slice(1).join(" ") || "",
        email,
        password,
      });
      setToken(data.token);
      await applyResume();
      identify(email, { email, username: domain, firstName: name.split(" ")[0] });
      event(POSTHOG_EVENT_NAMES.SIGNUP_SUCCESS, {
        method: "email",
        email,
        username: domain,
        signup_flow: "job_share_resume",
        job_id: pendingJobId || null,
        has_resume: true,
      });
      const verifyUrl = pendingJobId
        ? `/email-verify?email=${encodeURIComponent(email)}&job=${pendingJobId}`
        : `/email-verify?email=${encodeURIComponent(email)}`;
      router.push(verifyUrl);
    } catch {
      setSubmitting(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      try {
        const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const user = await res.json();
        const { data } = await _signupGmail({
          loginMethod: 1,
          googleID: user.id,
          username: domain || user.given_name?.toLowerCase().replace(/\s+/g, "-") || "user",
          firstName: user.given_name,
          lastName: user.family_name,
          email: user.email,
        });
        setToken(data.token);
        await applyResume();
        identify(user.email, {
          email: user.email,
          username: domain || user.given_name?.toLowerCase().replace(/\s+/g, "-") || "user",
        });
        event(POSTHOG_EVENT_NAMES.SIGNUP_SUCCESS, {
          method: "google",
          email: user.email,
          username: domain || user.given_name?.toLowerCase().replace(/\s+/g, "-") || "user",
          signup_flow: "job_share_resume",
          job_id: pendingJobId || null,
          has_resume: true,
        });
        router.push(pendingJobId ? `/jobs?job=${pendingJobId}` : "/builder");
      } catch {
        setGoogleLoading(false);
      }
    },
    onError: () => setGoogleLoading(false),
  });

  if (!mounted || !parsed) return null;

  return (
    <>
      <Seo
        title="Sign up — Designfolio"
        description="Claim your portfolio and start finding matched jobs."
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="flex h-screen w-full overflow-hidden"
        style={{ fontFamily: "var(--font-manrope), sans-serif" }}
      >
        {/* ── LEFT: Form (landing-page style) ─────────── */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 flex h-full w-full shrink-0 flex-col overflow-y-auto bg-[#FDFCF8] md:w-[520px] lg:w-[560px] dark:bg-[#1A1A1A]"
          style={{ scrollbarWidth: "none" }}
        >
          {/* Top bar */}
          <div className="absolute top-0 right-0 left-0 z-10 flex items-center justify-between px-8 py-5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                sessionStorage.removeItem("df_parsed_resume");
                router.push("/");
              }}
              className="gap-1.5 px-2 text-[13px] font-semibold text-(--lp-text-faint) hover:bg-transparent hover:text-(--lp-text)"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Restart with different resume
            </Button>
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-(--lp-border) text-(--lp-text-faint) transition-all hover:border-(--lp-text)/30 hover:text-(--lp-text)"
            >
              {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </button>
          </div>

          {/* Form content */}
          <div className="mx-auto flex w-full max-w-[400px] flex-col gap-5 px-6 pt-24 pb-20 md:my-auto md:pb-0">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold"
                style={{ background: "rgba(229,77,46,0.10)", color: "#e54d2e" }}
              >
                <span
                  className="h-1.5 w-1.5 animate-pulse rounded-full"
                  style={{ background: "#e54d2e" }}
                />
                Your portfolio is ready
              </span>
            </motion.div>

            {/* Heading */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14 }}
              className="flex flex-col gap-1.5"
            >
              <h1 className="text-[26px] leading-[1.15] font-bold tracking-tight text-(--lp-text)">
                Sign up. Let{"'"}s get you hired.
              </h1>
              <p className="text-[14px] leading-relaxed text-(--lp-text-muted)">
                Your portfolio and matched jobs are one click away.
              </p>
            </motion.div>

            {/* Mobile: view preview */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.17 }}
              className="md:hidden"
            >
              <Button
                variant="outline"
                onClick={() => setShowMobileSheet(true)}
                className="h-auto justify-start rounded-xl py-2.5 text-[13px] font-medium"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0 opacity-70"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                View your portfolio {"&"} job matches
              </Button>
            </motion.div>

            {/* Form */}
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col gap-3"
            >
              <Field label="Full name">
                <Input
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  data-testid="input-name"
                />
              </Field>

              <AnimatePresence>
                {name.trim().length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="-mx-0.5 overflow-hidden px-0.5"
                  >
                    <Field label="Your portfolio URL">
                      <InputGroup className="">
                        <InputGroupInput
                          className="border-none"
                          type="text"
                          placeholder="yourname"
                          value={domain}
                          onChange={handleDomainChange}
                          data-testid="input-domain"
                        />
                        <InputGroupAddon className="gap-2 pr-4">
                          <InputGroupText className="px-0">.designfolio.me</InputGroupText>
                          {domainLoading && (
                            <Spinner variant="circle" className="h-3.5 w-3.5 text-(--lp-text)/30" />
                          )}
                        </InputGroupAddon>
                      </InputGroup>
                      <AnimatePresence>
                        {!domainLoading && domain.length >= 3 && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className={`mt-1 text-[12px] font-medium ${domainAvail ? "text-emerald-600" : "text-red-500"}`}
                          >
                            {domainAvail
                              ? `✓ ${domain}.designfolio.me is available`
                              : domainError || `${domain}.designfolio.me is taken`}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </Field>
                  </motion.div>
                )}
              </AnimatePresence>

              <Field label="Email">
                <Input
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid="input-email"
                />
              </Field>

              <Field label="Password">
                <div className="relative">
                  <Input
                    type={showPass ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                    data-testid="input-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPass((v) => !v)}
                    className="text-muted-foreground hover:text-foreground absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2"
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </Field>

              <Button
                type="submit"
                variant="default"
                disabled={!canSubmit || submitting}
                className="group mt-1 h-auto w-full rounded-xl py-3.5 text-[15px] font-semibold"
                data-testid="button-claim"
              >
                {submitting ? (
                  <Spinner variant="circle" className="h-4 w-4" />
                ) : (
                  <>
                    Claim my portfolio {"&"} jobs
                    <ArrowRight
                      className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                      strokeWidth={2.5}
                    />
                  </>
                )}
              </Button>
            </motion.form>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-(--lp-border)" />
              <span className="text-[12px] font-medium text-(--lp-text-faint)">or</span>
              <div className="h-px flex-1 bg-(--lp-border)" />
            </div>

            <GoogleButton onClick={() => googleLogin()} isLoading={googleLoading}>
              Continue with Google
            </GoogleButton>

            <p className="text-center text-[13px] text-(--lp-text-faint)">
              Already have an account?{" "}
              <button
                onClick={() => router.push("/login")}
                className="font-semibold text-(--lp-text-muted) underline underline-offset-2 transition-colors hover:text-(--lp-text)"
              >
                Sign in
              </button>
            </p>
          </div>
        </motion.div>

        {/* ── Divider ────────────────────────────────── */}
        <div className="hidden w-px shrink-0 bg-(--lp-border) md:block dark:bg-(--lp-border)/15" />

        {/* ── RIGHT: Preview panel (desktop) ──────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="hidden h-full flex-1 flex-col overflow-hidden md:flex"
        >
          <PreviewContent tab={activeTab} onTabChange={setActiveTab} parsed={parsed} />
        </motion.div>

        {/* ── Mobile preview bottom sheet ─────────────── */}
        <AnimatePresence>
          {showMobileSheet && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
                onClick={() => setShowMobileSheet(false)}
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 340, damping: 36, mass: 0.9 }}
                className="bg-background fixed right-0 bottom-0 left-0 z-50 flex flex-col overflow-hidden rounded-t-[28px] md:hidden"
                style={{ height: "90dvh" }}
              >
                {/* Handle */}
                <div className="flex shrink-0 justify-center pt-3 pb-1">
                  <div className="bg-foreground h-1 w-9 rounded-full" />
                </div>

                {/* Top fade */}
                <div className="from-background pointer-events-none absolute top-0 right-0 left-0 z-20 h-24 bg-linear-to-b to-transparent" />

                {/* Mobile tabs */}
                <div className="pointer-events-auto absolute top-7 right-0 left-0 z-30 flex justify-center">
                  <Tabs
                    tabs={["My Portfolio", "My Jobs"]}
                    active={mobileTab}
                    onChange={setMobileTab}
                  />
                </div>

                <AnimatePresence mode="wait">
                  {mobileTab === "My Portfolio" ? (
                    <motion.div
                      key="mob-portfolio"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-1 overflow-y-auto px-4 pt-[72px] pb-28"
                      style={{ scrollbarWidth: "none" }}
                    >
                      <CanvasPreview parsed={parsed} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="mob-jobs"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-1 overflow-y-auto px-4 pt-[72px] pb-28"
                      style={{ scrollbarWidth: "none" }}
                    >
                      <JobsPreview parsed={parsed} />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Bottom fade */}
                <div className="from-background pointer-events-none absolute right-0 bottom-0 left-0 h-24 bg-linear-to-t to-transparent" />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}

export async function getServerSideProps() {
  return { props: { hideHeader: true } };
}
