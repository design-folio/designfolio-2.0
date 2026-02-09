import { GoogleGenerativeAI } from "@google/generative-ai";
import { checkRateLimit } from "@/lib/api-rate-limit";

export const config = { maxDuration: 60 };

async function getAiCompletion(prompt) {
  const apiKey =
    process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
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
        "Email generation is not configured. Please set GEMINI_API_KEY in your environment.",
    });
  }

  const rateLimit = checkRateLimit(req, "generate-email");
  if (!rateLimit.allowed) {
    return res.status(429).json({
      message: `Rate limit reached. Please try again in ${rateLimit.remainingSec} seconds.`,
    });
  }

  try {
    const reqBody = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const {
      emailType,
      customEmailType,
      company,
      position,
      interviewer,
      name,
      additionalContext,
    } = reqBody;

    const type = emailType === "custom" ? customEmailType : emailType;

    if (!type || !company || !position || !interviewer || !name) {
      return res.status(400).json({
        message: "Missing required fields: emailType, company, position, interviewer, name.",
      });
    }

    const prompt = `Write a friendly and conversational email for a job seeker. Make it professional but warm and personable, avoiding overly formal language. Details:
- Type: ${type} email
- Company: ${company}
- Position: ${position}
- Interviewer: ${interviewer}
- Sender: ${name}
${additionalContext ? `- Additional Context: ${additionalContext}` : ""}

Guidelines:
- Use a warm, friendly tone while maintaining professionalism
- Be genuine and authentic in expression
- Include personal touches where appropriate
- Keep it concise but engaging
- Avoid corporate jargon or overly formal language
- For the subject line, use <b>text</b> format for emphasis, not markdown

Please provide the email in this format:
SUBJECT: <b>the subject line</b>
BODY: <the email body>`;

    const text = await getAiCompletion(prompt);
    if (!text) {
      throw new Error("AI failed to generate response");
    }

    const [subjectLine, ...bodyLines] = text.split("\n");
    const subject = subjectLine
      .replace("SUBJECT:", "")
      .trim()
      .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
    const emailBody = bodyLines.join("\n").replace("BODY:", "").trim();

    return res.status(200).json({ subject, body: emailBody });
  } catch (error) {
    console.error("Email generation error:", error);
    const message = error.message || "Failed to generate email";
    const isEnvError =
      message.includes("GEMINI_API_KEY") || message.includes("not configured");
    return res
      .status(isEnvError ? 503 : 500)
      .json({
        message: isEnvError
          ? "Email generation is not configured. Please set GEMINI_API_KEY."
          : message,
      });
  }
}
