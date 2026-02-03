export async function extractResumeText(file) {
  if (!file || typeof file.text !== "function") {
    throw new Error("Invalid file");
  }

  const ext = (file.name || "").toLowerCase().replace(/^.*\./, "") || "";
  const isPdf = file.type === "application/pdf" || ext === "pdf";
  const isTxt = file.type === "text/plain" || ext === "txt";

  if (isTxt) {
    const text = await file.text();
    return text || "";
  }

  if (isPdf) {
    const pdfjsLib = await import("pdfjs-dist");
    if (typeof window !== "undefined" && pdfjsLib.GlobalWorkerOptions) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/legacy/build/pdf.worker.min.mjs`;
    }
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => item.str).join(" ");
      fullText += pageText + "\n";
    }
    return fullText.trim();
  }

  throw new Error("Please upload a PDF or TXT file.");
}
