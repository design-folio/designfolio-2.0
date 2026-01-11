import React, { useRef } from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
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
            <div className="rounded-2xl flex flex-col justify-between  m-auto lg:w-[500px] max-h-[550px] my-auto overflow-hidden bg-modal-bg-color">
                <div className="flex p-5 justify-between items-center">
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
                <DndContext
                    sensors={modalSensors}
                    collisionDetection={closestCenter}
                    onDragEnd={onSortEnd}
                >
                    <SortableContext
                        items={items || []}
                        strategy={verticalListSortingStrategy}
                    >
                        <div
                            ref={scrollContainerRef}
                            className="flex flex-col gap-4 py-5 px-5 list-none max-h-[450px] overflow-auto "
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
