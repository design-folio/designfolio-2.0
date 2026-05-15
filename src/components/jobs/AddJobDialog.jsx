import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, AlertCircle, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { _postJobsAddManual } from "@/network/jobs";

const STEPS = [
  "Fetching job from LinkedIn",
  "Scoring against your profile",
];

export function AddJobDialog({ open, profileId, onClose, onJobAdded }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const stepTimerRef = useRef(null);

  useEffect(() => {
    if (open) {
      setUrl("");
      setError(null);
      setLoading(false);
      setStep(0);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
    return () => clearTimeout(stepTimerRef.current);
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed || loading) return;
    setError(null);
    setLoading(true);
    setStep(0);

    stepTimerRef.current = setTimeout(() => setStep(1), 9000);

    try {
      const { data } = await _postJobsAddManual(trimmed, profileId);
      clearTimeout(stepTimerRef.current);
      onJobAdded(data.job);
      onClose();
    } catch (err) {
      clearTimeout(stepTimerRef.current);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to add job. Please check the URL and try again.";
      setError(msg);
      setLoading(false);
      setStep(0);
    }
  };

  const isValidUrl = (() => {
    const u = url.trim();
    if (!/linkedin\.com\/jobs\//.test(u)) return false;
    if (/\/jobs\/view\/\d+/.test(u)) return true;
    try {
      const id = new URL(u).searchParams.get("currentJobId");
      return Boolean(id && /^\d+$/.test(id));
    } catch {
      return false;
    }
  })();

  return (
    <Dialog open={open} onOpenChange={(v) => !loading && !v && onClose()}>
      <DialogContent
        aria-describedby={undefined}
        className="bg-white dark:bg-[#2A2520] border border-black/[0.08] dark:border-white/[0.08] p-0 gap-0 max-w-[420px] rounded-2xl overflow-hidden [&>button]:hidden"
        onInteractOutside={(e) => loading && e.preventDefault()}
        onEscapeKeyDown={(e) => loading && e.preventDefault()}
      >
        <AnimatePresence mode="wait" initial={false}>
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="px-6 py-8 flex flex-col gap-6"
            >
              <div className="flex flex-col gap-4">
                {STEPS.map((label, i) => {
                  const isDone = i < step;
                  const isActive = i === step;
                  return (
                    <motion.div
                      key={i}
                      className="flex items-center gap-3"
                      animate={{ opacity: i > step ? 0.3 : 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                        {isDone ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 20 }}
                            className="w-5 h-5 rounded-full bg-[#1A1A1A] dark:bg-white flex items-center justify-center"
                          >
                            <Check className="w-3 h-3 text-white dark:text-black" strokeWidth={2.5} />
                          </motion.div>
                        ) : isActive ? (
                          <div className="w-5 h-5 rounded-full border-2 border-black/15 dark:border-white/15 border-t-[#1A1A1A] dark:border-t-white animate-spin" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-black/10 dark:border-white/10" />
                        )}
                      </div>
                      <span
                        className={`text-[13px] font-medium transition-colors duration-300 ${
                          isActive
                            ? "text-[#1A1A1A] dark:text-[#F0EDE7]"
                            : isDone
                            ? "text-foreground/45"
                            : "text-foreground/25"
                        }`}
                      >
                        {label}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
              <p className="text-[12px] text-foreground/35 leading-relaxed">
                This usually takes 15–20 seconds
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <DialogHeader className="px-6 pt-6 pb-5 border-b border-black/[0.06] dark:border-white/[0.06]">
                <DialogTitle className="text-[#1A1A1A] dark:text-[#F0EDE7] text-[17px] font-semibold leading-tight m-0">
                  Add a job
                </DialogTitle>
                <p className="text-[13px] text-foreground/50 mt-1 leading-[1.5]">
                  Paste a LinkedIn URL — we'll fetch and score it for you
                </p>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-3">
                <div className="relative">
                  <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/30 pointer-events-none" />
                  <input
                    ref={inputRef}
                    type="url"
                    value={url}
                    onChange={(e) => { setUrl(e.target.value); setError(null); }}
                    placeholder="https://www.linkedin.com/jobs/view/…"
                    className="w-full h-10 pl-9 pr-3.5 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.02] text-[13px] text-foreground placeholder:text-black/30 dark:placeholder:text-white/30 outline-none focus:border-black/20 dark:focus:border-white/20 focus:bg-transparent transition-colors"
                  />
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl px-3.5 py-3">
                        <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-[12px] text-red-600 dark:text-red-400 leading-relaxed">{error}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={!isValidUrl}
                  className="w-full flex items-center justify-center h-10 rounded-full bg-[#1A1A1A] dark:bg-white text-white dark:text-black text-[14px] font-medium transition-opacity disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                >
                  Add to Shortlisted
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
