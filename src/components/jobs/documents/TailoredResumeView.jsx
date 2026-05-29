import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronDown, Copy, Check, Download, RotateCcw,
  Loader2, Save, ExternalLink, Plus, Trash2, Info,
} from "lucide-react";

const FONTS = ["Inter", "Manrope", "Geist Mono", "DM Mono"];
const SPACINGS = ["Compact", "Normal", "Relaxed"];
const ACCENTS = ["#1A1A1A", "#2563EB", "#16A34A", "#9333EA", "#DC2626", "#D97706"];

const fontFamilyOf = (f) =>
  f === "Geist Mono" ? "'Geist Mono', monospace"
    : f === "DM Mono" ? "'DM Mono', monospace"
    : f === "Manrope" ? "'Manrope', sans-serif"
    : "'Inter', sans-serif";
const lineHeightOf = (s) => (s === "Compact" ? "1.5" : s === "Relaxed" ? "2" : "1.75");

const F = "w-full text-[11.5px] text-foreground/75 bg-foreground/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-foreground/[0.18] transition-all";

const SECTIONS = [
  { id: "personal", label: "Personal Info" },
  { id: "summary", label: "Summary" },
  { id: "experience", label: "Experience" },
  { id: "education", label: "Education" },
  { id: "skills", label: "Skills" },
];

// Resume editor wired to a persisted document. Facts come pre-filled from the
// portfolio; the user can edit everything. AI-Rewrite tab is hidden in v1.
export default function TailoredResumeView({ doc, job, onBack, onSave, onExport, onRegenerate, saving, exporting, regenerating }) {
  const c = doc?.content || {};
  const [personalInfo, setPersonalInfo] = useState(c.personalInfo || { name: "", email: "", linkedin: "", portfolio: "" });
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

  const skills = useMemo(() => skillsText.split("\n").map((s) => s.trim()).filter(Boolean), [skillsText]);

  const buildContent = () => ({
    personalInfo,
    summary,
    experiences,
    education,
    skills,
    sectionOrder: c.sectionOrder || ["summary", "experience", "education", "skills"],
  });
  const buildStyling = () => ({ font, spacing, accent });

  const original = useMemo(() => JSON.stringify({ c: { personalInfo: c.personalInfo, summary: c.summary, experiences: c.experiences, education: c.education, skills: c.skills }, s: doc?.styling }), [doc]);
  const current = JSON.stringify({ c: { personalInfo, summary, experiences, education, skills }, s: buildStyling() });
  const dirty = original !== current;

  const toggle = (id) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  const updateExp = (i, field, val) => setExperiences((p) => p.map((e, idx) => idx === i ? { ...e, [field]: val } : e));
  const updateExpBullets = (i, raw) => setExperiences((p) => p.map((e, idx) => idx === i ? { ...e, bullets: raw.split("\n") } : e));
  const addExp = () => setExperiences((p) => [...p, { company: "", title: "", dates: "", bullets: [] }]);
  const removeExp = (i) => setExperiences((p) => p.filter((_, idx) => idx !== i));

  const updateEdu = (i, field, val) => setEducation((p) => p.map((e, idx) => idx === i ? { ...e, [field]: val } : e));
  const addEdu = () => setEducation((p) => [...p, { school: "", degree: "", dates: "" }]);
  const removeEdu = (i) => setEducation((p) => p.filter((_, idx) => idx !== i));

  const handleCopy = () => {
    const lines = [
      personalInfo.name,
      [personalInfo.email, personalInfo.linkedin, personalInfo.portfolio].filter(Boolean).join("  ·  "),
      "", summary, "",
      ...experiences.flatMap((e) => [`${e.title} · ${e.company} (${e.dates})`, ...(e.bullets || []).map((b) => `• ${b}`), ""]),
      ...(skills.length ? ["Skills", ...skills] : []),
    ];
    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fontFamily = fontFamilyOf(font);
  const lineHeight = lineHeightOf(spacing);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 flex-shrink-0 flex items-center gap-3 h-[64px] border-b border-black/[0.08] dark:border-white/[0.08]">
        <button onClick={onBack} className="flex items-center gap-1.5 text-foreground/45 hover:text-foreground/75 transition-colors group -ml-1">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-[13px]">{job?.role}</span>
        </button>
        <div className="h-3.5 w-px bg-black/[0.10] dark:bg-white/[0.10]" />
        <span className="text-[13px] font-semibold text-foreground/80">Tailored Resume</span>
        {doc?.version ? <span className="text-[11px] text-foreground/35">v{doc.version}</span> : null}
        <span className="ml-auto text-[12px] text-foreground/40">{job?.company}</span>
      </div>

      {/* Body */}
      <div className="flex flex-1 min-h-0">
        {/* Left: preview */}
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center gap-1 px-4 py-2 border-b border-black/[0.05] dark:border-white/[0.05] flex-shrink-0">
            <div className="flex items-center gap-1.5 text-foreground/35 select-none">
              <Info className="w-3 h-3 flex-shrink-0" />
              <span className="text-[11px]">Edit sections in the Editor tab →</span>
            </div>
            <div className="flex-1" />
            <button onClick={onRegenerate} disabled={regenerating} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-foreground/45 hover:text-foreground/70 hover:bg-foreground/[0.05] transition-all text-[11px] font-medium group disabled:opacity-40">
              {regenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3 group-hover:-rotate-45 transition-transform duration-300" />}
              Regenerate
            </button>
            <div className="w-px h-3.5 bg-black/[0.07] dark:bg-white/[0.07]" />
            <button onClick={handleCopy} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-foreground/45 hover:text-foreground/70 hover:bg-foreground/[0.05] transition-all text-[11px] font-medium">
              {copied ? <span className="flex items-center gap-1.5 text-emerald-500"><Check className="w-3 h-3" />Copied</span> : <span className="flex items-center gap-1.5"><Copy className="w-3 h-3" />Copy</span>}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-[#F7F5F2] dark:bg-[#161210] px-5 py-5">
            <div className="bg-white dark:bg-[#1C1814] border border-black/[0.07] dark:border-white/[0.05] rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.07)] dark:shadow-[0_2px_16px_rgba(0,0,0,0.35)] px-8 py-7 min-h-[520px]" style={{ fontFamily, lineHeight }}>
              <p className="text-[20px] font-bold tracking-tight text-center text-foreground leading-tight">{personalInfo.name || "Your Name"}</p>
              <p className="text-[10.5px] text-foreground/55 text-center mt-1 mb-5">
                {[personalInfo.email, personalInfo.linkedin, personalInfo.portfolio].filter(Boolean).join("  ·  ")}
              </p>

              {summary ? (
                <div className="mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.09em] mb-1" style={{ color: accent }}>Summary</p>
                  <hr className="border-foreground/15 mb-2" />
                  <p className="text-[11.5px] text-foreground/80">{summary}</p>
                </div>
              ) : null}

              {experiences.length ? (
                <div className="mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.09em] mb-1" style={{ color: accent }}>Experience</p>
                  <hr className="border-foreground/15 mb-3" />
                  {experiences.map((exp, i) => (
                    <div key={i} className={i < experiences.length - 1 ? "mb-3.5" : ""}>
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="text-[12px] font-semibold text-foreground leading-snug">{exp.company}</p>
                        <p className="text-[10.5px] text-foreground/45 whitespace-nowrap flex-shrink-0">{exp.dates}</p>
                      </div>
                      <p className="text-[11px] text-foreground/55 italic mb-1.5">{exp.title}</p>
                      <ul className="space-y-0.5 pl-3.5">
                        {(exp.bullets || []).filter(Boolean).map((b, bi) => (
                          <li key={bi} className="text-[11.5px] text-foreground/72 leading-[1.7] list-disc list-outside ml-1">{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : null}

              {education.length ? (
                <div className="mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.09em] mb-1" style={{ color: accent }}>Education</p>
                  <hr className="border-foreground/15 mb-2" />
                  {education.map((edu, i) => (
                    <div key={i} className="flex items-baseline justify-between gap-2">
                      <div>
                        <p className="text-[11.5px] font-semibold text-foreground">{edu.school}</p>
                        <p className="text-[11px] text-foreground/55 italic">{edu.degree}</p>
                      </div>
                      <p className="text-[10.5px] text-foreground/45 whitespace-nowrap flex-shrink-0">{edu.dates}</p>
                    </div>
                  ))}
                </div>
              ) : null}

              {skills.length ? (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.09em] mb-1" style={{ color: accent }}>Skills</p>
                  <hr className="border-foreground/15 mb-2" />
                  {skills.map((line, i) => (
                    <p key={i} className="text-[11.5px] text-foreground/72">{line}</p>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-3.5 border-t border-black/[0.06] dark:border-white/[0.06] flex gap-2.5 flex-shrink-0">
            <button onClick={() => onSave(buildContent(), buildStyling())} disabled={saving || !dirty} className="flex items-center justify-center gap-2 h-9 px-4 rounded-full border border-black/[0.12] dark:border-white/[0.12] text-foreground/65 hover:text-foreground hover:border-black/[0.20] text-[12.5px] font-medium transition-colors disabled:opacity-40">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {dirty ? "Save changes" : "Saved"}
            </button>
            <button onClick={() => onExport(buildContent(), buildStyling())} disabled={exporting} className="flex items-center justify-center gap-2 h-9 px-4 rounded-full border border-black/[0.12] dark:border-white/[0.12] text-foreground/65 hover:text-foreground hover:border-black/[0.20] text-[12.5px] font-medium transition-colors disabled:opacity-40">
              {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              Download PDF
            </button>
            <div className="flex-1" />
            {job?.applyUrl ? (
              <a href={job.applyUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 h-9 px-5 rounded-full bg-[#1A1A1A] dark:bg-[#F0EDE7] text-white dark:text-[#1A1A1A] text-[12.5px] font-semibold hover:opacity-80 transition-opacity">
                Apply Now <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : null}
          </div>
        </div>

        <div className="w-px bg-black/[0.06] dark:bg-white/[0.06] flex-shrink-0" />

        {/* Right: Editor / Style */}
        <div className="w-[300px] flex-shrink-0 flex flex-col bg-[#F4F1EC] dark:bg-[#131008]">
          <div className="flex items-center px-3 pt-3 pb-0 gap-0.5 flex-shrink-0">
            {[{ key: "editor", label: "Editor" }, { key: "style", label: "Style" }].map((tab) => (
              <button key={tab.key} onClick={() => setRightTab(tab.key)} className={`flex-1 py-2 text-[11.5px] font-semibold rounded-t-lg transition-all ${rightTab === tab.key ? "bg-white dark:bg-[#1E1A16] text-foreground/85 border border-black/[0.07] dark:border-white/[0.07] border-b-0" : "text-foreground/40 hover:text-foreground/65"}`}>{tab.label}</button>
            ))}
          </div>
          <div className="h-px bg-black/[0.07] dark:bg-white/[0.07] flex-shrink-0" />

          {rightTab === "editor" && (
            <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">
              <div className="px-3 py-3 space-y-2.5">
                {SECTIONS.map((section) => (
                  <div key={section.id} className="bg-white dark:bg-[#1E1A16] border border-black/[0.06] dark:border-white/[0.05] rounded-xl overflow-hidden">
                    <button onClick={() => toggle(section.id)} className="w-full flex items-center gap-2 px-3 py-2.5 text-left">
                      <span className="flex-1 text-[12px] font-semibold text-foreground/75">{section.label}</span>
                      <motion.div animate={{ rotate: expanded[section.id] ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown className="w-3.5 h-3.5 text-foreground/35" />
                      </motion.div>
                    </button>

                    <AnimatePresence initial={false}>
                      {expanded[section.id] && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }} className="overflow-hidden">
                          <div className="border-t border-black/[0.05] dark:border-white/[0.05] px-3 py-3 space-y-2">

                            {section.id === "personal" && ["name", "email", "linkedin", "portfolio"].map((field) => (
                              <div key={field}>
                                <p className="text-[10px] text-foreground/40 font-medium mb-0.5 capitalize">{field}</p>
                                <input value={personalInfo[field] || ""} onChange={(e) => setPersonalInfo((p) => ({ ...p, [field]: e.target.value }))} className={F} />
                              </div>
                            ))}

                            {section.id === "summary" && (
                              <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={6} className={`${F} resize-none`} />
                            )}

                            {section.id === "experience" && (
                              <div className="space-y-4">
                                {experiences.map((exp, idx) => (
                                  <div key={idx} className="space-y-2">
                                    {idx > 0 && <div className="h-px bg-black/[0.05] dark:bg-white/[0.05]" />}
                                    <div className="flex items-center justify-between">
                                      <p className="text-[10px] font-semibold text-foreground/40 uppercase tracking-wide">Role {idx + 1}</p>
                                      <button onClick={() => removeExp(idx)} className="text-foreground/25 hover:text-red-400 transition-colors"><Trash2 className="w-3 h-3" /></button>
                                    </div>
                                    <input placeholder="Company" value={exp.company || ""} onChange={(e) => updateExp(idx, "company", e.target.value)} className={F} />
                                    <input placeholder="Title" value={exp.title || ""} onChange={(e) => updateExp(idx, "title", e.target.value)} className={F} />
                                    <input placeholder="Dates" value={exp.dates || ""} onChange={(e) => updateExp(idx, "dates", e.target.value)} className={F} />
                                    <textarea placeholder="Bullet points (one per line)" value={(exp.bullets || []).join("\n")} onChange={(e) => updateExpBullets(idx, e.target.value)} rows={4} className={`${F} resize-none`} />
                                  </div>
                                ))}
                                <button onClick={addExp} className="w-full flex items-center justify-center gap-1.5 h-8 rounded-lg border border-dashed border-black/[0.12] dark:border-white/[0.12] text-foreground/40 hover:text-foreground/65 text-[11.5px] font-medium transition-colors"><Plus className="w-3 h-3" />Add role</button>
                              </div>
                            )}

                            {section.id === "education" && (
                              <div className="space-y-4">
                                {education.map((edu, idx) => (
                                  <div key={idx} className="space-y-2">
                                    {idx > 0 && <div className="h-px bg-black/[0.05] dark:bg-white/[0.05]" />}
                                    <div className="flex items-center justify-between">
                                      <p className="text-[10px] font-semibold text-foreground/40 uppercase tracking-wide">Entry {idx + 1}</p>
                                      <button onClick={() => removeEdu(idx)} className="text-foreground/25 hover:text-red-400 transition-colors"><Trash2 className="w-3 h-3" /></button>
                                    </div>
                                    <input placeholder="School" value={edu.school || ""} onChange={(e) => updateEdu(idx, "school", e.target.value)} className={F} />
                                    <input placeholder="Degree" value={edu.degree || ""} onChange={(e) => updateEdu(idx, "degree", e.target.value)} className={F} />
                                    <input placeholder="Dates" value={edu.dates || ""} onChange={(e) => updateEdu(idx, "dates", e.target.value)} className={F} />
                                  </div>
                                ))}
                                <button onClick={addEdu} className="w-full flex items-center justify-center gap-1.5 h-8 rounded-lg border border-dashed border-black/[0.12] dark:border-white/[0.12] text-foreground/40 hover:text-foreground/65 text-[11.5px] font-medium transition-colors"><Plus className="w-3 h-3" />Add education</button>
                              </div>
                            )}

                            {section.id === "skills" && (
                              <div>
                                <p className="text-[10px] text-foreground/40 font-medium mb-0.5">Skills (one per line)</p>
                                <textarea value={skillsText} onChange={(e) => setSkillsText(e.target.value)} rows={6} className={`${F} resize-none`} />
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

          {rightTab === "style" && (
            <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">
              <div className="px-3 py-4 space-y-5">
                <div>
                  <p className="text-[10.5px] font-semibold text-foreground/45 uppercase tracking-[0.07em] mb-2">Font</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {FONTS.map((f) => (
                      <button key={f} onClick={() => setFont(f)} className={`h-9 rounded-xl border text-[11.5px] font-medium transition-colors bg-white dark:bg-[#1E1A16] ${font === f ? "border-foreground/35 text-foreground/85" : "border-black/[0.07] dark:border-white/[0.07] text-foreground/45 hover:text-foreground/70"}`}>{f}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10.5px] font-semibold text-foreground/45 uppercase tracking-[0.07em] mb-2">Line Spacing</p>
                  <div className="flex gap-1.5">
                    {SPACINGS.map((s) => (
                      <button key={s} onClick={() => setSpacing(s)} className={`flex-1 h-8 rounded-xl border text-[11px] font-medium transition-colors bg-white dark:bg-[#1E1A16] ${spacing === s ? "border-foreground/35 text-foreground/85" : "border-black/[0.07] dark:border-white/[0.07] text-foreground/45 hover:text-foreground/70"}`}>{s}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10.5px] font-semibold text-foreground/45 uppercase tracking-[0.07em] mb-2">Section Header Colour</p>
                  <div className="flex gap-2 flex-wrap">
                    {ACCENTS.map((color) => (
                      <button key={color} onClick={() => setAccent(color)} style={{ backgroundColor: color }} className={`w-7 h-7 rounded-full transition-all ${accent === color ? "ring-2 ring-offset-2 ring-foreground/50 dark:ring-offset-[#131008] scale-110" : "hover:scale-110"}`} />
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
