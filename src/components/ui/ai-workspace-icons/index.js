export { CaseStudyAuditIcon } from "./CaseStudyAuditIcon";
export { ResumeFixerIcon } from "./ResumeFixerIcon";
export { MockInterviewIcon } from "./MockInterviewIcon";
export { SalaryNegotiationIcon } from "./SalaryNegotiationIcon";
export { EmailGeneratorIcon } from "./EmailGeneratorIcon";
export { WriteCaseStudyIcon } from "./WriteCaseStudyIcon";

import { CaseStudyAuditIcon } from "./CaseStudyAuditIcon";
import { ResumeFixerIcon } from "./ResumeFixerIcon";
import { MockInterviewIcon } from "./MockInterviewIcon";
import { SalaryNegotiationIcon } from "./SalaryNegotiationIcon";
import { EmailGeneratorIcon } from "./EmailGeneratorIcon";
import { WriteCaseStudyIcon } from "./WriteCaseStudyIcon";

/** Navigation type keys used in pages/ai-tools.jsx */
const NAV = {
  caseStudy: "case-study-generator",
  analyze: "analyze-case-study",
  mockInterview: "mock-interview",
  salary: "salary-negotiator",
  email: "email-generator",
  optimizeResume: "optimize-resume",
};

export function getAiWorkspaceToolIcon(type) {
  const map = {
    [NAV.caseStudy]: WriteCaseStudyIcon,
    [NAV.analyze]: CaseStudyAuditIcon,
    [NAV.mockInterview]: MockInterviewIcon,
    [NAV.salary]: SalaryNegotiationIcon,
    [NAV.email]: EmailGeneratorIcon,
    [NAV.optimizeResume]: ResumeFixerIcon,
  };
  return map[type] || WriteCaseStudyIcon;
}
