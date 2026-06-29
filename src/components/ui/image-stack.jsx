import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ImgStack({ images, autoPlayInterval = 5000 }) {
  const [cards, setCards] = useState(
    images.map((src, index) => ({ id: index, src, zIndex: 50 - index * 10 }))
  );
  const [isAnimating, setIsAnimating] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const minDragDistance = 50;

  const handleNext = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCards((prev) => {
      const newCards = [...prev];
      const cardToMove = newCards.shift();
      newCards.push(cardToMove);
      return newCards.map((card, index) => ({ ...card, zIndex: 50 - index * 10 }));
    });
    setTimeout(() => setIsAnimating(false), 300);
  }, [isAnimating]);

  const handlePrev = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCards((prev) => {
      const newCards = [...prev];
      const cardToMove = newCards.pop();
      newCards.unshift(cardToMove);
      return newCards.map((card, index) => ({ ...card, zIndex: 50 - index * 10 }));
    });
    setTimeout(() => setIsAnimating(false), 300);
  }, [isAnimating]);

  useEffect(() => {
    if (!autoPlayInterval) return;
    const interval = setInterval(() => {
      handleNext();
    }, autoPlayInterval);
    return () => clearInterval(interval);
  }, [autoPlayInterval, handleNext]);

  const getCardStyles = (index) => ({
    x: index * -12,
    y: index * -8,
    rotate: index === 0 ? 0 : -(2 + index * 3),
    scale: 1,
    transition: { duration: 0.5 },
  });

  const handleDragEnd = (_, info) => {
    const dragDistance = Math.sqrt(
      Math.pow(info.point.x - dragStartPos.current.x, 2) +
        Math.pow(info.point.y - dragStartPos.current.y, 2)
    );
    if (isAnimating || dragDistance < minDragDistance) return;
    handleNext();
  };

  return (
    <div className="group relative my-8 flex h-80 w-full items-center justify-center">
      <button
        onClick={handlePrev}
        className="absolute left-0 z-[60] -translate-x-4 rounded-full bg-black/20 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/40"
      >
        <ChevronLeft size={24} />
      </button>

      <div className="relative h-64 w-48">
        {cards.map((card, index) => {
          const isTopCard = index === 0;
          const canDrag = isTopCard && !isAnimating;
          return (
            <motion.div
              key={card.id}
              className="origin-bottom-center absolute inset-0 cursor-grab overflow-hidden rounded-xl border border-white/20 bg-white shadow-xl active:cursor-grabbing"
              style={{ zIndex: card.zIndex }}
              animate={getCardStyles(index)}
              drag={canDrag}
              dragElastic={0.2}
              dragConstraints={{ left: -150, right: 150, top: -150, bottom: 150 }}
              dragSnapToOrigin={true}
              dragTransition={{ bounceStiffness: 600, bounceDamping: 10 }}
              onDragStart={(_, info) => {
                dragStartPos.current = { x: info.point.x, y: info.point.y };
              }}
              onDragEnd={handleDragEnd}
              whileHover={isTopCard ? { scale: 1.05, transition: { duration: 0.2 } } : {}}
              whileDrag={{
                scale: 1.1,
                rotate: 0,
                zIndex: 100,
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
                transition: { duration: 0.1 },
              }}
            >
              <img
                src={card.src}
                alt={`Card ${card.id + 1}`}
                className="pointer-events-none h-full w-full rounded-lg object-cover"
                draggable={false}
              />
            </motion.div>
          );
        })}
      </div>

      <button
        onClick={handleNext}
        className="absolute right-0 z-[60] translate-x-4 rounded-full bg-black/20 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/40"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
}
