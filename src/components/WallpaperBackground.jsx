import React from "react";

export default function WallpaperBackground({
    wallpaperUrl,
    suppressHydrationWarning = true,
    className = "wallpaper-transition",
    ...props
}) {
    if (!wallpaperUrl) return null;

    return (
        <div
            {...props}
            className={className}
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

