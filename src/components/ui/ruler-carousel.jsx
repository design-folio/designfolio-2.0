"use client";

import { useState, useRef, useEffect, startTransition, useCallback } from "react";
import { motion } from "motion/react";
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
      <div key={i} className={`w-px ${color} shrink-0`} style={{ height: `${height * 0.75}px` }} />
    );
  }

  return <div className="flex w-full items-center justify-between px-8">{lines}</div>;
};

const ITEM_WIDTH = 160;
const ITEM_GAP = 32;

export function RulerCarousel({ originalItems, onItemSelect, selectedIndex }) {
  const infiniteItems = createInfiniteItems(originalItems);
  const itemsPerSet = originalItems.length;

  const [activeIndex, setActiveIndex] = useState(itemsPerSet + (selectedIndex ?? 0));
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

  const handlePrevious = useCallback(() => {
    if (isResetting) return;
    const newIndex = activeIndex - 1;
    setActiveIndex(newIndex);
    if (onItemSelect) {
      onItemSelect(((newIndex % itemsPerSet) + itemsPerSet) % itemsPerSet);
    }
  }, [isResetting, activeIndex, onItemSelect, itemsPerSet]);

  const handleNext = useCallback(() => {
    if (isResetting) return;
    const newIndex = activeIndex + 1;
    setActiveIndex(newIndex);
    if (onItemSelect) {
      onItemSelect(newIndex % itemsPerSet);
    }
  }, [isResetting, activeIndex, onItemSelect, itemsPerSet]);

  useEffect(() => {
    if (selectedIndex !== undefined) {
      startTransition(() => setActiveIndex(itemsPerSet + selectedIndex));
    }
  }, [selectedIndex, itemsPerSet]);

  useEffect(() => {
    if (isResetting) return;

    if (activeIndex < itemsPerSet) {
      startTransition(() => setIsResetting(true));
      setTimeout(() => {
        startTransition(() => {
          setActiveIndex(activeIndex + itemsPerSet);
          setIsResetting(false);
        });
      }, 0);
    } else if (activeIndex >= itemsPerSet * 2) {
      startTransition(() => setIsResetting(true));
      setTimeout(() => {
        startTransition(() => {
          setActiveIndex(activeIndex - itemsPerSet);
          setIsResetting(false);
        });
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
  }, [isResetting, handleNext, handlePrevious]);

  const targetX = -(activeIndex * (ITEM_WIDTH + ITEM_GAP));

  const currentPage = (activeIndex % itemsPerSet) + 1;
  const totalPages = itemsPerSet;

  return (
    <div className="flex w-full flex-col items-center">
      <RulerLines />

      <div className="relative my-0.5 h-8 w-full overflow-hidden">
        <motion.div
          className="absolute flex h-full items-center"
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
                className={`flex cursor-pointer items-center justify-center text-sm font-semibold whitespace-nowrap ${
                  isActive ? "text-[#FF553E]" : "text-[#0A0A0A]/60 hover:text-[#0A0A0A]/80"
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

      <div className="mt-1 flex items-center justify-center gap-4">
        <button
          onClick={handlePrevious}
          disabled={isResetting}
          className="flex cursor-pointer items-center justify-center p-1"
          aria-label="Previous item"
        >
          <ChevronLeft className="h-4 w-4 text-[#0A0A0A]/70" />
        </button>

        <div className="flex items-center gap-1">
          <span className="text-xs font-medium text-[#0A0A0A]/70">{currentPage}</span>
          <span className="text-xs text-[#0A0A0A]/40">/</span>
          <span className="text-xs font-medium text-[#0A0A0A]/70">{totalPages}</span>
        </div>

        <button
          onClick={handleNext}
          disabled={isResetting}
          className="flex cursor-pointer items-center justify-center p-1"
          aria-label="Next item"
        >
          <ChevronRight className="h-4 w-4 text-[#0A0A0A]/70" />
        </button>
      </div>
    </div>
  );
}
