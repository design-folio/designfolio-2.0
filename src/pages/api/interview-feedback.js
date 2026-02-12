import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateFeedbackPrompt } from "@/lib/gemini";
import { checkRateLimit } from "@/lib/api-rate-limit";

export const config = { maxDuration: 90 };

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const apiKey =
    process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    return res.status(503).json({
      message:
        "Interview feedback is not configured. Please set GEMINI_API_KEY in your environment.",
    });
  }

  const rateLimit = checkRateLimit(req, "interview-feedback");
  if (!rateLimit.allowed) {
    const message = rateLimit.dailyLimit
      ? "Daily limit reached for this tool. Try again tomorrow."
      : `Rate limit reached. Please try again in ${rateLimit.remainingSec ?? 60} seconds.`;
    return res.status(429).json({ message });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const { role, questions, userAnswers } = body;

    if (!role || !Array.isArray(questions) || !Array.isArray(userAnswers)) {
      return res.status(400).json({
        message: "role, questions (array), and userAnswers (array) are required.",
      });
    }

    const prompt = generateFeedbackPrompt(role, questions, userAnswers);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    if (!text) {
      throw new Error("Empty response received from the API");
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in response");
    }

    const cleanedResponse = jsonMatch[0]
      .replace(/[\n\r\t]/g, " ")
      .replace(/,\s*}/g, "}")
      .replace(/,\s*]/g, "]")
      .replace(/:\s*,/g, ": null,")
      .trim();

    JSON.parse(cleanedResponse);

    return res.status(200).json({ feedback: cleanedResponse });
  } catch (error) {
    console.error("Interview feedback error:", error);
    const message = error.message || "Failed to generate feedback";
    const isEnvError =
      message.includes("GEMINI_API_KEY") || message.includes("not configured");
    return res
      .status(isEnvError ? 503 : 500)
      .json({
        message: isEnvError
          ? "Interview feedback is not configured. Please set GEMINI_API_KEY."
          : message,
      });
  }
}
