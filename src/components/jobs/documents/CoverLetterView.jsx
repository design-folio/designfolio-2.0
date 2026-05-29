import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Copy, Check, Download, RotateCcw, Loader2, Save, ExternalLink } from "lucide-react";

// Cover-letter editor: single-pane editable letter wired to a persisted document.
// (The source's AI-Edit sidebar is intentionally hidden in v1 — backend AI-refine
// is deferred; the schema is ready for it.)
export default function CoverLetterView({ doc, job, onBack, onSave, onExport, onRegenerate, saving, exporting, regenerating }) {
  const original = doc?.content?.body || "";
  const [body, setBody] = useState(original);
  const [copied, setCopied] = useState(false);
  const dirty = body !== original;

  const handleCopy = () => {
    navigator.clipboard.writeText(body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const buildContent = () => ({ ...doc.content, body });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 flex-shrink-0 flex items-center gap-3 h-[64px] border-b border-black/[0.08] dark:border-white/[0.08]">
        <button onClick={onBack} className="flex items-center gap-1.5 text-foreground/45 hover:text-foreground/75 transition-colors group -ml-1">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-[13px]">{job?.role}</span>
        </button>
        <div className="h-3.5 w-px bg-black/[0.10] dark:bg-white/[0.10]" />
        <span className="text-[13px] font-semibold text-foreground/80">Cover Letter</span>
        {doc?.version ? <span className="text-[11px] text-foreground/35">v{doc.version}</span> : null}
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={onRegenerate}
            disabled={regenerating}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-foreground/45 hover:text-foreground/75 hover:bg-foreground/[0.05] transition-all text-[11.5px] font-medium group disabled:opacity-40"
          >
            {regenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3 group-hover:-rotate-45 transition-transform duration-300" />}
            Regenerate
          </button>
          <button onClick={handleCopy} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-foreground/45 hover:text-foreground/75 hover:bg-foreground/[0.05] transition-all text-[11.5px] font-medium">
            <AnimatePresence mode="wait" initial={false}>
              {copied ? (
                <motion.span key="c" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }} transition={{ duration: 0.15 }} className="flex items-center gap-1.5 text-emerald-500"><Check className="w-3 h-3" />Copied</motion.span>
              ) : (
                <motion.span key="o" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }} transition={{ duration: 0.15 }} className="flex items-center gap-1.5"><Copy className="w-3 h-3" />Copy</motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Letter */}
      <div className="flex-1 overflow-y-auto bg-[#F7F5F2] dark:bg-[#161210] px-5 py-5">
        <div className="max-w-[680px] mx-auto bg-white dark:bg-[#1C1814] border border-black/[0.07] dark:border-white/[0.05] rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_16px_rgba(0,0,0,0.35)] overflow-hidden">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            spellCheck
            className="w-full px-8 py-7 min-h-[520px] text-[13px] leading-[1.85] text-foreground/85 bg-transparent outline-none resize-none"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3.5 border-t border-black/[0.06] dark:border-white/[0.06] flex gap-2.5 flex-shrink-0">
        <button
          onClick={() => onSave(buildContent(), doc.styling)}
          disabled={saving || !dirty}
          className="flex items-center justify-center gap-2 h-9 px-4 rounded-full border border-black/[0.12] dark:border-white/[0.12] text-foreground/65 hover:text-foreground hover:border-black/[0.20] text-[12.5px] font-medium transition-colors disabled:opacity-40"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          {dirty ? "Save changes" : "Saved"}
        </button>
        <button
          onClick={() => onExport(buildContent(), doc.styling)}
          disabled={exporting}
          className="flex items-center justify-center gap-2 h-9 px-4 rounded-full border border-black/[0.12] dark:border-white/[0.12] text-foreground/65 hover:text-foreground hover:border-black/[0.20] text-[12.5px] font-medium transition-colors disabled:opacity-40"
        >
          {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
          Download PDF
        </button>
        <div className="flex-1" />
        {job?.applyUrl ? (
          <a
            href={job.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 h-9 px-5 rounded-full bg-[#1A1A1A] dark:bg-[#F0EDE7] text-white dark:text-[#1A1A1A] text-[12.5px] font-semibold hover:opacity-80 transition-opacity"
          >
            Apply Now <ExternalLink className="w-3.5 h-3.5" />
          </a>
        ) : null}
      </div>
    </div>
  );
}
