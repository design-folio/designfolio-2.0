import { useEffect, useState, useCallback } from "react";
import { FileText, PenLine, Trash2, Loader2 } from "lucide-react";
import { _getDocuments, _deleteDocument } from "@/network/documents";
import DocumentStudio from "./DocumentStudio";

// Global "Documents" area — every saved resume / cover letter across all jobs.
// Renders from each document's jobSnapshot, so it works even after the source
// Job has been TTL-deleted.
export default function DocumentsLibrary() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [studio, setStudio] = useState({ open: false, type: "resume", docId: null, job: null, profileId: null });

  const refresh = useCallback(() => {
    setLoading(true);
    _getDocuments()
      .then((res) => setDocs(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const openDoc = (d) =>
    setStudio({
      open: true,
      type: d.type,
      docId: d._id,
      job: {
        id: d.jobId,
        role: d.jobSnapshot?.title || "Role",
        company: d.jobSnapshot?.companyName || "",
        applyUrl: d.jobSnapshot?.applyUrl || "",
      },
      profileId: d.profileId,
    });

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    setDeletingId(id);
    try {
      await _deleteDocument(id);
      setDocs((p) => p.filter((d) => d._id !== id));
    } catch {
      /* interceptor toasts */
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-5 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground">Documents</h1>
        <p className="text-[13px] text-foreground/45 mt-1">Tailored resumes and cover letters you’ve generated for your jobs.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-foreground/40">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : docs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-12 h-12 rounded-2xl bg-foreground/[0.04] flex items-center justify-center mb-3">
            <FileText className="w-5 h-5 text-foreground/30" />
          </div>
          <p className="text-[14px] text-foreground/60 font-medium">No documents yet</p>
          <p className="text-[12.5px] text-foreground/40 mt-1 max-w-[320px]">
            Open a job and use “Tailor resume” or “Cover letter” to generate one.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {docs.map((d) => (
            <button
              key={d._id}
              onClick={() => openDoc(d)}
              className="group relative text-left rounded-2xl border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#1E1A16] hover:border-black/[0.16] dark:hover:border-white/[0.16] transition-colors p-4"
            >
              <div className="flex items-start justify-between">
                <div className="w-9 h-9 rounded-xl bg-foreground/[0.05] flex items-center justify-center flex-shrink-0">
                  {d.type === "resume"
                    ? <FileText className="w-4 h-4 text-foreground/55" />
                    : <PenLine className="w-4 h-4 text-foreground/55" />}
                </div>
                <span
                  onClick={(e) => handleDelete(e, d._id)}
                  role="button"
                  aria-label="Delete document"
                  className="w-7 h-7 -mt-1 -mr-1 rounded-lg flex items-center justify-center text-foreground/25 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-400/10 transition-colors opacity-0 group-hover:opacity-100"
                >
                  {deletingId === d._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                </span>
              </div>

              <div className="mt-3">
                <p className="text-[13px] font-semibold text-foreground/85 leading-snug truncate">
                  {d.type === "resume" ? "Tailored resume" : "Cover letter"}
                </p>
                <p className="text-[12px] text-foreground/50 mt-0.5 truncate">
                  {d.jobSnapshot?.title || "Role"}{d.jobSnapshot?.companyName ? ` · ${d.jobSnapshot.companyName}` : ""}
                </p>
              </div>

              <div className="mt-3 flex items-center gap-2 text-[11px] text-foreground/35">
                <span>v{d.version}</span>
                <span>·</span>
                <span>{new Date(d.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {studio.open && (
        <div className="fixed inset-0 z-[60]">
          <DocumentStudio
            open
            onClose={() => setStudio((s) => ({ ...s, open: false }))}
            type={studio.type}
            job={studio.job}
            profileId={studio.profileId}
            docId={studio.docId}
            onChange={refresh}
          />
        </div>
      )}
    </div>
  );
}
