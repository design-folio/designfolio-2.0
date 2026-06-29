import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft,
  ChevronDown,
  Copy,
  Check,
  Download,
  RotateCcw,
  Loader2,
  Save,
  ExternalLink,
  Plus,
  Trash2,
  Info,
  AlertTriangle,
} from "lucide-react";

const FONTS = ["Inter", "Manrope", "Geist Mono", "DM Mono"];
const SPACINGS = ["Compact", "Normal", "Relaxed"];
const ACCENTS = ["#1A1A1A", "#2563EB", "#16A34A", "#9333EA", "#DC2626", "#D97706"];

const fontFamilyOf = (f) =>
  f === "Geist Mono"
    ? "'Geist Mono', monospace"
    : f === "DM Mono"
      ? "'DM Mono', monospace"
      : f === "Manrope"
        ? "'Manrope', sans-serif"
        : "'Inter', sans-serif";
const lineHeightOf = (s) => (s === "Compact" ? "1.5" : s === "Relaxed" ? "2" : "1.75");

// Input / textarea base class for the editor panel
const F =
  "w-full text-[11.5px] text-foreground/75 bg-foreground/[0.03] dark:bg-white/[0.03] border border-black/[0.07] dark:border-white/[0.07] rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-foreground/[0.18] transition-all";

const SECTIONS = [
  { id: "personal", label: "Personal Info" },
  { id: "summary", label: "Summary" },
  { id: "experience", label: "Experience" },
  { id: "education", label: "Education" },
  { id: "skills", label: "Skills" },
];

export default function TailoredResumeView({
  doc,
  job,
  onBack,
  onSave,
  onExport,
  onRegenerate,
  saving,
  exporting,
  regenerating,
}) {
  const c = doc?.content || {};
  const [personalInfo, setPersonalInfo] = useState(
    c.personalInfo || { name: "", email: "", linkedin: "", portfolio: "" }
  );
  const [summary, setSummary] = useState(c.summary || "");
  const [experiences, setExperiences] = useState(c.experiences || []);
  const [education, setEducation] = useState(c.education || []);
  const [skillsText, setSkillsText] = useState((c.skills || []).join("\n"));
  const [font, setFont] = useState(doc?.styling?.font || "Inter");
  const [spacing, setSpacing] = useState(doc?.styling?.spacing || "Normal");
  const [accent, setAccent] = useState(doc?.styling?.accent || "#1A1A1A");

  const [rightTab, setRightTab] = useState("editor");
  const [expanded, setExpanded] = useState({ summary: true });
  const [copied, setCopied] = useState(false);

  const skills = useMemo(
    () =>
      skillsText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    [skillsText]
  );

  const buildContent = () => ({
    personalInfo,
    summary,
    experiences,
    education,
    skills,
    sectionOrder: c.sectionOrder || ["summary", "experience", "education", "skills"],
  });
  const buildStyling = () => ({ font, spacing, accent });

  const original = useMemo(
    () =>
      JSON.stringify({
        c: {
          personalInfo: c.personalInfo,
          summary: c.summary,
          experiences: c.experiences,
          education: c.education,
          skills: c.skills,
        },
        s: doc?.styling,
      }),
    [doc, c.personalInfo, c.summary, c.experiences, c.education, c.skills]
  );
  const current = JSON.stringify({
    c: { personalInfo, summary, experiences, education, skills },
    s: buildStyling(),
  });
  const dirty = original !== current;

  const toggle = (id) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  const updateExp = (i, field, val) =>
    setExperiences((p) => p.map((e, idx) => (idx === i ? { ...e, [field]: val } : e)));
  const updateExpBullets = (i, raw) =>
    setExperiences((p) => p.map((e, idx) => (idx === i ? { ...e, bullets: raw.split("\n") } : e)));
  const addExp = () =>
    setExperiences((p) => [...p, { company: "", title: "", dates: "", bullets: [] }]);
  const removeExp = (i) => setExperiences((p) => p.filter((_, idx) => idx !== i));

  const updateEdu = (i, field, val) =>
    setEducation((p) => p.map((e, idx) => (idx === i ? { ...e, [field]: val } : e)));
  const addEdu = () => setEducation((p) => [...p, { school: "", degree: "", dates: "" }]);
  const removeEdu = (i) => setEducation((p) => p.filter((_, idx) => idx !== i));

  const handleCopy = () => {
    const lines = [
      personalInfo.name,
      [personalInfo.email, personalInfo.linkedin, personalInfo.portfolio]
        .filter(Boolean)
        .join("  ·  "),
      "",
      summary,
      "",
      ...experiences.flatMap((e) => [
        `${e.company} — ${e.title} (${e.dates})`,
        ...(e.bullets || []).map((b) => `• ${b}`),
        "",
      ]),
      ...(skills.length ? ["Skills", ...skills] : []),
    ];
    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fontFamily = fontFamilyOf(font);
  const lineHeight = lineHeightOf(spacing);

  return (
    <div className="flex h-full flex-col">
      {/* ── Header ── */}
      <div className="flex h-[64px] shrink-0 items-center gap-3 border-b border-black/[0.08] px-4 dark:border-white/[0.08]">
        <button
          onClick={onBack}
          className="text-foreground/45 hover:text-foreground/75 group -ml-1 flex items-center gap-1.5 transition-colors"
        >
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          <span className="text-[13px]">{job?.role}</span>
        </button>
        <div className="h-3.5 w-px bg-black/[0.10] dark:bg-white/[0.10]" />
        <span className="text-foreground/80 text-[13px] font-semibold">Tailored Resume</span>
        {doc?.version ? (
          <span className="text-foreground/35 text-[11px]">v{doc.version}</span>
        ) : null}
        <span className="text-foreground/40 ml-auto text-[12px]">{job?.company}</span>
      </div>

      {/* ── Body ── */}
      <div className="flex min-h-0 flex-1">
        {/* ── Left: preview ── */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Toolbar */}
          <div className="flex shrink-0 items-center gap-1 border-b border-black/[0.05] px-4 py-2 dark:border-white/[0.05]">
            <div className="text-foreground/35 flex items-center gap-1.5 select-none">
              <Info className="h-3 w-3 shrink-0" />
              <span className="text-[11px]">Edit sections in the Editor tab →</span>
            </div>
            <div className="flex-1" />
            <button
              onClick={onRegenerate}
              disabled={regenerating}
              className="text-foreground/45 hover:text-foreground/70 hover:bg-foreground/[0.05] group flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-all disabled:opacity-40"
            >
              {regenerating ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <RotateCcw className="h-3 w-3 transition-transform duration-300 group-hover:-rotate-45" />
              )}
              Regenerate
            </button>
            <div className="h-3.5 w-px bg-black/[0.07] dark:bg-white/[0.07]" />
            <button
              onClick={handleCopy}
              className="text-foreground/45 hover:text-foreground/70 hover:bg-foreground/[0.05] flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-all"
            >
              <AnimatePresence mode="wait" initial={false}>
                {copied ? (
                  <motion.span
                    key="c"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.14 }}
                    className="flex items-center gap-1.5 text-emerald-500"
                  >
                    <Check className="h-3 w-3" />
                    Copied
                  </motion.span>
                ) : (
                  <motion.span
                    key="o"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.14 }}
                    className="flex items-center gap-1.5"
                  >
                    <Copy className="h-3 w-3" />
                    Copy
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>

          {/* Resume paper — always white regardless of app theme */}
          <div className="custom-thin-scrollbar flex-1 overflow-y-auto bg-[#F7F5F2] px-5 py-5 dark:bg-[#161210]">
            <div
              className="min-h-[520px] rounded-xl border border-black/[0.07] bg-white px-8 py-7 shadow-[0_2px_16px_rgba(0,0,0,0.07)]"
              style={{ fontFamily, lineHeight }}
            >
              {/* Name */}
              <p
                style={{
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "#111",
                  margin: "0 0 4px",
                  textAlign: "center",
                  lineHeight: 1.2,
                }}
              >
                {personalInfo.name || "Your Name"}
              </p>
              {/* Contact */}
              <p
                style={{
                  fontSize: "10.5px",
                  color: "#555",
                  margin: "0 0 18px",
                  textAlign: "center",
                }}
              >
                {[personalInfo.email, personalInfo.linkedin, personalInfo.portfolio]
                  .filter(Boolean)
                  .join("  ·  ")}
              </p>

              {/* Summary */}
              {summary ? (
                <div className="mb-4">
                  <p
                    className="mb-1 text-[10px] font-bold tracking-[0.09em] uppercase"
                    style={{ color: accent }}
                  >
                    Summary
                  </p>
                  <hr className="mb-2" style={{ borderColor: "#e5e5e5" }} />
                  <p className="text-[11.5px] leading-relaxed" style={{ color: "#333" }}>
                    {summary}
                  </p>
                </div>
              ) : null}

              {/* Experience */}
              {experiences.length ? (
                <div className="mb-4">
                  <p
                    className="mb-1 text-[10px] font-bold tracking-[0.09em] uppercase"
                    style={{ color: accent }}
                  >
                    Experience
                  </p>
                  <hr className="mb-3" style={{ borderColor: "#e5e5e5" }} />
                  {experiences.map((exp, i) => (
                    <div key={i} style={{ marginBottom: i < experiences.length - 1 ? "12px" : 0 }}>
                      {/* Title · Company — matches PDF layout */}
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="text-[11.5px] font-semibold" style={{ color: "#111" }}>
                          {exp.title || ""}
                          {exp.company ? ` · ${exp.company}` : ""}
                        </p>
                        <p
                          className="shrink-0 text-[10px] whitespace-nowrap"
                          style={{ color: "#777" }}
                        >
                          {exp.dates}
                        </p>
                      </div>
                      {(exp.bullets || []).filter(Boolean).length ? (
                        <ul
                          style={{ margin: "6px 0 0", paddingLeft: "16px", listStyleType: "disc" }}
                        >
                          {(exp.bullets || []).filter(Boolean).map((b, bi) => (
                            <li
                              key={bi}
                              className="text-[11.5px] leading-[1.7]"
                              style={{ color: "#333", marginBottom: "3px", display: "list-item" }}
                            >
                              {b}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : null}

              {/* Education */}
              {education.length ? (
                <div className="mb-4">
                  <p
                    className="mb-1 text-[10px] font-bold tracking-[0.09em] uppercase"
                    style={{ color: accent }}
                  >
                    Education
                  </p>
                  <hr className="mb-2" style={{ borderColor: "#e5e5e5" }} />
                  {education.map((edu, i) => (
                    <div key={i} style={{ marginBottom: i < education.length - 1 ? "10px" : 0 }}>
                      {/* Degree · School — matches PDF layout */}
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="text-[11.5px] font-semibold" style={{ color: "#111" }}>
                          {edu.degree || ""}
                          {edu.school ? ` · ${edu.school}` : ""}
                        </p>
                        <p
                          className="shrink-0 text-[10px] whitespace-nowrap"
                          style={{ color: "#777" }}
                        >
                          {edu.dates}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              {/* Skills — chips to match PDF output */}
              {skills.length ? (
                <div>
                  <p
                    className="mb-1 text-[10px] font-bold tracking-[0.09em] uppercase"
                    style={{ color: accent }}
                  >
                    Skills
                  </p>
                  <hr className="mb-2" style={{ borderColor: "#e5e5e5" }} />
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {skills.map((s, i) => (
                      <span
                        key={i}
                        style={{
                          border: "1px solid #e0e0e0",
                          borderRadius: "4px",
                          padding: "2px 8px",
                          fontSize: "10px",
                          color: "#333",
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Page indicator */}
            <div className="mt-3 flex items-center justify-center">
              <span className="text-foreground/25 text-[11px] font-medium tracking-wide">
                1 / 1
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex shrink-0 gap-2.5 border-t border-black/[0.06] px-5 py-3.5 dark:border-white/[0.06]">
            <button
              onClick={() => onSave(buildContent(), buildStyling())}
              disabled={saving || !dirty}
              className="text-foreground/65 hover:text-foreground flex h-9 items-center justify-center gap-2 rounded-full border border-black/[0.12] px-4 text-[12.5px] font-medium transition-colors hover:border-black/[0.20] disabled:opacity-40 dark:border-white/[0.12] dark:hover:border-white/[0.20]"
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              {dirty ? "Save changes" : "Saved"}
            </button>
            <button
              onClick={() => onExport(buildContent(), buildStyling())}
              disabled={exporting}
              className="text-foreground/65 hover:text-foreground flex h-9 items-center justify-center gap-2 rounded-full border border-black/[0.12] px-4 text-[12.5px] font-medium transition-colors hover:border-black/[0.20] disabled:opacity-40 dark:border-white/[0.12] dark:hover:border-white/[0.20]"
            >
              {exporting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
              Download PDF
            </button>
            <div className="flex-1" />
            {job?.applyUrl ? (
              <a
                href={job.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 items-center justify-center gap-2 rounded-full bg-[#1A1A1A] px-5 text-[12.5px] font-semibold text-white transition-opacity hover:opacity-80 dark:bg-[#F0EDE7] dark:text-[#1A1A1A]"
              >
                Apply Now <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : null}
          </div>
        </div>

        <div className="w-px shrink-0 bg-black/[0.06] dark:bg-white/[0.06]" />

        {/* ── Right: Editor / Style panel ── */}
        <div className="flex w-[300px] shrink-0 flex-col bg-[#F4F1EC] dark:bg-[#131008]">
          {/* Tab bar */}
          <div className="flex shrink-0 items-center gap-0.5 px-3 pt-3 pb-0">
            {[
              { key: "editor", label: "Editor" },
              { key: "style", label: "Style" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setRightTab(tab.key)}
                className={`flex-1 rounded-t-lg py-2 text-[11.5px] font-semibold transition-all ${
                  rightTab === tab.key
                    ? "text-foreground/85 border border-b-0 border-black/[0.07] bg-white dark:border-white/[0.07] dark:bg-[#1E1A16]"
                    : "text-foreground/40 hover:text-foreground/65"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="h-px shrink-0 bg-black/[0.07] dark:bg-white/[0.07]" />

          {/* ── Editor tab ── */}
          {rightTab === "editor" && (
            <div className="custom-thin-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto">
              <div className="space-y-2.5 px-3 py-3">
                {/* Change notice */}
                <div className="flex items-start gap-2.5 rounded-xl border border-amber-200/70 bg-amber-50 px-3 py-2.5 dark:border-amber-400/20 dark:bg-amber-400/10">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                  <p className="text-[11px] leading-[1.6] text-amber-800 dark:text-amber-300">
                    Changes apply only to this tailored resume and update the preview instantly.
                  </p>
                </div>

                {SECTIONS.map((section) => (
                  <div
                    key={section.id}
                    className="overflow-hidden rounded-xl border border-black/[0.06] bg-white dark:border-white/[0.06] dark:bg-[#1E1A16]"
                  >
                    <button
                      onClick={() => toggle(section.id)}
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-left"
                    >
                      <span className="text-foreground/75 flex-1 text-[12px] font-semibold">
                        {section.label}
                      </span>
                      <motion.div
                        animate={{ rotate: expanded[section.id] ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="text-foreground/35 h-3.5 w-3.5" />
                      </motion.div>
                    </button>

                    <AnimatePresence initial={false}>
                      {expanded[section.id] && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-2 border-t border-black/[0.05] px-3 py-3 dark:border-white/[0.05]">
                            {section.id === "personal" &&
                              ["name", "email", "linkedin", "portfolio"].map((field) => (
                                <div key={field}>
                                  <p className="text-foreground/40 mb-0.5 text-[10px] font-medium capitalize">
                                    {field}
                                  </p>
                                  <input
                                    value={personalInfo[field] || ""}
                                    onChange={(e) =>
                                      setPersonalInfo((p) => ({ ...p, [field]: e.target.value }))
                                    }
                                    className={F}
                                  />
                                </div>
                              ))}

                            {section.id === "summary" && (
                              <textarea
                                value={summary}
                                onChange={(e) => setSummary(e.target.value)}
                                rows={6}
                                className={`${F} resize-none`}
                              />
                            )}

                            {section.id === "experience" && (
                              <div className="space-y-4">
                                {experiences.map((exp, idx) => (
                                  <div key={idx} className="space-y-2">
                                    {idx > 0 && (
                                      <div className="h-px bg-black/[0.05] dark:bg-white/[0.05]" />
                                    )}
                                    <div className="flex items-center justify-between">
                                      <p className="text-foreground/40 text-[10px] font-semibold tracking-wide uppercase">
                                        Role {idx + 1}
                                      </p>
                                      <button
                                        onClick={() => removeExp(idx)}
                                        className="text-foreground/25 transition-colors hover:text-red-400"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </button>
                                    </div>
                                    <div>
                                      <p className="text-foreground/40 mb-0.5 text-[10px] font-medium">
                                        Company
                                      </p>
                                      <input
                                        placeholder="Company"
                                        value={exp.company || ""}
                                        onChange={(e) => updateExp(idx, "company", e.target.value)}
                                        className={F}
                                      />
                                    </div>
                                    <div>
                                      <p className="text-foreground/40 mb-0.5 text-[10px] font-medium">
                                        Title
                                      </p>
                                      <input
                                        placeholder="Title"
                                        value={exp.title || ""}
                                        onChange={(e) => updateExp(idx, "title", e.target.value)}
                                        className={F}
                                      />
                                    </div>
                                    <div>
                                      <p className="text-foreground/40 mb-0.5 text-[10px] font-medium">
                                        Dates
                                      </p>
                                      <input
                                        placeholder="Dates"
                                        value={exp.dates || ""}
                                        onChange={(e) => updateExp(idx, "dates", e.target.value)}
                                        className={F}
                                      />
                                    </div>
                                    <div>
                                      <p className="text-foreground/40 mb-0.5 text-[10px] font-medium">
                                        Bullet points (one per line)
                                      </p>
                                      <textarea
                                        placeholder="Bullet points (one per line)"
                                        value={(exp.bullets || []).join("\n")}
                                        onChange={(e) => updateExpBullets(idx, e.target.value)}
                                        rows={4}
                                        className={`${F} resize-none`}
                                      />
                                    </div>
                                  </div>
                                ))}
                                <button
                                  onClick={addExp}
                                  className="text-foreground/40 hover:text-foreground/65 flex h-8 w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-black/[0.12] text-[11.5px] font-medium transition-colors hover:border-black/[0.22] dark:border-white/[0.12] dark:hover:border-white/[0.22]"
                                >
                                  <Plus className="h-3 w-3" />
                                  Add role
                                </button>
                              </div>
                            )}

                            {section.id === "education" && (
                              <div className="space-y-4">
                                {education.map((edu, idx) => (
                                  <div key={idx} className="space-y-2">
                                    {idx > 0 && (
                                      <div className="h-px bg-black/[0.05] dark:bg-white/[0.05]" />
                                    )}
                                    <div className="flex items-center justify-between">
                                      <p className="text-foreground/40 text-[10px] font-semibold tracking-wide uppercase">
                                        Entry {idx + 1}
                                      </p>
                                      <button
                                        onClick={() => removeEdu(idx)}
                                        className="text-foreground/25 transition-colors hover:text-red-400"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </button>
                                    </div>
                                    <div>
                                      <p className="text-foreground/40 mb-0.5 text-[10px] font-medium">
                                        School
                                      </p>
                                      <input
                                        placeholder="School"
                                        value={edu.school || ""}
                                        onChange={(e) => updateEdu(idx, "school", e.target.value)}
                                        className={F}
                                      />
                                    </div>
                                    <div>
                                      <p className="text-foreground/40 mb-0.5 text-[10px] font-medium">
                                        Degree
                                      </p>
                                      <input
                                        placeholder="Degree"
                                        value={edu.degree || ""}
                                        onChange={(e) => updateEdu(idx, "degree", e.target.value)}
                                        className={F}
                                      />
                                    </div>
                                    <div>
                                      <p className="text-foreground/40 mb-0.5 text-[10px] font-medium">
                                        Dates
                                      </p>
                                      <input
                                        placeholder="Dates"
                                        value={edu.dates || ""}
                                        onChange={(e) => updateEdu(idx, "dates", e.target.value)}
                                        className={F}
                                      />
                                    </div>
                                  </div>
                                ))}
                                <button
                                  onClick={addEdu}
                                  className="text-foreground/40 hover:text-foreground/65 flex h-8 w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-black/[0.12] text-[11.5px] font-medium transition-colors hover:border-black/[0.22] dark:border-white/[0.12] dark:hover:border-white/[0.22]"
                                >
                                  <Plus className="h-3 w-3" />
                                  Add education
                                </button>
                              </div>
                            )}

                            {section.id === "skills" && (
                              <div>
                                <p className="text-foreground/40 mb-0.5 text-[10px] font-medium">
                                  Skills (one per line)
                                </p>
                                <textarea
                                  value={skillsText}
                                  onChange={(e) => setSkillsText(e.target.value)}
                                  rows={6}
                                  className={`${F} resize-none`}
                                />
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Style tab ── */}
          {rightTab === "style" && (
            <div className="custom-thin-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto">
              <div className="space-y-5 px-3 py-4">
                <div>
                  <p className="text-foreground/45 mb-2 text-[10.5px] font-semibold tracking-[0.07em] uppercase">
                    Font
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {FONTS.map((f) => (
                      <button
                        key={f}
                        onClick={() => setFont(f)}
                        className={`h-9 rounded-xl border text-[11.5px] font-medium transition-colors ${
                          font === f
                            ? "border-foreground/35 text-foreground/85 bg-white dark:bg-[#1E1A16]"
                            : "text-foreground/45 hover:text-foreground/70 border-black/[0.07] bg-white hover:border-black/[0.15] dark:border-white/[0.07] dark:bg-[#1E1A16] dark:hover:border-white/[0.15]"
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-foreground/45 mb-2 text-[10.5px] font-semibold tracking-[0.07em] uppercase">
                    Line Spacing
                  </p>
                  <div className="flex gap-1.5">
                    {SPACINGS.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSpacing(s)}
                        className={`h-8 flex-1 rounded-xl border text-[11px] font-medium transition-colors ${
                          spacing === s
                            ? "border-foreground/35 text-foreground/85 bg-white dark:bg-[#1E1A16]"
                            : "text-foreground/45 hover:text-foreground/70 border-black/[0.07] bg-white hover:border-black/[0.15] dark:border-white/[0.07] dark:bg-[#1E1A16] dark:hover:border-white/[0.15]"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-foreground/45 mb-2 text-[10.5px] font-semibold tracking-[0.07em] uppercase">
                    Section Header Colour
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {ACCENTS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setAccent(color)}
                        style={{ backgroundColor: color }}
                        className={`h-7 w-7 rounded-full transition-all ${
                          accent === color
                            ? "ring-foreground/50 scale-110 ring-2 ring-offset-2 dark:ring-offset-[#131008]"
                            : "hover:scale-110"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
