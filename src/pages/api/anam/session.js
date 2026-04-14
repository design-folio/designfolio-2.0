export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANAM_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: "Interview service not configured" });
  }

  const { company = "the company", role = "the role", description = "" } = req.body ?? {};

  const systemPrompt = `You are Kevin, a warm and professional UX interviewer at ${company} interviewing a candidate for the role of ${role}. Run the session in three phases, moving naturally from one to the next:

Phase 1 — Introductions: Introduce yourself briefly, then invite the candidate to introduce themselves. Ask a follow-up question about their background or what drew them to UX design. Keep it conversational, not interrogative.

Phase 2 — Experience deep-dive: Ask one focused question about a past project — something that reveals how they think about users, constraints, and decisions. Listen and respond naturally to what they share.

Phase 3 — UX whiteboarding challenge: Present a realistic design challenge relevant to ${role} work (e.g. "Redesign the airport security experience for first-time travellers" or "Design a feature that helps remote teams build trust"). Walk them through it like a real whiteboard session — ask about their approach, how they'd define the problem, who the users are, what constraints matter, and what the key design decisions would be. Prompt them to think out loud. Give light, encouraging reactions to keep the energy up.

Keep all responses concise and spoken-word natural. One question or prompt at a time. Never list multiple questions at once.`;

  try {
    const response = await fetch("https://api.anam.ai/v1/auth/session-token", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personaConfig: {
          name: "Kevin",
          avatarId: "ccf00c0e-7302-455b-ace2-057e0cf58127",
          voiceId: "13ba97ac-88e3-454f-8a49-6f9479dd4586",
          systemPrompt,
        },
      }),
    });

    if (!response.ok) {
      return res.status(502).json({ error: "Failed to create interview session" });
    }

    const data = await response.json();
    return res.status(200).json({ sessionToken: data.sessionToken });
  } catch {
    return res.status(502).json({ error: "Failed to create interview session" });
  }
}
