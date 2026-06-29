import { useState, useEffect, startTransition } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "motion/react";
import ResumeUploader from "./resumeUploader";
import AnalysisResult from "./analysisResult";
import { Download, RefreshCcw, Loader2 } from "lucide-react";
import ScannerCardStream from "./ui/scanner-card-stream";
import { exportToPdf } from "./PdfExporter";
import { setAiToolResult, getAiToolResult } from "@/lib/ai-tools-usage";
import axiosInstance from "@/network/axiosInstance";

const validationSchema = Yup.object().shape({
  resumeText: Yup.string()
    .required("Resume text is required")
    .min(50, "Resume text should be at least 50 characters"),
  jobDescription: Yup.string()
    .required("Job description is required")
    .min(50, "Job description should be at least 50 characters"),
});

const RESULT_STORAGE_KEY = "optimize-resume";

export default function CoverLetterGenerator({
  onViewChange,
  onToolUsed,
  onStartNewAnalysis,
  guestUsageLimitReached = false,
  skipRestore = false,
}) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysis, setAnalysis] = useState(null);
  const [uploadedResumeFile, setUploadedResumeFile] = useState(null);
  const [isStartingNew, setIsStartingNew] = useState(false);

  useEffect(() => {
    if (skipRestore) return;
    const stored = getAiToolResult(RESULT_STORAGE_KEY);
    if (stored && typeof stored === "object" && stored.matchScore != null) {
      startTransition(() => setAnalysis(stored));
      onViewChange?.(true);
    }
  }, [skipRestore, onViewChange]);

  useEffect(() => {
    if (!isAnalyzing) {
      startTransition(() => setAnalysisProgress(0));
      return;
    }
    const duration = 8000;
    const interval = 80;
    const steps = duration / interval;
    const increment = 95 / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= 95) {
        clearInterval(timer);
        setAnalysisProgress(95);
      } else {
        setAnalysisProgress(current);
      }
    }, interval);
    return () => clearInterval(timer);
  }, [isAnalyzing]);

  const handleResumeUpload = (text, setFieldValue, file = null) => {
    setFieldValue("resumeText", typeof text === "string" ? text.trim() : "");
    setUploadedResumeFile(file || null);
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    if (guestUsageLimitReached) {
      toast.error("You've already used this tool once. Sign up to analyze again.");
      return;
    }
    setIsAnalyzing(true);
    try {
      const { data } = await axiosInstance.post("/ai/tools/resume/analyze", {
        resumeText: values.resumeText,
        jobDescription: values.jobDescription,
      });

      setAnalysisProgress(100);
      setAnalysis(data.analysis);
      setAiToolResult(RESULT_STORAGE_KEY, data.analysis);
      onViewChange?.(true);
      onToolUsed?.();
      toast.success("Analysis complete");
    } catch (error) {
      console.error("Analysis error:", error);
      if (error.response?.data?.limitReached) {
        onToolUsed?.();
        return;
      }
      const errorMessage =
        error?.response?.data?.error ||
        error?.message ||
        "There was an error analyzing your resume.";
      toast.error(errorMessage);
    } finally {
      setIsAnalyzing(false);
      setSubmitting(false);
    }
  };

  const initialValues = {
    resumeText: "",
    jobDescription: "",
  };

  if (analysis) {
    return (
      <div className="w-full space-y-8">
        <div className="mx-auto flex max-w-5xl flex-wrap justify-between gap-4">
          <button
            type="button"
            disabled={isStartingNew}
            onClick={() => {
              if (isStartingNew) return;
              setIsStartingNew(true);
              setAnalysis(null);
              setUploadedResumeFile(null);
              onViewChange?.(false);
              onStartNewAnalysis?.();
              setIsStartingNew(false);
            }}
            className="border-foreground/20 text-foreground hover:bg-foreground/10 ml-auto flex items-center gap-2 rounded-full border-2 bg-white/50 px-4 py-2 text-sm font-medium backdrop-blur-sm transition-colors disabled:pointer-events-none disabled:opacity-70"
          >
            <RefreshCcw className="text-foreground/60 h-4 w-4" />
            {isStartingNew ? "Loading…" : "Start New Analysis"}
          </button>
          {/* <button
            onClick={() => exportToPdf("pdf-content")}
            className="rounded-full border-2 border-foreground/20 bg-white/50 backdrop-blur-sm px-4 py-2 text-sm font-medium text-foreground hover:bg-foreground/10 transition-colors flex items-center gap-2"
          >
            <Download className="h-4 w-4 text-foreground/60" />
            Download Report (PDF)
          </button> */}
        </div>
        <div id="pdf-content" className="space-y-8">
          <AnalysisResult analysis={analysis} />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, setFieldValue }) => (
          <>
            <AnimatePresence mode="wait">
              {isAnalyzing ? (
                <motion.div
                  key="analyzing"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center justify-center space-y-6 py-4"
                >
                  <ScannerCardStream isScanning={true} file={uploadedResumeFile} />
                  <div className="w-full max-w-xs space-y-3 text-center">
                    <div className="text-foreground flex items-center justify-center gap-2 font-medium">
                      <Loader2 className="h-4 w-4 animate-spin text-[#FF553E]" />
                      <span className="text-sm">AI is thinking...</span>
                    </div>
                    <div className="bg-foreground/5 h-1.5 w-full overflow-hidden rounded-full">
                      <motion.div
                        className="h-full bg-[#FF553E]"
                        initial={{ width: 0 }}
                        animate={{ width: `${analysisProgress}%` }}
                      />
                    </div>
                    <p className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                      Matching Job Requirements
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <Form id="EmailForm" className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-foreground ml-1 text-sm font-medium">
                        Upload Resume (PDF Only)<span className="ml-0.5 text-[#FF553E]">*</span>
                      </label>
                      <ResumeUploader
                        onUpload={(text, file) => handleResumeUpload(text, setFieldValue, file)}
                        disabled={guestUsageLimitReached}
                      />
                      <ErrorMessage
                        name="resumeText"
                        component="p"
                        className="ml-1 text-sm text-red-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-foreground ml-1 text-sm font-medium">
                        Paste the Job Description<span className="ml-0.5 text-[#FF553E]">*</span>
                      </label>
                      <div
                        className={`border-border hover:border-foreground/20 focus-within:border-foreground/30 overflow-hidden rounded-2xl border-2 bg-white transition-all duration-300 ease-out focus-within:shadow-[0_0_0_4px_hsl(var(--foreground)/0.12)] dark:bg-white ${errors.jobDescription && touched.jobDescription ? "border-red-500" : ""}`}
                      >
                        <Field
                          placeholder="Paste the job description here..."
                          name="jobDescription"
                          as="textarea"
                          className="text-foreground placeholder:text-muted-foreground/60 min-h-[100px] w-full resize-none border-0 bg-transparent px-4 py-3 text-base focus-visible:ring-0 focus-visible:ring-offset-0"
                          autoComplete="off"
                        />
                      </div>
                      <ErrorMessage
                        name="jobDescription"
                        component="p"
                        className="ml-1 text-sm text-red-500"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isAnalyzing || guestUsageLimitReached}
                      className="bg-foreground text-background hover:bg-foreground/90 h-11 w-full rounded-full border-0 px-6 text-base font-semibold transition-colors focus-visible:outline-none disabled:opacity-50"
                    >
                      {guestUsageLimitReached ? "Sign up to analyze again" : "Analyze Resume"}
                    </button>
                  </Form>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </Formik>
    </div>
  );
}
