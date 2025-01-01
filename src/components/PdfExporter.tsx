import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "react-toastify";

export const exportToPdf = async (elementId: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  try {
    toast.info("Please wait while we prepare your report...");

    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [canvas.width, canvas.height],
    });

    // Add padding by adjusting the image position and size
    const padding = 40; // 40px padding on all sides
    const imageWidth = canvas.width - padding * 2;
    const imageHeight = (imageWidth * canvas.height) / canvas.width;

    // Add the content with padding
    pdf.addImage(imgData, "PNG", padding, padding, imageWidth, imageHeight);

    pdf.save("salary-negotiation-report.pdf");
    toast.success("Your report has been downloaded.");
  } catch (error) {
    toast.error("There was an error generating your PDF. Please try again.");
  }
};
