import React, { useState } from "react";
import { toast } from "react-toastify";
import { FileText, Upload } from "lucide-react";

const ResumeUploader = ({ onUpload, disabled = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState(null);

  const extractTextFromPdf = async (file) => {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => item.str).join(" ");
      fullText += pageText + "\n";
    }

    return fullText;
  };

  const handleFile = async (file) => {
    if (!file || disabled) return;

    try {
      let text;

      if (file.type === "application/pdf") {
        text = await extractTextFromPdf(file);
      } else {
        text = await file.text();
      }

      setFileName(file.name);
      onUpload(text, file);
      toast.success("Resume uploaded successfully");
    } catch (error) {
      console.error("Error reading file:", error);
      toast.error("There was an error processing your file.");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInput = (event) => {
    if (disabled) return;
    const file = event.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  return (
    <div className="w-full">
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileInput}
        disabled={disabled}
        className="hidden"
        id="resume-upload"
      />
      <div
        className={`p-6 rounded-2xl border-2 border-dashed transition-all duration-300 group ${
          disabled ? "cursor-not-allowed opacity-60 border-border/40 bg-muted/30" : "cursor-pointer"
        } ${
          !disabled && fileName
            ? "border-[#FF553E]/20 bg-[#FF553E]/[0.02]"
            : !disabled
              ? "border-border/40 bg-white/50 hover:border-[#FF553E]/20 hover:bg-[#FF553E]/[0.01]"
              : ""
        } ${!disabled && isDragging ? "border-[#FF553E] bg-[#FF553E]/[0.02]" : ""}`}
        onDrop={handleDrop}
        onDragOver={disabled ? (e) => e.preventDefault() : handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={disabled ? undefined : () => document.getElementById("resume-upload")?.click()}
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              fileName ? "bg-[#FF553E]/10" : "bg-muted/30 group-hover:bg-[#FF553E]/10"
            }`}
          >
            {fileName ? (
              <FileText className="w-5 h-5 text-[#FF553E]" />
            ) : (
              <Upload className="w-5 h-5 text-foreground/30 group-hover:text-[#FF553E] transition-colors" />
            )}
          </div>
          <div className="flex-1 text-left">
            <h4 className="text-sm font-semibold text-foreground">
              {fileName ? fileName : "Upload Resume"}
            </h4>
            <p className="text-[11px] text-foreground/40 font-medium">
              {fileName ? "PDF uploaded • Click to replace" : "PDF Only • Max 5MB"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeUploader;
