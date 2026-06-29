import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCcw, PenTool } from "lucide-react";

export default function EmailPreview({ generatedEmail, handleCopy, onEditDetails }) {
  return (
    <>
      <div className="flex items-center justify-between">
        <h3 className="text-foreground/60 text-sm font-medium tracking-wider uppercase">
          Email Preview
        </h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full bg-white/50"
            onClick={onEditDetails}
          >
            <RefreshCcw className="mr-2 h-3 w-3" />
            Edit Details
          </Button>
          <Button
            size="sm"
            className="bg-foreground-landing text-background-landing hover:bg-foreground-landing/90 hover:text-background-landing/80 rounded-full"
            onClick={handleCopy}
          >
            <PenTool className="mr-2 h-3 w-3" />
            Copy Email
          </Button>
        </div>
      </div>

      <div className="border-border/50 overflow-hidden rounded-2xl border bg-white font-sans shadow-sm">
        <div className="bg-muted/30 border-border/50 space-y-3 border-b px-6 py-4">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground w-16">Subject:</span>
            <span className="text-foreground font-medium">{generatedEmail.subject || "—"}</span>
          </div>
          <div className="border-border/30 flex items-center gap-4 border-t pt-3 text-sm">
            <span className="text-muted-foreground w-16">From:</span>
            <span className="text-foreground">you@example.com</span>
          </div>
        </div>
        <div className="text-foreground min-h-[300px] p-8 leading-relaxed whitespace-pre-wrap">
          {generatedEmail.body || "—"}
        </div>
      </div>
    </>
  );
}
