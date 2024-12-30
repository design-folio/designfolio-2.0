import React from "react";
import HeroBanner from "./heroBanner";
import About from "./About";
import Footer from "./footer";
import TrustedBy from "./trustedBy";
import AiToolsSection from "./aiToolsSection";

export default function Home({ dfToken }) {
  return (
    <div className="md:mt-20">
      <HeroBanner dfToken={dfToken} />

      <div
        className={`max-w-[1192px] mx-auto mt-[33px] xl:mt-[90px]`}
        id="trusted-by"
      >
        <TrustedBy />
      </div>

      <div
        className={`max-w-[1192px] mx-auto mt-[33px] xl:mt-[115px]`}
        id="how-it-works"
      >
        <About />
      </div>
      <AiToolsSection />
      <Footer dfToken={dfToken} />
    </div>
  );
}
