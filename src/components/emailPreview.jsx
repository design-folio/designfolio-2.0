import React from "react";
import Text from "./text";
import Button from "./button";

export default function EmailPreview({
  generatedEmail,
  isGenerating,
  handleCopy,
}) {
  return (
    <div>
      <div className="flex justify-between items-center">
        <Text size="p-xxsmall" className="font-semibold">
          PREVIEW
        </Text>
        <Button
          text={"Copy to Clipboard"}
          type="normal"
          size="small"
          onClick={handleCopy}
        />
      </div>
      <div className="mt-8">
        <Text size={"p-xxsmall"} className="font-medium" required>
          Subject
        </Text>
        <div
          className="bg-[#F2F2F0] rounded-lg p-4 mt-2"
          dangerouslySetInnerHTML={{
            __html: isGenerating
              ? "Generating..."
              : generatedEmail.subject || "Subject will appear here",
          }}
        ></div>
      </div>

      <div className="mt-8">
        <Text size={"p-xxsmall"} className="font-medium" required>
          Body
        </Text>
        <div className="bg-[#F2F2F0] rounded-lg p-4 mt-2 min-h-[60vh] whitespace-pre-wrap">
          {isGenerating
            ? "Generating..."
            : generatedEmail.body || "Body will appear here"}
        </div>
      </div>
    </div>
  );
}
