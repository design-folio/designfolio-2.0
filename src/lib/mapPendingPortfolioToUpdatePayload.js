import { DEFAULT_SECTION_ORDER } from "@/lib/constant";

/**
 * Maps convert-resume API response to PATCH /user/update payload for prefilled builder.
 * Keeps shapes minimal and aligned with what the API expects.
 */

function toTiptapDoc(text) {
  const t = String(text || "").trim();
  return {
    type: "doc",
    content: t ? [{ type: "paragraph", content: [{ type: "text", text: t }] }] : [],
  };
}

function getSkillLabel(s) {
  if (s == null) return "";
  if (typeof s === "string") return s;
  return s.name || s.label || String(s);
}

export function mapPendingPortfolioToUpdatePayload(content) {
  if (!content || typeof content !== "object" || content.raw) return null;

  const user = content.user || {};
  const workExperiences = content.workExperiences || [];
  const caseStudies = content.caseStudies || [];
  const MAX_PROJECTS = 2;

  const payload = {};

  // Introduction (name / greeting)
  if (user.name) {
    payload.introduction = String(user.name).trim();
  }

  // Bio (role / tagline) – shown under name in Profile
  if (user.role) {
    payload.bio = String(user.role).trim();
  }

  // About: description + empty pegboard (required shape)
  const aboutDesc = String(user.aboutMe || user.about || "").trim();
  payload.about = {
    description: aboutDesc,
    pegboardImages: [],
    pegboardStickers: [],
  };

  // Skills: custom skills format { label, value, __isNew__: true } (no categories)
  const skillLabels = [];
  if (Array.isArray(user.skills) && user.skills.length) {
    user.skills.forEach((s) => {
      const label = getSkillLabel(s);
      if (label) skillLabels.push(label);
    });
  }
  if (skillLabels.length) {
    payload.skills = skillLabels.map((label) => ({
      label,
      value: label,
      __isNew__: true,
    }));
  }

  // Experiences: role, company, dates, description as Tiptap doc
  if (workExperiences.length) {
    payload.experiences = workExperiences.map((exp) => {
      let startYear = exp.startYear ?? "";
      let endYear = exp.endYear ?? "";
      if ((!startYear || !endYear) && exp.period) {
        const m = String(exp.period).match(/(\d{4})\s*[-–—]\s*(\d{4})/);
        if (m) {
          startYear = startYear || m[1];
          endYear = endYear || m[2];
        }
      }
      return {
        role: exp.role ?? "",
        company: exp.company ?? "",
        startMonth: exp.startMonth ?? "Jan",
        startYear,
        endMonth: exp.endMonth ?? "Dec",
        endYear,
        currentlyWorking: Boolean(exp.currentlyWorking),
        description: toTiptapDoc(exp.description),
      };
    });
  }

  // Projects: max 2, with tiptapContent from description so body is populated
  if (caseStudies.length) {
    payload.projects = caseStudies.slice(0, MAX_PROJECTS).map((proj) => {
      const desc = proj.description || "";
      return {
        title: proj.title ?? "",
        description: desc,
        industry: proj.category ?? "",
        client: proj.client ?? "",
        role: proj.role ?? "",
        platform: proj.platform ?? "",
        contentVersion: 2,
        tiptapContent: toTiptapDoc(desc),
      };
    });
  }

  return Object.keys(payload).length ? payload : null;
}

/** Placeholder case study image paths for preview (no real thumbnail from AI). */
const CASESTUDY_PLACEHOLDER_URLS = [
  "/assets/svgs/casestudyux1.svg",
  "/assets/svgs/casestudyux2.svg",
];

/**
 * Maps convert-resume API response to full userDetails shape for template 0 (Preview1).
 * Use in ResultPopup to render the actual portfolio template.
 * Adds placeholder thumbnails (casestudyux1/2) and stable _id for projects.
 */
export function mapContentToUserDetails(content) {
  const payload = mapPendingPortfolioToUpdatePayload(content);
  if (!payload) return null;

  const user = content?.user || {};

  // Enrich projects with _id (required by Projects/SortableContext) and placeholder thumbnails
  const projects = (payload.projects || []).map((proj, i) => ({
    ...proj,
    _id: proj._id || `preview-project-${i}`,
    thumbnail:
      proj.thumbnail?.url != null
        ? proj.thumbnail
        : { url: CASESTUDY_PLACEHOLDER_URLS[i % CASESTUDY_PLACEHOLDER_URLS.length] },
  }));

  return {
    ...payload,
    projects,
    sectionOrder: DEFAULT_SECTION_ORDER,
    hiddenSections: [],
    contact: user.contact || {},
    contact_email: user.contact?.email,
    email: user.contact?.email,
    phone: user.contact?.phone,
  };
}
