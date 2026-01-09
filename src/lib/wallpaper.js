export const removeWallpaper = () => {
    const wallpaperElement = document.getElementById("global-wallpaper");
    if (wallpaperElement) {
        wallpaperElement.remove();
    }
    // Restore background color by removing inline styles to allow CSS rules to apply
    document.body.style.removeProperty("background-color");
    document.documentElement.style.removeProperty("background-color");
};

const applyWallpaper = (url) => {
    const oldWallpaper = document.getElementById("global-wallpaper");

    // Set body background to transparent to ensure wallpaper is visible
    // Don't set HTML background to avoid inheritance issues
    document.body.style.backgroundColor = "transparent";

    // Create new wallpaper element
    const newWallpaper = document.createElement("div");
    newWallpaper.id = "global-wallpaper";
    newWallpaper.style.position = "fixed";
    newWallpaper.style.top = "0";
    newWallpaper.style.left = "0";
    newWallpaper.style.width = "100vw";
    newWallpaper.style.height = "100vh";
    newWallpaper.style.zIndex = "-1";
    newWallpaper.style.backgroundSize = "cover";
    newWallpaper.style.backgroundPosition = "center";
    newWallpaper.style.backgroundRepeat = "no-repeat";
    newWallpaper.style.pointerEvents = "none";
    newWallpaper.style.backgroundImage = `url(${url})`;

    // Add animation class
    newWallpaper.classList.add("wallpaper-transition");

    // Append new wallpaper
    document.body.appendChild(newWallpaper);

    // Remove old wallpaper after animation
    if (oldWallpaper) {
        oldWallpaper.removeAttribute("id"); // Prevent selecting this one again
        setTimeout(() => {
            oldWallpaper.remove();
        }, 500); // Wait for 0.5s animation
    }
};

export const setWallpaperValue = (value, theme = "light") => {
    if (hasNoWallpaper(value)) {
        removeWallpaper();
        return;
    }
    const url = getWallpaperUrl(value, theme);
    if (url) {
        applyWallpaper(url);
    } else {
        removeWallpaper();
    }
};

export const getWallpaperUrl = (value, theme = "light") => {
    if (typeof value === "string") {
        return value;
    }
    const basePath = theme === "dark" ? "/wallpaper/darkui" : "/wallpaper";

    switch (value) {
        case 1:
            return `${basePath}/wall1.png`;
        case 2:
            return `${basePath}/wall2.png`;
        case 3:
            return `${basePath}/wall3.png`;
        case 4:
            return `${basePath}/wall4.png`;
        case 5:
            return `${basePath}/wall5.png`;
        case 6:
            return `${basePath}/wall6.png`;
        case 7:
            return `${basePath}/wall7.png`;
        default:
            return null;
    }
};

export const extractWallpaperValue = (wallpaper) => {
    if (!wallpaper) return undefined;
    return (wallpaper && typeof wallpaper === 'object')
        ? (wallpaper.url || wallpaper.value)
        : wallpaper;
};

export const hasNoWallpaper = (value) => {
    return !value || value === 0 || value === null || value === undefined || value === "";
};
