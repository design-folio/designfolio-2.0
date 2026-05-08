// Central registry for job-hunter credit costs.
// 'cost' matches backend aiLimits.costs — update both together.
// CreditsWidget and feature buttons derive from this — nothing hardcoded elsewhere.

export const JOB_CREDITS = {
  jobRecommendation: {
    cost: 15,
    label: 'Rescan',
    description: 'AI job rescan with fresh matches',
  },
  jobScout: {
    cost: 0,
    label: 'Scout',
    description: 'Ask Scout about a job',
  },
  jobInterview: {
    cost: 30,
    label: 'Interview',
    description: 'Mock video interview session',
  },
  jobCoverLetter: {
    cost: 8,
    label: 'Cover Letter',
    description: 'AI-tailored cover letter',
  },
  jobResumeCustomize: {
    cost: 8,
    label: 'Resume',
    description: 'Portfolio summary tailored to job',
  },
  jobFitAnalysis: {
    cost: 5,
    label: 'Fit Analysis',
    description: 'Strengths, gaps, and verdict',
  },
  offerDecision: {
    cost: 5,
    label: 'Offer Decision',
    description: 'AI compares two offers based on your profile',
  },
};

// Returns badge string shown on buttons, e.g. "1 credit" or "15 cr"
export const creditBadge = (type) => {
  const cost = JOB_CREDITS[type]?.cost;
  if (cost == null) return '';
  return cost === 1 ? '1 credit' : `${cost} PTS`;
};
