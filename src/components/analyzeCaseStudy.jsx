import React from "react";
import { motion } from "framer-motion";
import Text from "./text";
import CloseIcon from "../../public/assets/svgs/close.svg";
import Button from "./button";
import Good from "../../public/assets/svgs/good.svg";
import NotBad from "../../public/assets/svgs/not-bad.svg";
import Bad from "../../public/assets/svgs/not-bad.svg";
import { useGlobalContext } from "@/context/globalContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
    <div className="bg-good-bg-color text-good-text-color text-sm font-semibold p-[10px] rounded-[7px]">
      Good 🤟🏼
    </div>
  ),
  notBad: (
    <div className="bg-not-bad-bg-color text-not-bad-text-color text-sm font-semibold p-[10px] rounded-[7px]">
      Not Bad 💡
    </div>
  ),
  bad: (
    <div className="bg-bad-bg-color text-bad-text-color text-sm font-semibold p-[10px] rounded-[7px]">
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
  const {
    setShowUpgradeModal,
    setUpgradeModalSource,
    analysisCreditsRemaining,
    analysisCreditsLimit,
  } = useGlobalContext();

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
      <div
        className="mt-4 bg-df-section-card-bg-color rounded-2xl p-3 shadow-df-section-card-shadow"
        key={item.metric}
      >
        <div className="flex gap-2 items-center">
          {
            status[
            item.score > 8
              ? category.good
              : item.score > 6
                ? category.notBad
                : category.bad
            ]
          }
          <Text as="h3" size="p-xsmall" className="font-semibold">
            {item.metric}
          </Text>
        </div>
        <p className="font-inter text-sm mt-4 font-medium">
          <span className="font-semibold">Comments:</span> {item.comments}
        </p>
        <p className="font-inter text-sm mt-6 font-medium">
          <span className="font-semibold">Suggestion:</span> {item.suggestion}
        </p>
      </div>
    );
  });

  return (
    <motion.div
      className="bg-modal-analyze-bg-color h-[95%] w-[95%] m-auto md:w-[602px] md:fixed md:top-[2.25%] md:right-4 flex flex-col rounded-2xl"
      initial="hidden"
      animate="visible"
      variants={variants}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <header className="p-8 text-lg font-bold pb-0">
        <div className="flex items-center justify-between gap-4">
          <Text size="p-small" className="font-semibold font-inter">
            Scorecard
          </Text>
          <Button
            type="secondary"
            customClass="!p-2"
            icon={<CloseIcon className="text-icon-color cursor-pointer" />}
            onClick={setShowModal}
          />
        </div>
      </header>
      <main
        className={`flex-1 overflow-y-auto p-8 relative ${isAnalyzing && "opacity-20"}`}
      >
        <div className="flex flex-col justify-center items-center mb-8">
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
      <footer className="bg-modal-footer-bg-color py-4 px-8 rounded-b-2xl">
        <div className="flex justify-between items-center gap-2">
          {outOfCredits ? (
            <Button
              text="Upgrade to Pro"
              type="modal"
              onClick={() => { setUpgradeModalSource("analyze"); setShowUpgradeModal(true); }}
            />
          ) : (
            <Text
              size="p-xxsmall"
              className="font-medium font-inter text-used-credit-text-color"
            >
              {analysisCreditsRemaining !== null
                ? `${analysisCreditsRemaining}/${analysisCreditsLimit} Credits left`
                : "Loading credits…"}
            </Text>
          )}
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className={isDisabled ? "cursor-not-allowed inline-flex" : "inline-flex"}>
                  <Button
                    text="Analyze with AI"
                    type="modal"
                    isDisabled={isDisabled}
                    isLoading={isAnalyzing}
                    onClick={analyzeCallback}
                  />
                </span>
              </TooltipTrigger>
              {tooShort && (
                <TooltipContent side="top" className="text-xs">
                  {wordCount} / 400 words — add {400 - wordCount} more to analyze
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </footer>
    </motion.div>
  );
}
