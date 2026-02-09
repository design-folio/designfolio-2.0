import { GoogleGenerativeAI } from "@google/generative-ai";
import { checkRateLimit } from "@/lib/api-rate-limit";

// Allow up to 60s for Gemini to respond (avoids 504 Gateway Timeout on serverless)
export const config = { maxDuration: 90 };

const PERSONA_LABELS = [
  "Product Designers",
  "Developer / Engineer",
  "Product Managers",
  "Vibe / No-Code Builders",
  "UX Researchers",
  "Writers",
  "Graphic Designers",
  "Founder",
  "Educator",
  "Others",
];

async function fetchToolsList() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
  if (!baseUrl) return [];
  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, "")}/tool/get/all`, {
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    const tools = data?.tools || [];
    return tools.map((t) => t.label || t.name || "").filter(Boolean);
  } catch {
    return [];
  }
}

function buildResumePrompt(toolLabels) {
  const toolsRule =
    toolLabels.length >= 10
      ? `10. "tools": MUST be an array of 10-15 tool names. Choose ONLY from this exact list (use the exact label): ${toolLabels.join(", ")}. Infer from skills, experience, and tech stack. Minimum 10 tools.`
      : `10. "tools": Infer from skills, experience, and tech stack. Include 10-15 relevant tools.`;

  return `Based on the following resume text, extract and generate professional portfolio content. You MUST return the data in the following JSON format only (no markdown, no extra text):
{
  "persona": "MUST be exactly one of: ${PERSONA_LABELS.join(", ")}. Infer from job titles, skills, and experience. If unclear, use 'Others'.",
  "experienceLevel": 0,
  "user": {
    "name": "Hey, I'm [First Name]!",
    "role": "A single, powerful, and slightly edgy one-liner (max 25 words) that captures the person's professional essence with confidence and 'swag'. It should sound like a bold personal brand statement, avoiding corporate cliches. Use a mix of technical authority and human personality. NO exclamation marks.",
    "aboutMe": "A friendly, humane 2-3 sentence introduction about the person's interests and professional philosophy.",
    "skills": [{"name": "Skill Name", "level": 0-100}],
    "contact": {"email": "Email address", "phone": "Phone number or null", "location": "City, Country or null", "linkedin": "LinkedIn URL or null", "twitter": "X/Twitter URL or null", "instagram": "Instagram URL or null", "medium": "Medium/blog URL or null", "dribbble": "Dribbble URL or null"}
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
  ],
  "testimonials": [
    {
      "name": "Person Name",
      "company": "Company Name",
      "description": "Short testimonial quote or recommendation",
      "linkedinLink": "https://linkedin.com/in/... or null"
    }
  ],
  "tools": ["Exact Tool Label 1", "Exact Tool Label 2", "...10-15 from the allowed list"]
}

CRITICAL RULES:
1. "name" MUST be exactly: "Hey, I'm [First Name]!".
2. "aboutMe" must be first person and natural.
3. For each workExperience: startMonth and endMonth MUST be one of: Jan, Feb, Mar, Apr, May, June, July, Aug, Sept, Oct, Nov, Dec. startYear and endYear MUST be 4-digit strings (e.g. "2020"). If the person is still in the role, set currentlyWorking to true and set endMonth/endYear to the current month/year.
4. For each caseStudy: include client, role, platform when inferable from the resume; otherwise use null.
5. Extract contact details; if not found, use realistic placeholders. IMPORTANT: Extract ALL profile URLs found in the resume – not just LinkedIn. For each link type we accept, populate when present: linkedin (linkedin.com/in/...), twitter (twitter.com, x.com), instagram (instagram.com), medium (medium.com), dribbble (dribbble.com). Use null only for link types not found in the resume.
6. "persona" MUST be exactly one of: ${PERSONA_LABELS.join(", ")}. Infer from job titles, skills, and experience. If unclear, use "Others".
7. "experienceLevel" MUST be 0, 1, or 2 based on work experience:
   - 0 = "Just starting out": fresher, 0-2 years total, intern/junior/entry-level, first job, or no work experience.
   - 1 = "Intermediate": 2-5 years, mid-level, 2-3 roles, some leadership or ownership.
   - 2 = "Advanced": 5+ years, senior/lead/principal, many roles, clear leadership or expert track.
8. "testimonials": Extract from resume if present (e.g. "References", "Recommendations", quotes). If none, use [].
${toolsRule}

Resume Text: `;
}

const GEMINI_MODEL = "gemini-2.5-flash";

async function getAiCompletion(prompt) {
  const apiKey =
    process.env.GEMINI_API_KEY;
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
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    console.error("convert-resume: GEMINI_API_KEY is not set");
    return res.status(503).json({
      message: "Resume conversion is not configured. Please set GEMINI_API_KEY in your environment.",
    });
  }

  const rateLimit = checkRateLimit(req, "convert-resume");
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

    // Use tools from body if provided (frontend may have fetched them); else fetch from backend
    let toolLabels = Array.isArray(body.tools) ? body.tools.map((t) => t?.label || t?.name || t).filter(Boolean) : [];
    if (toolLabels.length < 10) {
      const fetched = await fetchToolsList();
      if (fetched.length >= 10) toolLabels = fetched;
    }
    const resumePrompt = buildResumePrompt(toolLabels);
    const prompt = resumePrompt + text + ";";
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
