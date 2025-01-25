import { GoogleGenerativeAI } from "@google/generative-ai";
import { extractOfferDetails } from "./offerExtractor";
import { generateAnalysisPrompt } from "./analysisPrompt";

const CACHE_KEY = "email_generation_attempts";
const MAX_ATTEMPTS = 3;
const COOLDOWN_PERIOD = 40000; // 40 seconds in milliseconds

const GEMINI_API_KEY = "AIzaSyAyZXZUJ5irogLkCclIE-1jKhKZKOiedUM";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

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

export const analyzeOffer = async (data) => {
  console.log("Starting offer analysis...");
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

  if (!genAI) {
    console.error("AI initialization failed");
    throw new Error("AI initialization failed");
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

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
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

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
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
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

export async function generateLinkedInStrategy(formData) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Generate a comprehensive LinkedIn strategy using the exact format below. Make sure to be specific, data-driven, and results-oriented. Do not deviate from this format or add additional sections.

## LinkedIn Headline
Here are 3-5 headline variations optimized for visibility and engagement (120 characters max):

1. ${formData.role} | ${formData.skills.split("\n")[0]} Expert | Helping ${
                  formData.targetAudience
                } ${
                  formData.careerGoals.toLowerCase().includes("hired")
                    ? "Achieve Career Success"
                    : "Drive Business Growth"
                }

2. Results-Driven ${formData.role} | Empowering ${
                  formData.targetAudience
                } Through Strategic ${formData.skills.split("\n")[0]}

3. ${formData.experienceLevel} ${formData.role} Specializing in ${
                  formData.skills.split("\n")[0]
                } | Transforming ${formData.targetAudience}'s ${
                  formData.careerGoals
                }

4. ${formData.role} & ${
                  formData.skills.split("\n")[0]
                } Strategist | Proven Results for ${
                  formData.targetAudience
                } | Let's Connect!

5. Innovative ${formData.role} | ${
                  formData.skills.split("\n")[0]
                } Solutions | Helping ${formData.targetAudience} ${
                  formData.careerGoals.toLowerCase().includes("expertise")
                    ? "Master " + formData.skills.split("\n")[0]
                    : "Achieve " + formData.careerGoals
                }

## About Section
Over the last ${
                  formData.experienceLevel === "Entry Level"
                    ? "few years"
                    : formData.experienceLevel.toLowerCase().includes("senior")
                    ? "decade+"
                    : "several years"
                }, I've ${
                  formData.experienceLevel === "Entry Level"
                    ? "rapidly mastered key skills and delivered impactful results"
                    : "led transformative initiatives and achieved remarkable milestones"
                } as a ${formData.role}, including ${formData.skills
                  .split("\n")
                  .slice(1, 4)
                  .join(", ")}.

My mission is to empower ${
                  formData.targetAudience
                } to unlock their full potential and achieve extraordinary results in ${
                  formData.careerGoals
                } through innovative ${
                  formData.skills.split("\n")[0]
                } solutions.

I use data-driven methodologies, cutting-edge ${
                  formData.skills.split("\n")[0]
                } frameworks, and battle-tested strategies from ${formData.experienceLevel.toLowerCase()} experience to help ${
                  formData.targetAudience
                } consistently achieve ${
                  formData.careerGoals
                } while maximizing ROI and market impact.

Here's a bit about me:
→ Founder of ${
                  formData.role
                } Success Academy: Empowering professionals with practical ${
                  formData.skills.split("\n")[0]
                } skills, achieving 95% success rate in career advancement
→ ${formData.experienceLevel} ${
                  formData.role
                }: Led 100+ successful projects, generating $10M+ in revenue through innovative ${
                  formData.skills.split("\n")[1]
                } solutions
→ Strategic Advisor for ${
                  formData.targetAudience
                }: Helping organizations achieve 3x growth through expert ${
                  formData.skills.split("\n")[0]
                } consultation

If you want to master ${
                  formData.skills.split("\n")[0]
                } and accelerate your career growth:
→ GO HERE: [Professional Training Program]

If you want to access exclusive insights about ${formData.skills
                  .split("\n")
                  .slice(0, 2)
                  .join(" and ")} and industry best practices:
→ GO HERE: [Weekly Newsletter]

If you're looking for strategic ${
                  formData.role
                } consulting and transformation services:
→ GO HERE: [Consulting Services]

## Keywords and Skills
${formData.skills
  .split("\n")
  .map((skill) => skill.trim())
  .filter(Boolean)
  .join("\n")}

## Content Calendar (10-Day Strategic Plan)
| Day | Content Type | Topic | Hook/Headline | Content Framework | Description | Hashtags |
|-----|--------------|-------|---------------|-------------------|-------------|----------|
| Day 1 | Growth | ${
                  formData.skills.split("\n")[0]
                } Mastery | "How I achieved ${
                  formData.experienceLevel === "Entry Level"
                    ? "early success"
                    : "industry recognition"
                } in ${formData.skills.split("\n")[0]} - A ${
                  formData.experienceLevel
                } perspective" | Zero-to-Hero Story | Share your journey from beginning to becoming a ${
                  formData.experienceLevel
                } ${
                  formData.role
                }, highlighting key milestones and lessons learned | #${formData.skills
                  .split("\n")[0]
                  .replace(/\s+/g, "")} #CareerGrowth |
| Day 2 | Authority | Industry Insights | "3 Game-Changing ${
                  formData.skills.split("\n")[1]
                } Trends That Will Transform ${
                  formData.targetAudience
                }'s Success in ${new Date().getFullYear()}" | Carousel Post | Break down emerging trends in ${
                  formData.skills.split("\n")[1]
                }, backed by data and expert analysis | #${formData.skills
                  .split("\n")[1]
                  .replace(/\s+/g, "")}Trends #IndustryInsights |
| Day 3 | Sales | Client Success Story | "How We Helped a ${
                  formData.targetAudience
                } Achieve 300% ROI Using Our ${
                  formData.skills.split("\n")[0]
                } Framework" | PAS Framework | Present a detailed case study showcasing your expertise in solving real client challenges | #${formData.role.replace(
                  /\s+/g,
                  ""
                )}Success #ROI |
| Day 4 | Growth | Skill Development | "The Ultimate ${
                  formData.skills.split("\n")[2]
                } Cheat Sheet: From Beginner to ${
                  formData.experienceLevel
                }" | Cheat Sheet | Create an actionable guide with step-by-step tips for mastering ${
                  formData.skills.split("\n")[2]
                } | #${formData.skills
                  .split("\n")[2]
                  .replace(/\s+/g, "")}Tips #SkillDevelopment |
| Day 5 | Authority | Myth Debunking | "5 Common Myths About ${
                  formData.skills.split("\n")[0]
                } That Are Holding You Back" | Carousel Post | Debunk industry misconceptions with data-backed insights and expert perspective | #${formData.skills
                  .split("\n")[0]
                  .replace(/\s+/g, "")}Facts #ExpertAdvice |
| Day 6 | Sales | Problem Solving | "The Hidden Cost of Poor ${
                  formData.skills.split("\n")[1]
                } Strategy (And How to Fix It)" | PAS Framework | Address common pain points and present your solution with clear ROI metrics | #${formData.skills
                  .split("\n")[1]
                  .replace(/\s+/g, "")}Strategy #Solutions |
| Day 7 | Growth | Behind the Scenes | "A Day in the Life of a ${
                  formData.experienceLevel
                } ${
                  formData.role
                }: Real Insights & Key Learnings" | Story Format | Share authentic experiences and practical wisdom from your daily work | #${formData.role.replace(
                  /\s+/g,
                  ""
                )}Life #CareerInsights |
| Day 8 | Authority | Expert Guide | "The ${
                  formData.experienceLevel
                } Guide to Mastering ${
                  formData.skills.split("\n")[0]
                }: 7 Critical Steps" | Cheat Sheet | Provide advanced strategies and insider tips for professional growth | #${formData.skills
                  .split("\n")[0]
                  .replace(/\s+/g, "")}Guide #ExpertTips |
| Day 9 | Sales | Value Proposition | "Transform Your ${
                  formData.careerGoals
                } with Our Proven ${
                  formData.skills.split("\n")[0]
                } Framework" | PAS Framework | Showcase your unique methodology and its impact on client success | #${formData.skills
                  .split("\n")[0]
                  .replace(/\s+/g, "")}Framework #Success |
| Day 10 | Growth | Community Engagement | "What I Learned from ${
                  formData.experienceLevel === "Entry Level"
                    ? "My First Year"
                    : "10+ Years"
                } in ${
                  formData.skills.split("\n")[0]
                }" | Story Format | Share valuable lessons and invite community discussion | #${formData.skills
                  .split("\n")[0]
                  .replace(/\s+/g, "")}Journey #CommunityGrowth |

## Profile Optimization Tips
• Upload a professional headshot with a clean background and approachable smile
• Create a custom LinkedIn URL with your full name
• Add relevant media (presentations, publications, videos) to showcase your expertise
• Incorporate industry-specific keywords naturally throughout your profile
• Request recommendations from colleagues and clients highlighting specific achievements
• Join and actively participate in relevant LinkedIn groups in your industry
• Regularly update your profile with new certifications and accomplishments
• Use rich media content to demonstrate your expertise
• Maintain consistent branding across all professional platforms
• Create showcase pages for major projects or initiatives

## Engagement Strategy
• 💡 Share daily insights about ${formData.skills.split("\n")[0]} and ${
                  formData.skills.split("\n")[1]
                }
• 🤝 Connect with 3-5 new ${formData.targetAudience} weekly
• 📊 Post data-driven content about ${
                  formData.skills.split("\n")[0]
                } success metrics
• 🎯 Create weekly thought leadership content about ${
                  formData.skills.split("\n")[2]
                }
• 📚 Share industry research and analysis
• 🌟 Highlight client success stories and testimonials
• 🔄 Engage with industry influencers' content daily
• 💡 Host monthly LinkedIn Live sessions about ${formData.skills.split("\n")[0]}
• 🎓 Share learnings from recent projects or certifications
• 🤔 Start discussions about industry challenges and solutions`,
              },
            ],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to generate strategy");
  }

  const data = await response.json();
  return data;
}
