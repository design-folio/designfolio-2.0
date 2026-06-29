import React, { useEffect, useRef, useState, startTransition } from "react";
import { useInView } from "motion/react";
import Text from "./text";

// Section Component with CSS Transitions
const AnimatedSection = ({ children, animationData, className, delay }) => {
  const [width, setWidth] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    startTransition(() => setWidth(window?.innerWidth));
  }, []);

  const adjustedDelay = width < 768 ? 0.3 : delay;

  return (
    <section
      ref={ref}
      className={`${className} px-[16px] transition-all duration-700 ease-out md:px-[32px]`}
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? "none" : "translateY(20px)",
        transition: `all 0.2s cubic-bezier(0.17, 0.55, 0.55, 1) ${adjustedDelay}s`,
      }}
    >
      <div className="flex flex-col items-center">
        <Text
          size="p-small"
          className="text-landing-heading-text-color font-satoshi text-center leading-[1.2] font-semibold"
        >
          Places we’ve already reached — humble brag
        </Text>

        {/* SVGs */}
        <div className="grid grid-cols-2 items-center justify-items-center gap-[10px] pt-[5px] md:flex md:flex-row md:space-y-0 md:space-x-[80px] md:pt-[20px]">
          <img src="/assets/svgs/google-trust.svg" alt="Google" className="h-24 w-24" />
          <img src="/assets/svgs/amazon-trust.svg" alt="Amazon" className="h-24 w-24" />
          <img src="/assets/svgs/swiggy-trust.svg" alt="Swiggy" className="h-24 w-36" />
          <img src="/assets/svgs/ola-trust.svg" alt="Ola" className="h-24 w-24" />
        </div>
      </div>
    </section>
  );
};

// Main Component
export default function TrustedBy() {
  return <AnimatedSection className="px-2 md:px-6"></AnimatedSection>;
}
