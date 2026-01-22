import React, { useEffect, useRef, useState } from "react";
import SpotlightUsersDesktop from "./spotlightUserDesktop";
import Text from "./text";
import SpotlightUsersMobile from "./spotlightUsersMobile";

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

  const projects = [
    {
      title: "Redefining the experience for Magenta",
      projectUrl:
        "https://utkarshbafana.designfolio.me/project/66294daa1c7b671af548aeef",
      imageSrc: "/assets/png/project4.png",
    },
    {
      title: "Unlocking mental wellness: Zenly's journey",
      projectUrl:
        "https://payalhora.designfolio.me/project/664f3fdbdd8889344def2129",
      imageSrc: "/assets/png/project2.jpg",
    },
    {
      title:
        "Boosting user trust & task completion by optimizing doctor video call scheduling, reducing drop-offs",
      projectUrl:
        "https://swati.designfolio.me/project/668693af389ca972e6170b71",
      imageSrc: "/assets/png/project3.png",
    },
    {
      title:
        "Redesigning Quote Builder at Freshworks for 1,900+ Enterprise Users",
      projectUrl:
        "https://shai.designfolio.me/project/67960f7f82a7f254b87ca209",
      imageSrc: "/assets/png/project1.png",
    },
    {
      title:
        "Designfolio: No-Code Portfolio Builder for 9,000+ Users (An Idea I Brought to Life)",
      description: "IoT device management made simple",
      projectUrl:
        "https://shai.designfolio.me/project/6797424882a7f254b87db4a8",
      imageSrc: "/assets/png/project5.png",
    },
  ];
  return (
    <div>
      <div className="text-center mb-12">
        <h2
          className="text-center font-gsans font-semibold text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-5xl leading-[46px] text-landing-card-heading-color "
        >
          Created with Designfolio
        </h2>



        <Text className="text-center mt-4 text-sm sm:text-base md:text-lg text-foreground/60 font-normal">
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
