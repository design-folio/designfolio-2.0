import React, { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import Lottie from "lottie-react";
import claimUrl from "../../public/lottie/claimurl.json";
import aboutJson from "../../public/lottie/about.json";
import casestudyJson from "../../public/lottie/casestuddy.json";
import publishButtonJson from "../../public/lottie/publishbutton.json";

// Section Component with CSS Transitions
const AnimatedSection = ({ children, animationData, className, delay }) => {
  const [width, setWidth] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    setWidth(window?.innerWidth);
  }, []);

  const adjustedDelay = width < 768 ? 0.3 : delay;

  return (
    <section
      ref={ref}
      className={`${className}  border-[6px] border-solid  !rounded-[16px] p-[16px] md:p-[32px] transition-all duration-700 ease-out`}
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? "none" : "translateY(80px)",
        transition: `all 0.2s cubic-bezier(0.17, 0.55, 0.55, 1) ${adjustedDelay}s`,
      }}
    >
      <div className="py-[10px] px-4 text-[14px] bg-landing-card-step-bg-color text-landing-card-step-text-color border-landing-card-step-border-color font-[600] border-solid  w-fit border-[3px] border-df-secondary-600 rounded-[16px] p-2 shadow-sm bg-white">
        {children.stepLabel}
      </div>
      <div className="mt-4">
        <h3 className="text-xl md:text-2xl font-satoshi font-bold text-landing-card-heading-color">
          {children.title}
        </h3>
        <p className="text-landing-card-description-color text-sm font-medium mb-6">
          {children.description}
        </p>
        <Lottie
          animationData={animationData}
          loop
          autoplay
          style={{ maxWidth: "100%" }}
        />
      </div>
    </section>
  );
};

// Main Component
export default function About() {
  return (
    <div className="px-4 md:px-0  grid gap-6 md:grid w-full md:gap-10 md:grid-cols-2 md:grid-rows-3">
      <AnimatedSection
        animationData={claimUrl}
        className="bg-landing-card-bg-color border-6 border-solid border-landing-card-border-color rounded-md p-4 md:p-8"
        delay={0}
      >
        {{
          stepLabel: "Step 1",
          title: "First, claim your unique link",
          description: "Choose a username",
        }}
      </AnimatedSection>
      <AnimatedSection
        animationData={aboutJson}
        className="bg-landing-card-bg-color row-span-2 border-6 border-solid  border-landing-card-border-color rounded-md p-4 md:p-8"
        delay={0.1}
      >
        {{
          stepLabel: "Step 2",
          title: "Setup your profile",
          description: "Your intro can be your game-changer",
        }}
      </AnimatedSection>
      <AnimatedSection
        animationData={casestudyJson}
        className="bg-landing-card-bg-color row-span-2 border-6 border-solid border-landing-card-border-color rounded-md p-4 md:p-8"
        delay={0.3}
      >
        {{
          stepLabel: "Step 3",
          title: "Build your case study",
          description: "Highlight your best work",
        }}
      </AnimatedSection>
      <AnimatedSection
        animationData={publishButtonJson}
        className="bg-landing-card-bg-color border-6 border-solid  border-landing-card-border-color rounded-md p-4 md:p-8"
        delay={0.4}
      >
        {{
          stepLabel: "Step 4",
          title: "Publish your website",
          description: "Tell the world what you’re capable of",
        }}
      </AnimatedSection>
    </div>
  );
}
