import React from "react";
import Text from "./text";
import GeneratorCard from "./generatorCard";

export default function AiToolsSection() {
  return (
    <div className="max-w-[1192px] mx-auto mt-[33px] xl:mt-[80px]">
      <Text
        as="h2"
        size="p-large"
        className="text-center mt-[75px] leading-[46px] text-landing-card-heading-color"
      >
        More AI tools to <br />{" "}
        <span className="ml-5">land your dream job 👇🏼</span>
      </Text>
      <Text className="text-center mt-4 text-landing-card-description-color !text-[18px]">
        Your dream career is closer than you think
      </Text>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4  lg:gap-8 mt-[56px] w-[90%] m-auto">
        {/* <GeneratorCard
          title="AI Mock Interview"
          src={"/assets/svgs/aiMock.svg"}
          description={"Land Your Dream Job with 100% Confidence"}
          buttonText="Begin Mock Interview"
          route="/login"
        /> */}
        <GeneratorCard
          title="Salary Negotiation Assistant"
          src={"/assets/svgs/salary-negotiate.svg"}
          description={"Learn how to negotiate and get the salary you deserve."}
          buttonText="Plan My Negotiation"
          route="/ai-tools?type=salary-negotiator"
        />
        <GeneratorCard
          title="AI Email Generator for Job Seekers"
          src={"/assets/svgs/emailGen.svg"}
          description={
            "Get personalized emails for any situation—ready to send or tweak."
          }
          route="/ai-tools?type=email-generator"
        />

        <GeneratorCard
          title="Case Study Generator"
          src={"/assets/svgs/caseStudyGen.svg"}
          description={
            "Get detailed case studies in seconds—just answer a few questions, and AI handles the rest."
          }
          buttonText="Generate My Case Study"
          route="/login"
        />
        <GeneratorCard
          title="Analyze Case Study"
          src={"/assets/svgs/analyzeCaseStudyGen.svg"}
          description={
            "Compare your case studies to top ones from Google, Meta, and more to see how you measure up and improve."
          }
          buttonText="Analyze my Case Study"
          route="/login"
        />
      </div>
    </div>
  );
}
