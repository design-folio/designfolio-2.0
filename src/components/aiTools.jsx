import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import Button from "./button";
import LeftArrow from "../../public/assets/svgs/left-arrow.svg";
import { Field } from "formik";
import MediumForm from "./mediumForm";
import AnalyzeCaseStudyTruncated from "./analyzeCaseStudyTruncated";
import Text from "./text";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      type: "spring",
    },
  },
};

const itemVariants = {
  hidden: { y: 50 },
  visible: {
    y: 0,
    transition: {
      type: "spring",
      stiffness: 180,
      damping: 15,
      duration: 0.4,
    },
  },
};

function AiTools({}) {
  const router = useRouter();
  const [isMediumFetched , setIsMediumFetched] = useState(false)
  const [suggestions, setSuggestions] = useState([]);
  const [score, setScore] = useState(0);
  const [rating, setRating] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleBack = () => {
    router.push("/builder");
  };

  return (
    <motion.div
      className="flex flex-col gap-4 md:gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <section className="bg-df-section-card-bg-color shadow-df-section-card-shadow rounded-[24px] p-4 lg:p-[32px] break-words">
          <Text className="mb-4">Medium Post Analyzer</Text>
          <MediumForm isMediumFetched={isMediumFetched} setIsMediumFetched={setIsMediumFetched} setSuggestions={setSuggestions} setRating={setRating} isAnalyzing={isAnalyzing} />
        </section>
      </motion.div>

      <div>
      {isMediumFetched && <AnalyzeCaseStudyTruncated setShowModal={setIsMediumFetched} suggestions={suggestions} rating={rating} isAnalyzing={isAnalyzing}></AnalyzeCaseStudyTruncated>}

      </div>

    </motion.div>
  );
}

export default AiTools;
