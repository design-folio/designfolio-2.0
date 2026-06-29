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
      <div className="mb-12 text-center">
        <Text
          as="h2"
          size="section-heading"
          className="text-landing-card-heading-color text-center leading-[46px]"
        >
          Created with Designfolio
        </Text>

        <Text className="text-foreground/60 text-center text-sm font-normal sm:mt-4 sm:text-base md:text-lg">
          Explore some of the portfolios powered by Designfolio
        </Text>
        {/* Desktop View */}
        <div
          ref={scrollRef}
          className="mt-[56px] hidden [transform:translateZ(0)] gap-6 overflow-x-hidden will-change-transform [backface-visibility:hidden] md:flex"
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
