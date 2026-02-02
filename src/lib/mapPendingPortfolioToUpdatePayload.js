import { DEFAULT_SECTION_ORDER } from "@/lib/constant";

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

const GOAL_GET_HIRED_ID = 0;

function resolvePersona(personaLabel, personas) {
  if (!personaLabel || !Array.isArray(personas) || personas.length === 0) return null;
  const label = personaLabel.trim();
  const matched = personas.find(
    (p) =>
      (p.label || p.name || p.title || "").trim().toLowerCase() === label.toLowerCase()
  );
  if (matched && matched._id) {
    return { value: matched._id, label: matched.label || matched.name || matched.title || label };
  }
  return null;
}

function resolveTool(toolName, tools) {
  if (!toolName || !Array.isArray(tools) || tools.length === 0) return null;
  const name = String(toolName).trim();
  const matched = tools.find(
    (t) =>
      (t.label || t.name || "").trim().toLowerCase() === name.toLowerCase()
  );
  if (matched && (matched.value || matched._id)) {
    const id = matched.value || matched._id;
    return { value: id, label: matched.label || matched.name || name };
  }
  return null;
}

export function mapPendingPortfolioToUpdatePayload(content, personas, tools) {
  if (!content || typeof content !== "object" || content.raw) return null;

  const user = content.user || {};
  const workExperiences = content.workExperiences || [];
  // LLM returns caseStudies; fallback to content.projects if caseStudies empty
  const caseStudies =
    content.caseStudies?.length > 0
      ? content.caseStudies
      : content.projects?.length > 0
        ? content.projects
        : [];
  const MAX_PROJECTS = 2;

  const payload = {};

  // Resume prefill flow (same as onboarding)
  payload.isNewUser = true;

  // Persona from LLM: value must be MongoDB _id (fetched from DB). Only set when we can resolve.
  const personaLabel = (content.persona || "").toString().trim();
  if (personaLabel) {
    const resolved = resolvePersona(personaLabel, personas || []);
    if (resolved) payload.persona = resolved;
  }
  payload.goal = GOAL_GET_HIRED_ID;

  // Experience level from LLM (0=Just starting out, 1=Intermediate, 2=Advanced)
  const expLevel = content.experienceLevel;
  if (typeof expLevel === "number" && expLevel >= 0 && expLevel <= 2) {
    payload.experienceLevel = expLevel;
  }

  // Introduction (name / greeting)
  if (user.name) {
    payload.introduction = String(user.name).trim();
  }

  // Bio (role / tagline) – shown under name in Profile
  if (user.role) {
    payload.bio = String(user.role).trim();
  }

  // Contact (email, phone) – backend expects contact_email, phone
  const contact = user.contact || {};
  if (contact.email) payload.contact_email = String(contact.email).trim();
  if (contact.phone) payload.phone = contact.phone;

  // Socials & portfolios – pass ANY accepted links found in resume (not just LinkedIn)
  // Backend expects socials.{linkedin,twitter,instagram}, portfolios.{medium,dribbble}
  const socials = {};
  const portfolios = {};
  const link = (v) => (v && String(v).trim()) || "";
  if (link(contact.linkedin)) socials.linkedin = link(contact.linkedin);
  if (link(contact.twitter) || link(contact.x)) socials.twitter = link(contact.twitter) || link(contact.x);
  if (link(contact.instagram)) socials.instagram = link(contact.instagram);
  if (link(contact.medium)) portfolios.medium = link(contact.medium);
  if (link(contact.dribbble)) portfolios.dribbble = link(contact.dribbble);
  if (Object.keys(socials).length) payload.socials = socials;
  if (Object.keys(portfolios).length) payload.portfolios = portfolios;

  // Resume file – if user uploaded PDF, include for prefill (FooterSettingsPanel format)
  if (content.resumeFile && content.resumeFile.key && content.resumeFile.originalName) {
    payload.resume = {
      key: content.resumeFile.key,
      originalName: content.resumeFile.originalName,
      extension: content.resumeFile.extension || "pdf",
    };
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

  // Projects: map caseStudies (or content.projects fallback) to payload.projects.
  // If both empty, derive from work experiences so portfolio has project-like entries.
  const projectSources =
    caseStudies.length > 0
      ? caseStudies.slice(0, MAX_PROJECTS).map((proj) => ({
        title: proj.title ?? "",
        description: proj.description || "",
        category: proj.category ?? "",
        client: proj.client ?? "",
        role: proj.role ?? "",
        platform: proj.platform ?? "",
      }))
      : workExperiences.slice(0, MAX_PROJECTS).map((exp) => ({
        title: `${exp.role ?? ""} at ${exp.company ?? ""}`.trim() || "Project",
        description: exp.description || "",
        category: "",
        client: exp.company ?? "",
        role: exp.role ?? "",
        platform: "",
      }));

  if (projectSources.length) {
    payload.projects = projectSources.map((proj) => {
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

  // Testimonials -> reviews
  const testimonials = content.testimonials || [];
  if (testimonials.length) {
    payload.reviews = testimonials.map((t) => ({
      name: t.name ?? "",
      company: t.company ?? "",
      description: toTiptapDoc(t.description),
      linkedinLink: t.linkedinLink || "",
    }));
  }

  const toolNames = content.tools || [];
  if (Array.isArray(toolNames) && toolNames.length && Array.isArray(tools) && tools.length) {
    const resolved = toolNames
      .filter((t) => t && String(t).trim())
      .slice(0, 15)
      .map((name) => resolveTool(name, tools))
      .filter(Boolean);
    if (resolved.length) payload.tools = resolved;
  }

  return Object.keys(payload).length ? payload : null;
}

/** Placeholder case study image paths for preview (no real thumbnail from AI). */
const CASESTUDY_PLACEHOLDER_URLS = [
  "/assets/svgs/casestudyux1.svg",
  "/assets/svgs/casestudyux2.svg",
];

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
