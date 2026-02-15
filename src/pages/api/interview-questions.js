import { GoogleGenerativeAI } from "@google/generative-ai";
import { checkRateLimit } from "@/lib/api-rate-limit";

export const config = { maxDuration: 60 };

const difficultyPrompts = {
  entry:
    "Focus on fundamental concepts and basic scenarios. Questions should be suitable for candidates with 0-2 years of experience.",
  mid: "Include moderate complexity scenarios. Questions should be suitable for candidates with 3-5 years of experience.",
  senior:
    "Include complex scenarios and system design questions. Questions should be suitable for candidates with 6-10 years of experience.",
  lead: "Focus on leadership, system design, and strategic thinking. Questions should be suitable for candidates with 10+ years of experience.",
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const apiKey =
    process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    return res.status(503).json({
      message:
        "Interview questions are not configured. Please set GEMINI_API_KEY in your environment.",
    });
  }

  const rateLimit = checkRateLimit(req, "interview-questions");
  if (!rateLimit.allowed) {
    const message = rateLimit.dailyLimit
      ? "Daily limit reached for this tool. Try again tomorrow."
      : `Rate limit reached. Please try again in ${rateLimit.remainingSec ?? 60} seconds.`;
    return res.status(429).json({ message });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const { jobDescription, role, difficulty = "mid" } = body;

    if (!jobDescription || !role) {
      return res.status(400).json({
        message: "jobDescription and role are required.",
      });
    }

    const prompt = `As an experienced ${role} interviewer, generate 5 interview questions based on this job description:

${jobDescription}

${difficultyPrompts[difficulty] || difficultyPrompts.mid}

Consider these aspects:
1. Technical knowledge
2. Problem-solving ability
3. Design thinking
4. Communication skills
5. Past experience

Format each question with an ideal answer for evaluation. Return the response as a JSON array of objects, each with 'question' and 'answer' properties.

The questions should be challenging but answerable in 2-3 minutes each.`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.8,
        maxOutputTokens: 8192,
      },
    });
    const response = result.response;
    const text = response.text();

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in response");
    }

    const questions = JSON.parse(jsonMatch[0]);
    return res.status(200).json({ questions });
  } catch (error) {
    console.error("Interview questions error:", error);
    const message = error.message || "Failed to generate interview questions";
    const isEnvError =
      message.includes("GEMINI_API_KEY") || message.includes("not configured");
    return res
      .status(isEnvError ? 503 : 500)
      .json({
        message: isEnvError
          ? "Interview questions are not configured. Please set GEMINI_API_KEY."
          : message,
      });
  }
}
