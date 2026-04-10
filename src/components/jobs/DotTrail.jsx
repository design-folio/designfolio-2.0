import { motion } from "framer-motion";

export function DotTrail({ current, total }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          className="rounded-full bg-foreground"
          animate={{
            width: i === current ? 20 : 6,
            opacity: i < current ? 0.25 : i === current ? 1 : 0.12,
          }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          style={{ height: 6 }}
        />
      ))}
    </div>
  );
}
