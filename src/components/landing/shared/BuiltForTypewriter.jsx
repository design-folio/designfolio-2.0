import { useState, useEffect } from "react";
import { Sun } from "lucide-react";

export default function BuiltForTypewriter() {
  const roles = ["PRODUCT DESIGNERS", "DEVS", "PRODUCT MANAGERS"];
  const [roleIndex, setRoleIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [phase, setPhase] = useState("typing");

  useEffect(() => {
    const target = roles[roleIndex];
    let timeout;

    if (phase === "typing") {
      if (displayed.length < target.length) {
        timeout = setTimeout(() => setDisplayed(target.slice(0, displayed.length + 1)), 55);
      } else {
        timeout = setTimeout(() => setPhase("pausing"), 1600);
      }
    } else if (phase === "pausing") {
      timeout = setTimeout(() => setPhase("deleting"), 0);
    } else {
      if (displayed.length > 0) {
        timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 35);
      } else {
        setRoleIndex((i) => (i + 1) % roles.length);
        setPhase("typing");
      }
    }

    return () => clearTimeout(timeout);
  }, [displayed, phase, roleIndex]);

  return (
    <div className="inline-flex items-center gap-[0.5em] whitespace-nowrap">
      <Sun className="w-[13px] h-[13px] text-yellow-500 flex-shrink-0" fill="currentColor" />
      <span className="text-lp-text/70 font-semibold">BUILT FOR</span>
      <span className="font-bold text-lp-text">
        {displayed}<span className="animate-pulse">_</span>
      </span>
    </div>
  );
}
