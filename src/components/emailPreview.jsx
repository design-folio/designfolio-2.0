import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Label } from "@/components/ui/label";
import TetrisLoading from "@/components/ui/tetris-loader";

export default function EmailPreview({
  generatedEmail,
  isGenerating,
  handleCopy,
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="space-y-2 flex-1 flex flex-col">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-foreground ml-1">
            Preview
          </Label>
          <button
            type="button"
            onClick={handleCopy}
            disabled={isGenerating}
            className="text-sm font-medium text-foreground hover:text-foreground/80 transition-colors rounded-full px-4 py-2 border-2 border-border hover:border-foreground/20 bg-white disabled:opacity-50"
          >
            Copy to Clipboard
          </button>
        </div>
        <div className="space-y-4 flex-1">
          <AnimatePresence mode="wait">
            {isGenerating ? (
              <motion.div
                key="drafting"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="flex flex-col items-center justify-center py-8 space-y-4"
              >
                <TetrisLoading
                  size="sm"
                  speed="fast"
                  loadingText="Drafting your email..."
                />
              </motion.div>
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4 flex-1"
              >
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground ml-1">
                    Subject
                  </Label>
                  <div className="bg-white border-2 border-border rounded-2xl p-4 min-h-[60px] text-foreground">
                    {generatedEmail.subject || "Subject will appear here"}
                  </div>
                </div>
                <div className="space-y-2 flex-1 flex flex-col">
                  <Label className="text-sm font-medium text-foreground ml-1">
                    Body
                  </Label>
                  <div className="bg-white border-2 border-border rounded-2xl p-4 min-h-[200px] flex-1 whitespace-pre-wrap text-foreground">
                    {generatedEmail.body || "Body will appear here"}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
