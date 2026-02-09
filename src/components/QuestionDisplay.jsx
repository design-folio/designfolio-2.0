import React, { useEffect, useState } from "react";
import ProgressBar from "./ProgressBar";

const MAX_CHAR_LIMIT = 500;

const generateTip = (question) => {
  if (!question) return "";

  const questionLower = question.toLowerCase();

  // Design Process Questions
  if (
    questionLower.includes("design process") ||
    questionLower.includes("methodology")
  ) {
    return "Framework: Define → Research → Ideate → Prototype → Test → Iterate";
  }

  // User Research Questions
  if (
    questionLower.includes("user research") ||
    questionLower.includes("usability")
  ) {
    return "Methods → Participants → Key Findings → Insights → Impact";
  }

  // Design System Questions
  if (
    questionLower.includes("design system") ||
    questionLower.includes("component")
  ) {
    return "Problem → Principles → Structure → Implementation → Documentation";
  }

  // Collaboration Questions
  if (
    questionLower.includes("team") ||
    questionLower.includes("collaborat") ||
    questionLower.includes("stakeholder")
  ) {
    return "Context → Roles → Communication → Challenges → Resolution";
  }

  // Problem-Solving Questions
  if (
    questionLower.includes("challenge") ||
    questionLower.includes("problem") ||
    questionLower.includes("difficult")
  ) {
    return "Situation → Task → Action → Result → Learning";
  }

  // Project Questions
  if (
    questionLower.includes("project") ||
    questionLower.includes("case study")
  ) {
    return "Overview → Goals → Process → Outcome → Impact";
  }

  // Leadership Questions
  if (
    questionLower.includes("lead") ||
    questionLower.includes("manage") ||
    questionLower.includes("mentor")
  ) {
    return "Role → Vision → Strategy → Execution → Results";
  }

  // Technical Questions
  if (
    questionLower.includes("technical") ||
    questionLower.includes("tool") ||
    questionLower.includes("software")
  ) {
    return "Tool Selection → Implementation → Best Practices → Optimization → Results";
  }

  // Metrics & Impact Questions
  if (
    questionLower.includes("metric") ||
    questionLower.includes("impact") ||
    questionLower.includes("success")
  ) {
    return "Goals → Metrics → Implementation → Results → Business Impact";
  }

  // Default structure for other questions
  return "Context → Approach → Implementation → Results → Learning";
};

export default function QuestionDisplay({
  currentQuestion,
  questionNumber,
  totalQuestions,
  userAnswer,
  onAnswerChange,
  onNext,
  isGeneratingFeedback = false,
}) {
  const [tip, setTip] = useState("");

  useEffect(() => {
    setTip(generateTip(currentQuestion));
  }, [currentQuestion]);

  const handleAnswerChange = (e) => {
    const text = e.target.value;
    if (text.length <= MAX_CHAR_LIMIT) {
      onAnswerChange(text);
    }
  };

  const remainingChars = MAX_CHAR_LIMIT - userAnswer.length;

  return (
    <div className="w-full space-y-4">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-foreground">
            Q. {questionNumber} of {totalQuestions}
          </span>
          <button
            type="button"
            disabled={isGeneratingFeedback}
            onClick={onNext}
            className="rounded-full h-11 px-6 text-base font-semibold bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50 transition-colors"
          >
            {questionNumber === totalQuestions
              ? isGeneratingFeedback
                ? "Generating Report..."
                : "Finish Interview"
              : "Next Question"}
          </button>
        </div>
        <div className="flex gap-2 mt-4">
          <ProgressBar progress={100} />
          <ProgressBar progress={questionNumber >= 2 && 100} />
          <ProgressBar progress={questionNumber >= 3 && 100} />
          <ProgressBar progress={questionNumber >= 4 && 100} />
          <ProgressBar progress={questionNumber >= 5 && 100} />
        </div>
        <div className="mt-6 space-y-2">
          <p className="text-sm font-semibold text-foreground">
            {currentQuestion || "Loading question..."}
          </p>
          <div className="bg-white dark:bg-white border-2 border-border rounded-2xl hover:border-foreground/20 focus-within:border-foreground/30 focus-within:shadow-[0_0_0_4px_hsl(var(--foreground)/0.12)] transition-all duration-300 ease-out overflow-hidden">
            <textarea
              className="border-0 bg-transparent min-h-[200px] px-4 py-3 w-full focus:outline-none text-base text-foreground placeholder:text-muted-foreground/60 resize-none"
              maxLength={MAX_CHAR_LIMIT}
              placeholder="Type your answer here..."
              value={userAnswer}
              onChange={handleAnswerChange}
            />
          </div>
        </div>
        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground font-medium">
          <span>Characters remaining: {remainingChars}</span>
          <span>💡 Tip: {tip}</span>
        </div>
      </div>
    </div>
  );
}
