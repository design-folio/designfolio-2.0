import { useState, useEffect, useRef, startTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MapPin,
  Briefcase,
  Monitor,
  Clock,
  DollarSign,
  Calendar,
  Check,
  BookmarkPlus,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CompanyLogo } from "@/components/jobs/CompanyLogo";
import { _getPublicJob, _postJobsAddFromShare, _getJobsCheckSaved } from "@/network/jobs";
import { toRelativeTime, formatSalary } from "@/lib/jobsUtils";
import { Spinner } from "../ui/spinner";

const EASE = [0.22, 1, 0.36, 1];

function Pill({ icon: Icon, children }) {
  return (
    <span className="font-jetbrains inline-flex items-center gap-1.5 rounded-md bg-[#EAE5DF] px-2.5 py-1 text-[10px] font-semibold tracking-wide whitespace-nowrap text-[#3D3630] uppercase dark:bg-[#1F1C1C] dark:text-white/55">
      {Icon && <Icon className="h-3 w-3 shrink-0" />}
      {children}
    </span>
  );
}

function Shimmer({ className }) {
  return (
    <div className={`animate-pulse rounded-md bg-black/[0.06] dark:bg-white/[0.06] ${className}`} />
  );
}

function JobSkeleton() {
  return (
    <div className="flex flex-col gap-4 px-6 py-6">
      <div className="flex items-center gap-3.5">
        <Shimmer className="h-11 w-11 shrink-0 rounded-xl" />
        <div className="flex flex-1 flex-col gap-2">
          <Shimmer className="h-2.5 w-20" />
          <Shimmer className="h-4 w-48" />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Shimmer className="h-6 w-28 rounded-md" />
        <Shimmer className="h-6 w-20 rounded-md" />
        <Shimmer className="h-6 w-24 rounded-md" />
      </div>
    </div>
  );
}

export function SharedJobPromptDialog({ jobId, onClose, onSaved }) {
  const [job, setJob] = useState(null);
  const [fetchError, setFetchError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [alreadySaved, setAlreadySaved] = useState(false);
  // Local close flag — lets the dialog dismiss itself without relying on router.replace
  const [forceClosed, setForceClosed] = useState(false);
  const savedJobRef = useRef(null);
  const resolvedRef = useRef(false);

  // Reset local state whenever a new jobId opens the dialog
  useEffect(() => {
    if (jobId) {
      startTransition(() => setForceClosed(false));
      resolvedRef.current = false;
      savedJobRef.current = null;
    }
  }, [jobId]);

  useEffect(() => {
    if (!jobId) return;
    startTransition(() => {
      setJob(null);
      setFetchError(false);
      setSaved(false);
      setAlreadySaved(false);
    });
    Promise.all([
      _getPublicJob(jobId),
      _getJobsCheckSaved(jobId).catch(() => ({ data: { saved: false } })),
    ])
      .then(([jobRes, checkRes]) => {
        setJob(jobRes.data.job);
        setAlreadySaved(checkRes.data?.saved ?? false);
      })
      .catch(() => setFetchError(true));
  }, [jobId]);

  const resolve = (jobData) => {
    if (resolvedRef.current) return;
    resolvedRef.current = true;
    onSaved?.(jobData);
    setForceClosed(true);
    onClose();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await _postJobsAddFromShare(jobId);
      const jobData = data?.job ?? null;
      savedJobRef.current = jobData;
      setSaved(true);
      setTimeout(() => resolve(jobData), 700);
    } catch {
      setSaving(false);
    }
  };

  const salaryLabel = job ? formatSalary(job.salary) : null;
  const postedLabel = job?.postedAt ? toRelativeTime(job.postedAt) : null;

  return (
    <Dialog open={!!jobId && !forceClosed} onOpenChange={(open) => !open && !saving && onClose()}>
      <DialogContent
        aria-describedby={undefined}
        overlayClassName="fixed inset-0 z-[300] bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        className="z-[301] w-[calc(100vw-32px)] max-w-[400px] gap-0 overflow-hidden rounded-2xl border border-black/[0.08] bg-white p-0 dark:border-white/[0.08] dark:bg-[#2A2520] [&>button]:hidden"
        onInteractOutside={(e) => saving && e.preventDefault()}
        onEscapeKeyDown={(e) => saving && e.preventDefault()}
      >
        <AnimatePresence mode="wait" initial={false}>
          {saved ? (
            <motion.div
              key="saved"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: EASE }}
              className="flex cursor-pointer flex-col items-center gap-3 px-6 py-10"
              onClick={() => resolve(savedJobRef.current)}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 360, damping: 22, delay: 0.05 }}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1A1A1A] dark:bg-white"
              >
                <Check className="h-5 w-5 text-white dark:text-black" strokeWidth={2.5} />
              </motion.div>
              <p className="text-foreground/70 text-[14px] font-medium">Added to your board</p>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: EASE }}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-black/[0.06] px-6 pt-5 pb-4 dark:border-white/[0.06]">
                <span className="text-foreground/35 text-[11px] font-semibold tracking-widest uppercase">
                  Shared with you
                </span>
                <button
                  onClick={() => !saving && onClose()}
                  className="text-foreground/30 hover:text-foreground/60 flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-black/[0.05] dark:hover:bg-white/[0.06]"
                  aria-label="Dismiss"
                >
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                    <path
                      d="M1 1l9 9M10 1L1 10"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>

              {/* Job info */}
              <AnimatePresence mode="wait" initial={false}>
                {!job && !fetchError ? (
                  <motion.div
                    key="skeleton"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <JobSkeleton />
                  </motion.div>
                ) : fetchError ? (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.15 }}
                    className="px-6 py-6"
                  >
                    <p className="text-foreground/45 text-center text-[13px]">
                      Could not load job details.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="job"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, ease: EASE }}
                    className="px-6 py-5"
                  >
                    {/* Logo + title */}
                    <div className="mb-4 flex items-center gap-3.5">
                      <CompanyLogo logoUrl={job.logoUrl} company={job.company} size={44} />
                      <div className="min-w-0">
                        <div className="text-foreground/35 mb-0.5 truncate text-[10px] font-semibold tracking-widest uppercase">
                          {job.company}
                        </div>
                        <div className="text-foreground line-clamp-2 text-[16px] leading-snug font-semibold">
                          {job.role}
                        </div>
                      </div>
                    </div>

                    {/* Pills */}
                    <div className="flex flex-wrap gap-1.5">
                      {salaryLabel && <Pill icon={DollarSign}>{salaryLabel}</Pill>}
                      {job.location && <Pill icon={MapPin}>{job.location}</Pill>}
                      {job.type && <Pill icon={Briefcase}>{job.type}</Pill>}
                      {job.workMode && <Pill icon={Monitor}>{job.workMode}</Pill>}
                      {job.yearsExp && <Pill icon={Clock}>{job.yearsExp}</Pill>}
                      {postedLabel && <Pill icon={Calendar}>{postedLabel}</Pill>}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Footer */}
              <div className="flex flex-col gap-2.5 border-t border-black/[0.05] px-6 pt-1 pb-6 dark:border-white/[0.05]">
                <p className="text-foreground/45 pt-3 pb-0.5 text-[12px] leading-relaxed">
                  {alreadySaved
                    ? "This job is already on your board."
                    : "Save this job to track your application and see how well you match."}
                </p>

                {alreadySaved ? (
                  <Button
                    variant="default"
                    className="w-full transition-all [transition-duration:160ms] active:scale-[0.97]"
                    onClick={() => {
                      onSaved?.(null);
                      setForceClosed(true);
                      onClose();
                    }}
                  >
                    <Check className="h-4 w-4" />
                    View on Board
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    className="w-full transition-all [transition-duration:160ms] active:scale-[0.97]"
                    onClick={handleSave}
                    disabled={saving || !job}
                  >
                    {saving ? (
                      <Spinner data-icon="inline-start" className="h-4 w-4" />
                    ) : (
                      <BookmarkPlus className="h-4 w-4" />
                    )}
                    {saving ? "Saving…" : "Save Job to Board"}
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
