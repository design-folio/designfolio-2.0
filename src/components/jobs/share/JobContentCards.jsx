import { motion } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const MD_COMPONENTS = {
  p: ({ children }) => (
    <p className="text-foreground/75 mb-3 text-sm leading-[1.75] last:mb-0">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="text-foreground/75 mb-3 list-disc space-y-1 pl-5 text-sm">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="text-foreground/75 mb-3 list-decimal space-y-1 pl-5 text-sm">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-[1.65]">{children}</li>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-foreground/55 hover:text-foreground underline underline-offset-2 transition-colors"
    >
      {children}
    </a>
  ),
  strong: ({ children }) => <strong className="text-foreground font-semibold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  h3: ({ children }) => (
    <h3 className="text-foreground mt-4 mb-1.5 text-sm font-semibold">{children}</h3>
  ),
  h2: ({ children }) => (
    <h2 className="text-foreground mt-4 mb-2 text-sm font-semibold">{children}</h2>
  ),
  h1: ({ children }) => (
    <h1 className="text-foreground mt-4 mb-2 text-base font-semibold">{children}</h1>
  ),
};

export function JobDescriptionCard({ description, delay = 0.06 }) {
  if (!description) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay }}
      className="rounded-2xl border border-black/[0.05] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:border-[#302B28] dark:bg-[#28231E] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
    >
      <h2 className="text-foreground/40 mb-4 text-[11px] font-semibold tracking-widest uppercase">
        About the role
      </h2>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD_COMPONENTS}>
        {description}
      </ReactMarkdown>
    </motion.div>
  );
}
