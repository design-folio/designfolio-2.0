import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import InterViewGuru from "@/components/interViewGuru";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      type: "spring",
    },
  },
};

function InterviewTools({}) {

return (
    <motion.div
        className="flex flex-col gap-4 md:gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
    >

<div className="m-8 p-8 mt-16">
<InterViewGuru></InterViewGuru>

</div>


    </motion.div>
);
}

export default InterviewTools;
