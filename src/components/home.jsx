import React from "react";
import TrustedBySection from "./trustedBySection";
import Footer from "./footer";;
import HeroSection from "./heroSection";
import EmailMockup from "./emailMockup";
import ScrollingBanner from "./scrollingBanner";
import FooterBottom from "./footerBottom";
import FeaturesSection from "./featuresSection";
import FeaturesShowcase from "./featuresShowcase";

export default function Home({ dfToken }) {
  return (
    <React.Fragment>
      <HeroSection dfToken={dfToken} />
      <EmailMockup />
      <TrustedBySection />
      <FeaturesSection />
      <FeaturesShowcase />
      <Footer />
      <FooterBottom />
      <ScrollingBanner />
    </React.Fragment>

  );
}
