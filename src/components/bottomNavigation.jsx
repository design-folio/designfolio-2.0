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
  const lastScrollY = useRef(0);
  const { projectRef } = useGlobalContext();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY || window.pageYOffset;
      const scrollThreshold = 10; // Minimum scroll distance to trigger hide/show

      if (currentScrollY < scrollThreshold) {
        // At the top, always show
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY.current + scrollThreshold) {
        // Scrolling down
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY.current - scrollThreshold) {
        // Scrolling up
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleHomeNavigation = () => {
    setIsProject(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleProjectNavigation = () => {
    if (projectRef.current) {
      setIsProject(true);
      const elementTop = projectRef.current.getBoundingClientRect().top;
      const offset = 20; // Adjust the offset as needed
      const scrollTop = window.scrollY || window.pageYOffset; // For compatibility
      const top = elementTop + scrollTop - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <motion.div
      className={`bg-gradient-to-b from-transparent px-2  to-df-bg-color fixed bottom-0 left-0 right-0 h-[90px] lg:h-[102px] overflow-hidden  z-10 ${className}`}
      initial={{ y: 0 }}
      animate={{ y: isVisible ? 0 : 100 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {!router?.asPath?.includes("project") && (
        <motion.div
          className="bg-df-section-card-bg-color rounded-[24px] shadow-bottom  p-1 w-fit max-w-[400px] md:max-w-[450px] m-auto flex items-center relative gap-4"
          initial={{ opacity: 0 }} // Start fully transparent
          animate={{ opacity: 1 }} // Animate to fully visible
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
            <a href={userDetails?.resume?.url} download={true} target="_blank">
              <Button
                text={window?.innerWidth > 500 ? "Download resume" : "Resume"}
                customClass=""
              />
            </a>
          )}
        </motion.div>
      )}
      {!userDetails?.pro && (
        <div
          className={`text-center flex justify-center relative top-5 lg:absolute lg:right-[36px] lg:top-[10px] xl:block cursor-pointer `}
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
