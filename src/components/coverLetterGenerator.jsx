import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import ResumeUploader from "./resumeUploader";
import AnalysisResult from "./analysisResult";
import { Download, RefreshCcw } from "lucide-react";
import { exportToPdf } from "./PdfExporter";

const validationSchema = Yup.object().shape({
  resumeText: Yup.string()
    .required("Resume text is required")
    .min(50, "Resume text should be at least 50 characters"),
  jobDescription: Yup.string()
    .required("Job description is required")
    .min(50, "Job description should be at least 50 characters"),
});

export default function CoverLetterGenerator({ onViewChange }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const handleResumeUpload = async (text, setFieldValue) => {
    setFieldValue("resumeText", text);
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: values.resumeText,
          jobDescription: values.jobDescription,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to analyze resume");
      }

      setAnalysis(data.analysis);
      onViewChange?.(true);
      toast.success("Analysis complete");
    } catch (error) {
      console.error("Analysis error:", error);
      const errorMessage =
        error?.message || "There was an error analyzing your resume.";
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
        <div className="flex justify-between flex-wrap gap-4">
          <button
            onClick={() => {
              setAnalysis(null);
              onViewChange?.(false);
            }}
            className="rounded-full border-2 border-foreground/20 bg-white/50 backdrop-blur-sm px-4 py-2 text-sm font-medium text-foreground hover:bg-foreground/10 transition-colors flex items-center gap-2"
          >
            <RefreshCcw className="h-4 w-4 text-foreground/60" />
            Start New Analysis
          </button>
          <button
            onClick={() => exportToPdf("pdf-content")}
            className="rounded-full border-2 border-foreground/20 bg-white/50 backdrop-blur-sm px-4 py-2 text-sm font-medium text-foreground hover:bg-foreground/10 transition-colors flex items-center gap-2"
          >
            <Download className="h-4 w-4 text-foreground/60" />
            Download Report (PDF)
          </button>
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
          <Form id="EmailForm" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground ml-1">Upload Resume (PDF Only)<span className="text-[#FF553E] ml-0.5">*</span></label>
              <ResumeUploader
                onUpload={(text) => handleResumeUpload(text, setFieldValue)}
              />
              <ErrorMessage name="resumeText" component="p" className="text-sm text-red-500 ml-1" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground ml-1">Paste the Job Description<span className="text-[#FF553E] ml-0.5">*</span></label>
              <div className={`bg-white dark:bg-white border-2 border-border rounded-2xl hover:border-foreground/20 focus-within:border-foreground/30 focus-within:shadow-[0_0_0_4px_hsl(var(--foreground)/0.12)] transition-all duration-300 ease-out overflow-hidden ${errors.jobDescription && touched.jobDescription ? "border-red-500" : ""}`}>
                <Field
                  placeholder="Paste the job description here..."
                  name="jobDescription"
                  as="textarea"
                  className="border-0 bg-transparent min-h-[100px] px-4 py-3 focus-visible:ring-0 focus-visible:ring-offset-0 text-base text-foreground placeholder:text-muted-foreground/60 resize-none w-full"
                  autoComplete="off"
                />
              </div>
              <ErrorMessage name="jobDescription" component="p" className="text-sm text-red-500 ml-1" />
            </div>
            <button
              type="submit"
              disabled={isAnalyzing}
              className="w-full bg-foreground text-background hover:bg-foreground/90 focus-visible:outline-none border-0 rounded-full h-11 px-6 text-base font-semibold transition-colors disabled:opacity-50"
            >
              {isAnalyzing ? "Analyzing..." : "Analyze Resume"}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}
