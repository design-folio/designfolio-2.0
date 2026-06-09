import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function CopyButton({
  content,
  copied: controlledCopied,
  onCopiedChange,
  delay = 3000,
  iconSize = 14,
  className,
  ...props
}) {
  const [internalCopied, setInternalCopied] = useState(false);
  const isControlled = controlledCopied !== undefined;
  const copied = isControlled ? controlledCopied : internalCopied;

  const handleClick = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(content);
      if (!isControlled) {
        setInternalCopied(true);
        setTimeout(() => {
          setInternalCopied(false);
          onCopiedChange?.(false, content);
        }, delay);
      }
      onCopiedChange?.(true, content);
    } catch {
      // silent
    }
  };

  return (
    <button
      onClick={handleClick}
      aria-label="Copy to clipboard"
      className={cn("relative flex items-center justify-center", className)}
      {...props}
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.div
            key="check"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="flex items-center justify-center"
          >
            <Check size={iconSize} className="text-green-500" />
          </motion.div>
        ) : (
          <motion.div
            key="copy"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="flex items-center justify-center"
          >
            <Copy size={iconSize} />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
