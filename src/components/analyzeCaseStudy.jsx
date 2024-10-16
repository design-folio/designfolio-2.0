import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Text from "./text";
import CloseIcon from "../../public/assets/svgs/close.svg";
import Button from "./button";
import Good from "../../public/assets/svgs/good.svg";
import NotBad from "../../public/assets/svgs/not-bad.svg";
import Bad from "../../public/assets/svgs/not-bad.svg";
import { _analyzeCaseStudyCredits } from "@/network/post-request";

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
    <div class="bg-good-bg-color text-good-text-color text-sm font-semibold p-[10px] rounded-[7px]">
      Good 🤟🏼
    </div>
  ),
  notBad: (
    <div class="bg-not-bad-bg-color text-not-bad-text-color text-sm font-semibold p-[10px] rounded-[7px]">
      Not Bad 💡
    </div>
  ),
  bad: (
    <div class="bg-bad-bg-color text-bad-text-color text-sm font-semibold p-[10px] rounded-[7px]">
      Needs Work 🚧
    </div>
  ),
};
export default function AnalyzeCaseStudy({ setShowModal,suggestions,rating,projectId,analyzeCallback }) {

  const category = {
    good: 'good',
    notBad: 'notBad',
    bad: 'bad'
  };

  const reAnalyze=()=>{
    analyzeCallback()
    setCredits(credits+1)
  }

  const [credits,setCredits] = useState(0)

  const fetchCredits=async ()=>{

    try {
      const response = await _analyzeCaseStudyCredits(projectId);
      console.log(response.data.usedToday)
      setCredits(response.data.usedToday)
    } catch (e) {
      console.log(e);
    }

  }

  useEffect(()=>{
    fetchCredits()
  },[])

  const renderItems = suggestions.map(item => {
    return (
      <div className="mt-8" key={item.metric}>
        <div className="flex gap-2 items-center">
          {status[item.score > 8 ? category.good : item.score > 6 ? category.notBad : category.bad]}
          <Text as="h3" size="p-xxsmall" className="font-semibold">
            {item.metric}
          </Text>
        </div>
        <p className="font-inter text-sm mt-4">
          <span className="font-semibold">Comments:</span> {item.comments}
        </p>
        <p className="font-inter text-sm mt-6">
          <span className="font-semibold">Suggestion:</span> {item.suggestion}
        </p>
      </div>
    );
  });

  return (
    <motion.div
      className="bg-modal-bg-color h-[95%] w-[95%] m-auto md:w-[602px] md:fixed md:top-[2.25%] md:right-4 flex flex-col rounded-2xl"
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
            customClass="!p-2 rounded-[8px]"
            icon={<CloseIcon className="text-icon-color" />}
            onClick={setShowModal}
          />
        </div>
      </header>
      <div className={`flex-1 overflow-y-auto p-8 relative `}>
        <div className="flex flex-col justify-center items-center">
          {rating === 1 ? states["good"].image : rating === 2 ? states["notBad"].image : states["bad"].image }
          <Text size="p-xsmall" className="mt-4">
          {rating === 1 ? states["good"].text : rating === 2 ? states["notBad"].text : states["bad"].text }
          </Text>
        </div>

        {renderItems}

      </div>
      <footer className="bg-modal-footer-bg-color py-4 px-8 rounded-b-2xl">
        <div className="flex justify-between items-center gap-2">
          <Text
            size="p-xxsmall"
            className="font-medium font-inter text-used-credit-text-color"
          >
            { credits ===2 ? "All credits used, Try again tomorrow" : credits + "/2 Credits left" }
          </Text>
          <Button text={"Re-analyze Case Study"} type="modal" isDisabled={ credits>=2} onClick={reAnalyze} />
        </div>
      </footer>
    </motion.div>
  );
}
