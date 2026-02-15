import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateAnalysisPrompt } from "@/lib/analysisPrompt";
import { checkRateLimit } from "@/lib/api-rate-limit";

export const config = { maxDuration: 90 };

async function extractOfferDetails(genAI, data) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const extractionPrompt = `
    You are an expert at analyzing job offer letters. Extract the following information from this offer letter. Be precise and only extract what is explicitly stated:

    1. Job Title/Position
    2. Company Name
    3. Base Salary/Compensation Amount (only numerical values)
    4. Location/Country
    5. Any mentioned current salary or previous compensation

    Offer Letter Content:
    ${data.offerContent}

    Format your response exactly like this, with only the extracted information:
    Position: [exact position from letter]
    Company: [exact company name]
    Offered Salary: [exact numerical amount]
    Location: [exact location]
    Current Salary: [exact amount if mentioned]

    If any information is not found, leave it blank but keep the label.
  `;

  try {
    const extraction = await model.generateContent(extractionPrompt);
    const extractedText = extraction.response.text();
    const extractedData = { ...data };
    const lines = extractedText.split("\n");

    lines.forEach((line) => {
      const [key, ...valueParts] = line.split(":");
      const value = valueParts.join(":").trim();

      if (
        value &&
        !value.includes("[") &&
        value !== "not found" &&
        value !== "not mentioned"
      ) {
        switch (key.trim()) {
          case "Position":
            extractedData.position = value || data.position;
            break;
          case "Company":
            extractedData.company = value || data.company;
            break;
          case "Offered Salary":
            const salaryMatch = value.match(/\d+/);
            if (salaryMatch) {
              extractedData.offeredSalary = salaryMatch[0];
            }
            break;
          case "Location":
            extractedData.country = value || data.country;
            break;
          case "Current Salary":
            if (!data.currentSalary) {
              const currentSalaryMatch = value.match(/\d+/);
              if (currentSalaryMatch) {
                extractedData.currentSalary = currentSalaryMatch[0];
              }
            }
            break;
        }
      }
    });

    return extractedData;
  } catch {
    return data;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const apiKey =
    process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    return res.status(503).json({
      message:
        "Offer analysis is not configured. Please set GEMINI_API_KEY in your environment.",
    });
  }

  const rateLimit = checkRateLimit(req, "analyze-offer");
  if (!rateLimit.allowed) {
    const message = rateLimit.dailyLimit
      ? "Daily limit reached for this tool. Try again tomorrow."
      : `Rate limit reached. Please try again in ${rateLimit.remainingSec ?? 60} seconds.`;
    return res.status(429).json({ message });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    let data = {
      offerContent: body.offerContent,
      currentSalary: body.currentSalary,
      offeredSalary: body.offeredSalary,
      position: body.position,
      company: body.company,
      country: body.country,
    };

    const genAI = new GoogleGenerativeAI(apiKey);

    if (data.offerContent) {
      data = await extractOfferDetails(genAI, data);
    }

    const analysisPrompt = generateAnalysisPrompt(data);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(analysisPrompt);
    const response = result.response;
    const text = response.text();

    return res.status(200).json({ analysis: text });
  } catch (error) {
    console.error("Offer analysis error:", error);
    const message = error.message || "Failed to analyze offer";
    const isEnvError =
      message.includes("GEMINI_API_KEY") || message.includes("not configured");
    return res
      .status(isEnvError ? 503 : 500)
      .json({
        message: isEnvError
          ? "Offer analysis is not configured. Please set GEMINI_API_KEY."
          : message,
      });
  }
}
