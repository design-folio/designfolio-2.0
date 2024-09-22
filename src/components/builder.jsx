import React from "react";
import Profile from "./profile";
import Projects from "./Projects";
import Reviews from "./reviews";

export default function Builder() {
  return (
    <div className="flex-1 flex flex-col gap-4 md:gap-6">
      <Profile edit />
      <Projects edit />
      <Reviews edit />
    </div>
  );
}
