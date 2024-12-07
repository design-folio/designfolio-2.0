import React, { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import Lottie from "lottie-react";
import claimUrl from "../../public/lottie/claimurl.json";
import aboutJson from "../../public/lottie/about.json";
import casestudyJson from "../../public/lottie/casestuddy.json";
import publishButtonJson from "../../public/lottie/publishbutton.json";
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
  <div className="flex pt-[20px] space-x-[60px]">
    <img src="/assets/svgs/google-trust.svg" alt="Google" className="w-36 h-36" />
    <img src="/assets/svgs/cisco-trust.svg" alt="Cisco" className="w-36 h-36" />
    <img src="/assets/svgs/phonepe-trust.svg" alt="PhonePe" className="w-36 h-36" />
    <img src="/assets/svgs/ola-trust.svg" alt="Ola" className="w-36 h-36" />
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
