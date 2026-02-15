import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCcw, PenTool } from "lucide-react";

export default function EmailPreview({
  generatedEmail,
  handleCopy,
  onEditDetails,
}) {
  return (
    <>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground/60 uppercase tracking-wider">Email Preview</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full bg-white/50"
            onClick={onEditDetails}
          >
            <RefreshCcw className="w-3 h-3 mr-2" />
            Edit Details
          </Button>
          <Button
            size="sm"
            className="rounded-full bg-foreground-landing text-background-landing hover:bg-foreground-landing/90 hover:text-background-landing/80"
            onClick={handleCopy}
          >
            <PenTool className="w-3 h-3 mr-2" />
            Copy Email
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden font-sans">
        <div className="bg-muted/30 border-b border-border/50 px-6 py-4 space-y-3">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground w-16">Subject:</span>
            <span className="font-medium text-foreground">{generatedEmail.subject || "—"}</span>
          </div>
          <div className="flex items-center gap-4 text-sm border-t border-border/30 pt-3">
            <span className="text-muted-foreground w-16">From:</span>
            <span className="text-foreground">you@example.com</span>
          </div>
        </div>
        <div className="p-8 min-h-[300px] whitespace-pre-wrap text-foreground leading-relaxed">
          {generatedEmail.body || "—"}
        </div>
      </div>
    </>
  );
}
