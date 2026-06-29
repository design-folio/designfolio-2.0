import React from "react";
import { motion } from "motion/react";
import Text from "./text";
import CloseIcon from "../../public/assets/svgs/close.svg";
import Good from "../../public/assets/svgs/good.svg";
import NotBad from "../../public/assets/svgs/not-bad.svg";
import Bad from "../../public/assets/svgs/not-bad.svg";
import { useGlobalContext } from "@/context/globalContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

const variants = {
  hidden: { x: "100%" },
  visible: { x: "0%" },
};
const states = {
  good: {
    text: "Nailed It 👏",
    image: <Good />,
  },
  notBad: {
    text: "👍 On Point",
    image: <NotBad />,
  },
  bad: {
    text: "Needs Work 🚧",
    image: <Bad />,
  },
};

const status = {
  good: (
    <div className="bg-good-bg-color text-good-text-color rounded-[7px] p-[10px] text-sm font-semibold">
      Good 🤟🏼
    </div>
  ),
  notBad: (
    <div className="bg-not-bad-bg-color text-not-bad-text-color rounded-[7px] p-[10px] text-sm font-semibold">
      Not Bad 💡
    </div>
  ),
  bad: (
    <div className="bg-bad-bg-color text-bad-text-color rounded-[7px] p-[10px] text-sm font-semibold">
      Needs Work 🚧
    </div>
  ),
};

export default function AnalyzeCaseStudy({
  setShowModal,
  suggestions,
  rating,
  analyzeCallback,
  wordCount,
  isAnalyzing,
}) {
  const { setShowUpgradeModal, setUpgradeModalSource, analysisCreditsRemaining } =
    useGlobalContext();

  const outOfCredits = analysisCreditsRemaining !== null && analysisCreditsRemaining <= 0;
  const tooShort = wordCount !== null && wordCount < 400;
  const isDisabled = outOfCredits || tooShort;

  const category = {
    good: "good",
    notBad: "notBad",
    bad: "bad",
  };

  const renderItems = suggestions.map((item) => {
    return (
      <div className="bg-muted border-border mt-4 rounded-2xl border p-3" key={item.metric}>
        <div className="flex items-center gap-2">
          {status[item.score > 8 ? category.good : item.score > 6 ? category.notBad : category.bad]}
          <Text as="h3" size="p-xsmall" className="font-semibold">
            {item.metric}
          </Text>
        </div>
        <p className="font-inter mt-4 text-sm font-medium">
          <span className="font-semibold">Comments:</span> {item.comments}
        </p>
        <p className="font-inter mt-6 text-sm font-medium">
          <span className="font-semibold">Suggestion:</span> {item.suggestion}
        </p>
      </div>
    );
  });

  return (
    <motion.div
      className="bg-card border-border m-auto flex h-[95%] w-[95%] flex-col rounded-2xl border md:fixed md:top-[2.25%] md:right-4 md:w-[602px]"
      initial="hidden"
      animate="visible"
      variants={variants}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <header className="p-8 pb-0 text-lg font-bold">
        <div className="flex items-center justify-between gap-4">
          <Text size="p-small" className="font-inter font-semibold">
            Scorecard
          </Text>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={setShowModal}>
            <CloseIcon className="text-icon-color" />
          </Button>
        </div>
      </header>
      <main className={`relative flex-1 overflow-y-auto p-8 ${isAnalyzing && "opacity-20"}`}>
        <div className="mb-8 flex flex-col items-center justify-center">
          {rating === 1
            ? states["good"].image
            : rating === 2
              ? states["notBad"].image
              : states["bad"].image}
          <Text size="p-xsmall" className="mt-4">
            {rating === 1
              ? states["good"].text
              : rating === 2
                ? states["notBad"].text
                : states["bad"].text}
          </Text>
        </div>

        {renderItems}
      </main>
      <footer className="bg-card border-border rounded-b-2xl border-t px-8 py-4">
        <div className="flex items-center justify-end gap-2">
          {outOfCredits ? (
            <Button
              onClick={() => {
                setUpgradeModalSource("analyze");
                setShowUpgradeModal(true);
              }}
            >
              <Zap size={13} fill="currentColor" strokeWidth={0} />
              Upgrade to Re-analyze
            </Button>
          ) : (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className={isDisabled ? "inline-flex cursor-not-allowed" : "inline-flex"}>
                    <Button disabled={isDisabled || isAnalyzing} onClick={analyzeCallback}>
                      {isAnalyzing ? "Analyzing…" : "Analyze with AI"}
                    </Button>
                  </span>
                </TooltipTrigger>
                {tooShort && (
                  <TooltipContent side="top" className="text-xs">
                    400 words required to analyze
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </footer>
    </motion.div>
  );
}
