import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Copy,
  Check,
  Download,
  RotateCcw,
  Loader2,
  Save,
  ExternalLink,
  Info,
} from "lucide-react";

export default function CoverLetterView({
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
  const original = doc?.content?.body || "";
  const [body, setBody] = useState(original);
  const [copied, setCopied] = useState(false);
  const editableRef = useRef(null);
  const dirty = body !== original;

  const handleCopy = () => {
    const text = editableRef.current?.innerText ?? body;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const buildContent = () => ({ ...doc.content, body });

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ── */}
      <div className="px-4 flex-shrink-0 flex items-center gap-3 h-[64px] border-b border-black/[0.08] dark:border-white/[0.08]">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-foreground/45 hover:text-foreground/75 transition-colors group -ml-1"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-[13px]">{job?.role}</span>
        </button>
        <div className="h-3.5 w-px bg-black/[0.10] dark:bg-white/[0.10]" />
        <span className="text-[13px] font-semibold text-foreground/80">Cover Letter</span>
        {doc?.version ? (
          <span className="text-[11px] text-foreground/35">v{doc.version}</span>
        ) : null}
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={onRegenerate}
            disabled={regenerating}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-foreground/45 hover:text-foreground/75 hover:bg-foreground/[0.05] transition-all text-[11.5px] font-medium group disabled:opacity-40"
          >
            {regenerating ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <RotateCcw className="w-3 h-3 group-hover:-rotate-45 transition-transform duration-300" />
            )}
            Regenerate
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-foreground/45 hover:text-foreground/75 hover:bg-foreground/[0.05] transition-all text-[11.5px] font-medium"
          >
            <AnimatePresence mode="wait" initial={false}>
              {copied ? (
                <motion.span
                  key="c"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-1.5 text-emerald-500"
                >
                  <Check className="w-3 h-3" />
                  Copied
                </motion.span>
              ) : (
                <motion.span
                  key="o"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-1.5"
                >
                  <Copy className="w-3 h-3" />
                  Copy
                </motion.span>
              )}
            </AnimatePresence>
          </button>
          <span className="text-[12px] text-foreground/40">{job?.company}</span>
        </div>
      </div>

      {/* ── Letter area — always white paper ── */}
      <div className="flex-1 overflow-y-auto custom-thin-scrollbar bg-[#F7F5F2] dark:bg-[#161210] px-5 py-5">
        <div className="max-w-[680px] mx-auto bg-white border border-black/[0.07] rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] overflow-hidden">
          {/* Toolbar inside card */}
          <div className="flex items-center gap-1.5 px-4 pt-3 pb-2.5 border-b border-black/[0.04]">
            <div className="flex items-center gap-1.5 select-none" style={{ color: "#999" }}>
              <Info className="w-3 h-3 flex-shrink-0" />
              <span className="text-[11.5px]">Click and type below to edit your letter</span>
            </div>
          </div>

          {/* Editable letter body */}
          <div
            ref={editableRef}
            contentEditable
            suppressContentEditableWarning
            onBlur={() => {
              if (editableRef.current) setBody(editableRef.current.innerText);
            }}
            className="px-8 py-6 min-h-[480px] outline-none cursor-text focus:bg-black/[0.01] transition-colors rounded-b-xl"
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: "13px",
              lineHeight: "1.85",
              color: "#2a2a2a",
              whiteSpace: "pre-wrap",
            }}
          >
            {body}
          </div>

          {/* Page counter */}
          <div className="flex items-center justify-center py-2.5 border-t border-black/[0.04]">
            <span className="text-[11px] font-medium tracking-wide" style={{ color: "#bbb" }}>
              1 / 1
            </span>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="px-5 py-3.5 border-t border-black/[0.06] dark:border-white/[0.06] flex gap-2.5 flex-shrink-0">
        <button
          onClick={() => onSave(buildContent(), doc.styling)}
          disabled={saving || !dirty}
          className="flex items-center justify-center gap-2 h-9 px-4 rounded-full border border-black/[0.12] dark:border-white/[0.12] text-foreground/65 hover:text-foreground hover:border-black/[0.20] dark:hover:border-white/[0.20] text-[12.5px] font-medium transition-colors disabled:opacity-40"
        >
          {saving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          {dirty ? "Save changes" : "Saved"}
        </button>
        <button
          onClick={() => onExport(buildContent(), doc.styling)}
          disabled={exporting}
          className="flex items-center justify-center gap-2 h-9 px-4 rounded-full border border-black/[0.12] dark:border-white/[0.12] text-foreground/65 hover:text-foreground hover:border-black/[0.20] dark:hover:border-white/[0.20] text-[12.5px] font-medium transition-colors disabled:opacity-40"
        >
          {exporting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
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
