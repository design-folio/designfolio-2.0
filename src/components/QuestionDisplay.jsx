import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

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

const STREAM_SPEED_MS = 40;

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
  const [streamedText, setStreamedText] = useState("");

  useEffect(() => {
    setTip(generateTip(currentQuestion));
  }, [currentQuestion]);

  // Stream question text (typewriter effect)
  useEffect(() => {
    const full = currentQuestion || "";
    setStreamedText("");
    if (!full) return;
    let index = 0;
    const timer = setInterval(() => {
      index += 1;
      setStreamedText(full.slice(0, index));
      if (index >= full.length) clearInterval(timer);
    }, STREAM_SPEED_MS);
    return () => clearInterval(timer);
  }, [currentQuestion]);

  const handleAnswerChange = (e) => {
    const text = e.target.value;
    if (text.length <= MAX_CHAR_LIMIT) {
      onAnswerChange(text);
    }
  };

  const remainingChars = MAX_CHAR_LIMIT - userAnswer.length;
  const totalCount = Math.max(totalQuestions, 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full space-y-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-foreground">
          Q. {questionNumber} of {totalQuestions}
        </h3>
        <Button
          type="button"
          disabled={isGeneratingFeedback || !userAnswer.trim()}
          onClick={onNext}
          className="bg-[#1A1F2C] text-white hover:bg-[#1A1F2C]/90 rounded-full px-8 h-11 font-medium"
        >
          {questionNumber === totalQuestions
            ? isGeneratingFeedback
              ? "Generating Report..."
              : "Finish Interview"
            : "Next Question"}
        </Button>
      </div>

      {/* Progress indicator */}
      <div className="flex gap-2 w-full">
        {Array.from({ length: totalCount }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
              i === questionNumber - 1
                ? "bg-[#FF553E]"
                : i < questionNumber - 1
                  ? "bg-[#FF553E]/40"
                  : "bg-muted/30"
            }`}
          />
        ))}
      </div>

      <div className="space-y-6 pt-4">
        <p className="text-base font-medium text-foreground leading-relaxed">
          {streamedText || (currentQuestion ? "" : "Loading question...")}
          {currentQuestion && streamedText.length < (currentQuestion?.length || 0) ? (
            <span className="inline-block w-0.5 h-4 bg-foreground/70 align-middle animate-pulse ml-0.5" aria-hidden />
          ) : null}
        </p>

        <div className="relative group">
          <div className="bg-white dark:bg-white border-2 border-border rounded-2xl hover:border-foreground/20 focus-within:border-foreground/30 focus-within:shadow-[0_0_0_4px_hsl(var(--foreground)/0.12)] transition-all duration-300 ease-out overflow-hidden">
            <textarea
              className="border-0 bg-transparent min-h-[240px] px-6 py-5 w-full focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 text-base text-foreground placeholder:text-muted-foreground/40 resize-none"
              maxLength={MAX_CHAR_LIMIT}
              placeholder="Type your answer here..."
              value={userAnswer}
              onChange={handleAnswerChange}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="text-sm font-medium text-foreground/60">
            Characters remaining: {remainingChars}
          </div>
          <div className="flex items-center gap-2 text-sm text-foreground/60">
            <Sparkles className="w-4 h-4 text-yellow-500 shrink-0" />
            <span className="font-medium italic">Tip: {tip}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
