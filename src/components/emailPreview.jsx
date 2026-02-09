import React from "react";
import { Label } from "@/components/ui/label";

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
            className="text-sm font-medium text-foreground hover:text-foreground/80 transition-colors rounded-full px-4 py-2 border-2 border-border hover:border-foreground/20 bg-white"
          >
            Copy to Clipboard
          </button>
        </div>
        <div className="space-y-4 flex-1">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground ml-1">
              Subject
            </Label>
            <div
              className="bg-white border-2 border-border rounded-2xl p-4 min-h-[60px] text-foreground"
              dangerouslySetInnerHTML={{
                __html: isGenerating
                  ? "Generating..."
                  : generatedEmail.subject || "Subject will appear here",
              }}
            />
          </div>
          <div className="space-y-2 flex-1 flex flex-col">
            <Label className="text-sm font-medium text-foreground ml-1">
              Body
            </Label>
            <div className="bg-white border-2 border-border rounded-2xl p-4 min-h-[200px] flex-1 whitespace-pre-wrap text-foreground">
              {isGenerating
                ? "Generating..."
                : generatedEmail.body || "Body will appear here"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
