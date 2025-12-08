import { GoogleGenerativeAI } from "@google/generative-ai";
import { extractOfferDetails } from "./offerExtractor";
import { generateAnalysisPrompt } from "./analysisPrompt";

const CACHE_KEY = "email_generation_attempts";
const MAX_ATTEMPTS = 3;
const COOLDOWN_PERIOD = 40000; // 40 seconds in milliseconds

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

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

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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

export const analyzeOffer = async (data) => {
  console.log("Starting offer analysis...");
  const genAI = new GoogleGenerativeAI(
    process.env.NEXT_PUBLIC_GEMINI_API_KEY
  );

  if (!genAI) {
    console.error("AI initialization failed");
    throw new Error("AI initialization failed");
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Extract data from offer letter if provided
    const extractedData = data.offerContent
      ? await extractOfferDetails(model, data)
      : data;

    console.log("Preparing analysis with data:", extractedData);
    const analysisPrompt = generateAnalysisPrompt(extractedData);

    console.log("Sending request to Gemini API...");
    const result = await model.generateContent(analysisPrompt);
    const response = await result.response;
    console.log("Analysis received successfully");
    return response.text();
  } catch (error) {
    console.error("Error during analysis:", error);
    throw error;
  }
};

export const generateInterviewQuestions = async (
  jobDescription,
  role,
  difficulty = "mid"
) => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const difficultyPrompts = {
    entry:
      "Focus on fundamental concepts and basic scenarios. Questions should be suitable for candidates with 0-2 years of experience.",
    mid: "Include moderate complexity scenarios. Questions should be suitable for candidates with 3-5 years of experience.",
    senior:
      "Include complex scenarios and system design questions. Questions should be suitable for candidates with 6-10 years of experience.",
    lead: "Focus on leadership, system design, and strategic thinking. Questions should be suitable for candidates with 10+ years of experience.",
  };

  const prompt = `As an experienced ${role} interviewer, generate 5 interview questions based on this job description:

${jobDescription}

${difficultyPrompts[difficulty]}

Consider these aspects:
1. Technical knowledge
2. Problem-solving ability
3. Design thinking
4. Communication skills
5. Past experience

Format each question with an ideal answer for evaluation. Return the response as a JSON array of objects, each with 'question' and 'answer' properties.

The questions should be challenging but answerable in 2-3 minutes each.`;

  try {
    const result = await generateWithRetry(model, prompt);
    const response = await result.response;
    const text = await response.text();

    // Find the JSON array in the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in response");
    }

    const questions = JSON.parse(jsonMatch[0]);
    return questions;
  } catch (error) {
    console.error("Error in question generation:", error);
    throw new Error("Failed to generate interview questions");
  }
};

export const generateWithRetry = async (model, prompt, retryCount = 0) => {
  try {
    // Configure the model with stricter parameters
    const generationConfig = {
      temperature: 0.7,
      topK: 40,
      topP: 0.8,
      maxOutputTokens: 8192,
    };

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
    });

    return result;
  } catch (error) {
    if (error?.status === 429 && retryCount < MAX_RETRIES) {
      await sleep(RETRY_DELAY * Math.pow(2, retryCount)); // Exponential backoff
      return generateWithRetry(model, prompt, retryCount + 1);
    }
    throw error;
  }
};

export const handleFeedbackGeneration = async (
  role,
  questions,
  userAnswers
) => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const prompt = generateFeedbackPrompt(role, questions, userAnswers);

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    if (!text) {
      throw new Error("Empty response received from the API");
    }

    // Find the JSON object in the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in response");
    }

    const cleanedResponse = jsonMatch[0]
      .replace(/[\n\r\t]/g, " ")
      .replace(/,\s*}/g, "}")
      .replace(/,\s*]/g, "]")
      .replace(/:\s*,/g, ": null,") // Handle empty values
      .trim();

    // Validate JSON structure
    JSON.parse(cleanedResponse); // This will throw if invalid
    return cleanedResponse;
  } catch (error) {
    console.error("Error in feedback generation:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate valid feedback: ${error.message}`);
    }
    throw new Error("Failed to generate valid feedback");
  }
};

export const generateFeedbackPrompt = (role, questions, userAnswers) => {
  return `As a senior ${role} interviewer with strict evaluation criteria, critically analyze these responses:

  Questions and Answers:
  ${questions
    .map(
      (q, i) => `
    Q${i + 1}: ${q.question}
    User's Answer: ${userAnswers[i]}
    Expected Answer: ${q.answer}
    
    Evaluation Criteria:
    - Technical Accuracy (35%): Assess correctness and depth of technical knowledge
    - Problem-Solving (25%): Evaluate approach, methodology, and critical thinking
    - Communication (40%): Evaluate based on:
      * Clarity & Structure (15%): How well-organized and clear the response is
      * Technical Communication (10%): Ability to explain complex concepts
      * Professionalism (10%): Tone, formality, and appropriateness
      * Completeness (5%): Thoroughness of response
  `
    )
    .join("\n")}

  Provide an extremely detailed and critical evaluation in this exact JSON format:
  {
    "interviewSummary": {
      "duration": "30 minutes",
      "difficulty": "Intermediate",
      "type": "${role} Technical Interview"
    },
    "score": <strict score between 0-100, deduct points for any imprecision or vagueness>,
    "strengths": [
      "<specific strength with concrete example from answers>",
      "<another specific strength with example>"
    ],
    "improvements": [
      "<detailed improvement area with specific example from answer>",
      "<another specific improvement with example and suggested correction>"
    ],
    "skillAnalysis": {
      "technical": "<critical analysis of technical competency with specific examples>",
      "domain": "<detailed evaluation of domain expertise with examples>",
      "methodology": "<thorough analysis of approach with specific improvements>"
    },
    "softSkills": {
      "communication": <score 0-100 based on clarity, structure, and completeness of responses>,
      "articulation": <score 0-100 based on ability to explain technical concepts clearly>,
      "problemSolving": <score 0-100 with emphasis on structured approach>,
      "professionalCommunication": <score 0-100 based on tone and formality>,
      "adaptability": <score 0-100 based on flexibility in approach to different questions>,
      "detailOrientation": <score 0-100 based on thoroughness and precision in responses>
    },
    "questionAnswers": [
      {
        "question": "<question text>",
        "userAnswer": "<user's answer>",
        "feedback": "<specific, actionable feedback with examples of better responses>",
        "communicationFeedback": "<specific feedback on how the answer was communicated>",
        "score": <strict score 0-100>
      }
    ],
    "recommendations": {
      "skillBased": [
        "<specific skill to improve with concrete learning objective>",
        "<another specific skill with measurable goal>"
      ],
      "resources": [
        "<specific resource with explanation of relevance>",
        "<another specific resource with expected learning outcome>"
      ],
      "interviewTips": [
        "<specific interview technique to improve with example>",
        "<another specific technique with situation-based advice>"
      ]
    },
    "overallFeedback": "<comprehensive analysis highlighting critical gaps and specific next steps>"
  }`;
};
