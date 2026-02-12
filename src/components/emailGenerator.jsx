import React, { useState, useEffect } from "react";
import Text from "./text";
import EmailForm from "./emailForm";
import EmailPreview from "./emailPreview";
import { toast } from "react-toastify";
import { getAiToolResult, setAiToolResult } from "@/lib/ai-tools-usage";

const RESULT_STORAGE_KEY = "email-generator";

export default function EmailGenerator({ onToolUsed, onViewChange, guestUsageLimitReached = false }) {
  const [generatedEmail, setGeneratedEmail] = useState({
    subject: "",
    body: "",
  });

  useEffect(() => {
    const stored = getAiToolResult(RESULT_STORAGE_KEY);
    if (stored && typeof stored === "object" && (stored.subject || stored.body)) {
      setGeneratedEmail({ subject: stored.subject || "", body: stored.body || "" });
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-4">
        <EmailForm
          generateEmailContent={generateEmailContent}
          isGenerating={isGenerating}
          disableGenerate={guestUsageLimitReached}
        />
      </div>
      <div className="flex flex-col h-full">
        <EmailPreview
          generatedEmail={generatedEmail}
          isGenerating={isGenerating}
          handleCopy={handleCopy}
        />
      </div>
    </div>
  );
}
