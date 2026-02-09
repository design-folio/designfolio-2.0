import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { toast } from "react-toastify";
import ResumeUploader from "./resumeUploader";
import AnalysisResult from "./analysisResult";
import { Download, RefreshCcw } from "lucide-react";
import { exportToPdf } from "./PdfExporter";

const RATE_LIMIT_DELAY = 10000;
let lastRequestTime = 0;

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

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

  const checkRateLimit = () => {
    const now = Date.now();
    if (now - lastRequestTime < RATE_LIMIT_DELAY) {
      const remainingTime = Math.ceil(
        (RATE_LIMIT_DELAY - (now - lastRequestTime)) / 1000
      );
      throw new Error(
        `Please wait ${remainingTime} seconds before making another request.`
      );
    }
    lastRequestTime = now;
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    setIsAnalyzing(true);
    try {
      checkRateLimit();

      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const prompt = `
        You are an AI expert in analyzing resumes against job descriptions. Provide a detailed analysis in the following JSON structure:
        {
          "matchScore": <number between 0-100>,
          "summary": "<comprehensive summary of match and key findings>",
          "strengths": [
            {
              "category": "<category name>",
              "details": "<strength details>"
            }
          ],
          "gaps": [
            {
              "category": "<category name>",
              "details": "<gap details>"
            }
          ],
          "keywordAnalysis": [
            {
              "keyword": "<keyword>",
              "resumeCount": <number>,
              "jdCount": <number>,
              "importance": "high|medium|low"
            }
          ],
          "metrics": [
            {
              "skill": "<skill name>",
              "resumeCoverage": <number 0-100>,
              "jdCoverage": <number 0-100>,
              "resumeFrequency": <number>,
              "jdFrequency": <number>,
              "status": "Matched|Missing|Additional"
            }
          ],
          "sections": [
            {
              "name": "Experience Match",
              "analysis": "<detailed analysis>",
              "suggestions": ["<actionable suggestions>"],
              "matchPercentage": <number 0-100>
            },
            {
              "name": "Education and Certifications",
              "analysis": "<analysis of requirements match>",
              "suggestions": ["<improvement suggestions>"],
              "matchPercentage": <number 0-100>
            },
            {
              "name": "Technical Skills",
              "analysis": "<analysis of technical alignment>",
              "suggestions": ["<specific suggestions>"],
              "matchPercentage": <number 0-100>
            },
            {
              "name": "Soft Skills",
              "analysis": "<analysis of soft skills>",
              "suggestions": ["<improvement suggestions>"],
              "matchPercentage": <number 0-100>
            }
          ],
          "recommendations": [
            {
              "priority": "high|medium|low",
              "action": "<specific action>",
              "impact": "<expected impact>"
            }
          ]
        }

        Resume Content:
        ${values.resumeText}
        
        Job Description:
        ${values.jobDescription}
        
        Important: Return ONLY valid JSON, no markdown formatting or additional text.
        Ensure all numerical values are actual numbers, not strings.
        Provide specific, actionable feedback that will help improve the resume's alignment with the job requirements.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      try {
        const cleanedText = text.replace(/```json\n?|\n?```/g, "").trim();
        const parsedAnalysis = JSON.parse(cleanedText);
        setAnalysis(parsedAnalysis);
        onViewChange?.(true);
        toast.success("Analysis complete");
        // navigate("/results", { state: { analysis: parsedAnalysis } });
      } catch (parseError) {
        console.error("Parse error:", parseError);
        toast.error("Failed to parse the AI response. Please try again.");
      }
    } catch (error) {
      console.error("Analysis error:", error);
      let errorMessage = "There was an error analyzing your resume.";

      if (error?.message?.includes("Please wait")) {
        errorMessage = error.message;
      } else if (
        error?.message?.includes("RESOURCE_EXHAUSTED") ||
        error?.status === 429
      ) {
        errorMessage =
          "API quota exceeded. Please wait a few minutes before trying again.";
      }

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
