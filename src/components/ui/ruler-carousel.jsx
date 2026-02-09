"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const createInfiniteItems = (originalItems) => {
  const items = [];
  for (let i = 0; i < 3; i++) {
    originalItems.forEach((item, index) => {
      items.push({
        ...item,
        id: `${i}-${item.id}`,
        originalIndex: index,
      });
    });
  }
  return items;
};

const RulerLines = ({ totalLines = 41 }) => {
  const lines = [];

  for (let i = 0; i < totalLines; i++) {
    const isFifth = i % 5 === 0;
    const isCenter = i === Math.floor(totalLines / 2);

    let height = 6;
    let color = "bg-[#0A0A0A]/30";

    if (isCenter) {
      height = 16;
      color = "bg-[#FF553E]";
    } else if (isFifth) {
      height = 10;
      color = "bg-[#0A0A0A]/60";
    }

    lines.push(
      <div
        key={i}
        className={`w-[1px] ${color} flex-shrink-0`}
        style={{ height: `${height * 0.75}px` }}
      />
    );
  }

  return (
    <div className="flex items-center justify-between w-full px-8">
      {lines}
    </div>
  );
};

const ITEM_WIDTH = 160;
const ITEM_GAP = 32;

export function RulerCarousel({ originalItems, onItemSelect, selectedIndex }) {
  const infiniteItems = createInfiniteItems(originalItems);
  const itemsPerSet = originalItems.length;

  const [activeIndex, setActiveIndex] = useState(
    itemsPerSet + (selectedIndex ?? 0)
  );
  const [isResetting, setIsResetting] = useState(false);
  const previousIndexRef = useRef(itemsPerSet);

  const handleItemClick = (newIndex) => {
    if (isResetting) return;

    const targetOriginalIndex = newIndex % itemsPerSet;

    const possibleIndices = [
      targetOriginalIndex,
      targetOriginalIndex + itemsPerSet,
      targetOriginalIndex + itemsPerSet * 2,
    ];

    let closestIndex = possibleIndices[0];
    let smallestDistance = Math.abs(possibleIndices[0] - activeIndex);

    for (const index of possibleIndices) {
      const distance = Math.abs(index - activeIndex);
      if (distance < smallestDistance) {
        smallestDistance = distance;
        closestIndex = index;
      }
    }

    previousIndexRef.current = activeIndex;
    setActiveIndex(closestIndex);

    if (onItemSelect) {
      onItemSelect(targetOriginalIndex);
    }
  };

  const handlePrevious = () => {
    if (isResetting) return;
    const newIndex = activeIndex - 1;
    setActiveIndex(newIndex);
    if (onItemSelect) {
      onItemSelect(((newIndex % itemsPerSet) + itemsPerSet) % itemsPerSet);
    }
  };

  const handleNext = () => {
    if (isResetting) return;
    const newIndex = activeIndex + 1;
    setActiveIndex(newIndex);
    if (onItemSelect) {
      onItemSelect(newIndex % itemsPerSet);
    }
  };

  useEffect(() => {
    if (selectedIndex !== undefined) {
      setActiveIndex(itemsPerSet + selectedIndex);
    }
  }, [selectedIndex, itemsPerSet]);

  useEffect(() => {
    if (isResetting) return;

    if (activeIndex < itemsPerSet) {
      setIsResetting(true);
      setTimeout(() => {
        setActiveIndex(activeIndex + itemsPerSet);
        setIsResetting(false);
      }, 0);
    } else if (activeIndex >= itemsPerSet * 2) {
      setIsResetting(true);
      setTimeout(() => {
        setActiveIndex(activeIndex - itemsPerSet);
        setIsResetting(false);
      }, 0);
    }
  }, [activeIndex, itemsPerSet, isResetting]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (isResetting) return;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        handlePrevious();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isResetting, activeIndex]);

  const targetX = -(activeIndex * (ITEM_WIDTH + ITEM_GAP));

  const currentPage = (activeIndex % itemsPerSet) + 1;
  const totalPages = itemsPerSet;

  return (
    <div className="w-full flex flex-col items-center">
      <RulerLines />

      <div className="w-full h-8 relative overflow-hidden my-0.5">
        <motion.div
          className="absolute flex items-center h-full"
          style={{ gap: `${ITEM_GAP}px`, left: "50%" }}
          animate={{
            x: `calc(-${ITEM_WIDTH / 2}px + ${targetX}px)`,
          }}
          transition={
            isResetting
              ? { duration: 0 }
              : {
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }
          }
        >
          {infiniteItems.map((item, index) => {
            const isActive = index === activeIndex;

            return (
              <motion.button
                key={item.id}
                onClick={() => handleItemClick(index)}
                className={`text-sm font-semibold whitespace-nowrap cursor-pointer flex items-center justify-center ${
                  isActive
                    ? "text-[#FF553E]"
                    : "text-[#0A0A0A]/60 hover:text-[#0A0A0A]/80"
                }`}
                animate={{
                  scale: isActive ? 1 : 0.9,
                  opacity: isActive ? 1 : 0.85,
                }}
                transition={
                  isResetting
                    ? { duration: 0 }
                    : {
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                      }
                }
                style={{
                  width: `${ITEM_WIDTH}px`,
                  flexShrink: 0,
                }}
              >
                {item.title}
              </motion.button>
            );
          })}
        </motion.div>
      </div>

      <RulerLines />

      <div className="flex items-center justify-center gap-4 mt-1">
        <button
          onClick={handlePrevious}
          disabled={isResetting}
          className="flex items-center justify-center cursor-pointer p-1"
          aria-label="Previous item"
        >
          <ChevronLeft className="w-4 h-4 text-[#0A0A0A]/70" />
        </button>

        <div className="flex items-center gap-1">
          <span className="text-xs font-medium text-[#0A0A0A]/70">
            {currentPage}
          </span>
          <span className="text-xs text-[#0A0A0A]/40">/</span>
          <span className="text-xs font-medium text-[#0A0A0A]/70">
            {totalPages}
          </span>
        </div>

        <button
          onClick={handleNext}
          disabled={isResetting}
          className="flex items-center justify-center cursor-pointer p-1"
          aria-label="Next item"
        >
          <ChevronRight className="w-4 h-4 text-[#0A0A0A]/70" />
        </button>
      </div>
    </div>
  );
}
