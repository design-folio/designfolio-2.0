import React, { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import Text from "./text";

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
      className={`${className} px-[16px] md:px-[32px] transition-all duration-700 ease-out`}
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? "none" : "translateY(20px)",
        transition: `all 0.2s cubic-bezier(0.17, 0.55, 0.55, 1) ${adjustedDelay}s`,
      }}
    >
      <div className="flex flex-col items-center">
        <Text
          size="p-small"
          className="text-landing-heading-text-color font-satoshi font-semibold leading-[1.2] text-center"
        >
          Trusted by design & product teams
        </Text>

        {/* SVGs */}
        <div className="grid grid-cols-2 justify-items-center md:flex md:flex-row items-center pt-[5px] md:pt-[20px] gap-[10px] md:space-y-0 md:space-x-[80px]">
          <img
            src="/assets/svgs/google-trust.svg"
            alt="Google"
            className="w-24 h-24"
          />
          <img
            src="/assets/svgs/amazon-trust.svg"
            alt="Amazon"
            className="w-24 h-24"
          />
          <img
            src="/assets/svgs/swiggy-trust.svg"
            alt="Swiggy"
            className="w-36 h-24"
          />
          <img
            src="/assets/svgs/ola-trust.svg"
            alt="Ola"
            className="w-24 h-24"
          />
        </div>
      </div>
    </section>
  );
};

// Main Component
export default function TrustedBy() {
  return <AnimatedSection className="px-2 md:px-6"></AnimatedSection>;
}
