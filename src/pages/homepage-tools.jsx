import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Card from "@/components/card";
import Button from "@/components/button";
import ArrowIcon from "../../public/assets/svgs/arrow.svg";
import AnalyzeCaseStudyTruncated from "@/components/analyzeCaseStudyTruncated";


const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      type: "spring",
    },
  },
};

function CardContent({obj})
{
    return <>
                <div>

<div className="flex gap-4">

    <div className="mt-2">

    <img src={obj.iconPath} alt="AI Icon" className="w-35 h-35" />

    </div>

    <div>

    <h4 className="text-lg md:text-xl font-satoshi font-bold text-landing-card-heading-color">
    {obj.title}
</h4>
<p className="text-landing-card-description-color text-sm md:text-base font-medium mt-2">
    {obj.description}</p>
    </div>

</div>

    <Button customClass="w-full mt-8" type="secondary" text={"Try Now"} iconPosition="left" icon={<ArrowIcon />} onClick={obj.onClick} ></Button>
</div>
    
    </>
}

function AiToolsHomePage({}) {


    const[showAnalyzeModel,setShowAnalyzeModal] = useState(false)
    const caseStudyGenClick=()=>{
        alert("Generate Case Study Flow")
    }

    const analyzeClick=()=>{
        setShowAnalyzeModal(true)
    }

    const caseStudyGen = {
        "iconPath" : "/assets/svgs/case-study-ai-home.svg",
        "title" : "Case Study Generator",
        "description" : "Get detailed case studies in seconds—just answer a few questions, and AI handles the rest.",
        "onClick" : caseStudyGenClick
    }

    const analyzeGen = {
        "iconPath" : "/assets/svgs/analyze-ai-home.svg",
        "title" : "Analyze Case Study",
        "description" : "Compare your case studies to top ones from Google, Meta, and more to see how you measure up and improve.",
        "onClick" : analyzeClick
    }

return (
    <motion.div
        className="flex flex-col gap-4 md:gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
    >
        <h3 className="text-xxl md:text-3xl text-center font-satoshi font-bold text-landing-card-heading-color">
            More Free AI tools to 
        </h3>

        <h3 className="text-xxl md:text-3xl text-center font-satoshi font-bold text-landing-card-heading-color">
            land your dream job 👇🏼
        </h3>

        <p className="text-center text-landing-card-description-color text-m font-medium mb-6">
            Your dream career is closer than you think
        </p>

        <div className="flex flex-col gap-4 md:flex-row md:gap-6">
            <Card> <CardContent obj={caseStudyGen}></CardContent></Card>
            <Card><CardContent obj={analyzeGen}></CardContent></Card>
        </div>

{ showAnalyzeModel && <AnalyzeCaseStudyTruncated setShowModal={setShowAnalyzeModal} suggestions={[]} rating={""}></AnalyzeCaseStudyTruncated>}

    </motion.div>
);
}

export default AiToolsHomePage;
