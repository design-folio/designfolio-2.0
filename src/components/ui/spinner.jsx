import { cn } from "@/lib/utils"
import { Loader2Icon } from "lucide-react"

function Spinner({ className, variant = "default", ...props }) {
  if (variant === "circle") {
    return (
      <svg
        role="status"
        aria-label="Loading"
        className={cn("animate-spin size-4", className)}
        viewBox="0 0 24 24"
        fill="none"
        {...props}
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V2.5A9.5 9.5 0 002.5 12H4z" />
      </svg>
    );
  }

  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  );
}

export { Spinner }
