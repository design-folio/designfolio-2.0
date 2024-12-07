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
      className={`${className} p-[16px] md:p-[32px] transition-all duration-700 ease-out`}
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? "none" : "translateY(80px)",
        transition: `all 0.2s cubic-bezier(0.17, 0.55, 0.55, 1) ${adjustedDelay}s`,
      }}
    >

<div className="flex flex-col items-center">
  <Text size="p-small" className="text-landing-description-text-color font-satoshi font-semibold leading-[1.2] text-center">
    Trusted by Design, Dev, and Product teams across
  </Text>

  {/* SVGs */}
  <div className="flex flex-col md:flex-row items-center pt-[5px] md:pt-[20px] space-y-[10px] md:space-y-0 md:space-x-[80px]">
    <img src="/assets/svgs/google-trust.svg" alt="Google" className="w-24 h-24" />
    <img src="/assets/svgs/cisco-trust.svg" alt="Cisco" className="w-24 h-24" />
    <img src="/assets/svgs/phonepe-trust.svg" alt="PhonePe" className="w-36 h-24" />
    <img src="/assets/svgs/ola-trust.svg" alt="Ola" className="w-24 h-24" />
  </div>
</div>


        
    </section>
  );
};

// Main Component
export default function TrustedBy() {
  return (
      <AnimatedSection
        className="p-2 md:p-6"
      >
      </AnimatedSection>
  );
}
