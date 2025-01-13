import { useState } from "react";
import Text from "./text";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { toast } from "react-toastify";
import ResumeUploader from "./resumeUploader";
import Button from "./button";
import AnalysisResult from "./analysisResult";
import { Download, RefreshCcw } from "lucide-react";
import { exportToPdf } from "./PdfExporter";

const RATE_LIMIT_DELAY = 10000;
let lastRequestTime = 0;

const genAI = new GoogleGenerativeAI("AIzaSyA3OdkRcRU_Sr6ECLJJORsOjUSl-w4eXpc");

const validationSchema = Yup.object().shape({
  resumeText: Yup.string()
    .required("Resume text is required")
    .min(50, "Resume text should be at least 50 characters"),
  jobDescription: Yup.string()
    .required("Job description is required")
    .min(50, "Job description should be at least 50 characters"),
});

export default function CoverLetterGenerator() {
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

      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
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
      <div className="container mx-auto">
        <div className="text-center mb-12" id="initial-title">
          <Text
            size="p-large"
            className="text-center text-[#202937] font-satoshi"
          >
            Analysis Results
          </Text>
        </div>
        <div
          id="pdf-content"
          className="space-y-8 bg-white shadow-tools border border-[#E5E7EB] rounded-3xl p-6"
        >
          {" "}
          <div className="flex justify-end gap-4 mb-8">
            <button
              onClick={() => exportToPdf("pdf-content")}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export PDF
            </button>
            <button
              onClick={() => setAnalysis(null)}
              className="flex items-center gap-2"
            >
              <RefreshCcw className="h-4 w-4" />
              New Analysis
            </button>
          </div>
          <AnalysisResult analysis={analysis} />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl">
      <div className="text-center mb-12" id="initial-title">
        <Text
          size="p-large"
          className="text-center text-[#202937] font-satoshi"
        >
          Turn Good Resumes Into Great Ones
        </Text>
        <Text
          size="p-small"
          className="text-center text-[#475569] font-medium mt-4"
        >
          See how your resume stacks up against the Job Description.{" "}
        </Text>
      </div>
      <div className="bg-white shadow-tools border border-[#E5E7EB] rounded-3xl p-6">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, setFieldValue, values }) => (
            <Form id="EmailForm">
              <Text size={"p-xxsmall"} className="font-medium mb-2" required>
                Upload Resume (PDF Only)
              </Text>
              <ResumeUploader
                onUpload={(text) => handleResumeUpload(text, setFieldValue)}
              />
              <ErrorMessage
                name="resumeText"
                component="div"
                className="error-message text-[14px]"
              />
              <Text size={"p-xxsmall"} className="font-medium mt-4" required>
                Paste the Job Description
              </Text>
              <Field
                placeholder="Paste the job description here..."
                name="jobDescription"
                as="textarea"
                className={`text-input mt-2  min-h-[180px] border-b ${
                  errors.jobDescription &&
                  touched.jobDescription &&
                  "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                }`}
                autoComplete="off"
              />
              <ErrorMessage
                name="jobDescription"
                component="div"
                className="error-message text-[14px]"
              />

              <Button
                btnType="submit"
                text={isAnalyzing ? "Analyzing..." : "Perfect my Resume"}
                form="EmailForm"
                customClass="mt-4 w-full"
                isLoading={isAnalyzing}
              />
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
