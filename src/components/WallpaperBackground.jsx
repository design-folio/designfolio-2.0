import React, { useEffect, useState, useRef } from "react";

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
    effects = null,
    suppressHydrationWarning = true,
    ...props
}) {
    const [shouldAnimate, setShouldAnimate] = useState(false);
    const [previousWallpaperUrl, setPreviousWallpaperUrl] = useState(null);
    const [scrollOffset, setScrollOffset] = useState(0);
    const rafRef = useRef(null);

    // Track wallpaper changes for smooth transitions
    useEffect(() => {
        const wallpaperId = getWallpaperIdentifier(wallpaperUrl);

        // Only animate if wallpaper identifier has actually changed
        if (previousWallpaperId !== null && previousWallpaperId !== wallpaperId) {
            setShouldAnimate(true);
            // Store previous wallpaper for crossfade
            setPreviousWallpaperUrl(previousWallpaperId);
            // Reset animation flag after transition completes
            const timer = setTimeout(() => {
                setShouldAnimate(false);
                setPreviousWallpaperUrl(null);
            }, 500); // Match animation duration
            return () => clearTimeout(timer);
        } else {
            setShouldAnimate(false);
        }

        // Update previous wallpaper identifier
        previousWallpaperId = wallpaperId;
    }, [wallpaperUrl]);

    // Handle scroll offset for motion effect (simple scale on scroll, no parallax)
    useEffect(() => {
        if (!effects?.motion) {
            setScrollOffset(0);
            return;
        }

        const handleScroll = () => {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }
            rafRef.current = requestAnimationFrame(() => {
                setScrollOffset(window.scrollY);
            });
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }
        };
    }, [effects?.motion]);

    if (!wallpaperUrl) {
        previousWallpaperId = null;
        return null;
    }

    // Build style object with effects (matching Dashboard pattern)
    const style = {
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
    };

    // Apply blur effect
    if (effects?.effectType === 'blur' && effects?.blur > 0) {
        style.filter = `blur(${effects.blur}px)`;
    }

    // Apply motion transform (simple scale on scroll, matching Dashboard)
    if (effects?.motion) {
        style.transform = `scale(${1.05 + (scrollOffset * 0.00008)})`;
        style.transition = 'transform 0.1s ease-out';
    }

    // Build className (only wallpaper-transition, matching Dashboard)
    const className = shouldAnimate ? "wallpaper-transition" : "";

    return (
        <>
            {/* Previous wallpaper layer (stays visible during transition) */}
            {previousWallpaperUrl && (
                <div
                    className="fixed inset-0"
                    style={{
                        backgroundImage: `url(${previousWallpaperUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        zIndex: 0,
                        filter: effects?.effectType === 'blur' && effects?.blur > 0 ? `blur(${effects.blur}px)` : 'none',
                        transform: effects?.motion ? `scale(${1.05 + (scrollOffset * 0.00008)})` : 'none',
                        transition: 'transform 0.1s ease-out'
                    }}
                />
            )}

            {/* Current wallpaper layer with smooth fade-in */}
            <div
                {...props}
                data-wallpaper-background
                data-wallpaper-loaded="true"
                className={className}
                suppressHydrationWarning={suppressHydrationWarning}
                style={style}
            >
                {/* Grain overlay for grain effect */}
                {effects?.effectType === 'grain' && effects?.grainIntensity > 0 && (
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            zIndex: 2,
                            opacity: effects.grainIntensity / 100,
                            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                            mixBlendMode: 'overlay',
                            pointerEvents: "none"
                        }}
                    />
                )}
            </div>
        </>
    );
}
