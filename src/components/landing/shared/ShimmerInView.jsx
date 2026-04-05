import { motion } from "framer-motion";

/**
 * Wraps the quoted portion of `text` in a shimmer gradient animation
 * triggered when the element scrolls into view.
 *
 * Usage: <ShimmerInView text='Use AI as a "co-pilot".' />
 * The part between double-quotes gets the shimmer.
 */
export default function ShimmerInView({ text }) {
  if (!text.includes('"')) return <>{text}</>;

  const parts = text.split('"');

  return (
    <>
      {parts[0]}
      <motion.span
        initial={{ backgroundPosition: "100% center" }}
        whileInView={{ backgroundPosition: "0% center" }}
        viewport={{ once: true, margin: "0px 0px -20% 0px" }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        className="text-transparent bg-clip-text inline-block"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--lp-text) 0%, var(--lp-text) 30%, #5D3560 40%, #E54D2E 50%, #F5A623 60%, var(--lp-text) 70%, var(--lp-text) 100%)",
          backgroundSize: "300% auto",
        }}
      >
        {parts[1]}
      </motion.span>
      {parts[2]}
    </>
  );
}
