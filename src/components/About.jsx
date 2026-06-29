import React, { useRef, useState } from "react";
import { useInView } from "motion/react";
import dynamic from "next/dynamic";
import claimUrl from "../../public/lottie/claimurl.json";
import aboutJson from "../../public/lottie/about.json";
import casestudyJson from "../../public/lottie/casestuddy.json";
import publishButtonJson from "../../public/lottie/publishbutton.json";
const Lottie = dynamic(() => import("lottie-react"), {
  ssr: false,
  loading: () => <></>,
});

// Section Component with CSS Transitions
const AnimatedSection = ({ children, animationData, className, delay }) => {
  const [width] = useState(() => (typeof window !== "undefined" ? window.innerWidth : 0));
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const adjustedDelay = width < 768 ? 0.3 : delay;

  return (
    <section
      ref={ref}
      className={`${className} rounded-[16px]! border-[6px] border-solid p-[16px] transition-all duration-700 ease-out md:p-[32px]`}
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? "none" : "translateY(80px)",
        transition: `all 0.2s cubic-bezier(0.17, 0.55, 0.55, 1) ${adjustedDelay}s`,
      }}
    >
      <div className="bg-landing-card-step-bg-color text-landing-card-step-text-color border-landing-card-step-border-color border-df-secondary-600 w-fit rounded-[16px] border-[3px] border-solid bg-white p-2 px-4 py-[10px] text-[14px] font-[600] shadow-sm">
        {children.stepLabel}
      </div>
      <div className="mt-4">
        <h3 className="font-satoshi text-landing-card-heading-color text-xl font-bold md:text-2xl">
          {children.title}
        </h3>
        <p className="text-landing-card-description-color mb-6 text-sm font-medium">
          {children.description}
        </p>
        <Lottie animationData={animationData} loop autoplay style={{ maxWidth: "100%" }} />
      </div>
    </section>
  );
};

// Main Component
export default function About() {
  return (
    <div className="grid w-full gap-6 px-4 md:grid md:grid-cols-2 md:grid-rows-3 md:gap-10 md:px-0">
      <AnimatedSection
        animationData={claimUrl}
        className="bg-landing-card-bg-color border-landing-card-border-color rounded-md border-6 border-solid p-4 md:p-8"
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
        className="bg-landing-card-bg-color border-landing-card-border-color row-span-2 rounded-md border-6 border-solid p-4 md:p-8"
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
        className="bg-landing-card-bg-color border-landing-card-border-color row-span-2 rounded-md border-6 border-solid p-4 md:p-8"
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
        className="bg-landing-card-bg-color border-landing-card-border-color rounded-md border-6 border-solid p-4 md:p-8"
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
