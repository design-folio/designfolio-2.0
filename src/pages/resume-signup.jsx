import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Sun, Moon, Lock, Sparkles, Briefcase, Monitor, Clock } from "lucide-react";
import { useTheme } from "next-themes";
import { useGoogleLogin } from "@react-oauth/google";
import { useDebouncedCallback } from "use-debounce";

import { _signupEmail, _signupGmail, _checkUsername } from "@/network/post-request";
import { _postResumeApply } from "@/network/resume";
import { setToken } from "@/lib/cooikeManager";
import { Gauge } from "@/components/ui/gauge-1";
import { GoogleButton } from "@/components/ui/google-button";
import { usePostHogEvent } from "@/hooks/usePostHogEvent";
import { usePostHogIdentify } from "@/hooks/usePostHogIdentify";
import { POSTHOG_EVENT_NAMES } from "@/lib/posthogEventNames";
import Seo from "@/components/seo";

// ── Animated tabs (app design system) ────────────────────────────────────────
function Tabs({ tabs, active, onChange }) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-full bg-black/[0.07] dark:bg-white/[0.08] p-1">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={`relative px-4 py-1.5 rounded-full text-[13px] font-semibold transition-colors duration-200 ${active === t
            ? "text-foreground"
            : "text-foreground/40 hover:text-foreground/65"
            }`}
        >
          {active === t && (
            <motion.span
              layoutId="tab-pill"
              className="absolute inset-0 rounded-full bg-white dark:bg-card shadow-sm"
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
const PLACEHOLDER_THUMBNAILS = [
  "/previewproject/Thumbnail1.png",
  "/previewproject/Thumbnail2.png",
];

// ── Canvas template preview (self-contained, no globalContext needed) ─────────
function CanvasPreview({ parsed }) {
  const name = parsed?.name || "Your Name";
  const bio = parsed?.bio || "Product designer crafting purposeful digital experiences.";
  const intro = parsed?.introduction || "";
  const rawSkills = parsed?.skills || [];
  const exp = parsed?.experience || [];
  const projs = parsed?.projects || [];

  const skills = rawSkills.map((s) => ({
    label: typeof s === "string" ? s : (s?.label || s?.name || ""),
  })).filter((s) => s.label);

  const repeatedSkills = skills.length > 0
    ? [...skills, ...skills, ...skills, ...skills, ...skills]
    : [];

  const visibleExp = exp.slice(0, 4);
  const MOCK_PROJECTS = [
    { title: "Case Study", description: "End-to-end redesign with user research and prototyping." },
    { title: "Design System", description: "Component library built for scale and consistency." },
  ];
  const visibleProjs = projs.slice(0, 6);
  const displayProjs = visibleProjs.length > 0 ? visibleProjs : MOCK_PROJECTS;

  return (
    <div className="w-full flex flex-col gap-3 pb-24 max-w-[720px] mx-auto">

      {/* ── Profile card — mirrors CanvasProfileCard ── */}
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 12, delay: 0.15 }}
        className="bg-white dark:bg-[#2A2520] rounded-[24px] border border-[#E5D7C4] dark:border-white/10 p-4 flex flex-col md:flex-row gap-6 items-start md:items-center w-full"
      >
        <div className="w-28 h-28 rounded-2xl shrink-0 border border-black/5 dark:border-white/10 shadow-sm flex items-center justify-center bg-[#F0EDE7] dark:bg-[#3A352E] overflow-hidden">
          <img src="/previewproject/avatar.png" alt="avatar" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-[24px] font-semibold text-[#1A1A1A] dark:text-[#F0EDE7] tracking-tight leading-tight">
            {`Hey, I'm ${name}`}
          </h1>
          <p className="text-[#7A736C] dark:text-[#B5AFA5] text-[16px] leading-relaxed max-w-[480px]">
            {bio}
          </p>
        </div>
      </motion.div>

      {/* ── Skills marquee — mirrors CanvasSkillsMarquee ── */}
      {skills.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 12, delay: 0.3 }}
          className="bg-white dark:bg-[#2A2520] rounded-[24px] border border-[#E5D7C4] dark:border-white/10 py-2 relative w-full overflow-hidden"
        >
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white dark:from-[#2A2520] to-transparent z-10 rounded-l-[24px]" />
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white dark:from-[#2A2520] to-transparent z-10 rounded-r-[24px]" />
          <div className="overflow-hidden">
            <motion.div
              className="flex gap-4 whitespace-nowrap"
              animate={{ x: [0, "-50%"] }}
              transition={{ ease: "linear", duration: 22, repeat: Infinity }}
            >
              {repeatedSkills.map((skill, idx) => (
                <div key={idx} className="flex gap-4 items-center shrink-0">
                  <span className="text-[#7A736C] dark:text-[#B5AFA5] font-medium text-[12px] uppercase tracking-wider">
                    {skill.label}
                  </span>
                  <div className="w-3 h-3 text-[#1A1A1A] dark:text-[#F0EDE7] shrink-0">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0l2 9 9 2-9 2-2 9-2-9-9-2 9-2 2-9z" />
                    </svg>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* ── Projects section — mirrors CanvasProjectsSection ── */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 12, delay: 0.45 }}
        className="bg-white dark:bg-[#2A2520] rounded-[24px] border border-[#E5D7C4] dark:border-white/10 p-4 md:p-6 w-full"
      >
        <h2 className="text-[#7A736C] dark:text-[#B5AFA5] font-medium text-[14px] mb-4 uppercase tracking-wider">
          Projects
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {displayProjs.map((p, i) => (
            <div key={i} className="flex flex-col gap-3 group/card">
              {/* 4:3 placeholder thumbnail */}
              <div className="rounded-2xl overflow-hidden aspect-[4/3] border border-black/5 dark:border-white/10 bg-[#F5F5F5] dark:bg-[#1A1A1A]">
                <img
                  src={PLACEHOLDER_THUMBNAILS[i % PLACEHOLDER_THUMBNAILS.length]}
                  alt={p.title || "Project"}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105"
                />
              </div>
              {/* Title + description */}
              <div>
                <h3 className="text-base font-medium text-[#1A1A1A] dark:text-[#F0EDE7] mb-1 leading-snug line-clamp-2">
                  {p.title}
                </h3>
                {p.description && (
                  <p className="text-[#7A736C] dark:text-[#B5AFA5] text-sm leading-relaxed line-clamp-2">
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
          transition={{ type: "spring", stiffness: 100, damping: 12, delay: 0.6 }}
          className="bg-white dark:bg-[#2A2520] rounded-[24px] border border-[#E5D7C4] dark:border-white/10 p-4 md:p-6 w-full"
        >
          <h2 className="text-[#7A736C] dark:text-[#B5AFA5] font-medium text-[14px] mb-6 uppercase tracking-wider">
            Career Ladder
          </h2>

          <div className="relative flex">
            {/* Ladder structure — only shown when more than 1 experience */}
            {visibleExp.length > 1 && (
              <>
                {/* Climbing character at top */}
                <div className="absolute left-[1px] z-20 w-[40px] h-[54px]" style={{ top: 0 }}>
                  <img
                    src="/assets/svgs/character-me.svg"
                    alt="Character climbing"
                    className="w-full h-full object-contain"
                  />
                </div>
                {/* Ladder rails + rungs */}
                <div className="absolute left-0 top-3 bottom-0 w-[42px] flex flex-col justify-between items-start border-x-[5px] border-[#F0EDE7] dark:border-[#3A352E] py-1 bg-transparent">
                  {[...Array(30)].map((_, i) => (
                    <div key={i} className="w-full h-[5px] bg-[#F0EDE7] dark:bg-[#3A352E]" />
                  ))}
                </div>
              </>
            )}

            {/* Experience entries */}
            <div className={`space-y-6 ${visibleExp.length > 1 ? "pl-16" : ""} relative z-10 w-full pt-1 pb-2`}>
              {visibleExp.map((e, i) => (
                <div key={i} className="p-4 -mx-4 rounded-2xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2 sm:gap-0">
                    <h3 className="text-base font-semibold text-[#1A1A1A] dark:text-[#F0EDE7]">
                      {e.role}{e.company ? ` @ ${e.company}` : ""}
                    </h3>
                    {(e.startDate || e.endDate) && (
                      <div className="bg-[#F0EDE7] dark:bg-[#3A352E] px-3 py-1 rounded-full text-[13px] text-[#1A1A1A] dark:text-[#F0EDE7] w-fit whitespace-nowrap">
                        {e.startDate}{e.endDate ? ` — ${e.endDate}` : " — Present"}
                      </div>
                    )}
                  </div>
                  {e.description && (
                    <p className="text-[#7A736C] dark:text-[#B5AFA5] text-[15px] leading-relaxed line-clamp-3">
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
    { company: "Series B SaaS", role: baseRole, workMode: "Remote", type: "Full-Time", yearsExp: "4+ yrs", location: "Remote", logoColor: "#5E6AD2", logoLetter: "S" },
    { company: "Growth-stage tech", role: `Senior ${baseRole}`, workMode: "Hybrid", type: "Full-Time", yearsExp: "5+ yrs", location: "Hybrid", logoColor: "#171717", logoLetter: "G" },
    { company: "Established product", role: baseRole, workMode: "On-site", type: "Full-Time", yearsExp: "3+ yrs", location: "San Francisco", logoColor: "#0F9D58", logoLetter: "E" },
  ];

  return (
    <div className="w-full max-w-[580px] mx-auto flex flex-col gap-3 pb-24">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 16 }}
        className="flex items-center gap-2 mb-1"
      >
        <Sparkles className="w-3.5 h-3.5 text-foreground/40" />
        <span className="text-[12px] font-bold uppercase tracking-[0.1em] text-foreground/40">
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
          className="flex flex-col gap-3 p-3 rounded-lg border border-black/[0.06] bg-white dark:bg-background dark:border-border select-none"
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
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-[42px] h-[42px] rounded-lg flex items-center justify-center shrink-0 text-white text-[15px] font-bold"
                style={{ backgroundColor: job.logoColor }}
              >
                {job.logoLetter}
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-medium text-foreground/70 truncate">{job.company}</div>
                <div className="text-[12px] text-foreground/40 truncate">{job.location}</div>
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
          <p className="text-[15px] font-semibold text-foreground leading-snug">{job.role}</p>

          {/* Row 3: Pills */}
          <div className="flex items-center gap-1 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-foreground/55 bg-black/[0.05] dark:bg-white/[0.06] rounded-md px-1.5 py-0.5">
              <Briefcase className="w-2.5 h-2.5 shrink-0" />
              {job.type}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-foreground/55 bg-black/[0.05] dark:bg-white/[0.06] rounded-md px-1.5 py-0.5">
              <Monitor className="w-2.5 h-2.5 shrink-0" />
              {job.workMode}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-foreground/55 bg-black/[0.05] dark:bg-white/[0.06] rounded-md px-1.5 py-0.5">
              <Clock className="w-2.5 h-2.5 shrink-0" />
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
        className="relative -mt-1 flex flex-col items-center gap-3 rounded-xl border border-black/[0.06] dark:border-border bg-white dark:bg-background p-6 text-center"
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "rgba(229,77,46,0.10)" }}
        >
          <Lock className="w-4 h-4" style={{ color: "#e54d2e" }} />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-[14px] font-semibold text-foreground">
            Real matches unlock after signup
          </p>
          <p className="text-[12px] text-foreground/50 leading-relaxed max-w-[260px]">
            AI scans thousands of live jobs, scores each against your resume, and surfaces the best fits — in seconds.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// ── Field wrapper ─────────────────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold text-[--lp-text-faint] uppercase tracking-[0.1em]">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-[--lp-border] bg-[--lp-text]/[0.03] px-4 py-3 text-[14px] text-[--lp-text] placeholder:text-[--lp-text]/30 outline-none focus:border-[--lp-text]/30 transition-colors";

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

  useEffect(() => {
    setMounted(true);
    try {
      const raw = sessionStorage.getItem("df_parsed_resume");
      if (!raw) { router.replace("/claim-link"); return; }
      const data = JSON.parse(raw);
      setParsed(data);
      if (data.name) setName(data.name);
      if (data.email) setEmail(data.email);
      const slug = (data.name || "")
        .trim().toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      if (slug) { setDomain(slug); debouncedCheck(slug); }
    } catch {
      router.replace("/claim-link");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  const handleDomainChange = (e) => {
    const raw = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setDomain(raw);
    setDomainTouched(true);
    setDomainAvail(false);
    setDomainError("");
    if (raw.length < 3) { setDomainError(raw ? "Minimum 3 characters" : ""); return; }
    setDomainLoading(true);
    debouncedCheck(raw);
  };

  const handleNameChange = (val) => {
    setName(val);
    if (!domainTouched) {
      const slug = val.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      setDomain(slug);
      if (slug.length >= 3) { setDomainLoading(true); debouncedCheck(slug); }
    }
  };

  const applyResume = async () => {
    try {
      const raw = sessionStorage.getItem("df_parsed_resume");
      if (!raw) return;
      await _postResumeApply(JSON.parse(raw));
      sessionStorage.removeItem("df_parsed_resume");
    } catch { /* silent */ }
  };

  const canSubmit = name.trim() && domain.length >= 3 && domainAvail && email.trim() && password.length >= 8;

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
      event(POSTHOG_EVENT_NAMES.SIGNUP_SUCCESS, { method: "email", email, username: domain });
      router.push(`/email-verify?email=${encodeURIComponent(email)}`);
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
        identify(user.email, { email: user.email });
        event(POSTHOG_EVENT_NAMES.SIGNUP_SUCCESS, { method: "google" });
        router.push("/builder");
      } catch {
        setGoogleLoading(false);
      }
    },
    onError: () => setGoogleLoading(false),
  });

  if (!mounted || !parsed) return null;

  // Right panel — shared between desktop and mobile sheet
  const PreviewContent = ({ tab, onTabChange }) => (
    <div className="flex flex-col flex-1 h-full overflow-hidden relative bg-background">
      {/* Top fade */}
      <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none h-20 bg-gradient-to-b from-background to-transparent" />

      {/* Floating tabs */}
      <div className="absolute top-4 left-0 right-0 z-30 flex justify-center pointer-events-auto">
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
            className="flex-1 overflow-y-auto pt-20 pb-8 px-6"
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
            className="flex-1 overflow-y-auto pt-20 pb-8 px-6"
            style={{ scrollbarWidth: "none" }}
          >
            <JobsPreview parsed={parsed} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none bg-gradient-to-t from-background to-transparent" />
    </div>
  );

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
          className="relative flex flex-col w-full md:w-[520px] lg:w-[560px] bg-[#FDFCF8] dark:bg-[#1A1A1A] shrink-0 h-full overflow-y-auto z-10 "
          style={{ scrollbarWidth: "none" }}
        >
          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-8 py-5 z-10">
            <button
              onClick={() => router.push("/")}
              className="text-[13px] font-semibold text-[--lp-text-faint] hover:text-[--lp-text] transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="flex items-center justify-center w-8 h-8 rounded-full border border-[--lp-border] text-[--lp-text-faint] hover:text-[--lp-text] hover:border-[--lp-text]/30 transition-all"
            >
              {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Form content */}
          <div className="flex flex-col gap-5 w-full max-w-[400px] mx-auto px-6 pt-24 pb-20 md:pb-0 md:my-auto">

            {/* Badge */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold"
                style={{ background: "rgba(229,77,46,0.10)", color: "#e54d2e" }}
              >
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#e54d2e" }} />
                Your portfolio is ready
              </span>
            </motion.div>

            {/* Heading */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }} className="flex flex-col gap-1.5">
              <h1 className="text-[26px] font-bold text-[--lp-text] tracking-tight leading-[1.15]">
                Sign up. Let&apos;s get you hired.
              </h1>
              <p className="text-[14px] text-[--lp-text-muted] leading-relaxed">
                Your portfolio and matched jobs are one click away.
              </p>
            </motion.div>

            {/* Mobile: view preview */}
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.17 }} className="md:hidden">
              <button
                onClick={() => setShowMobileSheet(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-[--lp-border] bg-[--lp-text]/[0.03] px-4 py-2.5 text-[13px] font-medium text-[--lp-text-muted] hover:border-[--lp-text]/25 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-70">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                </svg>
                View your portfolio &amp; job matches
              </button>
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
                <input
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className={inputCls}
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
                    className="overflow-hidden"
                  >
                    <Field label="Your portfolio URL">
                      <div className="flex items-center rounded-xl border border-[--lp-border] bg-[--lp-text]/[0.03] overflow-hidden focus-within:border-[--lp-text]/30 transition-colors">
                        <input
                          type="text"
                          placeholder="yourname"
                          value={domain}
                          onChange={handleDomainChange}
                          className="flex-1 min-w-0 bg-transparent px-4 py-3 text-[14px] text-[--lp-text] placeholder:text-[--lp-text]/30 outline-none"
                          data-testid="input-domain"
                        />
                        <div className="flex items-center gap-2 pr-4 shrink-0">
                          <span className="text-[13px] text-[--lp-text-faint] font-medium select-none">.designfolio.me</span>
                          {domainLoading && (
                            <svg className="animate-spin h-3.5 w-3.5 text-[--lp-text]/30" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V2.5A9.5 9.5 0 002.5 12H4z" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <AnimatePresence>
                        {!domainLoading && domain.length >= 3 && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className={`text-[12px] mt-1 font-medium ${domainAvail ? "text-emerald-600" : "text-red-500"}`}
                          >
                            {domainAvail ? `✓ ${domain}.designfolio.me is available` : domainError || `${domain}.designfolio.me is taken`}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </Field>
                  </motion.div>
                )}
              </AnimatePresence>

              <Field label="Email">
                <input
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputCls}
                  data-testid="input-email"
                />
              </Field>

              <Field label="Password">
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${inputCls} pr-11`}
                    data-testid="input-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[--lp-text-faint] hover:text-[--lp-text-muted] transition-colors"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </Field>

              <button
                type="submit"
                disabled={!canSubmit || submitting}
                className="group mt-1 w-full flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-[15px] font-semibold transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: "var(--lp-text)", color: "var(--lp-bg)" }}
                data-testid="button-claim"
              >
                {submitting ? (
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z" />
                  </svg>
                ) : (
                  <>
                    Claim my portfolio &amp; jobs
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2.5} />
                  </>
                )}
              </button>
            </motion.form>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-[--lp-border]" />
              <span className="text-[12px] text-[--lp-text-faint] font-medium">or</span>
              <div className="flex-1 h-px bg-[--lp-border]" />
            </div>

            <GoogleButton onClick={() => googleLogin()} isLoading={googleLoading}>
              Continue with Google
            </GoogleButton>

            <p className="text-center text-[13px] text-[--lp-text-faint]">
              Already have an account?{" "}
              <button
                onClick={() => router.push("/login")}
                className="font-semibold text-[--lp-text-muted] hover:text-[--lp-text] transition-colors underline underline-offset-2"
              >
                Sign in
              </button>
            </p>
          </div>
        </motion.div>

        {/* ── Divider ────────────────────────────────── */}
        <div className="hidden md:block w-px bg-[--lp-border] shrink-0" />

        {/* ── RIGHT: Preview panel (desktop) ──────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="hidden md:flex flex-col flex-1 h-full overflow-hidden"
        >
          <PreviewContent tab={activeTab} onTabChange={setActiveTab} />
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
                className="fixed bottom-0 left-0 right-0 z-50 md:hidden flex flex-col bg-background rounded-t-[28px] overflow-hidden"
                style={{ height: "90dvh" }}
              >
                {/* Handle */}
                <div className="shrink-0 pt-3 pb-1 flex justify-center">
                  <div className="w-9 h-1 rounded-full bg-foreground/10" />
                </div>

                {/* Top fade */}
                <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none h-24 bg-gradient-to-b from-background to-transparent" />

                {/* Mobile tabs */}
                <div className="absolute top-7 left-0 right-0 z-30 flex justify-center pointer-events-auto">
                  <Tabs tabs={["My Portfolio", "My Jobs"]} active={mobileTab} onChange={setMobileTab} />
                </div>

                <AnimatePresence mode="wait">
                  {mobileTab === "My Portfolio" ? (
                    <motion.div
                      key="mob-portfolio"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-1 overflow-y-auto pt-[72px] pb-28 px-4"
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
                      className="flex-1 overflow-y-auto pt-[72px] pb-28 px-4"
                      style={{ scrollbarWidth: "none" }}
                    >
                      <JobsPreview parsed={parsed} />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Bottom fade */}
                <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none bg-gradient-to-t from-background to-transparent" />
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
