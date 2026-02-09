import React, { useRef, useState } from "react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import Button from "./button";
import {
  generateInterviewQuestions,
  handleFeedbackGeneration,
} from "@/lib/gemini";
import { toast } from "react-toastify";
import QuestionDisplay from "./QuestionDisplay";
import DetailedFeedback from "./DetailedFeedback";

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

export default function MockInterviewTool() {
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
  const initializeQuestions = async () => {
    try {
      setIsLoading(true);
      const generatedQuestions = await generateInterviewQuestions(
        jobDescription,
        role,
        difficulty
      );
      setQuestions(generatedQuestions);
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
        const feedbackResult = await handleFeedbackGeneration(
          role,
          questions,
          newUserAnswers
        );
        setFeedback(feedbackResult);
        setIsFinished(true);
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

  if (isFinished) {
    try {
      const feedbackData = JSON.parse(feedback);
      return <DetailedFeedback feedbackData={feedbackData} />;
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
            initializeQuestions();
          }}
          innerRef={formikRef}
        >
          {({ errors, touched, values }) => (
            <Form id="InterviewForm" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground ml-1">Role you're applying for<span className="text-[#FF553E] ml-0.5">*</span></label>
                <div className={`bg-white dark:bg-white border-2 border-border rounded-full hover:border-foreground/20 focus-within:border-foreground/30 focus-within:shadow-[0_0_0_4px_hsl(var(--foreground)/0.12)] transition-all duration-300 ease-out overflow-hidden ${errors.role && touched.role ? "border-red-500" : ""}`}>
                  <Field
                    name="role"
                    type="text"
                    placeholder="e.g. Senior Product Designer"
                    className="border-0 bg-transparent h-11 px-4 focus-visible:ring-0 focus-visible:ring-offset-0 text-base text-foreground placeholder:text-muted-foreground/60 w-full"
                    autoComplete="off"
                  />
                </div>
                <ErrorMessage name="role" component="p" className="text-sm text-red-500 ml-1" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground ml-1">Experience Level<span className="text-[#FF553E] ml-0.5">*</span></label>
                <div className={`bg-white dark:bg-white border-2 border-border rounded-full hover:border-foreground/20 focus-within:border-foreground/30 focus-within:shadow-[0_0_0_4px_hsl(var(--foreground)/0.12)] transition-all duration-300 ease-out overflow-hidden ${errors.difficulty && touched.difficulty ? "border-red-500" : ""}`}>
                  <Field
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
                <label className="text-sm font-medium text-foreground ml-1">Interview Round<span className="text-[#FF553E] ml-0.5">*</span></label>
                <div className={`bg-white dark:bg-white border-2 border-border rounded-full hover:border-foreground/20 focus-within:border-foreground/30 focus-within:shadow-[0_0_0_4px_hsl(var(--foreground)/0.12)] transition-all duration-300 ease-out overflow-hidden ${errors.round && touched.round ? "border-red-500" : ""}`}>
                  <Field
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
                <label className="text-sm font-medium text-foreground ml-1">Paste Job Description<span className="text-[#FF553E] ml-0.5">*</span></label>
                <div className={`bg-white dark:bg-white border-2 border-border rounded-2xl hover:border-foreground/20 focus-within:border-foreground/30 focus-within:shadow-[0_0_0_4px_hsl(var(--foreground)/0.12)] transition-all duration-300 ease-out overflow-hidden ${errors.jobDescription && touched.jobDescription ? "border-red-500" : ""}`}>
                  <Field
                    name="jobDescription"
                    as="textarea"
                    placeholder="Copy and paste the JD from Linkedin, WellFound or any job platform"
                    className="border-0 bg-transparent min-h-[100px] px-4 py-3 focus-visible:ring-0 focus-visible:ring-offset-0 text-base text-foreground placeholder:text-muted-foreground/60 resize-none w-full"
                    autoComplete="off"
                  />
                </div>
                <ErrorMessage name="jobDescription" component="p" className="text-sm text-red-500 ml-1" />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-foreground text-background hover:bg-foreground/90 focus-visible:outline-none border-0 rounded-full h-11 px-6 text-base font-semibold transition-colors disabled:opacity-50"
              >
                {isLoading ? "Preparing your interview question..." : "Start Mock Interview"}
              </button>
            </Form>
          )}
        </Formik>
    </div>
  );
}
