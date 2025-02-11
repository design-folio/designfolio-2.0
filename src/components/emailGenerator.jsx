import React, { useState } from "react";
import Text from "./text";
import EmailForm from "./emailForm";
import EmailPreview from "./emailPreview";
import { generateEmail } from "@/lib/gemini";
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
      const result = await generateEmail(formData);
      setGeneratedEmail(result);
    } catch (error) {
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
    <div>
      <Text size="p-large" className="text-center text-[#202937] font-satoshi">
        AI Email Generator for Job Seekers
      </Text>
      <Text
        size="p-small"
        className="text-center text-[#475569] font-medium mt-4"
      >
        Get personalized emails for any situation—ready to send or tweak.{" "}
      </Text>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-y-4 lg:gap-4 mt-10 h-full">
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 h-full">
          <EmailForm
            generateEmailContent={generateEmailContent}
            isGenerating={isGenerating}
          />
        </div>

        <div className="col-span-2  bg-white border border-[#E5E7EB] rounded-2xl p-6 h-full">
          <EmailPreview
            generatedEmail={generatedEmail}
            isGenerating={isGenerating}
            handleCopy={handleCopy}
          />
        </div>
      </div>
    </div>
  );
}
