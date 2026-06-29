import React, { useRef } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import Modal from "./modal";
import Button from "./button";
import Button2 from "./button";
import Text from "./text";
import CloseIcon from "../../public/assets/svgs/close.svg";

export default function SortableModal({
  show,
  onClose,
  items,
  onSortEnd,
  children,
  title = "Change the order",
  sensors,
  useButton2 = false,
}) {
  const scrollContainerRef = useRef(null);

  const defaultSensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const modalSensors = sensors || defaultSensors;

  return (
    <Modal show={show}>
      <div className="bg-card m-auto my-auto flex max-h-[550px] flex-col justify-between overflow-hidden rounded-2xl lg:w-[500px]">
        <div className="flex items-center justify-between p-5">
          <Text size="p-small" className="font-semibold">
            {title}
          </Text>
          {useButton2 ? (
            <Button2
              type="secondary"
              customClass="!p-2"
              icon={<CloseIcon className="text-icon-color cursor-pointer" />}
              onClick={onClose}
            />
          ) : (
            <Button
              type="secondary"
              customClass="!p-2"
              icon={<CloseIcon className="text-icon-color cursor-pointer" />}
              onClick={onClose}
            />
          )}
        </div>
        <DndContext sensors={modalSensors} collisionDetection={closestCenter} onDragEnd={onSortEnd}>
          <SortableContext items={items || []} strategy={verticalListSortingStrategy}>
            <div
              ref={scrollContainerRef}
              className="flex max-h-[450px] list-none flex-col gap-4 overflow-auto px-5 py-5"
            >
              {children}
            </div>
          </SortableContext>
        </DndContext>

        <div className="h-5" />
      </div>
    </Modal>
  );
}
