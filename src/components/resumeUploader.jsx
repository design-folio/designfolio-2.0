import React, { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { getDocument } from "pdfjs-dist";
import { toast } from "react-toastify";
import workerSrc from "pdfjs-dist/build/pdf.worker.mjs";

// Setting the worker source for pdf.js
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.mjs",
    import.meta.url
  ).toString();
}

const ResumeUploader = ({ onUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState(null);

  const extractTextFromPdf = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await getDocument({ data: arrayBuffer }).promise;
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
    if (!file) return;

    try {
      let text;

      if (file.type === "application/pdf") {
        text = await extractTextFromPdf(file);
      } else {
        text = await file.text();
      }

      setFileName(file.name);
      onUpload(text);
      toast.success("Resume uploaded successfully");
    } catch (error) {
      console.error("Error reading file:", error);
      toast.error("There was an error processing your file.");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
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
        className="hidden"
        id="resume-upload"
      />
      <div
        className={`w-full min-h-[200px] border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
          isDragging ? "border-primary bg-primary/5" : "border-gray-300"
        } ${
          fileName
            ? "bg-green-50 border-green-500"
            : "hover:border-primary hover:bg-primary/5"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById("resume-upload")?.click()}
      >
        {fileName ? (
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center text-green-600">
              <svg
                className="w-6 h-6 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="font-medium">File uploaded successfully</span>
            </div>
            <p className="text-sm text-gray-600">{fileName}</p>
          </div>
        ) : (
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center text-gray-400">
              <svg
                className="w-12 h-12 mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <div className="space-y-1">
              <p className="text-base font-medium text-gray-700">
                Click to upload or drag and drop
              </p>
              <p className="text-sm text-gray-500">PDF Only</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeUploader;
