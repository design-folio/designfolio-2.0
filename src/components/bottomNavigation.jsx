import { useGlobalContext } from "@/context/globalContext";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import FolderIcon from "../../public/assets/svgs/folder.svg";
import HomeIcon from "../../public/assets/svgs/home.svg";
import MadeWithDesignfolio from "../../public/assets/svgs/madewithdesignfolio.svg";
import { useState, useEffect, useRef } from "react";
import Button from "./button";

export default function BottomNavigation({
  userDetails,
  className = "",
  watermarkClassName = "",
}) {
  const router = useRouter();
  const [isProject, setIsProject] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastY = useRef(0);

  const { projectRef } = useGlobalContext();

  useEffect(() => {
    let lastWheelEventTime = 0;
    let lastGestureDirection = null; // "up" or "down"

    const onWheel = (e) => {
      const now = performance.now();

      // Ignore momentum: if less than 80ms since last wheel, it's inertia
      const isMomentum = now - lastWheelEventTime < 80;
      lastWheelEventTime = now;

      if (!isMomentum) {
        if (e.deltaY < 0) {
          lastGestureDirection = "up";
          setIsVisible(true); // show instantly
        } else if (e.deltaY > 0) {
          lastGestureDirection = "down";
          setIsVisible(false);
        }
      }
    };

    const onScroll = () => {
      const y = window.scrollY;
      const diff = y - lastY.current;

      const atTop = y < 10;
      const atBottom =
        window.innerHeight + y >=
        (document.documentElement.scrollHeight ||
          document.body.scrollHeight) - 10;

      if (atTop || atBottom) {
        setIsVisible(true);
      } else {
        if (diff > 2) setIsVisible(false);
        if (diff < -2) setIsVisible(true);
      }

      lastY.current = y;
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);


  const handleHomeNavigation = () => {
    setIsProject(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleProjectNavigation = () => {
    if (projectRef.current) {
      setIsProject(true);
      const elementTop = projectRef.current.getBoundingClientRect().top;
      const offset = 20;
      const scrollTop = window.scrollY || window.pageYOffset;
      const top = elementTop + scrollTop - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <motion.div
      className={`bg-gradient-to-b from-transparent px-2 to-df-bg-color fixed bottom-0 left-0 right-0 h-[75px] lg:h-[100px] overflow-hidden z-10 ${className}`}
      animate={{ y: isVisible ? 0 : 100 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
    >
      {!router?.asPath?.includes("project") && (
        <motion.div
          className="bg-df-section-card-bg-color border border-bottom-navigation-border rounded-[24px] shadow-bottom p-1 w-fit max-w-[400px] md:max-w-[450px] m-auto flex items-center relative gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Button
            icon={
              <HomeIcon
                className={`${!isProject
                  ? "text-bottom-navigation-active-stroke hover:text-bottom-navigation-active-stroke"
                  : "text-bottom-navigation-inactive-stroke hover:text-bottom-navigation-inactive-stroke"
                  } cursor-pointer`}
              />
            }
            size="medium"
            type="normal"
            customClass={`${!isProject
              ? "bg-bottom-navigation-active-fill hover:bg-bottom-navigation-active-fill"
              : "bottom-navigation-inactive-fill hover:bg-bottom-navigation-inactive-fill"
              }`}
            onClick={handleHomeNavigation}
          />

          {userDetails?.projects?.length != 0 && (
            <Button
              onClick={handleProjectNavigation}
              icon={
                <FolderIcon
                  className={`${isProject
                    ? "text-bottom-navigation-active-stroke hover:text-bottom-navigation-active-stroke"
                    : "text-bottom-navigation-inactive-stroke hover:text-bottom-navigation-inactive-stroke"
                    } cursor-pointer`}
                />
              }
              size="medium"
              type="normal"
              customClass={`${isProject
                ? "bg-bottom-navigation-active-fill hover:bg-bottom-navigation-active-fill"
                : "bottom-navigation-inactive-fill hover:bg-bottom-navigation-inactive-fill"
                }`}
            />
          )}

          {!!userDetails?.resume?.url && (
            <a href={userDetails?.resume?.url} download target="_blank">
              <Button
                text={
                  typeof window !== "undefined" && window.innerWidth > 500
                    ? "Download resume"
                    : "Resume"
                }
              />
            </a>
          )}
        </motion.div>
      )}

      {!userDetails?.pro && (
        <div
          className="hidden text-center lg:flex justify-center relative top-5 lg:absolute lg:right-[36px] lg:top-[10px] xl:block cursor-pointer"
          onClick={() => window.open("https://www.designfolio.me", "_blank")}
        >
          <div className="bg-df-section-card-bg-color shadow-df-section-card-shadow p-2 rounded-2xl">
            <MadeWithDesignfolio className="text-df-icon-color" />
          </div>
        </div>
      )}
    </motion.div>
  );
}
