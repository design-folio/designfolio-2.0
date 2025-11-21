import { useEffect, useRef } from "react";
import { AlertCircle } from "lucide-react";

export default function ErrorBanner({ message }) {
    const bannerRef = useRef(null);

    useEffect(() => {
        if (message && bannerRef.current) {
            // Small delay to ensure the banner is rendered
            setTimeout(() => {
                bannerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
            }, 100);
        }
    }, [message]);

    if (!message) return null;
    return (
        <div ref={bannerRef} className="md:mb-4 mb-2 flex items-center gap-2 rounded-xl border border-red-300/60 bg-red-50 px-3 py-2 text-red-700 dark:border-red-500/40 dark:bg-red-950/30 dark:text-red-300">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{message}</span>
        </div>
    );
}