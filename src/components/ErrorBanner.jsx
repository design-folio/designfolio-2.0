import { AlertCircle } from "lucide-react";

export default function ErrorBanner({ message }) {
    if (!message) return null;
    return (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-300/60 bg-red-50 px-3 py-2 text-red-700 dark:border-red-500/40 dark:bg-red-950/30 dark:text-red-300">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{message}</span>
        </div>
    );
}