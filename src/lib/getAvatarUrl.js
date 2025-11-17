const PERSONAS = [
    {
        "label": "Product Designers",
        "image": "/onboarding-animated-icons/productdesigner.png"
    },
    {
        "label": "Developer / Engineer",
        "image": "/onboarding-animated-icons/developer.png"
    },
    {
        "label": "Product Managers",
        "image": "/onboarding-animated-icons/productmanager.png"
    },
    {
        "label": "Vibe / No-Code Builders",
        "image": "/onboarding-animated-icons/nocodemakers.png"
    },
    {
        "label": "UX Researchers",
        "image": "/onboarding-animated-icons/datascientist.png"
    },
    {
        "label": "Writers",
        "image": "/onboarding-animated-icons/contentwriting.png"
    },
    {
        "label": "Graphic Designers",
        "image": "/onboarding-animated-icons/graphicdesigner.png"
    },
    {
        "label": "Founder",
        "image": "/onboarding-animated-icons/founder.png"
    },
    {
        "label": "Educator",
        "image": "/onboarding-animated-icons/teacher.png"
    },
    {
        "label": "Others",
        "image": "/onboarding-animated-icons/others.png"
    }
];

export const getUserAvatarImage = (userDetails) => {
    // Priority 1: Custom uploaded avatar
    if (userDetails?.avatar?.url) return userDetails.avatar.url;

    // Priority 2: Persona-based avatar
    if (userDetails?.persona?.label) {
        const persona = PERSONAS.find(p => p.label === userDetails.persona.label);
        if (persona?.image) return persona.image;
    }

    // Priority 3: Experience level fallback
    const level = userDetails?.experienceLevel;
    if (level === 1) return "/assets/png/startingout.png";
    if (level === 2) return "/assets/png/intermediate.png";
    if (level === 3) return "/assets/png/advanced.png";

    // Priority 4: Default avatar
    return "/assets/svgs/avatar.svg";
};