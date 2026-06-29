import React, { useContext, useState } from "react";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import Task from "./task";
import { useGlobalContext } from "@/context/globalContext";
import Text from "./text";
import { popovers } from "@/lib/constant";

export default function BottomTask() {
  const { taskPercentage, setPopoverMenu, popoverMenu } = useGlobalContext();
  return (
    <div data-modal-id={popovers.task}>
      <div
        className={`translateZ(0) fixed right-0 bottom-[88px] left-0 z-50 mb-4 flex origin-bottom justify-center transition-all duration-120 ease-in-out will-change-transform ${
          popoverMenu == popovers.task
            ? "scale-100 opacity-100"
            : "pointer-events-none scale-90 opacity-0"
        }`}
      >
        <Task
          setOpen={() => setPopoverMenu((prev) => (prev == popovers.task ? null : popovers.task))}
        />
      </div>
      <div
        className={`pointer-events-none fixed right-0 bottom-0 left-0 z-10 flex cursor-pointer flex-col items-center justify-center overflow-hidden px-2 py-4`}
      >
        <div
          onClick={() => setPopoverMenu((prev) => (prev == popovers.task ? null : popovers.task))}
          style={{ boxShadow: "0px 8.3px 33.2px 0px rgba(32, 41, 55, 0.14)" }}
          className="bg-popover-bg-color border-popover-border-color pointer-events-auto flex cursor-pointer items-center justify-center gap-[8.5px] rounded-[24px] border-[5px] px-[14px] py-[10.42px] shadow-lg"
        >
          <div className="h-[46.28px] w-[47.24px]">
            <CircularProgressbar
              value={taskPercentage}
              text={`${taskPercentage}%`}
              className="cursor-pointer"
              styles={buildStyles({
                textColor: "var(--progress-text-color)",
                pathColor: "var(--progress-active-color)",
                trailColor: "var(--progess-trail-color)",
              })}
            />
          </div>
          <Text size="p-xxsmall" className="text-checked-list-item-text-color cursor-pointer">
            Complete portfolio
          </Text>
          {/* <p className="text-checked-list-item-text-color font-inter text-[13.28px] font-[600]">
            Complete portfolio
          </p> */}
        </div>
      </div>
    </div>
  );
}
