import React, { useRef, useState, useEffect, startTransition } from "react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import TetrisLoading from "./ui/tetris-loader";
import QuestionDisplay from "./QuestionDisplay";
import DetailedFeedback from "./DetailedFeedback";
import { Button } from "@/components/ui/button";
import { getAiToolResult, setAiToolResult } from "@/lib/ai-tools-usage";
import axiosInstance from "@/network/axiosInstance";

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

export default function MockInterviewTool({
  onToolUsed,
  onViewChange,
  onReportView,
  onStartNewAnalysis,
  guestUsageLimitReached = false,
  skipRestore = false,
}) {
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
        startTransition(() => {
          setFeedback(stored.feedback);
          setIsFinished(true);
        });
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
      const { data } = await axiosInstance.post("/ai/tools/interview/questions", {
        jobDescription: jd.trim(),
        role: r.trim(),
        difficulty: diff || "mid",
      });
      setQuestions(data.questions);
      setIsInterviewStarted(true);
    } catch (error) {
      console.error("Error generating questions:", error);
      if (error.response?.data?.limitReached) {
        onToolUsed?.();
        return;
      }
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
        const { data } = await axiosInstance.post("/ai/tools/interview/feedback", {
          role,
          questions,
          userAnswers: newUserAnswers,
        });
        setFeedback(data.feedback);
        setIsFinished(true);
        setAiToolResult(MOCK_INTERVIEW_STORAGE_KEY, { feedback: data.feedback });
        onToolUsed?.();
      } catch (error) {
        console.error("Error generating feedback:", error);
        if (error.response?.data?.limitReached) {
          onToolUsed?.();
          return;
        }
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
    let feedbackData = null;
    let feedbackParseError = false;
    try {
      feedbackData = JSON.parse(feedback);
    } catch (error) {
      console.error("Feedback parse error:", error);
      feedbackParseError = true;
    }
    if (feedbackParseError) {
      return (
        <div className="mx-auto max-w-lg p-4">
          <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-6">
            <h2 className="mb-4 text-2xl font-bold text-red-700">Error Processing Feedback</h2>
            <p className="text-red-600">
              There was an error processing the interview feedback. Please try again.
            </p>
            <button
              className="bg-foreground text-background hover:bg-foreground/90 mt-6 rounded-full px-6 py-3 font-semibold"
              onClick={() => window.location.reload()}
            >
              Start New Interview
            </button>
          </div>
        </div>
      );
    }
    return <DetailedFeedback feedbackData={feedbackData} onStartNew={handleStartNewInterview} />;
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
              <label htmlFor="role" className="text-foreground ml-1 text-sm font-medium">
                Role you&apos;re applying for*
              </label>
              <div
                className={`border-border hover:border-foreground/20 focus-within:border-foreground/30 rounded-2xl border-2 bg-white transition-all duration-300 ease-out focus-within:shadow-[0_0_0_4px_hsl(var(--foreground)/0.12)] dark:bg-white ${errors.role && touched.role ? "border-red-500" : ""}`}
              >
                <Field
                  id="role"
                  name="role"
                  type="text"
                  placeholder="e.g. SPD"
                  className="text-foreground placeholder:text-muted-foreground/60 h-11 w-full border-0 bg-transparent px-4 text-base focus-visible:ring-0 focus-visible:ring-offset-0"
                  autoComplete="off"
                />
              </div>
              <ErrorMessage name="role" component="p" className="ml-1 text-sm text-red-500" />
            </div>
            <div className="space-y-2">
              <label htmlFor="experience" className="text-foreground ml-1 text-sm font-medium">
                Experience Level*
              </label>
              <div
                className={`border-border hover:border-foreground/20 focus-within:border-foreground/30 rounded-2xl border-2 bg-white transition-all duration-300 ease-out focus-within:shadow-[0_0_0_4px_hsl(var(--foreground)/0.12)] dark:bg-white ${errors.difficulty && touched.difficulty ? "border-red-500" : ""}`}
              >
                <Field
                  id="experience"
                  as="select"
                  name="difficulty"
                  className="text-foreground h-11 w-full cursor-pointer appearance-none border-0 bg-transparent px-4 text-base focus:outline-none"
                >
                  <option value="" className="text-muted-foreground">
                    Select level
                  </option>
                  {difficultyLevels.map((level, i) => (
                    <option value={level.value} key={i}>
                      {level.label}
                    </option>
                  ))}
                </Field>
              </div>
              <ErrorMessage name="difficulty" component="p" className="ml-1 text-sm text-red-500" />
            </div>
            <div className="space-y-2">
              <label htmlFor="round" className="text-foreground ml-1 text-sm font-medium">
                Interview Round*
              </label>
              <div
                className={`border-border hover:border-foreground/20 focus-within:border-foreground/30 rounded-2xl border-2 bg-white transition-all duration-300 ease-out focus-within:shadow-[0_0_0_4px_hsl(var(--foreground)/0.12)] dark:bg-white ${errors.round && touched.round ? "border-red-500" : ""}`}
              >
                <Field
                  id="round"
                  name="round"
                  type="text"
                  placeholder="e.g. Design Challenge, Portfolio Review"
                  className="text-foreground placeholder:text-muted-foreground/60 h-11 w-full border-0 bg-transparent px-4 text-base focus-visible:ring-0 focus-visible:ring-offset-0"
                  autoComplete="off"
                />
              </div>
              <ErrorMessage name="round" component="p" className="ml-1 text-sm text-red-500" />
            </div>
            <div className="space-y-2">
              <label htmlFor="mock-job-desc" className="text-foreground ml-1 text-sm font-medium">
                Paste Job Description*
              </label>
              <div
                className={`border-border hover:border-foreground/20 focus-within:border-foreground/30 overflow-hidden rounded-2xl border-2 bg-white transition-all duration-300 ease-out focus-within:shadow-[0_0_0_4px_hsl(var(--foreground)/0.12)] dark:bg-white ${errors.jobDescription && touched.jobDescription ? "border-red-500" : ""}`}
              >
                <Field
                  id="mock-job-desc"
                  name="jobDescription"
                  as="textarea"
                  placeholder="Copy and paste the JD from Linkedin, WellFound or any job platform"
                  className="text-foreground placeholder:text-muted-foreground/60 min-h-[120px] w-full resize-none border-0 bg-transparent px-4 py-3 text-base focus-visible:ring-0 focus-visible:ring-offset-0"
                  autoComplete="off"
                />
              </div>
              <ErrorMessage
                name="jobDescription"
                component="p"
                className="ml-1 text-sm text-red-500"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading || guestUsageLimitReached}
              className="mt-2 h-12 w-full rounded-2xl border-0 bg-[#1A1F2C] px-6 text-base font-semibold text-white hover:bg-[#1A1F2C]/90"
            >
              {guestUsageLimitReached
                ? "Sign up to start again"
                : isLoading
                  ? "Preparing..."
                  : "Start Mock Interview"}
            </Button>
          </Form>
        )}
      </Formik>
      {isLoading && (
        <div className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 rounded-3xl bg-white p-8 shadow-xl">
            <TetrisLoading />
            <p className="text-foreground animate-pulse text-sm font-medium">
              Initializing your interview session...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
