import React, { useRef, useState } from "react";
import Text from "./text";
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
        <div className="max-w-3xl mx-auto p-4">
          <div className="p-6 bg-red-50 rounded-lg">
            <h2 className="text-2xl font-bold mb-4 text-red-700">
              Error Processing Feedback
            </h2>
            <p className="text-red-600">
              There was an error processing the interview feedback. Please try
              again.
            </p>
            <button
              className="mt-6 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
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
    <div className="container mx-auto max-w-2xl">
      <div className="text-center mb-12" id="initial-title">
        <Text
          size="p-large"
          className="text-center text-[#202937] font-satoshi"
        >
          Practice Mock Interview
        </Text>
        <Text
          size="p-small"
          className="text-center text-[#475569] font-medium mt-4"
        >
          Ace your next opportunity
        </Text>
      </div>
      <div className="bg-white shadow-tools border border-[#E5E7EB] rounded-2xl p-6">
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
            <Form id="InterviewForm">
              <>
                <Text size={"p-xxsmall"} className="font-medium" required>
                  Role you're applying for
                </Text>
                <Field
                  name="role"
                  type="text"
                  placeholder="e.g. Senior Product Designer"
                  className={`text-input mt-2  ${
                    errors.role &&
                    touched.role &&
                    "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                  }`}
                  autoComplete="off"
                />
                <ErrorMessage
                  name="role"
                  component="div"
                  className="error-message"
                />
              </>
              <>
                <Text size={"p-xxsmall"} className="font-medium mt-4" required>
                  Experience Level
                </Text>
                <Field
                  as="select"
                  name="difficulty"
                  className={`text-input !w-full text-[14px]  font-inter !font-[500] custom-select mt-2  ${
                    errors.difficulty &&
                    touched.difficulty &&
                    "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                  } ${values.difficulty == "" && "!text-[#7A829D]"}`}
                >
                  <option value="" className="text-[#7A829D]">
                    Select level
                  </option>
                  {difficultyLevels.map((level, i) => (
                    <option value={level.value} key={i}>
                      {level.label}
                    </option>
                  ))}
                </Field>
                <ErrorMessage
                  name="difficulty"
                  component="div"
                  className="error-message"
                />
              </>
              <>
                <Text size={"p-xxsmall"} className="font-medium mt-4" required>
                  Interview Round
                </Text>
                <Field
                  name="round"
                  type="text"
                  placeholder="e.g. Design Challenge, Portfolio Review"
                  className={`text-input mt-2  ${
                    errors.round &&
                    touched.round &&
                    "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                  }`}
                  autoComplete="off"
                />
                <ErrorMessage
                  name="round"
                  component="div"
                  className="error-message"
                />
              </>
              <>
                <Text size={"p-xxsmall"} className="font-medium mt-4" required>
                  Paste Job Description
                </Text>
                <Field
                  name="jobDescription"
                  as="textarea"
                  type="text"
                  placeholder="Copy and paste the JD from Linkedin, WellFound or any job platform"
                  className={`text-input mt-2 min-h-[200px] ${
                    errors.jobDescription &&
                    touched.jobDescription &&
                    "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                  }`}
                  autoComplete="off"
                />
                <ErrorMessage
                  name="jobDescription"
                  component="div"
                  className="error-message"
                />
              </>
              <Button
                btnType="submit"
                text={
                  isLoading
                    ? "Preparing your interview question..."
                    : "Start Mock Interview"
                }
                form="InterviewForm"
                customClass="mt-4 w-full"
                isLoading={isLoading}
              />
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
