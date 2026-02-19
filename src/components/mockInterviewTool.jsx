import React, { useRef, useState, useEffect } from "react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import TetrisLoading from "./ui/tetris-loader";
import QuestionDisplay from "./QuestionDisplay";
import DetailedFeedback from "./DetailedFeedback";
import { Button } from "@/components/ui/button";
import { getAiToolResult, setAiToolResult } from "@/lib/ai-tools-usage";

const MOCK_INTERVIEW_STORAGE_KEY = "mock-interview";

const validationSchema = Yup.object().shape({
  role: Yup.string().required("Role is required"),
  difficulty: Yup.string().required("Difficulty is required"),
  round: Yup.string().required("Round is required"),
  jobDescription: Yup.string().required("Job description is required"),
});

const difficultyLevels = [
  {
    value: "entry",
    label: "Entry Level 0-2 years",
  },
  {
    value: "mid",
    label: "Mid Level 3-5 years",
  },
  {
    value: "senior",
    label: "Senior Level 6-10 years",
  },
  {
    value: "lead",
    label: "Lead Level 10+ years",
  },
];

export default function MockInterviewTool({ onToolUsed, onViewChange, onReportView, onStartNewAnalysis, guestUsageLimitReached = false, skipRestore = false }) {
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const formikRef = useRef(null); // Create a ref to access Formik instance
  const [values, setValues] = useState({});
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [userAnswers, setUserAnswers] = useState([]);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const { jobDescription, role, round, difficulty } = values || {};
  const hasResult = isInterviewStarted || isFinished;

  useEffect(() => {
    if (skipRestore) return;
    const stored = getAiToolResult(MOCK_INTERVIEW_STORAGE_KEY);
    if (stored && typeof stored === "object" && stored.feedback) {
      try {
        JSON.parse(stored.feedback);
        setFeedback(stored.feedback);
        setIsFinished(true);
        onViewChange?.(true);
      } catch (_) {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skipRestore]);

  useEffect(() => {
    onViewChange?.(hasResult);
  }, [hasResult, onViewChange]);

  useEffect(() => {
    onReportView?.(isFinished);
  }, [isFinished, onReportView]);

  const initializeQuestions = async (formValues) => {
    if (guestUsageLimitReached) {
      toast.error("You've already used this tool once. Sign up to start another mock interview.");
      return;
    }
    const { jobDescription: jd, role: r, difficulty: diff } = formValues || values || {};
    if (!jd?.trim() || !r?.trim()) {
      toast.error("Role and job description are required.");
      return;
    }
    try {
      setIsLoading(true);
      const res = await fetch("/api/interview-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription: jd.trim(), role: r.trim(), difficulty: diff || "mid" }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to generate questions");
      }
      setQuestions(data.questions);
      setIsInterviewStarted(true);
    } catch (error) {
      console.error("Error generating questions:", error);
      toast.error("Failed to generate questions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextQuestion = async () => {
    if (!userAnswer.trim()) {
      toast.error("Please provide an answer before continuing.");
      return;
    }

    const newUserAnswers = [...userAnswers, userAnswer];
    setUserAnswers(newUserAnswers);

    if (currentQuestionIndex === questions.length - 1) {
      try {
        setIsGeneratingFeedback(true);
        const res = await fetch("/api/interview-feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            role,
            questions,
            userAnswers: newUserAnswers,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Failed to generate feedback");
        }
        setFeedback(data.feedback);
        setIsFinished(true);
        setAiToolResult(MOCK_INTERVIEW_STORAGE_KEY, { feedback: data.feedback });
        onToolUsed?.();
      } catch (error) {
        console.error("Error generating feedback:", error);
        toast.error("Failed to generate feedback. Please try again.");
      } finally {
        setIsGeneratingFeedback(false);
      }
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setUserAnswer("");
    }
  };

  const handleStartNewInterview = () => {
    onViewChange?.(false);
    onReportView?.(false);
    onStartNewAnalysis?.();
  };

  if (isFinished) {
    try {
      const feedbackData = JSON.parse(feedback);
      return <DetailedFeedback feedbackData={feedbackData} onStartNew={handleStartNewInterview} />;
    } catch (error) {
      console.error("Feedback parse error:", error);
      return (
        <div className="max-w-lg mx-auto p-4">
          <div className="p-6 bg-red-50 rounded-2xl border-2 border-red-200">
            <h2 className="text-2xl font-bold mb-4 text-red-700">
              Error Processing Feedback
            </h2>
            <p className="text-red-600">
              There was an error processing the interview feedback. Please try
              again.
            </p>
            <button
              className="mt-6 px-6 py-3 bg-foreground text-background rounded-full font-semibold hover:bg-foreground/90"
              onClick={() => window.location.reload()}
            >
              Start New Interview
            </button>
          </div>
        </div>
      );
    }
  }

  if (isInterviewStarted) {
    return (
      <QuestionDisplay
        currentQuestion={questions[currentQuestionIndex]?.question}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={questions.length}
        userAnswer={userAnswer}
        onAnswerChange={setUserAnswer}
        onNext={handleNextQuestion}
        isGeneratingFeedback={isGeneratingFeedback}
      />
    );
  }

  return (
    <div className="w-full space-y-4">
      <Formik
          initialValues={{
            role: "",
            difficulty: "",
            round: "",
            jobDescription: "",
          }}
          validationSchema={validationSchema}
          onSubmit={(values, actions) => {
            setValues(values);
            initializeQuestions(values);
          }}
          innerRef={formikRef}
        >
          {({ errors, touched, values }) => (
            <Form id="InterviewForm" className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="role" className="text-sm font-medium text-foreground ml-1">Role you're applying for*</label>
                <div className={`bg-white dark:bg-white border-2 border-border rounded-2xl hover:border-foreground/20 focus-within:border-foreground/30 focus-within:shadow-[0_0_0_4px_hsl(var(--foreground)/0.12)] transition-all duration-300 ease-out ${errors.role && touched.role ? "border-red-500" : ""}`}>
                  <Field
                    id="role"
                    name="role"
                    type="text"
                    placeholder="e.g. SPD"
                    className="border-0 bg-transparent h-11 px-4 focus-visible:ring-0 focus-visible:ring-offset-0 text-base text-foreground placeholder:text-muted-foreground/60 w-full"
                    autoComplete="off"
                  />
                </div>
                <ErrorMessage name="role" component="p" className="text-sm text-red-500 ml-1" />
              </div>
              <div className="space-y-2">
                <label htmlFor="experience" className="text-sm font-medium text-foreground ml-1">Experience Level*</label>
                <div className={`bg-white dark:bg-white border-2 border-border rounded-2xl hover:border-foreground/20 focus-within:border-foreground/30 focus-within:shadow-[0_0_0_4px_hsl(var(--foreground)/0.12)] transition-all duration-300 ease-out ${errors.difficulty && touched.difficulty ? "border-red-500" : ""}`}>
                  <Field
                    id="experience"
                    as="select"
                    name="difficulty"
                    className="border-0 bg-transparent h-11 px-4 focus:outline-none text-base text-foreground w-full appearance-none cursor-pointer"
                  >
                    <option value="" className="text-muted-foreground">Select level</option>
                    {difficultyLevels.map((level, i) => (
                      <option value={level.value} key={i}>
                        {level.label}
                      </option>
                    ))}
                  </Field>
                </div>
                <ErrorMessage name="difficulty" component="p" className="text-sm text-red-500 ml-1" />
              </div>
              <div className="space-y-2">
                <label htmlFor="round" className="text-sm font-medium text-foreground ml-1">Interview Round*</label>
                <div className={`bg-white dark:bg-white border-2 border-border rounded-2xl hover:border-foreground/20 focus-within:border-foreground/30 focus-within:shadow-[0_0_0_4px_hsl(var(--foreground)/0.12)] transition-all duration-300 ease-out ${errors.round && touched.round ? "border-red-500" : ""}`}>
                  <Field
                    id="round"
                    name="round"
                    type="text"
                    placeholder="e.g. Design Challenge, Portfolio Review"
                    className="border-0 bg-transparent h-11 px-4 focus-visible:ring-0 focus-visible:ring-offset-0 text-base text-foreground placeholder:text-muted-foreground/60 w-full"
                    autoComplete="off"
                  />
                </div>
                <ErrorMessage name="round" component="p" className="text-sm text-red-500 ml-1" />
              </div>
              <div className="space-y-2">
                <label htmlFor="mock-job-desc" className="text-sm font-medium text-foreground ml-1">Paste Job Description*</label>
                <div className={`bg-white dark:bg-white border-2 border-border rounded-2xl hover:border-foreground/20 focus-within:border-foreground/30 focus-within:shadow-[0_0_0_4px_hsl(var(--foreground)/0.12)] transition-all duration-300 ease-out overflow-hidden ${errors.jobDescription && touched.jobDescription ? "border-red-500" : ""}`}>
                  <Field
                    id="mock-job-desc"
                    name="jobDescription"
                    as="textarea"
                    placeholder="Copy and paste the JD from Linkedin, WellFound or any job platform"
                    className="border-0 bg-transparent min-h-[120px] px-4 py-3 focus-visible:ring-0 focus-visible:ring-offset-0 text-base text-foreground placeholder:text-muted-foreground/60 resize-none w-full"
                    autoComplete="off"
                  />
                </div>
                <ErrorMessage name="jobDescription" component="p" className="text-sm text-red-500 ml-1" />
              </div>
              <Button
                type="submit"
                disabled={isLoading || guestUsageLimitReached}
                className="w-full rounded-2xl h-12 px-6 text-base font-semibold bg-[#1A1F2C] text-white hover:bg-[#1A1F2C]/90 border-0 mt-2"
              >
                {guestUsageLimitReached ? "Sign up to start again" : isLoading ? "Preparing..." : "Start Mock Interview"}
              </Button>
            </Form>
          )}
        </Formik>
        {isLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="bg-white p-8 rounded-3xl shadow-xl flex flex-col items-center gap-4">
              <TetrisLoading />
              <p className="text-sm font-medium text-foreground animate-pulse">Initializing your interview session...</p>
            </div>
          </div>
        )}
    </div>
  );
}
