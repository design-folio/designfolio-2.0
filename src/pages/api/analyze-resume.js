import { GoogleGenerativeAI } from "@google/generative-ai";
import { checkRateLimit } from "@/lib/api-rate-limit";

export const config = { maxDuration: 90 };

async function getAiCompletion(prompt) {
  const apiKey =
    process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const result = await model.generateContent(prompt);
  const response = result.response;
  if (!response) {
    throw new Error("No response from Gemini");
  }
  const text = response.text();
  return text ?? null;
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
        "Resume analysis is not configured. Please set GEMINI_API_KEY in your environment.",
    });
  }

  const rateLimit = checkRateLimit(req, "analyze-resume");
  if (!rateLimit.allowed) {
    const message = rateLimit.dailyLimit
      ? "Daily limit reached for this tool. Try again tomorrow."
      : `Rate limit reached. Please try again in ${rateLimit.remainingSec ?? 60} seconds.`;
    return res.status(429).json({ message });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const resumeText = typeof body.resumeText === "string" ? body.resumeText.trim() : "";
    const jobDescription = typeof body.jobDescription === "string" ? body.jobDescription.trim() : "";

    if (!resumeText || resumeText.length < 50) {
      return res.status(400).json({
        message: "Resume text is required and must be at least 50 characters.",
      });
    }

    if (!jobDescription || jobDescription.length < 50) {
      return res.status(400).json({
        message: "Job description is required and must be at least 50 characters.",
      });
    }

    const prompt = `You are an AI expert in analyzing resumes against job descriptions. Provide a detailed analysis in the following JSON structure:
{
  "matchScore": <number between 0-100>,
  "summary": "<comprehensive summary of match and key findings>",
  "strengths": [
    {
      "category": "<category name>",
      "details": "<strength details>"
    }
  ],
  "gaps": [
    {
      "category": "<category name>",
      "details": "<gap details>"
    }
  ],
  "keywordAnalysis": [
    {
      "keyword": "<keyword>",
      "resumeCount": <number>,
      "jdCount": <number>,
      "importance": "high|medium|low"
    }
  ],
  "metrics": [
    {
      "skill": "<skill name>",
      "resumeCoverage": <number 0-100>,
      "jdCoverage": <number 0-100>,
      "resumeFrequency": <number>,
      "jdFrequency": <number>,
      "status": "Matched|Missing|Additional"
    }
  ],
  "sections": [
    {
      "name": "Experience Match",
      "analysis": "<detailed analysis>",
      "suggestions": ["<actionable suggestions>"],
      "matchPercentage": <number 0-100>
    },
    {
      "name": "Education and Certifications",
      "analysis": "<analysis of requirements match>",
      "suggestions": ["<improvement suggestions>"],
      "matchPercentage": <number 0-100>
    },
    {
      "name": "Technical Skills",
      "analysis": "<analysis of technical alignment>",
      "suggestions": ["<specific suggestions>"],
      "matchPercentage": <number 0-100>
    },
    {
      "name": "Soft Skills",
      "analysis": "<analysis of soft skills>",
      "suggestions": ["<improvement suggestions>"],
      "matchPercentage": <number 0-100>
    }
  ],
  "recommendations": [
    {
      "priority": "high|medium|low",
      "action": "<specific action>",
      "impact": "<expected impact>"
    }
  ]
}

Resume Content:
${resumeText}

Job Description:
${jobDescription}

Important: Return ONLY valid JSON, no markdown formatting or additional text.
Ensure all numerical values are actual numbers, not strings.
Provide specific, actionable feedback that will help improve the resume's alignment with the job requirements.`;

    const aiResponse = await getAiCompletion(prompt);

    if (!aiResponse) {
      throw new Error("AI failed to generate response");
    }

    const cleanedText = aiResponse.replace(/```json\n?|\n?```/g, "").trim();
    const analysis = JSON.parse(cleanedText);

    return res.status(200).json({ analysis });
  } catch (error) {
    console.error("Resume analysis error:", error);
    const message = error.message || "Failed to analyze resume";
    const isEnvError =
      message.includes("GEMINI_API_KEY") || message.includes("not configured");
    return res
      .status(isEnvError ? 503 : 500)
      .json({
        message: isEnvError
          ? "Resume analysis is not configured. Please set GEMINI_API_KEY."
          : message,
      });
  }
}
