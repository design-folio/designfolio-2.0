import { useEffect, useState, useCallback, useRef } from "react";
import { FileText, PenLine, Trash2, Loader2, FolderOpen, Download, Pencil, MoreHorizontal } from "lucide-react";
import { _getDocuments, _deleteDocument, _postExportDocument } from "@/network/documents";
import DocumentStudio from "./DocumentStudio";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "resume", label: "Resumes" },
  { key: "coverLetter", label: "Cover letters" },
];

const TYPE_META = {
  resume: {
    label: "Resume",
    Icon: FileText,
    color: "text-blue-500 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-400/10",
    badge: "bg-blue-50 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-400/20",
  },
  coverLetter: {
    label: "Cover letter",
    Icon: PenLine,
    color: "text-violet-500 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-400/10",
    badge: "bg-violet-50 dark:bg-violet-400/10 text-violet-600 dark:text-violet-400 border border-violet-200/60 dark:border-violet-400/20",
  },
};

function formatDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

// ─────────────────────────────────────────────
// Skeleton row
// ─────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 animate-pulse">
      <div className="w-6 h-6 rounded-[6px] bg-black/[0.06] dark:bg-white/[0.06] flex-shrink-0" />
      <div className="flex-1 space-y-1.5 min-w-0">
        <div className="h-3 w-48 rounded bg-black/[0.07] dark:bg-white/[0.07]" />
        <div className="h-2.5 w-24 rounded bg-black/[0.05] dark:bg-white/[0.05]" />
      </div>
      <div className="h-2.5 w-16 rounded bg-black/[0.04] dark:bg-white/[0.04] flex-shrink-0" />
    </div>
  );
}

// ─────────────────────────────────────────────
// Document row
// ─────────────────────────────────────────────
function DocRow({ d, onEdit, onDeleteClick, onDownload, deletingId, downloadingId }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isDeleting = deletingId === d._id;
  const isDownloading = downloadingId === d._id;
  const isBusy = isDeleting || isDownloading;
  const meta = TYPE_META[d.type] ?? TYPE_META.resume;

  return (
    <div className="group flex items-center gap-3 py-[10px] px-4 transition-[background-color] duration-150 ease-out hover:bg-black/[0.03] dark:hover:bg-white/[0.03]">
      {/* Doc type icon */}
      <div className={`w-6 h-6 rounded-[6px] flex items-center justify-center flex-shrink-0 ${meta.bg}`}>
        <meta.Icon className={`w-3 h-3 ${meta.color}`} aria-hidden="true" />
      </div>

      {/* Title + company */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-foreground/85 leading-snug truncate">
          {d.jobSnapshot?.title || "Untitled role"}
        </p>
        {d.jobSnapshot?.companyName && (
          <p className="text-[11.5px] text-foreground/40 truncate mt-px">
            {d.jobSnapshot.companyName}
          </p>
        )}
      </div>

      {/* Type pill badge */}
      <span className={`hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${meta.badge}`}>
        <meta.Icon className="w-3 h-3" aria-hidden="true" />
        {meta.label}
      </span>

      {/* Date */}
      <span className="text-[11px] text-foreground/30 flex-shrink-0 tabular-nums w-[80px] text-right hidden md:block">
        {formatDate(d.lastExport?.generatedAt || d.createdAt)}
      </span>

      {/* Options popover */}
      <Popover open={menuOpen} onOpenChange={setMenuOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Document options"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-foreground/30 hover:text-foreground/70 hover:bg-black/[0.06] dark:hover:bg-white/[0.07] transition-colors flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:text-foreground/70 data-[state=open]:bg-black/[0.06] dark:data-[state=open]:bg-white/[0.07]"
          >
            {isBusy
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
              : <MoreHorizontal className="w-3.5 h-3.5" aria-hidden="true" />}
          </button>
        </PopoverTrigger>

        <PopoverContent
          side="bottom"
          align="end"
          sideOffset={6}
          collisionPadding={12}
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="w-[168px] p-1.5 rounded-2xl border border-black/[0.08] dark:border-border shadow-xl bg-white dark:bg-card"
        >
          {/* Edit */}
          <button
            type="button"
            onClick={() => { setMenuOpen(false); onEdit(d); }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium text-foreground/70 hover:text-foreground hover:bg-foreground/[0.05] active:bg-foreground/[0.08] transition-colors text-left"
          >
            <Pencil className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
            Edit
          </button>

          {/* Download */}
          <button
            type="button"
            disabled={isDownloading}
            onClick={() => { setMenuOpen(false); onDownload(d._id); }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium text-foreground/70 hover:text-foreground hover:bg-foreground/[0.05] active:bg-foreground/[0.08] transition-colors text-left disabled:opacity-50 disabled:pointer-events-none"
          >
            {isDownloading
              ? <Loader2 className="w-3.5 h-3.5 flex-shrink-0 animate-spin" aria-hidden="true" />
              : <Download className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />}
            Download PDF
          </button>

          <div className="h-px bg-black/[0.06] dark:bg-white/[0.06] mx-1.5 my-1" />

          {/* Delete */}
          <button
            type="button"
            disabled={isDeleting}
            onClick={() => { setMenuOpen(false); onDeleteClick(d); }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-400/10 active:bg-red-100 dark:active:bg-red-400/15 transition-colors text-left disabled:opacity-50 disabled:pointer-events-none"
          >
            {isDeleting
              ? <Loader2 className="w-3.5 h-3.5 flex-shrink-0 animate-spin" aria-hidden="true" />
              : <Trash2 className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />}
            Delete
          </button>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// ─────────────────────────────────────────────
// Job group — company header + doc rows
// ─────────────────────────────────────────────
function JobGroup({ jobSnapshot, docs, ...rowProps }) {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      {/* Company header */}
      {jobSnapshot && (
        <div className="flex items-center gap-2.5 px-4 py-2.5 bg-black/[0.02] dark:bg-white/[0.015] border-b border-border">
          {jobSnapshot.companyLogo && (
            <div className="w-5 h-5 rounded overflow-hidden flex-shrink-0">
              <img
                src={jobSnapshot.companyLogo}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            </div>
          )}
          <span className="text-[12px] font-semibold text-foreground/60 truncate">
            {jobSnapshot.companyName || "Unknown company"}
          </span>
          {jobSnapshot.title && (
            <>
              <span className="text-[10px] text-foreground/25 flex-shrink-0">·</span>
              <span className="text-[12px] text-foreground/40 truncate">{jobSnapshot.title}</span>
            </>
          )}
          <span className="ml-auto text-[11px] text-foreground/25 flex-shrink-0 tabular-nums">
            {docs.length} {docs.length === 1 ? "doc" : "docs"}
          </span>
        </div>
      )}

      {/* Rows */}
      {docs.map((d, i) => (
        <div key={d._id}>
          <DocRow d={d} {...rowProps} />
          {i < docs.length - 1 && (
            <div className="h-px bg-black/[0.04] dark:bg-white/[0.04] mx-4" />
          )}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function groupDocsByJob(docList) {
  return Object.values(
    docList.reduce((acc, d) => {
      const key = d.jobId ?? `__none__${d._id}`;
      if (!acc[key]) acc[key] = { jobSnapshot: d.jobSnapshot, jobId: d.jobId, docs: [] };
      acc[key].docs.push(d);
      return acc;
    }, {})
  );
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────
export default function DocumentsLibrary() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [studio, setStudio] = useState({ open: false, type: "resume", docId: null, job: null, profileId: null });
  const [isScrolled, setIsScrolled] = useState(false);
  const listRef = useRef(null);

  const refresh = useCallback(() => {
    setLoading(true);
    _getDocuments()
      .then((res) => setDocs(res.data || []))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const openStudio = (d) =>
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

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget._id;
    setDeleteTarget(null);
    setDeletingId(id);
    try {
      await _deleteDocument(id);
      setDocs((p) => p.filter((d) => d._id !== id));
    } catch { /* interceptor toasts */ }
    finally { setDeletingId(null); }
  };

  const handleDownload = async (id) => {
    setDownloadingId(id);
    try {
      const res = await _postExportDocument(id, "pdf");
      if (res.data?.url) window.open(res.data.url, "_blank", "noopener,noreferrer");
    } catch { /* interceptor toasts */ }
    finally { setDownloadingId(null); }
  };

  const counts = {
    all: docs.length,
    resume: docs.filter((d) => d.type === "resume").length,
    coverLetter: docs.filter((d) => d.type === "coverLetter").length,
  };

  const displayDocs = filter === "all" ? docs : docs.filter((d) => d.type === filter);
  const groups = groupDocsByJob(displayDocs);

  const sharedRowProps = {
    onEdit: openStudio,
    onDeleteClick: setDeleteTarget,
    onDownload: handleDownload,
    deletingId,
    downloadingId,
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <div className="flex flex-col flex-1 min-h-0 max-w-4xl mx-auto w-full px-4 pt-8 overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-baseline justify-between gap-3 mb-[22px] flex-shrink-0">
          <h1 className="text-[20px] font-semibold text-foreground tracking-tight">Documents</h1>
          {!loading && docs.length > 0 && (
            <span className="text-[12px] text-foreground/30 tabular-nums flex-shrink-0">
              {docs.length} {docs.length === 1 ? "document" : "documents"}
            </span>
          )}
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div className="rounded-xl border border-border overflow-hidden flex-shrink-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i}>
                <SkeletonRow />
                {i < 4 && <div className="h-px bg-black/[0.04] dark:bg-white/[0.04] mx-4" />}
              </div>
            ))}
          </div>
        ) : docs.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center">
            <div className="w-11 h-11 rounded-xl bg-black/[0.04] dark:bg-white/[0.04] flex items-center justify-center mb-4">
              <FolderOpen className="w-5 h-5 text-foreground/25" aria-hidden="true" />
            </div>
            <p className="text-[14px] font-medium text-foreground/60">No documents yet</p>
            <p className="text-[12.5px] text-foreground/35 mt-1.5 max-w-[280px] leading-snug">
              Open a job and use &quot;Tailor resume&quot; or &quot;Cover letter&quot; to create your first document.
            </p>
          </div>
        ) : (
          <div className="flex gap-[31px] flex-1 min-h-0 max-md:flex-col">

            {/* ── Nav sidebar ── */}
            <nav aria-label="Document type filter" className="w-[148px] flex-shrink-0 flex flex-col gap-0.5 max-md:w-auto max-md:flex-row max-md:flex-wrap max-md:gap-1 max-md:mb-[18px]">
              {FILTERS.map(({ key, label }) => {
                const count = counts[key];
                const isOn = filter === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFilter(key)}
                    aria-pressed={isOn}
                    className={`flex items-center justify-between gap-2 py-2 px-[10px] rounded-lg text-[13px] w-full text-left border-0 transition-all duration-200 ease-out max-md:w-auto ${isOn
                      ? "bg-[hsl(46,15%,91%)] text-foreground font-semibold shadow-[inset_0_1px_3px_rgba(0,0,0,0.07)] cursor-default dark:bg-white/[0.13] dark:shadow-[inset_0_1px_3px_rgba(0,0,0,0.2)]"
                      : "text-muted-foreground font-medium hover:bg-black/[0.07] dark:hover:bg-white/10 cursor-pointer"
                      }`}
                  >
                    <span>{label}</span>
                    {count > 0 && (
                      <span className={`text-[11px] font-semibold tabular-nums ${isOn ? "text-foreground/40" : "text-foreground/30"}`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* ── List area — only this scrolls ── */}
            <div className="relative flex-1 min-w-0 overflow-hidden">
              {/* Top fade — only visible once scrolled */}
              <div className={`pointer-events-none absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-background to-transparent z-10 transition-opacity duration-200 ${isScrolled ? "opacity-100" : "opacity-0"}`} />
              {/* Bottom fade */}
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent z-10" />
              <div
                ref={listRef}
                className="h-full overflow-y-auto custom-thin-scrollbar pb-10 pr-1 bg-background"
                onScroll={(e) => setIsScrolled(e.currentTarget.scrollTop > 8)}
              >
                {groups.length === 0 ? (
                  <p className="text-center text-[13px] text-foreground/35 py-16">
                    No {filter === "resume" ? "resumes" : "cover letters"} yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {groups.map((group) => (
                      <JobGroup
                        key={group.jobId ?? group.docs[0]?._id}
                        jobSnapshot={group.jobSnapshot}
                        docs={group.docs}
                        {...sharedRowProps}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* ── Delete confirm dialog ── */}
      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete document?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this{" "}
              {deleteTarget?.type === "resume" ? "resume" : "cover letter"}
              {deleteTarget?.jobSnapshot?.title
                ? ` for ${deleteTarget.jobSnapshot.title}`
                : ""}
              {deleteTarget?.jobSnapshot?.companyName
                ? ` at ${deleteTarget.jobSnapshot.companyName}`
                : ""}
              . This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 border-0"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Document Studio — centered modal overlay ── */}
      {studio.open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-6">
          <div className="w-full max-w-[820px] h-[calc(100vh-80px)] max-h-[900px] bg-[#FBFAF8] dark:bg-[#0E0B07] rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-black/[0.09] dark:border-white/[0.09]">
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
        </div>
      )}
    </div>
  );
}
