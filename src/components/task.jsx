/* eslint-disable @next/next/no-img-element */
import React from "react";
import { useGlobalContext } from "@/context/globalContext";
import CloseIcon from "../../public/assets/svgs/close.svg";
import Button from "./button";
import CheckedIcon from "../../public/assets/svgs/checked.svg";

export default function Task({ setOpen }) {
  const { checkList, openModal, setStep } = useGlobalContext();

  const handleClick = (i) => {
    if (i == 0 && !checkList[0].checked) {
      openModal("projects");
    } else if (i == 1 && !checkList[1].checked) {
      openModal("onboarding");
      setStep(2);
    } else if (i == 2 && !checkList[2].checked) {
      openModal("work");
    } else if (i == 3 && !checkList[3].checked) {
      openModal("reviews");
    }
  };

  return (
    <div
      className="bg-popover-bg shadow-popover-shadow border-[5px] border-popover-border transition-all ease-in-out duration-400 p-4 rounded-[24px] flex flex-col gap-[14px] w-[286px]"
      style={{ boxShadow: "0px 8.3px 33.2px 0px rgba(32, 41, 55, 0.14)" }}
    >
      <div className="flex justify-between">
        <p className="text-checked-list-item-text-color text-[20px] font-[500] !font-inter">
          Get started checklist
        </p>
        <Button
          // customClass="lg:hidden"
          type="secondary"
          customClass="!p-2 rounded-[8px]"
          icon={<CloseIcon className="text-icon-color text-base" />}
          onClick={setOpen}
        />
      </div>

      {checkList.map((item, i) => {
        return (
          <div
            key={i}
            onClick={() => handleClick(i)}
            className={`border group border-checked-list-item-border-color bg-checked-list-item-bg-color  transition-all duration-200 ease-in-out hover:bg-checked-list-item-bg-hover-color rounded-2xl flex gap-[10px] items-center p-[10px]  ${
              !item?.checked ? "cursor-pointer " : "cursor-default"
            }`}
          >
            {item?.checked ? (
              <CheckedIcon className="text-checked-list-item-icon-color" />
            ) : (
              <div className="w-[25px] h-[25px] border border-check-list-empty-border-color rounded-full"></div>
            )}
            <p
              className={`text-[12px] font-[500] text-checked-list-item-text-color !font-inter${
                item?.checked && "line-through"
              }`}
            >
              {item.name}
            </p>
          </div>
        );
      })}
    </div>
  );
}
