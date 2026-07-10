import { motion } from "motion/react";
import { useEffect, useState, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import Button from "@/components/button";
import PlusIcon from "../../../../public/assets/svgs/plus.svg";
import { useGlobalContext } from "@/context/globalContext";
import { sidebars } from "@/lib/constant";
import { cn } from "@/lib/utils";

export const SpotlightToolsSection = ({ userDetails, edit, titleClasses, headerActions }) => {
  const isMobile = useIsMobile();
  const { tools } = userDetails || {};
  const { openSidebar } = useGlobalContext();

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
    const node = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !inView) {
          setInView(entry.isIntersecting);
        }
      },
      { threshold: 0.5 }
    );

    if (node) {
      observer.observe(node);
    }

    return () => {
      if (node) {
        observer.unobserve(node);
      }
    };
  }, [inView]);

  return (
    <section className="overflow-hidden py-12">
      <div className="mb-8 flex items-center justify-between">
        <h2 className={cn("text-scaled-24 font-bold", titleClasses)}>Tool Stack</h2>
        {headerActions && <div className="shrink-0">{headerActions}</div>}
      </div>
      {isMobile ? (
        <div
          className="relative w-full"
          style={{
            opacity: 1,
            maskImage:
              "linear-gradient(to right, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 12.5%, rgb(0, 0, 0) 87.5%, rgba(0, 0, 0, 0) 100%)",
          }}
        >
          <motion.div className="flex gap-4 px-4" animate={scrollAnimation}>
            {scrollTools.map((tool, index) => (
              <div key={index} className="flex min-w-[100px] flex-col items-center gap-2">
                <div className="bg-card hover:bg-card/80 flex items-center justify-center rounded-2xl p-4 transition-colors">
                  <img src={tool.image} className="w-8" alt={tool.name} />
                </div>
                <span className="text-scaled-14 whitespace-nowrap">{tool.name}</span>
              </div>
            ))}
          </motion.div>
        </div>
      ) : (
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="flex flex-wrap justify-center gap-4"
        >
          {tools.map((tool, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.2, y: -8 }}
              className="group relative hover:z-50"
            >
              <div className="bg-card hover:bg-card/80 flex items-center justify-center rounded-2xl p-4 transition-colors">
                <img
                  src={tool.image ? tool.image : "/assets/svgs/default-tools.svg"}
                  className="w-8"
                  alt={tool.label || tool.name || ""}
                />
              </div>
              <div className="text-scaled-14 absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 transition-opacity group-hover:opacity-100">
                {tool.label}
              </div>
            </motion.div>
          ))}
          {edit && (
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.2, y: -8 }}
              className="group relative"
            >
              <Button
                type="secondary"
                size="icon"
                icon={
                  <PlusIcon className="text-secondary-btn-text-color h-[32px] w-[32px] cursor-pointer" />
                }
                onClick={() => openSidebar(sidebars.tools)}
              />
              <div className="text-scaled-14 absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 transition-opacity group-hover:opacity-100">
                Edit
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </section>
  );
};
