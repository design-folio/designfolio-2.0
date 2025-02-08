import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import Button from "../button";
import PlusIcon from "../../../public/assets/svgs/plus.svg";
import { useGlobalContext } from "@/context/globalContext";

export const ToolStack = ({ userDetails, edit }) => {
  const isMobile = useIsMobile();
  const { tools } = userDetails || {};
  const { openModal } = useGlobalContext();

  // Duplicate tools multiple times for smoother infinite scroll
  const scrollTools = [...tools, ...tools, ...tools];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  const scrollAnimation = {
    x: [0, -1000],
    transition: {
      x: {
        repeat: Infinity,
        repeatType: "loop",
        duration: 30,
        ease: "linear",
      },
    },
  };

  // Custom IntersectionObserver for Next.js Page Router
  const [inView, setInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !inView) {
          setInView(entry.isIntersecting);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [inView]);

  return (
    <section className="py-12 overflow-hidden">
      <h2 className="text-2xl font-bold mb-8 text-center">Tool Stack</h2>
      {isMobile ? (
        <div className="relative w-full">
          <motion.div className="flex gap-4 px-4" animate={scrollAnimation}>
            {scrollTools.map((tool, index) => (
              <div
                key={index}
                className="flex flex-col items-center gap-2 min-w-[100px]"
              >
                <div className="bg-card p-4 rounded-2xl flex items-center justify-center transition-colors hover:bg-card/80">
                  <img src={tool.image} className="w-8" />
                </div>
                <span className="text-sm whitespace-nowrap">{tool.name}</span>
              </div>
            ))}
          </motion.div>
        </div>
      ) : (
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "show" : "hidden"} // Uses IntersectionObserver-based inView state
          className="flex justify-center flex-wrap gap-4"
        >
          {tools.map((tool, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.2, y: -8 }}
              className="relative group"
            >
              <div className="bg-card p-4 rounded-2xl flex items-center justify-center transition-colors hover:bg-card/80">
                {/* <Tool.icon className="size-8" /> */}
                <img
                  src={
                    tool.image ? tool.image : "/assets/svgs/default-tools.svg"
                  }
                  className="w-8"
                />
              </div>
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-sm whitespace-nowrap">
                {tool.label}
              </div>
            </motion.div>
          ))}
          {edit && (
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.2, y: -8 }}
              className="relative group"
            >
              <Button
                type="secondary"
                icon={
                  <PlusIcon className="text-secondary-btn-text-color w-[32px] h-[32px] cursor-pointer" />
                }
                onClick={() => openModal("tools")}
                // customClass="px-[22px]"
              />{" "}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-sm whitespace-nowrap">
                Edit
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </section>
  );
};
