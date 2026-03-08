import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ImgStack({ images, autoPlayInterval = 5000 }) {
  const [cards, setCards] = useState(
    images.map((src, index) => ({ id: index, src, zIndex: 50 - index * 10 }))
  );
  const [isAnimating, setIsAnimating] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const minDragDistance = 50;

  useEffect(() => {
    if (!autoPlayInterval) return;
    const interval = setInterval(() => { handleNext(); }, autoPlayInterval);
    return () => clearInterval(interval);
  }, [autoPlayInterval, isAnimating]);

  const getCardStyles = (index) => ({
    x: index * -12,
    y: index * -8,
    rotate: index === 0 ? 0 : -(2 + index * 3),
    scale: 1,
    transition: { duration: 0.5 },
  });

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCards((prev) => {
      const newCards = [...prev];
      const cardToMove = newCards.shift();
      newCards.push(cardToMove);
      return newCards.map((card, index) => ({ ...card, zIndex: 50 - index * 10 }));
    });
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handlePrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCards((prev) => {
      const newCards = [...prev];
      const cardToMove = newCards.pop();
      newCards.unshift(cardToMove);
      return newCards.map((card, index) => ({ ...card, zIndex: 50 - index * 10 }));
    });
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleDragEnd = (_, info) => {
    const dragDistance = Math.sqrt(
      Math.pow(info.point.x - dragStartPos.current.x, 2) +
      Math.pow(info.point.y - dragStartPos.current.y, 2)
    );
    if (isAnimating || dragDistance < minDragDistance) return;
    handleNext();
  };

  return (
    <div className="relative flex items-center justify-center w-full h-80 my-8 group">
      <button
        onClick={handlePrev}
        className="absolute left-0 z-[60] p-2 bg-black/20 hover:bg-black/40 rounded-full text-white backdrop-blur-sm transition-all -translate-x-4"
      >
        <ChevronLeft size={24} />
      </button>

      <div className="relative w-48 h-64">
        {cards.map((card, index) => {
          const isTopCard = index === 0;
          const canDrag = isTopCard && !isAnimating;
          return (
            <motion.div
              key={card.id}
              className="absolute inset-0 origin-bottom-center overflow-hidden rounded-xl shadow-xl bg-white cursor-grab active:cursor-grabbing border border-white/20"
              style={{ zIndex: card.zIndex }}
              animate={getCardStyles(index)}
              drag={canDrag}
              dragElastic={0.2}
              dragConstraints={{ left: -150, right: 150, top: -150, bottom: 150 }}
              dragSnapToOrigin={true}
              dragTransition={{ bounceStiffness: 600, bounceDamping: 10 }}
              onDragStart={(_, info) => { dragStartPos.current = { x: info.point.x, y: info.point.y }; }}
              onDragEnd={handleDragEnd}
              whileHover={isTopCard ? { scale: 1.05, transition: { duration: 0.2 } } : {}}
              whileDrag={{ scale: 1.1, rotate: 0, zIndex: 100, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", transition: { duration: 0.1 } }}
            >
              <img
                src={card.src}
                alt={`Card ${card.id + 1}`}
                className="w-full h-full object-cover rounded-lg pointer-events-none"
                draggable={false}
              />
            </motion.div>
          );
        })}
      </div>

      <button
        onClick={handleNext}
        className="absolute right-0 z-[60] p-2 bg-black/20 hover:bg-black/40 rounded-full text-white backdrop-blur-sm transition-all translate-x-4"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
}
