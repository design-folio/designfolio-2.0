// Central registry for job-hunter credit limits.
// When backend aiLimits.js changes, update the `limit` here to match.
// Every UI badge and widget derives from this object — nothing is hardcoded elsewhere.

export const JOB_CREDITS = {
  jobRecommendation: {
    limit:       5,
    label:       "Rescan",
    description: "AI job rescans per day",
  },
  jobScout: {
    limit:       30,
    label:       "Scout",
    description: "Scout AI messages per day",
  },
  jobInterview: {
    limit:       3,
    label:       "Interview",
    description: "Mock interview sessions per day",
  },
};

// Helper: return the badge string shown on buttons, e.g. "30/day"
export const creditBadge = (type) => `${JOB_CREDITS[type]?.limit ?? '?'}/day`;
