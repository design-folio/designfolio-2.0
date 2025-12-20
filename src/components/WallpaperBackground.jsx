import React, { useEffect, useState } from "react";


let previousWallpaperId = null;

function getWallpaperIdentifier(url) {
    if (!url) return null;
    try {
        if (url.startsWith('http://') || url.startsWith('https://')) {
            const urlObj = new URL(url);
            return urlObj.pathname;
        }


        if (url.includes('?')) {
            return url.split('?')[0];
        }

        return url;
    } catch (e) {
        return url.split('?')[0];
    }
}

export default function WallpaperBackground({
    wallpaperUrl,
    suppressHydrationWarning = true,
    ...props
}) {
    const [shouldAnimate, setShouldAnimate] = useState(false);

    useEffect(() => {
        // Extract stable identifier from URL (ignores query params for signed URLs)
        const wallpaperId = getWallpaperIdentifier(wallpaperUrl);

        // Only animate if wallpaper identifier has actually changed
        if (previousWallpaperId !== null && previousWallpaperId !== wallpaperId) {
            setShouldAnimate(true);
            // Reset animation flag after transition completes
            const timer = setTimeout(() => {
                setShouldAnimate(false);
            }, 500); // Match animation duration
            return () => clearTimeout(timer);
        } else {
            setShouldAnimate(false);
        }

        // Update previous wallpaper identifier
        previousWallpaperId = wallpaperId;
    }, [wallpaperUrl]);

    if (!wallpaperUrl) {
        previousWallpaperId = null;
        return null;
    }

    // Only apply transition class if wallpaper changed
    const finalClassName = shouldAnimate ? "wallpaper-transition" : "";

    return (
        <div
            {...props}
            className={finalClassName}
            suppressHydrationWarning={suppressHydrationWarning}
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                zIndex: -1,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                backgroundImage: `url(${wallpaperUrl})`,
                pointerEvents: "none",
            }}
        />
    );
}

