import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown, Pencil, Plus, Trash2 } from "lucide-react";
import { useGlobalContext } from "@/context/globalContext";
import { sidebars } from "@/lib/constant";
import { SectionVisibilityButton } from "@/components/section";
import SimpleTiptapRenderer from "@/components/SimpleTiptapRenderer";

function getInitials(name, fallback = "U") {
  if (!name || typeof name !== "string") return fallback;
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return fallback;
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || fallback;
  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase() || fallback;
}

function ReviewCard({ rec, isEditing, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [needsExpand, setNeedsExpand] = useState(false);
  const contentRef = useRef(null);

  // Detect actual rendered overflow once Tiptap editor mounts
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const check = () => {
      if (!el) return;
      setNeedsExpand(el.scrollHeight > el.clientHeight + 2);
    };
    // Tiptap editor loads async — check after a short delay
    const t = setTimeout(check, 150);
    return () => clearTimeout(t);
  }, [rec.description]);

  return (
    <div className="bg-white dark:bg-[#2A2520] rounded-[16px] border border-black/5 dark:border-white/10 drop-shadow-sm overflow-hidden group/card relative">
      {isEditing && (
        <div className="absolute top-3 right-3 z-20 transition-opacity flex gap-2 opacity-100 md:opacity-0 md:group-hover/card:opacity-100">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-black/10 dark:border-white/10 shadow-sm hover:bg-white dark:hover:bg-[#35302A]"
            onClick={(e) => { e.stopPropagation(); onEdit(rec); }}
          >
            <Pencil className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
          </Button>
          <div onClick={(e) => e.stopPropagation()}>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-black/10 dark:border-white/10 shadow-sm hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-200 dark:hover:border-red-900/50 hover:text-red-600 dark:hover:text-red-400"
                >
                  <Trash2 className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent
                onClick={(e) => e.stopPropagation()}
                className="bg-[#F0EDE7] dark:bg-[#1A1A1A] border-black/10 dark:border-white/10 rounded-2xl p-6 gap-6 max-w-md w-[90vw]"
              >
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-xl font-semibold text-[#1A1A1A] dark:text-[#F0EDE7]">
                    Delete Recommendation
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-[15px] text-[#7A736C] dark:text-[#B5AFA5]">
                    Are you sure you want to delete this recommendation from {rec.name}? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-3 sm:gap-2">
                  <AlertDialogCancel className="rounded-xl border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-[#1A1A1A] dark:text-[#F0EDE7] m-0 h-11 px-6">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(e) => { e.stopPropagation(); onDelete(rec.id); }}
                    className="rounded-xl bg-red-600 text-white hover:bg-red-700 m-0 h-11 px-6 border-none shadow-none"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center px-6 py-4">
        <div className="flex flex-col">
          <h3 className="font-medium text-base text-[#1A1A1A] dark:text-[#F0EDE7] mb-1">{rec.name}</h3>
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-black dark:text-[#F0EDE7] transition-colors duration-200 hover:text-[#0077B5] dark:hover:text-[#87CEEB] cursor-pointer" fill="currentColor">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
            <span className="text-[13px] text-[#7A736C] dark:text-[#9E9893]">{rec.role}</span>
          </div>
        </div>
        <Avatar className="w-[80px] h-[80px] rounded-none -mr-6 -my-4 transition-all duration-700">
          <AvatarImage src={rec.image} className="object-cover" />
          <AvatarFallback className="rounded-none bg-[#E5D7C4] dark:bg-[#3A352E] text-[#1A1A1A] dark:text-[#F0EDE7]">
            {getInitials(rec.name, "A")}
          </AvatarFallback>
        </Avatar>
      </div>

      <div className="p-0">
        <div className="border border-dashed border-[#E5D7C4] dark:border-[#3A352E] rounded-[16px] p-4">
          <div
            ref={contentRef}
            className={cn(
              "overflow-hidden",
              !expanded && "line-clamp-3"
            )}
          >
            <SimpleTiptapRenderer
              content={rec.description || ""}
              mode="review"
              enableBulletList={false}
              className="text-[#7A736C] dark:text-[#B5AFA5] text-[15px] leading-relaxed"
              noCardStyle
            />
          </div>
          {needsExpand && (
            <button
              onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
              className="text-[13px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7] mt-3 flex items-center gap-1.5 opacity-70 hover:opacity-100 transition-opacity"
            >
              {expanded ? "View less" : "View more"}
              <motion.svg
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                width="10" height="10" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </motion.svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MonoReviewsSection({ isEditing }) {
  const { userDetails, openSidebar, setSelectedReview } = useGlobalContext();

  const mappedRecommendations = useMemo(
    () =>
      (userDetails?.reviews || []).map((review, index) => ({
        id: review._id || review.id || `review-${index}`,
        name: review.name || "Anonymous",
        role: review.company || "",
        description: review.description,
        image: review?.avatar?.url || review?.avatar || "",
        raw: review,
      })),
    [userDetails?.reviews],
  );

  const [recommendations, setRecommendations] = useState(mappedRecommendations);

  useEffect(() => {
    setRecommendations(mappedRecommendations);
  }, [mappedRecommendations]);

  const handleOpenReviewSidebar = useCallback(
    (review) => {
      if (review) setSelectedReview?.(review.raw || review);
      openSidebar?.(sidebars.review);
    },
    [openSidebar, setSelectedReview],
  );

  const handleDelete = useCallback((id) => {
    setRecommendations((prev) => prev.filter((r) => r.id !== id));
  }, []);

  if (!isEditing && recommendations.length === 0) return null;

  return (
    <div className="px-5 md:px-8 py-8 relative group/section">
      {isEditing && (
        <div className="absolute top-4 right-4 transition-opacity z-10 flex gap-2">
          {recommendations.length >= 2 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => openSidebar?.(sidebars.sortReviews)}
              className="h-8 w-8 p-0 rounded-full bg-white dark:bg-[#2A2520] border-black/10 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A] transition-colors opacity-100 md:opacity-0 md:group-hover/section:opacity-100"
            >
              <ChevronsUpDown className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenReviewSidebar(null)}
            className="h-8 w-8 p-0 rounded-full bg-white dark:bg-[#2A2520] border-black/10 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A] transition-colors opacity-100 md:opacity-0 md:group-hover/section:opacity-100"
          >
            <Plus className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
          </Button>
          <SectionVisibilityButton
            sectionId="reviews"
            showOnHoverWhenVisible
            className="h-8 w-8 rounded-full border-black/10 dark:border-white/10 shadow-sm bg-white dark:bg-[#2A2520] hover:bg-gray-50 dark:hover:bg-[#35302A]"
          />
        </div>
      )}

      <h2 className="text-[14px] font-bold text-[#463B34] dark:text-[#D4C9BC] font-dm-mono uppercase tracking-widest mb-6">
        Recommendations
      </h2>

      {recommendations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-dashed border-black/10 dark:border-white/10 bg-background backdrop-blur-sm">
          <div className="w-12 h-12 rounded-full bg-black/[0.03] dark:bg-white/[0.03] flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-[#7A736C] dark:text-[#9E9893]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-[15px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7] mb-1">No recommendations yet</h3>
          <p className="text-[13px] text-[#7A736C] dark:text-[#9E9893] max-w-[250px] mb-5">
            Add recommendations to build trust and credibility.
          </p>
          {isEditing && (
            <Button
              onClick={() => handleOpenReviewSidebar(null)}
              className="h-9 px-4 rounded-full text-[13px] font-medium bg-[#1A1A1A] dark:bg-white text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/90 transition-colors shadow-sm"
            >
              Add Testimonial
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {recommendations.map((rec) => (
            <ReviewCard
              key={rec.id}
              rec={rec}
              isEditing={isEditing}
              onEdit={handleOpenReviewSidebar}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
