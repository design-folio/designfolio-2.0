import { useState, useRef, useEffect, startTransition } from "react";
import { linkedinValidation, manualValidation } from "@/lib/validationSchemas";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { motion, AnimatePresence } from "motion/react";
import { Link2, PenLine, AlertCircle, Check, Plus, Sparkles, ChevronDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { _postJobsAddManual, _postJobsAddManualEntry } from "@/network/jobs";
import { LocationAutocomplete } from "./LocationAutocomplete";

const STEPS_LINKEDIN = ["Fetching job from LinkedIn", "Scoring against your profile"];

const STEPS_MANUAL = ["Saving your job", "Scoring against your profile"];

const labelCls = "text-[13px] font-medium text-foreground ml-1";

function TabToggle({ mode, onChange }) {
  return (
    <div className="flex items-center gap-1 rounded-xl bg-black/[0.04] p-1 dark:bg-white/[0.04]">
      {[
        { id: "linkedin", icon: Link2, label: "LinkedIn URL" },
        { id: "manual", icon: PenLine, label: "Enter manually" },
      ].map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={`flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg text-[12px] font-medium transition-all ${
            mode === id
              ? "text-foreground bg-white shadow-sm dark:bg-white/10"
              : "text-foreground/40 hover:text-foreground/60"
          }`}
        >
          <Icon className="h-3 w-3" />
          {label}
        </button>
      ))}
    </div>
  );
}

export function AddJobDialog({ open, profileId, onClose, onJobAdded }) {
  const [mode, setMode] = useState("linkedin");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState(null);
  const urlInputRef = useRef(null);
  const titleInputRef = useRef(null);
  const stepTimerRef = useRef(null);

  useEffect(() => {
    if (open) {
      startTransition(() => {
        setError(null);
        setLoading(false);
        setStep(0);
      });
      setTimeout(() => {
        if (mode === "linkedin") urlInputRef.current?.focus();
        else titleInputRef.current?.focus();
      }, 80);
    }
    return () => clearTimeout(stepTimerRef.current);
  }, [open, mode]);

  useEffect(() => {
    startTransition(() => setError(null));
  }, [mode]);

  const STEPS = mode === "linkedin" ? STEPS_LINKEDIN : STEPS_MANUAL;

  const handleLinkedinSubmit = async ({ url }, { resetForm }) => {
    setError(null);
    setLoading(true);
    setStep(0);
    stepTimerRef.current = setTimeout(() => setStep(1), 9000);
    try {
      const { data } = await _postJobsAddManual(url.trim(), profileId);
      clearTimeout(stepTimerRef.current);
      onJobAdded(data.job);
      onClose();
      resetForm();
    } catch (err) {
      clearTimeout(stepTimerRef.current);
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to add job. Please check the URL and try again."
      );
      setLoading(false);
      setStep(0);
    }
  };

  const handleManualSubmit = async (values, { resetForm }) => {
    setError(null);
    setLoading(true);
    setStep(0);
    stepTimerRef.current = setTimeout(() => setStep(1), 3000);
    try {
      const { data } = await _postJobsAddManualEntry(
        {
          title: values.title.trim(),
          company: values.company.trim(),
          applyUrl: /^https?:\/\//i.test(values.applyUrl.trim())
            ? values.applyUrl.trim()
            : `https://${values.applyUrl.trim()}`,
          description: values.description.trim(),
          location: values.location.trim(),
          ...(values.workMode ? { workMode: values.workMode } : {}),
        },
        profileId
      );
      clearTimeout(stepTimerRef.current);
      onJobAdded(data.job);
      onClose();
      resetForm();
    } catch (err) {
      clearTimeout(stepTimerRef.current);
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to add job. Please try again."
      );
      setLoading(false);
      setStep(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !loading && !v && onClose()}>
      <DialogContent
        aria-describedby={undefined}
        overlayClassName="fixed inset-0 z-[300] bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        className="z-[301] max-w-[440px] gap-0 overflow-hidden rounded-2xl border border-black/[0.08] bg-white p-0 dark:border-white/[0.08] dark:bg-[#2A2520] [&>button]:hidden"
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
              className="flex flex-col gap-6 px-6 py-8"
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
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                        {isDone ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 20 }}
                            className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1A1A1A] dark:bg-white"
                          >
                            <Check
                              className="h-3 w-3 text-white dark:text-black"
                              strokeWidth={2.5}
                            />
                          </motion.div>
                        ) : isActive ? (
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-black/15 border-t-[#1A1A1A] dark:border-white/15 dark:border-t-white" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-black/10 dark:border-white/10" />
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
              <p className="text-foreground/35 text-[12px] leading-relaxed">
                {mode === "linkedin"
                  ? "This usually takes 15–20 seconds"
                  : "This usually takes 10–15 seconds"}
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
              <DialogHeader className="border-b border-black/[0.06] px-6 pt-6 pb-4 dark:border-white/[0.06]">
                <DialogTitle className="m-0 mb-4 text-[17px] leading-tight font-semibold text-[#1A1A1A] dark:text-[#F0EDE7]">
                  Add a job
                </DialogTitle>
                <TabToggle mode={mode} onChange={setMode} />
              </DialogHeader>

              <div className="flex flex-col gap-3 px-6 py-5">
                <AnimatePresence mode="wait" initial={false}>
                  {mode === "linkedin" ? (
                    <motion.div
                      key="linkedin-form"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      transition={{ duration: 0.18 }}
                    >
                      <Formik
                        initialValues={{ url: "" }}
                        validationSchema={linkedinValidation}
                        validateOnBlur
                        validateOnChange={false}
                        onSubmit={handleLinkedinSubmit}
                      >
                        {({ errors, touched }) => (
                          <Form className="flex flex-col gap-3">
                            <p className="text-foreground/45 text-[12px] leading-[1.5]">
                              Paste a LinkedIn job URL — we&apos;ll fetch and score it against your
                              profile.
                            </p>
                            <div className="flex flex-col gap-1">
                              <Field name="url">
                                {({ field, form }) => (
                                  <Input
                                    {...field}
                                    ref={urlInputRef}
                                    type="url"
                                    placeholder="https://linkedin.com/jobs/view/…"
                                    className={cn(
                                      errors.url &&
                                        touched.url &&
                                        "border-destructive focus-visible:ring-destructive"
                                    )}
                                    onChange={(e) => {
                                      form.setFieldValue("url", e.target.value);
                                      setError(null);
                                    }}
                                  />
                                )}
                              </Field>
                              <ErrorMessage
                                name="url"
                                component="p"
                                className="text-[11px] text-red-500 dark:text-red-400"
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
                                  <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 dark:border-red-800/30 dark:bg-red-900/20">
                                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
                                    <p className="text-[12px] leading-relaxed text-red-600 dark:text-red-400">
                                      {error}
                                    </p>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            <Button type="submit" size="lg" className="mt-1 w-full rounded-full">
                              <Sparkles className="h-4 w-4" />
                              Fetch & score job
                            </Button>
                          </Form>
                        )}
                      </Formik>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="manual-form"
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.18 }}
                    >
                      <Formik
                        initialValues={{
                          title: "",
                          company: "",
                          applyUrl: "",
                          description: "",
                          location: "",
                          workMode: "",
                        }}
                        validationSchema={manualValidation}
                        validateOnBlur
                        validateOnChange={false}
                        onSubmit={handleManualSubmit}
                      >
                        {({ errors, touched }) => (
                          <Form className="flex flex-col gap-3">
                            <div>
                              <Label className={labelCls} htmlFor="title">
                                Role title <span className="text-destructive">*</span>
                              </Label>
                              <Field name="title">
                                {({ field }) => (
                                  <Input
                                    {...field}
                                    id="title"
                                    ref={titleInputRef}
                                    placeholder="e.g. Senior Product Designer"
                                    className={cn(
                                      errors.title &&
                                        touched.title &&
                                        "border-destructive focus-visible:ring-destructive"
                                    )}
                                  />
                                )}
                              </Field>
                              <ErrorMessage
                                name="title"
                                component="p"
                                className="mt-1 text-[11px] text-red-500 dark:text-red-400"
                              />
                            </div>

                            <div>
                              <Label className={labelCls} htmlFor="company">
                                Company <span className="text-destructive">*</span>
                              </Label>
                              <Field name="company">
                                {({ field }) => (
                                  <Input
                                    {...field}
                                    id="company"
                                    placeholder="e.g. Figma"
                                    className={cn(
                                      errors.company &&
                                        touched.company &&
                                        "border-destructive focus-visible:ring-destructive"
                                    )}
                                  />
                                )}
                              </Field>
                              <ErrorMessage
                                name="company"
                                component="p"
                                className="mt-1 text-[11px] text-red-500 dark:text-red-400"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label className={labelCls} htmlFor="location">
                                  Location
                                </Label>
                                <Field name="location">
                                  {({ field, form }) => (
                                    <LocationAutocomplete
                                      value={field.value}
                                      onChange={(val) => form.setFieldValue("location", val)}
                                      onSelect={(label) => form.setFieldValue("location", label)}
                                      placeholder="e.g. London, UK"
                                      size="sm"
                                    />
                                  )}
                                </Field>
                                <ErrorMessage
                                  name="location"
                                  component="p"
                                  className="mt-1 text-[11px] text-red-500 dark:text-red-400"
                                />
                              </div>
                              <div>
                                <Label className={labelCls} htmlFor="workMode">
                                  Work mode
                                </Label>
                                <div className="relative">
                                  <Field name="workMode">
                                    {({ field }) => (
                                      <select
                                        {...field}
                                        id="workMode"
                                        className={cn(
                                          "text-foreground flex h-10 w-full items-center rounded-xl border border-transparent bg-black/[0.03] px-3.5 text-sm dark:bg-white/[0.03]",
                                          "appearance-none pr-8 transition-colors focus-visible:ring-2 focus-visible:ring-black/10 focus-visible:outline-none dark:focus-visible:ring-white/10"
                                        )}
                                      >
                                        <option value="">Select…</option>
                                        <option value="remote">Remote</option>
                                        <option value="hybrid">Hybrid</option>
                                        <option value="onsite">On-site</option>
                                      </select>
                                    )}
                                  </Field>
                                  <ChevronDown className="text-foreground/30 pointer-events-none absolute top-1/2 right-3 h-3.5 w-3.5 -translate-y-1/2" />
                                </div>
                              </div>
                            </div>

                            <div>
                              <Label className={labelCls} htmlFor="applyUrl">
                                Apply URL <span className="text-destructive">*</span>
                              </Label>
                              <Field name="applyUrl">
                                {({ field, form }) => (
                                  <Input
                                    {...field}
                                    id="applyUrl"
                                    type="url"
                                    placeholder="https://company.com/jobs/…"
                                    className={cn(
                                      errors.applyUrl &&
                                        touched.applyUrl &&
                                        "border-destructive focus-visible:ring-destructive"
                                    )}
                                    onChange={(e) => form.setFieldValue("applyUrl", e.target.value)}
                                  />
                                )}
                              </Field>
                              <ErrorMessage
                                name="applyUrl"
                                component="p"
                                className="mt-1 text-[11px] text-red-500 dark:text-red-400"
                              />
                            </div>

                            <div>
                              <Label className={labelCls} htmlFor="description">
                                Job description <span className="text-destructive">*</span>
                              </Label>
                              <Field name="description">
                                {({ field, form }) => (
                                  <Textarea
                                    {...field}
                                    id="description"
                                    rows={4}
                                    placeholder="Paste the job description here for AI scoring and interview prep…"
                                    className={cn(
                                      "resize-none",
                                      form.errors.description &&
                                        form.touched.description &&
                                        "border-destructive focus-visible:ring-destructive"
                                    )}
                                  />
                                )}
                              </Field>
                              <ErrorMessage
                                name="description"
                                component="p"
                                className="mt-1 text-[11px] text-red-500 dark:text-red-400"
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
                                  <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 dark:border-red-800/30 dark:bg-red-900/20">
                                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
                                    <p className="text-[12px] leading-relaxed text-red-600 dark:text-red-400">
                                      {error}
                                    </p>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            <Button type="submit" size="lg" className="mt-1 w-full rounded-full">
                              <Plus className="h-4 w-4" />
                              Add to board
                            </Button>
                          </Form>
                        )}
                      </Formik>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
