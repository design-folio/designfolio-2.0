import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import EmailForm from "./emailForm";
import EmailPreview from "./emailPreview";
import TetrisLoading from "./ui/tetris-loader";
import { toast } from "react-toastify";
import { getAiToolResult, setAiToolResult } from "@/lib/ai-tools-usage";

const RESULT_STORAGE_KEY = "email-generator";

export default function EmailGenerator({ onToolUsed, onViewChange, guestUsageLimitReached = false }) {
  const [generatedEmail, setGeneratedEmail] = useState({
    subject: "",
    body: "",
  });
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const stored = getAiToolResult(RESULT_STORAGE_KEY);
    if (stored && typeof stored === "object" && (stored.subject || stored.body)) {
      setGeneratedEmail({ subject: stored.subject || "", body: stored.body || "" });
      setShowPreview(true);
      onViewChange?.(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    onViewChange?.(!!(generatedEmail.subject || generatedEmail.body));
  }, [generatedEmail, onViewChange]);

  const [isGenerating, setIsGenerating] = useState(false);
  const generateEmailContent = async (formData) => {
    if (guestUsageLimitReached) {
      toast.error("You've already used this tool once. Sign up to generate more emails.");
      return;
    }
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to generate email");
      }
      const result = { subject: data.subject, body: data.body };
      setGeneratedEmail(result);
      setAiToolResult(RESULT_STORAGE_KEY, result);
      setShowPreview(true);
      onToolUsed?.();
    } catch (error) {
      toast.error(error?.message || "Failed to generate email");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    const fullEmail = `Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`;
    navigator.clipboard.writeText(fullEmail);
    toast.success("Your email has been copied to your clipboard.");
  };

  return (
    <AnimatePresence mode="wait">
      {isGenerating ? (
        <motion.div
          key="generating"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="flex flex-col items-center justify-center py-4 space-y-6"
        >
          <div className="flex flex-col items-center">
            <TetrisLoading size="sm" speed="fast" loadingText="Drafting your email..." />
          </div>
        </motion.div>
      ) : showPreview && (generatedEmail.subject || generatedEmail.body) ? (
        <motion.div
          key="preview"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full space-y-6"
        >
          <EmailPreview
            generatedEmail={generatedEmail}
            handleCopy={handleCopy}
            onEditDetails={() => setShowPreview(false)}
          />
        </motion.div>
      ) : (
        <motion.div
          key="form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          <EmailForm
            generateEmailContent={generateEmailContent}
            isGenerating={isGenerating}
            disableGenerate={guestUsageLimitReached}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
