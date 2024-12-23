import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Text from "./text";
import CloseIcon from "../../public/assets/svgs/close.svg";
import Button from "./button";
import Good from "../../public/assets/svgs/good.svg";
import NotBad from "../../public/assets/svgs/not-bad.svg";
import Bad from "../../public/assets/svgs/not-bad.svg";
import MediumForm from "./mediumForm";
import dynamic from "next/dynamic";
const ProjectEditor = dynamic(() => import("./projectEditor"), {
  ssr: false,
});

const variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
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

export default function AnalyzeCaseStudyTruncated({ setShowModal }) {
  const [suggestions, setSuggestions] = useState([
    {
      metric: "Design",
      score: 9,
      suggestion: "Try adding a few more color variations.",
    },
    {
      metric: "Content",
      score: 7,
      suggestion: "Add charts and images to make it more engaging.",
    },
    {
      metric: "UX",
      score: 6,
      suggestion: "Make the navigation bar sticky for better usability.",
    },
    {
      metric: "Performance",
      score: 8,
      suggestion: "Optimize the images for even faster loading.",
    },
  ]);

  const [rating, setRating] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [projectDetails, setProjectDetails] = useState({
    content: {
      blocks: [],
    },
    time: "1728848289380",
    version: "2.30.6",
  });

  const close = () => {
    setShowModal(false);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-modal-analyze-bg-color bg-opacity-95 flex flex-col rounded-2xl shadow-lg"
      initial="hidden"
      animate="visible"
      variants={variants}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <header className="p-8 text-lg font-bold pb-0 flex justify-between items-center">
        <Text size="p-small" className="font-semibold font-inter">
          Analyze Case Study Using AI
        </Text>
        <Button
          type="secondary"
          customClass="!p-2 rounded-[8px]"
          icon={<CloseIcon className="text-icon-color cursor-pointer" />}
          onClick={close}
        />
      </header>
      <main className="flex flex-1">
        {/* Left Half */}
        <div className="w-1/2 p-8 mt-8 flex-col justify-center bg-lorem-bg-color">
          <ProjectEditor projectDetails={projectDetails} />
          <MediumForm
            setProjectDetails={setProjectDetails}
            setSuggestions={setSuggestions}
            setIsAnalyzing={setIsAnalyzing}
            setRating={setRating}
          />
        </div>

{/* Right Half */}
<div
  className={`w-1/2 p-8 flex-col justify-between ${
    isAnalyzing ? "opacity-35 blur-sm" : ""
  }`}
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
  <div
    className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200"
  >
    {suggestions.slice(0, 4).map((item) => (
      <div
        className="mt-4 bg-df-section-card-bg-color rounded-2xl p-3 shadow-df-section-card-shadow"
        key={item?.metric}
      >
        <div className="flex gap-2 items-center">
          {status[
            item?.score > 8
              ? "good"
              : item?.score > 6
              ? "notBad"
              : "bad"
          ]}
          <Text as="h3" size="p-xsmall" className="font-semibold">
            {item?.metric}
          </Text>
        </div>
        <p className="font-inter text-sm mt-6 font-medium">
          <span className="font-semibold">Suggestion:</span> {item?.suggestion}
        </p>
      </div>
    ))}

    {!isAnalyzing && <Button type="secondary" customClass={"mt-4"} text={"Do Something"} />  }
  </div>
</div>

      </main>
    </motion.div>
  );
}
