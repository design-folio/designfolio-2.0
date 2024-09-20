import React, { useContext, useState } from "react";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import Task from "./task";
import { useGlobalContext } from "@/context/globalContext";

export default function BottomTask() {
  const { taskPercentage } = useGlobalContext();
  const [open, setOpen] = useState(false);
  return (
    <>
      <div
        className={`mb-4 transition-all will-change-transform translateZ(0) origin-bottom duration-120 ease-in-out fixed right-0 left-0 flex justify-center bottom-[88px] ${
          open
            ? "opacity-100 scale-100"
            : "opacity-0 scale-90 pointer-events-none"
        }`}
      >
        <Task setOpen={() => setOpen(false)} />
      </div>
      <div
        className={`px-2 fixed bottom-0 py-4 cursor-pointer left-0 right-0 flex flex-col justify-center items-center overflow-hidden z-10 `}
      >
        <div
          onClick={() => setOpen((prev) => !prev)}
          style={{ boxShadow: "0px 8.3px 33.2px 0px rgba(32, 41, 55, 0.14)" }}
          className="bg-popover-bg shadow-popover-shadow border-[5px] border-popover-border rounded-[24px] px-[14px] py-[10.42px] flex gap-[8.5px] items-center justify-center"
        >
          <div className="w-[47.24px] h-[46.28px]">
            <CircularProgressbar
              value={taskPercentage}
              text={`${taskPercentage}%`}
              styles={buildStyles({
                textColor: "var(--progress-text-color)",
                pathColor: "var(--progress-active-color)",
                trailColor: "var(--progess-trail-color)",
              })}
            />
          </div>
          <p className="text-checked-list-item-text-color font-inter text-[13.28px] font-[600]">
            Complete portfolio
          </p>
        </div>
      </div>
    </>
  );
}
