import { motion } from "motion/react";
import { useInView } from "motion/react";
import { useRef } from "react";

export const SideProjects = () => {
  const projects = [
    { name: "White Illustration Pack", icon: "🎨" },
    { name: "500+ Gradient Pack", icon: "🎯" },
    { name: "Case Study Template", icon: "📝" },
    { name: "Clean Portfolio Template", icon: "🎨" },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut",
        staggerChildren: 0.15,
      },
    },
  };

  const item = {
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

  const ref = useRef(null);
  const [isInView, refInView] = useInView({ once: true, rootMargin: "-100px" });

  return (
    <section className="py-16">
      <h2 className="mb-8 text-2xl font-bold">Side Projects</h2>
      <motion.div
        ref={ref}
        variants={container}
        initial="hidden"
        animate={isInView ? "show" : "hidden"}
        className="space-y-4"
      >
        {projects.map((project, index) => (
          <motion.div
            key={index}
            variants={item}
            className="bg-card hover:bg-card/80 flex cursor-pointer items-center justify-between rounded-lg p-4 shadow-[0px_0px_16.4px_0px_rgba(0,0,0,0.02)] transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{project.icon}</span>
              <span>{project.name}</span>
            </div>
            <span className="text-gray-400">→</span>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};
