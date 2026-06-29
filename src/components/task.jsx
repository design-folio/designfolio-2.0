import React from "react";
import { useGlobalContext } from "@/context/globalContext";
import CloseIcon from "../../public/assets/svgs/close.svg";
import Button from "./button";
import CheckedIcon from "../../public/assets/svgs/checked.svg";
import Text from "./text";
import { modals, sidebars } from "@/lib/constant";

export default function Task({ setOpen }) {
  const { checkList, openModal, openSidebar, openNewWork, openNewReview, setStep } =
    useGlobalContext();

  const handleClick = (i) => {
    if (i == 0 && !checkList[0].checked) {
      openSidebar(sidebars.project);
    } else if (i == 1 && !checkList[1].checked) {
      openModal(modals.onboarding);
      setStep(2);
    } else if (i == 2 && !checkList[2].checked) {
      openNewWork();
    } else if (i == 3 && !checkList[3].checked) {
      openNewReview();
    }
  };

  return (
    <div
      className="bg-popover-bg-color border-popover-border-color flex w-[286px] flex-col gap-[14px] rounded-[24px] border-4 p-4 shadow-lg transition-all duration-400 ease-in-out"
      style={{ boxShadow: "0px 8.3px 33.2px 0px rgba(32, 41, 55, 0.14)" }}
    >
      <div className="flex items-center justify-between">
        <Text size="p-xsmall" className="text-checked-list-item-text-color cursor-pointer">
          Launch your portfolio
        </Text>
        <Button
          // customClass="lg:hidden"
          type="secondary"
          customClass="!p-2"
          icon={<CloseIcon className="text-icon-color cursor-pointer text-base" />}
          onClick={setOpen}
        />
      </div>

      {checkList.map((item, i) => {
        return (
          <div
            key={i}
            onClick={() => handleClick(i)}
            className={`group border-checked-list-item-border-color bg-checked-list-item-bg-color hover:bg-checked-list-item-bg-hover-color flex items-center gap-[10px] rounded-2xl border p-[10px] transition-all duration-200 ease-in-out ${
              !item?.checked ? "cursor-pointer " : "cursor-default"
            }`}
          >
            {item?.checked ? (
              <CheckedIcon className="text-checked-list-item-icon-color" />
            ) : (
              <div className="border-check-list-empty-border-color h-[25px] w-[25px] cursor-pointer rounded-full border"></div>
            )}
            <Text
              size={`p-xxxsmall`}
              className={`text-checked-list-item-text-color cursor-pointer ${
                item?.checked && "line-through"
              }`}
            >
              {item.name}
            </Text>
          </div>
        );
      })}
    </div>
  );
}
