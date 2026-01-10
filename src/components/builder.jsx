import React from "react";
import Profile from "./profile";
import Projects from "./Projects";
import Reviews from "./reviews";
import { useGlobalContext } from "@/context/globalContext";
import Tools from "./tools";
import Works from "./works";
import Others from "./others";
import { motion } from "framer-motion";
import { sidebars } from "@/lib/constant";

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

  // Wrapper function that routes work/review to openSidebar, others to openModal
  const handleOpen = (type) => {
    if (type === sidebars.work || type === sidebars.review) {
      openSidebar(type);
    } else {
      openModal(type);
    }
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
      <motion.div variants={itemVariants}>
        <Projects
          edit
          userDetails={userDetails}
          projectRef={projectRef}
          setUserDetails={setUserDetails}
          setSelectedProject={setSelectedProject}
          openModal={openModal}
        />
      </motion.div>
      <motion.div variants={itemVariants}>
        <Reviews
          edit
          openModal={handleOpen}
        />
      </motion.div>
      <motion.div variants={itemVariants}>
        <Tools userDetails={userDetails} openModal={openModal} edit />
      </motion.div>
      <motion.div variants={itemVariants}>
        <Works
          edit
          openSidebar={handleOpen}
          userDetails={userDetails}
          setUserDetails={setUserDetails}
          updateCache={updateCache}
        />
      </motion.div>
      <motion.div variants={itemVariants}>
        <Others edit openModal={openModal} userDetails={userDetails} />
      </motion.div>
    </motion.div>
  );
}
