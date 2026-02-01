import { GoogleGenerativeAI } from "@google/generative-ai";

// Allow up to 60s for Gemini to respond (avoids 504 Gateway Timeout on serverless)
export const config = { maxDuration: 90 };

// Rate limit: same as gemini.js (3 attempts per 40s), but server-side per IP
const RATE_LIMIT_MAX_ATTEMPTS = 3;
const RATE_LIMIT_COOLDOWN_MS = 40000; // 40 seconds
const rateLimitMap = new Map(); // ip -> { attempts, timestamp }

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    const first = forwarded.split(",")[0].trim();
    if (first) return first;
  }
  return req.socket?.remoteAddress ?? "unknown";
}

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry) {
    rateLimitMap.set(ip, { attempts: 1, timestamp: now });
    return { allowed: true };
  }

  const { attempts, timestamp } = entry;
  const elapsed = now - timestamp;

  if (elapsed > RATE_LIMIT_COOLDOWN_MS) {
    rateLimitMap.set(ip, { attempts: 1, timestamp: now });
    return { allowed: true };
  }

  if (attempts >= RATE_LIMIT_MAX_ATTEMPTS) {
    const remainingSec = Math.ceil((RATE_LIMIT_COOLDOWN_MS - elapsed) / 1000);
    return { allowed: false, remainingSec };
  }

  entry.attempts += 1;
  return { allowed: true };
}

const RESUME_PROMPT = `Based on the following resume text, extract and generate professional portfolio content. You MUST return the data in the following JSON format only (no markdown, no extra text):
{
  "user": {
    "name": "Hey, I'm [First Name]!",
    "role": "A single, powerful, and slightly edgy one-liner (max 25 words) that captures the person's professional essence with confidence and 'swag'. It should sound like a bold personal brand statement, avoiding corporate cliches. Use a mix of technical authority and human personality. NO exclamation marks.",
    "aboutMe": "A friendly, humane 2-3 sentence introduction about the person's interests and professional philosophy.",
    "skills": [{"name": "Skill Name", "level": 0-100}],
    "contact": {"email": "Email address", "phone": "Phone number or null", "location": "City, Country or null"}
  },
  "workExperiences": [
    {
      "role": "Job Title",
      "company": "Company Name",
      "startMonth": "Jan|Feb|Mar|Apr|May|June|July|Aug|Sept|Oct|Nov|Dec",
      "startYear": "YYYY",
      "endMonth": "Jan|Feb|Mar|Apr|May|June|July|Aug|Sept|Oct|Nov|Dec",
      "endYear": "YYYY",
      "currentlyWorking": false,
      "description": "Short achievement or responsibility"
    }
  ],
  "caseStudies": [
    {
      "title": "Project Title",
      "description": "Project overview",
      "category": "Project Category / Industry",
      "client": "Client or company name if known, else null",
      "role": "Role on this project if known, else null",
      "platform": "Platform or tech (e.g. Web, iOS) if known, else null"
    }
  ]
}

CRITICAL RULES:
1. "name" MUST be exactly: "Hey, I'm [First Name]!".
2. "aboutMe" must be first person and natural.
3. For each workExperience: startMonth and endMonth MUST be one of: Jan, Feb, Mar, Apr, May, June, July, Aug, Sept, Oct, Nov, Dec. startYear and endYear MUST be 4-digit strings (e.g. "2020"). If the person is still in the role, set currentlyWorking to true and set endMonth/endYear to the current month/year.
4. For each caseStudy: include client, role, platform when inferable from the resume; otherwise use null.
5. Extract contact details; if not found, use realistic placeholders.

Resume Text: `;

const GEMINI_MODEL = "gemini-2.5-flash";

async function getAiCompletion(prompt) {
  const apiKey =
    process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
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

  // Fail fast if Gemini API key is missing (avoids FUNCTION_INVOCATION_FAILED)
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    console.error("convert-resume: GEMINI_API_KEY (or NEXT_PUBLIC_GEMINI_API_KEY) is not set");
    return res.status(503).json({
      message: "Resume conversion is not configured. Please set GEMINI_API_KEY in your environment.",
    });
  }

  const ip = getClientIp(req);
  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.allowed) {
    return res.status(429).json({
      message: `Rate limit reached. Please try again in ${rateLimit.remainingSec} seconds.`,
    });
  }

  try {
    // Client sends JSON { text } (file reading & extraction done in browser)
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const text = typeof body.text === "string" ? body.text.trim() : "";

    if (!text || text.length < 50) {
      return res.status(400).json({
        message: "Resume text is missing or too short. Please upload a PDF or TXT file with at least 50 characters.",
      });
    }

    const prompt = RESUME_PROMPT + text + ";";
    const aiResponse = await getAiCompletion(prompt);

    if (!aiResponse) {
      throw new Error("AI failed to generate response");
    }

    let content;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      content = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(aiResponse);
    } catch {
      content = { raw: aiResponse };
    }

    return res.status(200).json({ content });
  } catch (error) {
    console.error("Conversion error:", error);
    const message = error.message || "Failed to convert resume";
    const isEnvError = message.includes("GEMINI_API_KEY") || message.includes("not configured");
    return res
      .status(isEnvError ? 503 : 500)
      .json({ message: isEnvError ? "Resume conversion is not configured. Please set GEMINI_API_KEY." : message });
  }
}
