import { modals, moveItemInArray } from "@/lib/constant";
import { _updateUser } from "@/network/post-request";
import React, { useContext, useRef, useState } from "react";
import {
  SortableContainer,
  SortableElement,
  SortableHandle,
} from "react-sortable-hoc";
import Section from "./section";
import WorkCard from "./workCard";
import AddItem from "./addItem";
import PlusIcon from "../../public/assets/svgs/plus.svg";
import Button from "./button";
import BagIcon from "../../public/assets/svgs/bag.svg";
import Modal from "./modal";
import Text from "./text";
import CloseIcon from "../../public/assets/svgs/close.svg";
import DragIcon from "../../public/assets/svgs/drag.svg";
import SortIcon from "../../public/assets/svgs/sort.svg";
import { useTheme } from "next-themes";

export default function Works({
  edit,
  openModal,
  userDetails,
  setUserDetails,
  updateCache,
}) {
  const scrollContainerRef = useRef(null); // Ref for the scrollable container

  const getContainer = () => scrollContainerRef.current;
  const [showModal, setShowModal] = useState(false);
  const { theme } = useTheme();
  const onSortStart = () => {
    document.body.classList.add("cursor-grabbing");
    document.body.classList.remove("cursor-grab");
  };

  const onSortEnd = ({ oldIndex, newIndex }) => {
    document.body.classList.remove("cursor-grabbing");
    document.body.classList.add("cursor-grab");

    const sortedExperiences = moveItemInArray(
      userDetails.experiences,
      oldIndex,
      newIndex
    );

    setUserDetails((prev) => ({ ...prev, experiences: sortedExperiences }));
    _updateUser({ experiences: sortedExperiences }).then((res) =>
      updateCache("userDetails", res?.data?.user)
    );
  };

  return (
    <Section
      title={"Work experience"}
      edit={edit}
      className="!w-fit !h-fit"
      btnType="normal"
      icon={
        userDetails?.experiences?.length != 0 && (
          <SortIcon className="w-4 h-4 text-df-icon-color cursor-pointer" />
        )
      }
      onClick={() => {
        setShowModal(true);
      }}
      imageClassName={"pr-4"}
    >
      <div className="flex flex-col gap-[24px]">
        {userDetails?.experiences?.map((experience) => {
          return (
            <WorkCard
              work={experience}
              key={experience?._id}
              onClick={() => openModal(modals.work)}
              edit={edit}
            />
          );
        })}

        {edit && (
          <AddItem
            title="Add your work experience"
            onClick={() => openModal(modals.work)}
            iconLeft={
              userDetails?.experiences?.length > 0 ? (
                <Button
                  type="secondary"
                  icon={
                    <PlusIcon className="text-secondary-btn-text-color w-[12px] h-[12px] cursor-pointer" />
                  }
                  onClick={() => openModal(modals.work)}
                  size="small"
                />
              ) : (
                <BagIcon />
              )
            }
            iconRight={
              userDetails?.experiences?.length == 0 ? (
                <Button
                  type="secondary"
                  icon={
                    <PlusIcon className="text-secondary-btn-text-color w-[12px] h-[12px] cursor-pointer" />
                  }
                  onClick={() => openModal(modals.work)}
                  size="small"
                />
              ) : (
                false
              )
            }
            theme={theme}
          />
        )}
      </div>
      <Modal show={showModal}>
        <div className="rounded-2xl flex flex-col justify-between  m-auto lg:w-[500px] max-h-[550px] my-auto overflow-hidden bg-modal-bg-color">
          <div className="flex p-5 justify-between items-center">
            <Text size="p-small" className="font-semibold">
              Change the order
            </Text>
            <Button
              // customClass="lg:hidden"
              type="secondary"
              customClass="!p-2"
              icon={<CloseIcon className="text-icon-color cursor-pointer" />}
              onClick={() => {
                document.body.classList.remove("cursor-grab");
                setShowModal(false);
              }}
            />
          </div>
          <SortableContainerElement
            onSortEnd={onSortEnd}
            onSortStart={onSortStart}
            useDragHandle
            axis="y"
            lockAxis="y"
            helperClass="z-[100000] list-none"
            getContainer={getContainer}
            lockToContainerEdges={true}
            lockOffset={["0%", "100%"]} // Lock the movement to the container edges
            helperContainer={getContainer}
          >
            <div
              ref={scrollContainerRef}
              className="flex flex-col gap-[24px] py-5 list-none max-h-[450px] overflow-auto "
            >
              {userDetails?.experiences?.map((experience, index) => (
                <SortableItem
                  key={`item-${experience._id}`} // Assuming each project has a unique id for better key handling
                  index={index}
                  value={experience}
                  edit={edit}
                />
              ))}
            </div>
          </SortableContainerElement>

          <div className="h-5" />
        </div>
      </Modal>
    </Section>
  );
}

const DragHandle = SortableHandle(({ rectFill }) => {
  return (
    <Button
      type="normal"
      icon={
        <DragIcon className="text-project-card-reorder-btn-icon-color cursor-pointer" />
      }
    />
  );
});

const SortableItem = SortableElement(({ value }) => {
  const [grabbing, setGrabbing] = useState(false);
  const { theme } = useTheme();
  return (
    <div
      className={`bg-white px-5 flex justify-between gap-5 items-start dark:bg-[#23252F]`}
    >
      <div className="flex-1">
        <WorkCard work={value} show={false} />
      </div>
      <DragHandle
        setGrabbing={() => setGrabbing(true)}
        rectFill={theme == "dark" ? "#383A47" : "#EFF0F0"}
      />
    </div>
  );
});

const SortableContainerElement = SortableContainer(({ children }) => {
  return <>{children}</>;
});
