import formidable from "formidable";
import fs from "fs";
import path from "path";
import pdf from "pdf-parse";
import { GoogleGenerativeAI } from "@google/generative-ai";

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

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIMES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];
const ALLOWED_EXT = [".pdf", ".docx", ".txt"];

export const config = {
  api: {
    bodyParser: false,
  },
};

function getFileFromForm(files) {
  const resume = files.resume ?? files.Resume;
  if (!resume) return null;
  return Array.isArray(resume) ? resume[0] : resume;
}

async function extractTextFromBuffer(buffer, mimetype) {
  if (mimetype === "application/pdf") {
    try {
      if (!buffer || buffer.length === 0) throw new Error("Empty file buffer");
      const data = await pdf(buffer);
      return data.text ?? "";
    } catch (pdfError) {
      try {
        const text = buffer.toString("utf-8").replace(/[^\x20-\x7E\n\r\t]/g, " ");
        if (text.trim().length < 100) throw new Error("Fallback text extraction failed");
        return text;
      } catch {
        throw new Error(
          "This PDF file appears to be corrupted or in an unsupported format. Please try saving it again as a PDF or use a .txt/.docx file."
        );
      }
    }
  }
  return buffer.toString("utf-8");
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

// Use GEMINI_API_KEY (server-only, not in client bundle). Fallback: NEXT_PUBLIC_GEMINI_API_KEY.
async function getAiCompletion(prompt) {
  const apiKey =
    process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    const result = await model.generateContent(prompt);
    const response = result.response;
    if (!response) {
      throw new Error("No response from Gemini");
    }
    const text = response.text();
    return text ?? null;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const ip = getClientIp(req);
  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.allowed) {
    return res.status(429).json({
      message: `Rate limit reached. Please try again in ${rateLimit.remainingSec} seconds.`,
    });
  }

  let tmpFilePath = null;

  try {
    const form = formidable({
      maxFileSize: MAX_FILE_SIZE,
      keepExtensions: true,
    });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    const file = getFileFromForm(files);
    if (!file?.filepath) {
      return res.status(400).json({ message: "No resume file uploaded" });
    }

    tmpFilePath = file.filepath;
    const ext = path.extname(file.originalFilename || "").toLowerCase();
    const mimetype = file.mimetype || "";

    const mimeOk = ALLOWED_MIMES.includes(mimetype);
    const extOk = ALLOWED_EXT.includes(ext);
    if (!mimeOk && !extOk) {
      return res.status(400).json({
        message: "Invalid file type. Please upload a PDF, DOCX, or TXT file.",
      });
    }

    const buffer = fs.readFileSync(file.filepath);
    const text = await extractTextFromBuffer(buffer, mimetype);

    if (!text || text.trim().length < 50) {
      return res.status(400).json({
        message: "The uploaded file appears to be empty or too short.",
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
    return res.status(500).json({ message: error.message || "Failed to convert resume" });
  } finally {
    if (tmpFilePath && fs.existsSync(tmpFilePath)) {
      try {
        fs.unlinkSync(tmpFilePath);
      } catch (e) {
        console.warn("Could not delete temp file:", tmpFilePath, e);
      }
    }
  }
}
