import React from "react";
import HeroBanner from "./heroBanner";
import About from "./About";
import Footer from "./footer";

export default function Home({ dfToken }) {
  return (
    <div className="md:mt-20">
      <HeroBanner dfToken={dfToken} />
      <div
        className={`max-w-[1192px] mx-auto mt-[66px] xl:mt-[180px]`}
        id="how-it-works"
      >
        <About />
      </div>
      <Footer dfToken={dfToken} />
    </div>
  );
}
