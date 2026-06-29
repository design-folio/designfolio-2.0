import { useEffect, useState, useCallback, startTransition } from "react";
import { toast } from "react-toastify";
import {
  _getDocument,
  _patchDocument,
  _postExportDocument,
  _postGenerateResume,
  _postGenerateCoverLetter,
} from "@/network/documents";
import DocumentGeneratingView from "./DocumentGeneratingView";
import TailoredResumeView from "./TailoredResumeView";
import CoverLetterView from "./CoverLetterView";

// Full-screen overlay that either GENERATES a new document (no docId) or LOADS an
// existing one (docId), then renders the matching editor with save/export/regenerate.
// `job` must carry { id, role, company, applyUrl }. Calls onChange() after mutations
// so callers can refresh their version lists.
export default function DocumentStudio({ open, onClose, type, job, profileId, docId, onChange }) {
  const [phase, setPhase] = useState("idle"); // idle | generating | loading | ready | error
  const [doc, setDoc] = useState(null);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const generateFn = type === "coverLetter" ? _postGenerateCoverLetter : _postGenerateResume;

  const generate = useCallback(async () => {
    setPhase("generating");
    try {
      const res = await generateFn(job.id, profileId);
      setDoc(res.data);
      setPhase("ready");
      onChange?.();
    } catch {
      setPhase("error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job?.id, profileId, type]);

  const load = useCallback(async (id) => {
    setPhase("loading");
    try {
      const res = await _getDocument(id);
      setDoc(res.data);
      setPhase("ready");
    } catch {
      setPhase("error");
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    startTransition(() => {
      setDoc(null);
      void (docId ? load(docId) : generate());
    });
  }, [open, docId, load, generate]);

  const handleSave = async (content, styling) => {
    if (!doc?._id) return;
    setSaving(true);
    try {
      const res = await _patchDocument(doc._id, { content, styling });
      setDoc(res.data);
      toast.success("Saved");
      onChange?.();
    } catch {
      /* interceptor toasts */
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async (content, styling) => {
    if (!doc?._id) return;
    setExporting(true);
    try {
      // Persist current edits first so the PDF reflects them.
      const patched = await _patchDocument(doc._id, { content, styling });
      setDoc(patched.data);
      const res = await _postExportDocument(doc._id, "pdf");
      if (res.data?.url) window.open(res.data.url, "_blank", "noopener,noreferrer");
      onChange?.();
    } catch {
      /* interceptor toasts */
    } finally {
      setExporting(false);
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const res = await generateFn(job.id, profileId);
      setDoc(res.data);
      toast.success("Generated a new version");
      onChange?.();
    } catch {
      /* interceptor toasts */
    } finally {
      setRegenerating(false);
    }
  };

  if (!open) return null;

  const editorProps = {
    job,
    onBack: onClose,
    onSave: handleSave,
    onExport: handleExport,
    onRegenerate: handleRegenerate,
    saving,
    exporting,
    regenerating,
  };

  return (
    <div className="flex h-full w-full flex-col bg-[#FBFAF8] dark:bg-[#0E0B07]">
      {phase === "generating" && <DocumentGeneratingView type={type} job={job} onBack={onClose} />}

      {phase === "loading" && (
        <div className="text-foreground/40 flex flex-1 items-center justify-center text-[13px]">
          Loading…
        </div>
      )}

      {phase === "error" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3">
          <p className="text-foreground/60 text-[13px]">
            Something went wrong generating this document.
          </p>
          <button
            onClick={onClose}
            className="text-foreground/70 rounded-full border border-black/[0.12] px-4 py-2 text-[12px] dark:border-white/[0.12]"
          >
            Close
          </button>
        </div>
      )}

      {phase === "ready" &&
        doc &&
        (type === "coverLetter" ? (
          <CoverLetterView key={doc._id} doc={doc} {...editorProps} />
        ) : (
          <TailoredResumeView key={doc._id} doc={doc} {...editorProps} />
        ))}
    </div>
  );
}
