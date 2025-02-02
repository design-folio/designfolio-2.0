import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useRouter } from "next/router";

export const WorkShowcase = ({ userDetails }) => {
  const { projects } = userDetails || {};
  const router = useRouter();

  const containerVariants = {
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

  // Custom IntersectionObserver for Next.js Page Router
  const [inView, setInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      }
      // { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  const handleNavigation = (id) => {
    router.push(`/project/${id}`);
  };

  // Image Component with Loading State
  const ImageWithPreload = ({ src, alt }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
      <div className="relative w-full h-full">
        {!isLoaded && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 bg-secondary/50"
          />
        )}
        <motion.img
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.4 }}
          src={src}
          alt={alt}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          loading="eager"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
        />
      </div>
    );
  };

  // Project Card Component
  const ProjectCard = ({ project }) => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const cardRef = useRef(null);

    const handleMouseMove = (e) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    return (
      <motion.div
        variants={itemVariants}
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onClick={() => handleNavigation(project?._id)}
        className="group rounded-3xl bg-card overflow-hidden relative shadow-lg"
      >
        {/* Hover effect */}
        <div
          className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,.1), transparent 40%)`,
          }}
        />
        {/* Project Image */}
        <div className="aspect-[4/3] overflow-hidden bg-secondary/50 relative">
          <ImageWithPreload src={project?.thumbnail?.url} alt={project.title} />
          {/* Project Link */}
          <a
            href={project.link}
            className="absolute top-6 right-6 size-14 rounded-full bg-tertiary flex items-center justify-center opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 hover:bg-tertiary-hover"
          >
            <ArrowUpRight className="size-6 text-white" />
          </a>
        </div>
        {/* Project Info */}
        <div className="p-8 pb-10">
          <h3 className="text-2xl font-semibold mb-3 leading-tight">
            {project.title}
          </h3>
          <p className="text-gray-400 line-clamp-2">{project.description}</p>
        </div>
      </motion.div>
    );
  };

  return (
    <section className="pt-0 pb-16">
      <h2 className="text-2xl font-bold mb-8">Featured Projects</h2>
      <motion.div
        ref={ref}
        variants={containerVariants}
        initial="hidden"
        animate={inView ? "show" : "hidden"}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {projects.map((project, index) => (
          <ProjectCard key={index} project={project} />
        ))}
      </motion.div>
    </section>
  );
};

export default WorkShowcase;
