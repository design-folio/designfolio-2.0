export const generateAnalysisPrompt = (data) => `
You are an expert salary negotiation consultant with deep knowledge of the ${
  data.country
} job market. Provide a detailed analysis of this job offer in clear, actionable terms.

KEY DETAILS:
- Current Salary: ${data.currentSalary}
- Offered Salary: ${data.offeredSalary}
- Position: ${data.position}
- Company: ${data.company}
- Location: ${data.country}
${data.offerContent ? `\nOFFER DETAILS:\n${data.offerContent}` : ""}

First, calculate and provide an overall score (0-100) based on:
- Salary increase percentage
- Market competitiveness
- Career growth potential
- Company reputation
- Industry outlook

Start your response with "Score: [X]" where X is the calculated score.

Then analyze this offer and provide insights in the following format:

# Executive Summary
Provide a clear, balanced 2-3 sentence overview of the offer, including the percentage increase and initial assessment.

# Compensation Analysis
- Current Package: ${data.currentSalary}
- Offered Package: ${data.offeredSalary}
- Percentage Change: [Calculate and explain the increase/decrease]
- Market Position: [How does this compare to market rates for ${
  data.position
} roles in ${data.country}]

# Market Context
- Industry Standards: [Provide specific salary ranges for ${
  data.position
} roles in ${data.country}]
- Company Position: [${
  data.company
}'s market position and compensation practices]
- Market Trends: [Current trends affecting this role and compensation]

# Negotiation Strategy
## Strengths
- [List 3-4 specific points that support asking for more]
- [Include market data and company-specific factors]

## Action Items
- [Specific next step]
- [Target numbers with justification]
- [Key benefits to negotiate for]

# Risk Assessment
- Market Risks: [Economic factors to consider]
- Career Impact: [How this move affects future opportunities]
- Growth Potential: [Career progression at ${data.company}]

# Email Template
Subject: Re: ${data.position} Offer at ${data.company}

Dear [Hiring Manager's Name],

Thank you for extending the offer for the ${data.position} position at ${
  data.company
}. I am genuinely excited about the opportunity and believe I can make significant contributions to [specific team/project].

After carefully reviewing the offer details and considering my experience and the current market rates for similar positions in ${
  data.country
}, I would like to discuss the compensation package. While the base salary of ${
  data.offeredSalary
} represents an increase from my current compensation, recent market research indicates that professionals in similar roles with my experience level typically command [market rate range].

Given my [specific skill/achievement] and the value I can bring to ${
  data.company
}, I would like to discuss adjusting the base salary to [target range]. This would better align with market rates and reflect my expertise in [key area].

I remain very enthusiastic about joining ${
  data.company
} and am confident we can find a mutually beneficial arrangement. Would you be available for a brief discussion about this?

Thank you for your consideration.

Best regards,
[Your name]

# Long-term Impact
- Career Growth: [Specific opportunities at ${data.company}]
- Skill Development: [Key skills you'll gain]
- Future Value: [How this role enhances your market value]
`;
