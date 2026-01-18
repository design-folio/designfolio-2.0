import { useGlobalContext } from "@/context/globalContext";
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import OthersPreview from "@/components/othersPreview";
import Profile from "@/components/profile";
import Projects from "@/components/Projects";
import Reviews from "@/components/reviews";
import Tools from "@/components/tools";
import Works from "@/components/works";
import BottomLayout from "./bottomLayout";

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
      stiffness: 150, // Smoothness adjusted
      damping: 15, // Controlled bounciness
      duration: 0.5, // Duration of each child's animation
    },
  },
};

// Template-specific default section orders
const TEMPLATE_DEFAULTS = {
  0: ['projects', 'reviews', 'tools', 'works'],
};

const getDefaultSectionOrder = (template) => {
  return TEMPLATE_DEFAULTS[template] || TEMPLATE_DEFAULTS[0];
};

export default function Template1({ userDetails }) {
  const { projectRef, setCursor } = useGlobalContext();
  useEffect(() => {
    setCursor(userDetails?.cursor ? userDetails?.cursor : 0);
  }, []);

  // Get section order from userDetails or use template default
  const _raw = userDetails?.sectionOrder;
  const _defaultOrder = getDefaultSectionOrder(0);
  const _filtered = _raw && Array.isArray(_raw) && _raw.length > 0 ? _raw.filter(section => _defaultOrder.includes(section)) : null;
  const sectionOrder = _raw && Array.isArray(_raw) && _raw.length > 0 && _filtered && _filtered.length > 0
    ? _filtered
    : _defaultOrder;

  // Section component mapping
  const sectionComponents = {
    projects: userDetails?.projects?.length > 0 && (
      <motion.div variants={itemVariants} id="section-projects">
        <Projects userDetails={userDetails} projectRef={projectRef} />
      </motion.div>
    ),
    reviews: userDetails?.reviews?.length > 0 && (
      <motion.div variants={itemVariants} id="section-reviews">
        <Reviews userDetails={userDetails} />
      </motion.div>
    ),
    tools: (
      <motion.div variants={itemVariants} id="section-tools">
        <Tools userDetails={userDetails} />
      </motion.div>
    ),
    works: userDetails?.experiences?.length > 0 && (
      <motion.div variants={itemVariants} id="section-works">
        <Works userDetails={userDetails} />
      </motion.div>
    ),
  };

  return (
    <div
      className={`max-w-[890px] mx-auto pb-[120px] py-[32px] px-2 md:px-4 lg:px-0`}
    >
      <BottomLayout userDetails={userDetails}>
        <motion.div
          className="flex-1 flex flex-col gap-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <Profile userDetails={userDetails} />
          </motion.div>

          {sectionOrder.map((sectionId) => sectionComponents[sectionId])}

          {(!!userDetails?.socials?.instagram ||
            !!userDetails?.socials?.twitter ||
            !!userDetails?.socials?.linkedin ||
            !!userDetails?.portfolios?.dribbble ||
            !!userDetails?.portfolios?.notion ||
            !!userDetails?.portfolios?.behance ||
            !!userDetails?.portfolios?.medium) && (
              <motion.div variants={itemVariants}>
                <OthersPreview userDetails={userDetails} />
              </motion.div>
            )}
          <div className="mb-20"></div>
        </motion.div>
      </BottomLayout>
    </div>
  );
}
