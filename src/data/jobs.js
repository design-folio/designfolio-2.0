// NOTE: APIS TO BE INTEGRATED HERE — replace BASE_JOBS with GET /api/jobs?userId=... once ready

export const BASE_JOBS = [
  {
    id: "1",
    company: "Linear",
    role: "Senior Product Designer",
    match: 96,
    reason: "Remote-first, full ownership, design system scope",
    logoColor: "#5E6AD2",
    logoLetter: "L",
    source: "linkedin",
    type: "Full-Time",
    workMode: "Remote",
    yearsExp: "5+ yrs",
    location: "San Francisco, CA",
    description:
      "We're looking for a Senior Product Designer to help shape the future of software project management. At Linear, design is a core part of how we build — you'll work directly with engineers and product leads to craft experiences that millions of developers and teams rely on daily.\n\nYou'll own end-to-end design for key product areas, from early exploration to final polish. We care deeply about craft, clarity, and shipping work that actually moves the needle.",
    requirements: [
      "5+ years of product design experience at a B2B or developer-focused company",
      "Strong systems thinking — you've built or significantly contributed to a design system",
      "Fluency in interaction design, information architecture, and visual polish",
      "Comfortable working directly with engineers and reviewing implementation",
      "A portfolio that shows both breadth of thinking and depth of execution",
    ],
    postedDate: "3 days ago",
    contacts: [
      { name: "Sarah Chen", initials: "SC" },
      { name: "Alex Park", initials: "AP" },
    ],
  },
  {
    id: "2",
    company: "Vercel",
    role: "Product Designer",
    match: 91,
    reason: "Developer-led culture, design-code bridge, async",
    logoColor: "#171717",
    logoLetter: "V",
    source: "linkedin",
    type: "Full-Time",
    workMode: "Remote",
    yearsExp: "3+ yrs",
    location: "New York, NY",
    description:
      "Vercel is where the world's best frontend teams deploy their work. As a Product Designer, you'll sit at the intersection of developer tooling and consumer-grade UX — helping make complex infrastructure feel simple and powerful at once.\n\nYou'll collaborate with engineering and product management to define, design, and ship features across our dashboard, CLI, and onboarding flows. We move fast, write clearly, and care about the details.",
    requirements: [
      "3+ years designing developer tools, SaaS dashboards, or technical products",
      "Experience translating complex technical concepts into clear, intuitive UI",
      "Solid grasp of frontend fundamentals — HTML, CSS, component thinking",
      "Async-first work style with strong written communication",
      "Figma proficiency and experience collaborating closely with eng",
    ],
    postedDate: "1 week ago",
    contacts: [
      { name: "James Wu", initials: "JW" },
      { name: "Priya Nair", initials: "PN" },
    ],
  },
  {
    id: "3",
    company: "Notion",
    role: "Product Designer",
    match: 88,
    reason: "Content-first, collaborative, B2B/consumer overlap",
    logoColor: "#191919",
    logoLetter: "N",
    source: "indeed",
    type: "Full-Time",
    workMode: "Hybrid",
    yearsExp: "4+ yrs",
    location: "San Francisco, CA",
    description:
      "Notion's mission is to make it possible for everyone to shape the tools that shape their work. As a Product Designer, you'll help design the blocks, templates, and collaborative surfaces that millions of knowledge workers use every day.\n\nYou'll partner with cross-functional teams across our core editor, AI features, and enterprise product lines. The role is highly collaborative — we work in small teams and ship continuously.",
    requirements: [
      "4+ years of product design with a focus on consumer or prosumer software",
      "Strong portfolio demonstrating a mastery of interaction and visual design",
      "Experience designing for complex, state-heavy UI (editors, databases, or similar)",
      "Collaborative mindset — you run great critique and give useful feedback",
      "Bonus: experience designing AI-powered features or workflows",
    ],
    postedDate: "2 weeks ago",
    contacts: [
      { name: "Tom Baker", initials: "TB" },
      { name: "Elena Costa", initials: "EC" },
    ],
  },
  {
    id: "4",
    company: "Figma",
    role: "UX Designer",
    match: 85,
    reason: "Design community influence, tool ecosystem impact",
    logoColor: "#F24E1E",
    logoLetter: "F",
    source: "linkedin",
    type: "Full-Time",
    workMode: "On-site",
    yearsExp: "3+ yrs",
    location: "San Francisco, CA",
    description:
      "At Figma, we build the tools that designers use to build everything else. As a UX Designer, you'll work on the core product — including the canvas, multiplayer features, plugins, and components — alongside some of the sharpest design minds in the industry.\n\nThis is a role for someone who loves thinking about interaction models at a deep level and can articulate design decisions clearly across a large, cross-functional org.",
    requirements: [
      "3+ years of UX design experience with a strong portfolio",
      "Deep experience with complex, interaction-heavy applications",
      "Comfortable with design systems, component libraries, and design tokens",
      "Strong visual design sensibility and attention to typographic detail",
      "Ability to present work clearly and incorporate feedback constructively",
    ],
    postedDate: "5 days ago",
    contacts: [
      { name: "Chris Moon", initials: "CM" },
      { name: "Dana Fox", initials: "DF" },
    ],
  },
  {
    id: "5",
    company: "Loom",
    role: "Senior UX Designer",
    match: 82,
    reason: "Async-first, startup momentum, video-native product",
    logoColor: "#625DF5",
    logoLetter: "L",
    source: "indeed",
    type: "Full-Time",
    workMode: "Remote",
    yearsExp: "5+ yrs",
    location: "Austin, TX",
    description:
      "Loom helps teams communicate more clearly through video. As a Senior UX Designer, you'll own the experience across our record, watch, and share flows — making async video feel as effortless as sending a message.\n\nYou'll work in a nimble team, move quickly, and have real influence over product direction. We're growing fast and this role will shape how millions of remote workers communicate.",
    requirements: [
      "5+ years of UX design experience, ideally at a startup or high-growth company",
      "Experience with video, media, or communication products is a strong plus",
      "Able to run your own research — user interviews, usability tests, synthesis",
      "Strong visual design chops — you don't hand off wireframes, you ship polished work",
      "Remote-first mindset, comfortable with async collaboration across time zones",
    ],
    postedDate: "1 week ago",
    contacts: [{ name: "Ryan Patel", initials: "RP" }],
  },
  {
    id: "6",
    company: "Stripe",
    role: "Product Designer",
    match: 79,
    reason: "High craft bar, complex systems, strong fintech brand",
    logoColor: "#6772E5",
    logoLetter: "S",
    source: "linkedin",
    type: "Full-Time",
    workMode: "Hybrid",
    yearsExp: "4+ yrs",
    location: "Seattle, WA",
    description:
      "Stripe builds the economic infrastructure of the internet. As a Product Designer, you'll design mission-critical surfaces used by millions of businesses to accept payments, manage revenue, and run their finances.\n\nOur design bar is exceptionally high. You'll be expected to think in systems, write clearly, and obsess over the small details that make complex workflows feel manageable for a global developer audience.",
    requirements: [
      "4+ years of product design experience, ideally in fintech or developer tools",
      "Proven ability to design complex, multi-step workflows with clarity and precision",
      "Experience working with and contributing to large-scale design systems",
      "Strong written communication — Stripe is a writing-first culture",
      "Ability to navigate a large, collaborative org while maintaining design quality",
    ],
    postedDate: "3 weeks ago",
    contacts: [
      { name: "Marcus Webb", initials: "MW" },
      { name: "Anya Singh", initials: "AS" },
    ],
  },
];

export const COL_ORDER = ["picks", "not_applied", "applied", "interview", "offer"];

export const COL_LABELS = {
  picks: "AI Picks",
  not_applied: "Shortlisted",
  applied: "Applied",
  interview: "Interview",
  offer: "Offer",
};

export const COL_BG = {
  picks: "bg-[#E5E1DA] border border-[#D5CFC7] dark:bg-card dark:border-border",
  not_applied: "bg-[#E5E1DA] border border-[#D5CFC7] dark:bg-card dark:border-border",
  applied: "bg-[#E5E1DA] border border-[#D5CFC7] dark:bg-card dark:border-border",
  interview: "bg-[#E5E1DA] border border-[#D5CFC7] dark:bg-card dark:border-border",
  offer: "bg-[#E5E1DA] border border-[#D5CFC7] dark:bg-card dark:border-border",
};

// NOTE: APIS TO BE INTEGRATED HERE — INITIAL_COLUMNS should be populated from GET /api/jobs/pipeline?userId=...
export const INITIAL_COLUMNS = {
  picks: BASE_JOBS,
  not_applied: [],
  applied: [],
  interview: [],
  offer: [],
};

// NOTE: APIS TO BE INTEGRATED HERE — questions should come from GET /api/jobs/onboarding-questions
export const questions = [
  "What kind of work are you looking for — full-time, freelance, or something in between?",
  "Where would you want to be based? Remote, hybrid, or a specific city?",
  "Which industry excites you most right now?",
  "What's the one thing a role must have for you to say yes?",
  "Anything you'd want to avoid in your next job?",
];

// NOTE: APIS TO BE INTEGRATED HERE — replace SCOUT_RESPONSES with POST /api/jobs/scout { jobId, message }
export const SCOUT_SUGGESTIONS = [
  "Tell me why this job is a good fit for me.",
  "Give me resume tips to apply here.",
  "What's the culture like at this company?",
  "Show me similar roles I might like.",
];

export const SCOUT_RESPONSES = {
  "Tell me why this job is a good fit for me.":
    "Based on your senior-level background and preference for remote-first environments, this role aligns well. The scope of ownership and design system work matches your experience and career goals closely.",
  "Give me resume tips to apply here.":
    "Highlight end-to-end design ownership, design system contributions, and close collaboration with engineering. Tailor your summary to emphasize the product areas most relevant to this company's focus.",
  "What's the culture like at this company?":
    "This company is known for a high craft bar and a strong design culture. Teams are small and move fast, with designers having real influence over product direction — not just execution.",
  "Show me similar roles I might like.":
    "Based on this role's profile, you might also enjoy similar positions at Notion, Linear, Vercel, or Figma — all share a design-first culture with remote or hybrid flexibility.",
};
