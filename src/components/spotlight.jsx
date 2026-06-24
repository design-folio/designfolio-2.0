import React, { useEffect, useRef, useState } from "react";
import SpotlightUsersDesktop from "./spotlightUserDesktop";
import Text from "./text";
import SpotlightUsersMobile from "./spotlightUsersMobile";
import { portfolioProjects } from "./landing/shared/portfolioData";

export default function SpotlightUsers() {
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let scrollInterval;

    const startScroll = () => {
      scrollInterval = window.setInterval(() => {
        if (!isPaused && scrollContainer) {
          scrollContainer.scrollLeft += 1;

          if (
            scrollContainer.scrollLeft >=
            scrollContainer.scrollWidth - scrollContainer.clientWidth
          ) {
            scrollContainer.scrollLeft = 0;
          }
        }
      }, 20);
    };

    startScroll();

    return () => {
      if (scrollInterval) clearInterval(scrollInterval);
    };
  }, [isPaused]);

  const projects = portfolioProjects;
  return (
    <div>
      <div className="text-center mb-12">
        <Text
          as="h2"
          size="section-heading"
          className="text-center leading-[46px] text-landing-card-heading-color"
        >
          Created with Designfolio
        </Text>

        <Text className="text-center sm:mt-4 text-sm sm:text-base md:text-lg text-foreground/60 font-normal">
          Explore some of the portfolios powered by Designfolio
        </Text>
        {/* Desktop View */}
        <div
          ref={scrollRef}
          className="hidden mt-[56px] md:flex gap-6 overflow-x-hidden [backface-visibility:hidden] [transform:translateZ(0)] will-change-transform"
        >
          {[...projects, ...projects].map((project, index) => (
            <SpotlightUsersDesktop
              key={index}
              {...project}
              onHover={(isHovering) => setIsPaused(isHovering)}
            />
          ))}
        </div>
        <SpotlightUsersMobile projects={projects} />
      </div>
    </div>
  );
}
