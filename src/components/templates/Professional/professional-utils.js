export const itemVariants = {
  hidden: {
    opacity: 0,
    filter: "blur(10px)",
    y: 10,
  },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.21, 0.47, 0.32, 0.98],
    },
  },
};

export const SPOTLIGHT_TABS = [
  { key: "Projects", label: "Projects" },
  { key: "Experience", label: "Experience" },
  { key: "About", label: "About me" },
  { key: "Contact", label: "Contact" },
  { key: "Testimonials", label: "Testimonials" },
];

// Only backend-valid sectionOrder values — contact is excluded (backend rejects it)
export const PROFESSIONAL_DEFAULT_ORDER = ['projects', 'works', 'about', 'reviews'];

export const PROFESSIONAL_TAB_MAP = {
  projects: { key: 'Projects', label: 'Projects' },
  works:    { key: 'Experience', label: 'Experience' },
  about:    { key: 'About', label: 'About me' },
  contact:  { key: 'Contact', label: 'Contact' },
  reviews:  { key: 'Testimonials', label: 'Testimonials' },
};

export function extractText(content) {
  if (!content) return "";
  if (typeof content === "string") return content;
  if (typeof content === "object") {
    const extract = (node) => {
      if (node.text) return node.text;
      if (node.content) return node.content.map(extract).join(" ");
      return "";
    };
    return extract(content);
  }
  return "";
}

// Shared screw/rivet decoration class
export const screwClass =
  "w-2.5 h-2.5 z-20 rounded-full bg-gradient-to-br from-[#F5F3EF] to-[#D0CCC5] shadow-[inset_-1px_-1px_2px_rgba(0,0,0,0.1),1px_1px_2px_rgba(0,0,0,0.2)] dark:from-[#5A554E] dark:to-[#2A2520]";

// Shared frame border class
export const frameBorderClass =
  "border-[16px] md:border-[20px] border-t-[#EBE7E0] border-r-[#DCD7CD] border-b-[#D2CDC2] border-l-[#E4DFD7] dark:border-t-[#2A2520] dark:border-r-[#1A1A1A] dark:border-b-[#12100E] dark:border-l-[#221F1B]";
