export const getUserAvatarImage = (userDetails) => {
    if (userDetails?.avatar?.url) return userDetails.avatar.url;

    const level = userDetails?.experienceLevel;
    if (level === 1) return "/assets/png/startingout.png";
    if (level === 2) return "/assets/png/intermediate.png";
    if (level === 3) return "/assets/png/advanced.png";

    return "/assets/svgs/avatar.svg";
};