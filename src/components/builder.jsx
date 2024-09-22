import React from "react";
import Profile from "./profile";
import Projects from "./Projects";

export default function Builder() {
  return (
    <div className="flex-1 flex flex-col gap-4 md:gap-6">
      <Profile edit />
      <Projects edit />
    </div>
  );
}
