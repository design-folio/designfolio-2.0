import React, { useState } from "react";
import TrustedBySection from "./trustedBySection";
import Footer from "./footer";
import HeroSection from "./heroSection";
import EmailMockup from "./emailMockup";
import ScrollingBanner from "./scrollingBanner";
import FooterBottom from "./footerBottom";
import FeaturesSection from "./featuresSection";
import FeaturesShowcase from "./featuresShowcase";
import AiToolsSection from "./aiToolsSection";
import SpotlightUsers from "./spotlight";

export default function Home({ dfToken }) {
  const [activeTab, setActiveTab] = useState("scratch");
  const [isResumeCompact, setIsResumeCompact] = useState(false);

  return (
    <React.Fragment>
      <HeroSection
        dfToken={dfToken}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onResumeCompactChange={setIsResumeCompact}
      />
      <TrustedBySection />
      {activeTab !== "resume" && <EmailMockup />}
      {activeTab === "resume" && !isResumeCompact && (
        <div className="py-0 md:py-0" aria-hidden="true" />
      )}

      <FeaturesSection />
      {/* <FeaturesShowcase /> */}
      <AiToolsSection />
      <div className={` mx-auto mt-[75px] xl:mt-[115px]`}>
        <SpotlightUsers />
      </div>
      <Footer dfToken={dfToken} />

      <FooterBottom />
      <ScrollingBanner />
    </React.Fragment>
  );
}
