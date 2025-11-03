import React from "react";
import HeroBanner from "./heroBanner";
import About from "./About";
import Footer from "./footer-old";
import TrustedBy from "./trustedBy";
import AiToolsSection from "./aiToolsSection";
import SpotlightUsers from "./spotlight";

export default function Home({ dfToken }) {
    return (
        <div className="md:mt-20">
            <HeroBanner dfToken={dfToken} />
            <div
                className={`max-w-[1192px] mx-auto mt-[75px] xl:mt-[180px]`}
                id="trusted-by"
            >
                <TrustedBy />
            </div>
            <div
                className={`max-w-[1192px] mx-auto mt-[75px] xl:mt-[115px]`}
                id="how-it-works"
            >
                <About />
            </div>
            <AiToolsSection />

            <div className={` mx-auto mt-[75px] xl:mt-[115px]`}>
                <SpotlightUsers />
            </div>

            <Footer dfToken={dfToken} />
        </div>
    );
}
