// Utility functions for wallpaper - DOM manipulation moved to WallpaperBackground component

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
