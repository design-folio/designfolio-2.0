import { GoogleGenerativeAI } from "@google/generative-ai";

const CACHE_KEY = "email_generation_attempts";
const MAX_ATTEMPTS = 3;
const COOLDOWN_PERIOD = 40000; // 40 seconds in milliseconds

const checkRateLimit = () => {
  const cache = localStorage.getItem(CACHE_KEY);
  if (!cache) {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        attempts: 1,
        timestamp: Date.now(),
      })
    );
    return true;
  }

  const { attempts, timestamp } = JSON.parse(cache);
  const timePassed = Date.now() - timestamp;

  if (timePassed > COOLDOWN_PERIOD) {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        attempts: 1,
        timestamp: Date.now(),
      })
    );
    return true;
  }

  if (attempts >= MAX_ATTEMPTS) {
    const remainingTime = Math.ceil((COOLDOWN_PERIOD - timePassed) / 1000);
    throw new Error(
      `Rate limit reached. Please try again in ${remainingTime} seconds.`
    );
  }

  localStorage.setItem(
    CACHE_KEY,
    JSON.stringify({
      attempts: attempts + 1,
      timestamp: timestamp,
    })
  );
  return true;
};

export const generateEmail = async (context) => {
  checkRateLimit();

  const genAI = new GoogleGenerativeAI(
    "AIzaSyAyZXZUJ5irogLkCclIE-1jKhKZKOiedUM"
  );
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const emailType =
    context.emailType === "custom"
      ? context.customEmailType
      : context.emailType;

  const prompt = `Write a friendly and conversational email for a job seeker. Make it professional but warm and personable, avoiding overly formal language. Details:
- Type: ${emailType} email
- Company: ${context.company}
- Position: ${context.position}
- Interviewer: ${context.interviewer}
- Sender: ${context.name}
${
  context.additionalContext
    ? `- Additional Context: ${context.additionalContext}`
    : ""
}

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

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = await response.text();

  // Parse the response and handle HTML formatting
  const [subjectLine, ...bodyLines] = text.split("\n");
  const subject = subjectLine
    .replace("SUBJECT:", "")
    .trim()
    .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>"); // Convert any remaining markdown to HTML
  const body = bodyLines.join("\n").replace("BODY:", "").trim();

  return { subject, body };
};
