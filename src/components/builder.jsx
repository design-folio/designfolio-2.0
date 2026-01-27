import React from "react";
import Profile from "./profile";
import Projects from "./Projects";
import Reviews from "./reviews";
import { useGlobalContext } from "@/context/globalContext";
import Tools from "./tools";
import Works from "./works";
// import Others from "./others";
import PortfolioFooter from "./portfolioFooter";
import { motion } from "framer-motion";
import { sidebars, DEFAULT_SECTION_ORDER, normalizeSectionOrder } from "@/lib/constant";
// import AboutMe from "./aboutMe";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1, // Children animations start at the same time but staggered
      type: "spring",
    },
  },
};

const itemVariants = {
  hidden: { y: 50 }, // Starting position of children below their final position
  visible: {
    y: 0, // Final position of children
    transition: {
      type: "spring",
      stiffness: 180, // Smoothness adjusted
      damping: 15, // Controlled bounciness
      duration: 0.4, // Duration of each child's animation
    },
  },
};

export default function Builder() {
  const {
    projectRef,
    userDetails,
    setUserDetails,
    setSelectedProject,
    openModal,
    openSidebar,
    updateCache,
  } = useGlobalContext();

  // Get section order from userDetails or use default
  const sectionOrder = normalizeSectionOrder(userDetails?.sectionOrder, DEFAULT_SECTION_ORDER);

  // Wrapper function that routes work/review to openSidebar, others to openModal
  const handleOpen = (type) => {
    if (type === sidebars.work || type === sidebars.review) {
      openSidebar(type);
    } else {
      openModal(type);
    }
  };

  // Section component mapping
  const sectionComponents = {
    /*
    about: (
      <AboutMe edit userDetails={userDetails} openModal={openModal} />
    ),
    */
    projects: (
      <Projects
        edit
        userDetails={userDetails}
        projectRef={projectRef}
        setUserDetails={setUserDetails}
        setSelectedProject={setSelectedProject}
        openModal={openModal}
      />
    ),
    reviews: (
      <Reviews
        edit
        openModal={handleOpen}
        userDetails={userDetails}
      />
    ),
    tools: (
      <Tools userDetails={userDetails} openModal={openModal} edit />
    ),
    works: (
      <Works
        edit
        openSidebar={handleOpen}
        userDetails={userDetails}
        setUserDetails={setUserDetails}
        updateCache={updateCache}
      />
    ),
  };

  return (
    <motion.div
      className="flex-1 flex flex-col gap-3"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <Profile edit userDetails={userDetails} openModal={openModal} />
      </motion.div>
      {sectionOrder.map((sectionId) => (
        <motion.div
          key={sectionId}
          id={`section-${sectionId}`}
          variants={itemVariants}
        >
          {sectionComponents[sectionId]}
        </motion.div>
      ))}
      {/* Old Footer - Commented out */}
      {/* <motion.div variants={itemVariants}>
        <Others edit openModal={openModal} userDetails={userDetails} />
      </motion.div> */}
      
      {/* New Footer */}
      <motion.div variants={itemVariants}>
        <PortfolioFooter edit openModal={openModal} openSidebar={openSidebar} userDetails={userDetails} />
      </motion.div>
    </motion.div>
  );
}
