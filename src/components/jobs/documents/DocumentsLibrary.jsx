import { useEffect, useState, useCallback, useRef, startTransition } from "react";
import {
  FileText,
  PenLine,
  Trash2,
  Loader2,
  FolderOpen,
  Download,
  Pencil,
  MoreHorizontal,
} from "lucide-react";
import { _getDocuments, _deleteDocument, _postExportDocument } from "@/network/documents";
import DocumentStudio from "./DocumentStudio";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
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
    badge:
      "bg-blue-50 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-400/20",
  },
  coverLetter: {
    label: "Cover letter",
    Icon: PenLine,
    color: "text-violet-500 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-400/10",
    badge:
      "bg-violet-50 dark:bg-violet-400/10 text-violet-600 dark:text-violet-400 border border-violet-200/60 dark:border-violet-400/20",
  },
};

function formatDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ─────────────────────────────────────────────
// Skeleton row
// ─────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div className="flex animate-pulse items-center gap-3 px-5 py-4">
      <div className="h-9 w-9 shrink-0 rounded-lg bg-black/[0.06] dark:bg-white/[0.06]" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-3.5 w-52 rounded bg-black/[0.07] dark:bg-white/[0.07]" />
        <div className="h-3 w-28 rounded bg-black/[0.05] dark:bg-white/[0.05]" />
      </div>
      <div className="h-3 w-20 shrink-0 rounded bg-black/[0.04] dark:bg-white/[0.04]" />
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
    <div className="group flex items-center gap-3 px-5 py-3.5 transition-[background-color] duration-150 ease-out hover:bg-black/[0.03] dark:hover:bg-white/[0.03]">
      {/* Doc type icon */}
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${meta.bg}`}>
        <meta.Icon className={`h-4 w-4 ${meta.color}`} aria-hidden="true" />
      </div>

      {/* Title + company */}
      <div className="min-w-0 flex-1">
        <p className="text-foreground/85 truncate text-[15px] leading-snug font-medium">
          {d.jobSnapshot?.title || "Untitled role"}
        </p>
        {d.jobSnapshot?.companyName && (
          <p className="text-foreground/40 mt-0.5 truncate text-[13px]">
            {d.jobSnapshot.companyName}
          </p>
        )}
      </div>

      {/* Type pill badge */}
      <span
        className={`hidden shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold sm:inline-flex ${meta.badge}`}
      >
        <meta.Icon className="h-3.5 w-3.5" aria-hidden="true" />
        {meta.label}
      </span>

      {/* Date */}
      <span className="text-foreground/30 hidden w-[96px] shrink-0 text-right text-[13px] tabular-nums md:block">
        {formatDate(d.lastExport?.generatedAt || d.createdAt)}
      </span>

      {/* Options popover */}
      <Popover open={menuOpen} onOpenChange={setMenuOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Document options"
            className="text-foreground/30 hover:text-foreground/70 focus-visible:ring-ring data-[state=open]:text-foreground/70 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-black/[0.06] focus-visible:ring-2 focus-visible:outline-none data-[state=open]:bg-black/[0.06] dark:hover:bg-white/[0.07] dark:data-[state=open]:bg-white/[0.07]"
          >
            {isBusy ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </PopoverTrigger>

        <PopoverContent
          side="bottom"
          align="end"
          sideOffset={6}
          collisionPadding={12}
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="dark:border-border dark:bg-card w-[180px] rounded-2xl border border-black/[0.08] bg-white p-1.5 shadow-xl"
        >
          {/* Edit */}
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              onEdit(d);
            }}
            className="text-foreground/70 hover:text-foreground hover:bg-foreground/[0.05] active:bg-foreground/[0.08] flex w-full items-center gap-2.5 rounded-xl px-3.5 py-3 text-left text-[14px] font-medium transition-colors"
          >
            <Pencil className="h-4 w-4 shrink-0" aria-hidden="true" />
            Edit
          </button>

          {/* Download */}
          <button
            type="button"
            disabled={isDownloading}
            onClick={() => {
              setMenuOpen(false);
              onDownload(d._id);
            }}
            className="text-foreground/70 hover:text-foreground hover:bg-foreground/[0.05] active:bg-foreground/[0.08] flex w-full items-center gap-2.5 rounded-xl px-3.5 py-3 text-left text-[14px] font-medium transition-colors disabled:pointer-events-none disabled:opacity-50"
          >
            {isDownloading ? (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
            ) : (
              <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
            )}
            Download PDF
          </button>

          <div className="mx-1.5 my-1 h-px bg-black/[0.06] dark:bg-white/[0.06]" />

          {/* Delete */}
          <button
            type="button"
            disabled={isDeleting}
            onClick={() => {
              setMenuOpen(false);
              onDeleteClick(d);
            }}
            className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-3 text-left text-[14px] font-medium text-red-500 transition-colors hover:bg-red-50 hover:text-red-600 active:bg-red-100 disabled:pointer-events-none disabled:opacity-50 dark:hover:bg-red-400/10 dark:active:bg-red-400/15"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
            ) : (
              <Trash2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            )}
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
    <div className="border-border overflow-hidden rounded-xl border">
      {/* Company header */}
      {jobSnapshot && (
        <div className="border-border flex items-center gap-3 border-b bg-black/[0.02] px-5 py-3 dark:bg-white/[0.015]">
          {jobSnapshot.companyLogo && (
            <div className="h-6 w-6 shrink-0 overflow-hidden rounded">
              <img
                src={jobSnapshot.companyLogo}
                alt=""
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          )}
          <span className="text-foreground/60 truncate text-[13px] font-semibold">
            {jobSnapshot.companyName || "Unknown company"}
          </span>
          {jobSnapshot.title && (
            <>
              <span className="text-foreground/25 shrink-0 text-[12px]">·</span>
              <span className="text-foreground/40 truncate text-[13px]">{jobSnapshot.title}</span>
            </>
          )}
          <span className="text-foreground/25 ml-auto shrink-0 text-[12px] tabular-nums">
            {docs.length} {docs.length === 1 ? "doc" : "docs"}
          </span>
        </div>
      )}

      {/* Rows */}
      {docs.map((d, i) => (
        <div key={d._id}>
          <DocRow d={d} {...rowProps} />
          {i < docs.length - 1 && (
            <div className="mx-4 h-px bg-black/[0.04] dark:bg-white/[0.04]" />
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
  const [studio, setStudio] = useState({
    open: false,
    type: "resume",
    docId: null,
    job: null,
    profileId: null,
  });
  const [isScrolled, setIsScrolled] = useState(false);
  const listRef = useRef(null);

  const refresh = useCallback(() => {
    setLoading(true);
    _getDocuments()
      .then((res) => setDocs(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    startTransition(() => refresh());
  }, [refresh]);

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
    } catch {
      /* interceptor toasts */
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = async (id) => {
    setDownloadingId(id);
    try {
      const res = await _postExportDocument(id, "pdf");
      if (res.data?.url) window.open(res.data.url, "_blank", "noopener,noreferrer");
    } catch {
      /* interceptor toasts */
    } finally {
      setDownloadingId(null);
    }
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
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col overflow-hidden px-4 pt-8">
        {/* ── Header ── */}
        <div className="mb-6 flex shrink-0 items-baseline justify-between gap-3">
          <h1 className="text-foreground text-[26px] font-semibold tracking-tight">Documents</h1>
          {!loading && docs.length > 0 && (
            <span className="text-foreground/30 shrink-0 text-[13px] tabular-nums">
              {docs.length} {docs.length === 1 ? "document" : "documents"}
            </span>
          )}
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div className="border-border shrink-0 overflow-hidden rounded-xl border">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i}>
                <SkeletonRow />
                {i < 4 && <div className="mx-4 h-px bg-black/[0.04] dark:bg-white/[0.04]" />}
              </div>
            ))}
          </div>
        ) : docs.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-black/[0.04] dark:bg-white/[0.04]">
              <FolderOpen className="text-foreground/25 h-7 w-7" aria-hidden="true" />
            </div>
            <p className="text-foreground/60 text-[16px] font-medium">No documents yet</p>
            <p className="text-foreground/35 mt-2 max-w-[300px] text-[14px] leading-relaxed">
              Open a job and use &quot;Tailor resume&quot; or &quot;Cover letter&quot; to create
              your first document.
            </p>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 gap-[31px] max-md:flex-col">
            {/* ── Nav sidebar ── */}
            <nav
              aria-label="Document type filter"
              className="flex w-[160px] shrink-0 flex-col gap-0.5 max-md:mb-5 max-md:w-auto max-md:flex-row max-md:flex-wrap max-md:gap-1.5"
            >
              {FILTERS.map(({ key, label }) => {
                const count = counts[key];
                const isOn = filter === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFilter(key)}
                    aria-pressed={isOn}
                    className={`flex w-full items-center justify-between gap-2 rounded-lg border-0 px-3 py-2.5 text-left text-[14px] transition-all duration-200 ease-out max-md:w-auto ${
                      isOn
                        ? "text-foreground cursor-default bg-[hsl(46,15%,91%)] font-semibold shadow-[inset_0_1px_3px_rgba(0,0,0,0.07)] dark:bg-white/[0.13] dark:shadow-[inset_0_1px_3px_rgba(0,0,0,0.2)]"
                        : "text-muted-foreground cursor-pointer font-medium hover:bg-black/[0.07] dark:hover:bg-white/10"
                    }`}
                  >
                    <span>{label}</span>
                    {count > 0 && (
                      <span
                        className={`text-[12px] font-semibold tabular-nums ${isOn ? "text-foreground/40" : "text-foreground/30"}`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* ── List area — only this scrolls ── */}
            <div className="relative min-w-0 flex-1 overflow-hidden">
              {/* Top fade — only visible once scrolled */}
              <div
                className={`from-background pointer-events-none absolute top-0 right-0 left-0 z-10 h-12 bg-gradient-to-b to-transparent transition-opacity duration-200 ${isScrolled ? "opacity-100" : "opacity-0"}`}
              />
              {/* Bottom fade */}
              <div className="from-background pointer-events-none absolute right-0 bottom-0 left-0 z-10 h-12 bg-gradient-to-t to-transparent" />
              <div
                ref={listRef}
                className="custom-thin-scrollbar bg-background h-full overflow-y-auto pr-1 pb-10"
                onScroll={(e) => setIsScrolled(e.currentTarget.scrollTop > 8)}
              >
                {groups.length === 0 ? (
                  <p className="text-foreground/35 py-16 text-center text-[14px]">
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
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete document?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this{" "}
              {deleteTarget?.type === "resume" ? "resume" : "cover letter"}
              {deleteTarget?.jobSnapshot?.title ? ` for ${deleteTarget.jobSnapshot.title}` : ""}
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm sm:p-6">
          <div className="flex h-[calc(100vh-80px)] max-h-[900px] w-full max-w-[820px] flex-col overflow-hidden rounded-2xl border border-black/[0.09] bg-[#FBFAF8] shadow-2xl dark:border-white/[0.09] dark:bg-[#0E0B07]">
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
