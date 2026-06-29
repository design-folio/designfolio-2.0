import React from "react";

export function GoogleButton({ onClick, isLoading = false, children = "Sign up with Google" }) {
  return (
    <div
      className={`border-border hover-elevate hover:border-foreground/20 flex cursor-pointer items-center justify-center gap-3 rounded-full border bg-(--input-bg-color) px-5 py-3 transition-colors ${
        isLoading ? "cursor-not-allowed opacity-50" : ""
      }`}
      onClick={isLoading ? undefined : onClick}
      data-testid="button-google"
    >
      <img src="/assets/svgs/google.svg" alt="" className="h-5 w-5" />
      <span className="text-foreground text-base font-medium">
        {isLoading ? "Loading..." : children}
      </span>
    </div>
  );
}
