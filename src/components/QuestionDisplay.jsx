import React, { useEffect, useState } from "react";
import Text from "./text";
import Button from "./button";
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
          Ace your next opportunity{" "}
        </Text>
      </div>
      <div className="bg-white shadow-tools border border-[#E5E7EB] rounded-2xl p-6">
        <div className="flex justify-between items-center">
          <Text size="p-small" className=" text-[#20294C] font-semibold">
            Q. {questionNumber} of {totalQuestions}
          </Text>

          <Button
            text={
              questionNumber === totalQuestions
                ? isGeneratingFeedback
                  ? "Generating Report..."
                  : "Finish Interview"
                : "Next Question"
            }
            isLoading={isGeneratingFeedback}
            onClick={onNext}
            isDisabled={isGeneratingFeedback}
          />
        </div>
        <div className="flex gap-2 mt-4">
          <ProgressBar progress={100} />
          <ProgressBar progress={questionNumber >= 2 && 100} />
          <ProgressBar progress={questionNumber >= 3 && 100} />
          <ProgressBar progress={questionNumber >= 4 && 100} />
          <ProgressBar progress={questionNumber >= 5 && 100} />
        </div>
        <div className="mt-7">
          <Text size="p-xsmall" className=" text-[#20294C] font-bold">
            {currentQuestion || "Loading question..."}
          </Text>
          <textarea
            className={`text-input mt-5  min-h-[200px] border-b`}
            maxLength={MAX_CHAR_LIMIT}
            placeholder="Type your answer here..."
            value={userAnswer}
            onChange={handleAnswerChange}
          />
        </div>
        <div className="flex items-center justify-between mt-3">
          <Text
            size="p-xxsmall"
            className=" text-[#20294C] font-semibold text-[12px]"
          >
            Characters remaining: {remainingChars}
          </Text>
          <Text
            size="p-xxsmall"
            className=" text-[#20294C] font-semibold text-[12px]"
          >
            💡 Tip: {tip}
          </Text>
        </div>
      </div>
    </div>
  );
}
