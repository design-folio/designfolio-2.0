import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, AlertCircle } from "lucide-react";
import { _postJobsAddManual, _getJobsHistory } from "@/network/jobs";

export function AddJobDialog({ open, profileId, onClose, onJobAdded }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setUrl("");
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed || loading) return;
    setError(null);
    setLoading(true);

    try {
      // Snapshot saved job IDs before adding
      const before = await _getJobsHistory();
      const savedIdsBefore = new Set(
        (before.data?.columns?.saved || []).map(String)
      );

      // If this LinkedIn job is already in Shortlisted, surface it immediately
      const linkedinJobId = trimmed.match(/\/jobs\/view\/(\d+)/)?.[1];
      if (linkedinJobId) {
        const alreadySaved = (before.data?.jobs || []).find(
          (j) => savedIdsBefore.has(j.id) && j.applyUrl?.includes(linkedinJobId)
        );
        if (alreadySaved) {
          onJobAdded(alreadySaved);
          onClose();
          return;
        }
      }

      await _postJobsAddManual(trimmed, profileId);

      // Poll getHistory until a new job appears in pipeline.saved (up to 30s)
      let newJob = null;
      for (let attempt = 0; attempt < 15; attempt++) {
        await new Promise((r) => setTimeout(r, 3000));
        const after = await _getJobsHistory();
        const afterJobs = after.data?.jobs || [];
        const afterSaved = (after.data?.columns?.saved || []).map(String);
        const newId = afterSaved.find((id) => !savedIdsBefore.has(id));
        if (newId) {
          newJob = afterJobs.find((j) => j.id === newId) ?? null;
          break;
        }
      }

      if (!newJob) {
        setError("Job added but took too long to appear. Refresh the page to see it in Shortlisted.");
        return;
      }

      onJobAdded(newJob);
      onClose();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to add job. Please check the URL and try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const isValidUrl = /linkedin\.com\/jobs\/view\/\d+/.test(url.trim());

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] max-w-[calc(100vw-2rem)]"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="bg-white dark:bg-card border border-black/[0.08] dark:border-border rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-black/[0.06] dark:border-border">
                <div>
                  <p className="text-[15px] font-semibold text-foreground">Add a job</p>
                  <p className="text-[12px] text-muted-foreground/60 mt-0.5">
                    Paste a LinkedIn job URL — we'll score it against your profile
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-foreground/40 hover:text-foreground hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="px-5 py-4 flex flex-col gap-3">
                <div>
                  <label className="text-[11px] font-medium text-foreground/50 mb-1.5 block">
                    LinkedIn job URL
                  </label>
                  <input
                    ref={inputRef}
                    type="url"
                    value={url}
                    onChange={(e) => { setUrl(e.target.value); setError(null); }}
                    placeholder="https://www.linkedin.com/jobs/view/1234567890"
                    disabled={loading}
                    className="w-full bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-border rounded-xl px-3.5 py-2.5 text-[13px] text-foreground placeholder:text-foreground/30 outline-none focus:border-foreground/25 transition-colors disabled:opacity-50"
                  />
                  <p className="text-[11px] text-foreground/35 mt-1.5 leading-relaxed">
                    Open any LinkedIn job listing and copy the URL from your browser.
                  </p>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-xl px-3.5 py-3"
                    >
                      <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-px" />
                      <p className="text-[12px] text-red-600 dark:text-red-400 leading-relaxed">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={!isValidUrl || loading}
                  className="w-full flex items-center justify-center gap-2 h-10 rounded-xl bg-foreground text-background text-[13px] font-semibold transition-opacity disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="flex gap-[3px]">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-1 h-1 rounded-full bg-current"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }}
                          />
                        ))}
                      </div>
                      Adding to Shortlisted…
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      Add to Shortlisted
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
