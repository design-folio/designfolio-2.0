import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const MD_COMPONENTS = {
  p:      ({ children }) => <p className="text-sm text-foreground/75 leading-[1.75] mb-3 last:mb-0">{children}</p>,
  ul:     ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1 text-sm text-foreground/75">{children}</ul>,
  ol:     ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1 text-sm text-foreground/75">{children}</ol>,
  li:     ({ children }) => <li className="leading-[1.65]">{children}</li>,
  a:      ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="underline underline-offset-2 text-foreground/55 hover:text-foreground transition-colors">
      {children}
    </a>
  ),
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  em:     ({ children }) => <em className="italic">{children}</em>,
  h3:     ({ children }) => <h3 className="text-sm font-semibold text-foreground mt-4 mb-1.5">{children}</h3>,
  h2:     ({ children }) => <h2 className="text-sm font-semibold text-foreground mt-4 mb-2">{children}</h2>,
  h1:     ({ children }) => <h1 className="text-base font-semibold text-foreground mt-4 mb-2">{children}</h1>,
};

export function JobDescriptionCard({ description, delay = 0.06 }) {
  if (!description) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay }}
      className="bg-white dark:bg-[#28231E] rounded-2xl border border-black/[0.05] dark:border-[#302B28] shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)] p-6"
    >
      <h2 className="text-[11px] font-semibold text-foreground/40 uppercase tracking-widest mb-4">
        About the role
      </h2>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD_COMPONENTS}>
        {description}
      </ReactMarkdown>
    </motion.div>
  );
}
