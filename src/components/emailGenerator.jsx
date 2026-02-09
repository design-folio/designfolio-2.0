import React, { useState } from "react";
import Text from "./text";
import EmailForm from "./emailForm";
import EmailPreview from "./emailPreview";
import { toast } from "react-toastify";

export default function EmailGenerator() {
  const [generatedEmail, setGeneratedEmail] = useState({
    subject: "",
    body: "",
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const generateEmailContent = async (formData) => {
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
      setGeneratedEmail({ subject: data.subject, body: data.body });
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
