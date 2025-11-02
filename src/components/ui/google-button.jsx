import React from "react";

export function GoogleButton({ onClick, isLoading = false, children = "Sign up with Google" }) {
    return (
        <div
            className={`bg-white border border-border rounded-full px-5 py-3 flex items-center justify-center gap-3 hover-elevate cursor-pointer ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            onClick={isLoading ? undefined : onClick}
            data-testid="button-google"
        >
            <img
                src="/assets/svgs/google.svg"
                alt=""
                className="w-5 h-5"
            />
            <span className="text-base font-medium text-foreground">
                {isLoading ? "Loading..." : children}
            </span>
        </div>
    );
}