import { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
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
        <span className="text-foreground/80 text-[13px] font-semibold">Cover Letter</span>
        {doc?.version ? (
          <span className="text-foreground/35 text-[11px]">v{doc.version}</span>
        ) : null}
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={onRegenerate}
            disabled={regenerating}
            className="text-foreground/45 hover:text-foreground/75 hover:bg-foreground/[0.05] group flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11.5px] font-medium transition-all disabled:opacity-40"
          >
            {regenerating ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <RotateCcw className="h-3 w-3 transition-transform duration-300 group-hover:-rotate-45" />
            )}
            Regenerate
          </button>
          <button
            onClick={handleCopy}
            className="text-foreground/45 hover:text-foreground/75 hover:bg-foreground/[0.05] flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11.5px] font-medium transition-all"
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
                  <Check className="h-3 w-3" />
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
                  <Copy className="h-3 w-3" />
                  Copy
                </motion.span>
              )}
            </AnimatePresence>
          </button>
          <span className="text-foreground/40 text-[12px]">{job?.company}</span>
        </div>
      </div>

      {/* ── Letter area — always white paper ── */}
      <div className="custom-thin-scrollbar flex-1 overflow-y-auto bg-[#F7F5F2] px-5 py-5 dark:bg-[#161210]">
        <div className="mx-auto max-w-[680px] overflow-hidden rounded-xl border border-black/[0.07] bg-white shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
          {/* Toolbar inside card */}
          <div className="flex items-center gap-1.5 border-b border-black/[0.04] px-4 pt-3 pb-2.5">
            <div className="flex items-center gap-1.5 select-none" style={{ color: "#999" }}>
              <Info className="h-3 w-3 shrink-0" />
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
            className="min-h-[480px] cursor-text rounded-b-xl px-8 py-6 transition-colors outline-none focus:bg-black/[0.01]"
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
          <div className="flex items-center justify-center border-t border-black/[0.04] py-2.5">
            <span className="text-[11px] font-medium tracking-wide" style={{ color: "#bbb" }}>
              1 / 1
            </span>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="flex shrink-0 gap-2.5 border-t border-black/[0.06] px-5 py-3.5 dark:border-white/[0.06]">
        <button
          onClick={() => onSave(buildContent(), doc.styling)}
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
          onClick={() => onExport(buildContent(), doc.styling)}
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
  );
}
