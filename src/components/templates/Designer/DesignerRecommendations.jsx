import { useRef } from "react";
import { Pencil, Trash2, Plus, ChevronsUpDown } from "lucide-react";
import { useGlobalContext } from "@/context/globalContext";
import { sidebars } from "@/lib/constant";
import SimpleTiptapRenderer from "@/components/SimpleTiptapRenderer";
import { Button } from "@/components/ui/button";

const PAPER_CLIP_PATH = `polygon(
  0% 3%, 2% 1%, 5% 2%, 9% 0%, 14% 2%, 20% 0%, 27% 2%, 34% 0%,
  41% 2%, 49% 0%, 56% 2%, 63% 0%, 70% 2%, 77% 0%, 83% 2%,
  89% 0%, 94% 2%, 97% 1%, 100% 3%,
  99% 22%, 100% 45%, 99% 68%, 100% 88%, 98% 97%, 100% 100%,
  96% 99%, 90% 100%, 84% 99%, 77% 100%, 70% 99%, 63% 100%,
  56% 99%, 49% 100%, 42% 99%, 35% 100%, 28% 99%, 21% 100%,
  15% 99%, 9% 100%, 4% 99%, 1% 100%, 0% 97%,
  1% 78%, 0% 56%, 1% 34%, 0% 12%
)`;

function LetterCard({ review, isEditing, onEdit, onDelete }) {
  const avatarSrc = review?.avatar?.url || review?.avatar;
  return (
    <div style={{ flexShrink: 0, width: 420, position: "relative" }}>
      <img
        src="/assets/png/clip.png"
        alt=""
        draggable={false}
        style={{
          position: "absolute",
          top: -42,
          left: "50%",
          transform: "translateX(-50%)",
          width: 66,
          zIndex: 10,
          pointerEvents: "none",
        }}
      />

      {isEditing && (
        <div className="absolute top-4 right-4 z-20 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(review)}
            className="h-8 w-8 rounded-full border-black/10 bg-white/90 p-0 shadow-sm backdrop-blur-sm hover:bg-gray-50"
            aria-label="Edit recommendation"
          >
            <Pencil className="h-3.5 w-3.5 text-[#1A1A1A]" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(review)}
            className="h-8 w-8 rounded-full border-black/10 bg-white/90 p-0 shadow-sm backdrop-blur-sm hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            aria-label="Delete recommendation"
          >
            <Trash2 className="h-3.5 w-3.5 text-[#1A1A1A]" />
          </Button>
        </div>
      )}

      <div
        style={{
          width: "100%",
          clipPath: PAPER_CLIP_PATH,
          backgroundColor: "#F8E3C4",
          backgroundImage: "url('/assets/backgrounds/bgcard.avif')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundBlendMode: "multiply",
          padding: "44px 32px 40px",
          position: "relative",
        }}
      >
        <div className="mb-5 flex items-center gap-3.5">
          <div
            style={{
              background: "white",
              padding: "5px 5px 16px 5px",
              boxShadow: "0 4px 14px rgba(0,0,0,0.18)",
              transform: "rotate(-2deg)",
              flexShrink: 0,
            }}
          >
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={review?.name}
                draggable={false}
                style={{ width: 74, height: 74, objectFit: "cover", display: "block" }}
              />
            ) : (
              <div
                style={{
                  width: 74,
                  height: 74,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#439BEA",
                  color: "white",
                  fontWeight: 700,
                  fontSize: 22,
                }}
              >
                {(review?.name || "?").trim().charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <p className="mb-0.5 text-[16px] font-bold text-[#1A1A1A]">{review?.name}</p>
            <p className="text-[13px] leading-snug text-[#6B5B45]">{review?.company}</p>
          </div>
        </div>

        <SimpleTiptapRenderer
          content={review?.description || ""}
          mode="review"
          enableBulletList={false}
          className="text-[15px] leading-[1.75] text-[#2D1F0E]"
          noCardStyle
        />
      </div>
    </div>
  );
}

export default function DesignerRecommendations({ isEditing }) {
  const trackRef = useRef(null);
  const { userDetails, setSelectedReview, openSidebar, openNewReview } = useGlobalContext();
  const { reviews = [] } = userDetails || {};

  if (!isEditing && reviews.length === 0) return null;

  const handleEdit = (review) => {
    setSelectedReview(review);
    openSidebar(sidebars.review);
  };
  const handleDelete = (review) => {
    setSelectedReview(review);
    openSidebar(sidebars.review);
  };

  const cards = reviews.length > 0 ? [...reviews, ...reviews] : [];

  return (
    <div className="pt-16">
      <div className="mb-4 flex items-center gap-3 px-6 md:px-0">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0">
          <path d="M7 0L8.4 5.6L14 7L8.4 8.4L7 14L5.6 8.4L0 7L5.6 5.6L7 0Z" fill="#3B82F6" />
        </svg>
        <span className="designer-script text-[22px] font-bold tracking-[0.04em] text-[#439BEA]">
          Recommendations
        </span>
        <div className="h-px flex-1 bg-[#E2E8F0]" />
        {isEditing && reviews.length > 0 && (
          <div className="flex flex-shrink-0 gap-2">
            {reviews.length >= 2 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => openSidebar(sidebars.sortReviews)}
                className="h-8 w-8 rounded-full border-[#E2E8F0] bg-white p-0 shadow-sm hover:bg-gray-50"
                aria-label="Rearrange recommendations"
              >
                <ChevronsUpDown className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => openNewReview()}
              className="h-8 gap-1.5 rounded-full border-[#E2E8F0] bg-white px-3 text-[12px] font-medium shadow-sm hover:bg-gray-50"
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </Button>
          </div>
        )}
      </div>

      <div className="mb-8 px-6 md:px-0">
        <h2
          className="designer-heading text-[#0F172A]"
          style={{
            fontSize: "clamp(22px, 3.2vw, 38px)",
            fontWeight: 600,
            lineHeight: 1.15,
            letterSpacing: "-0.025em",
          }}
        >
          what people say
        </h2>
      </div>

      {reviews.length === 0 ? (
        <div className="mx-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/10 bg-white/60 px-4 py-16 text-center md:mx-0">
          <h3 className="mb-1 text-[15px] font-medium text-[#1A1A1A]">No recommendations yet</h3>
          <p className="mb-5 max-w-[250px] text-[13px] text-[#7A736C]">
            Add recommendations to build trust and credibility.
          </p>
          {isEditing && (
            <Button
              onClick={() => openNewReview()}
              className="flex h-9 items-center gap-2 rounded-full bg-[#1A1A1A] px-5 text-[13px] font-medium text-white shadow-sm hover:bg-black/80"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Testimonial
            </Button>
          )}
        </div>
      ) : (
        <div
          style={{ overflowX: "clip", overflowY: "visible", width: "100%", position: "relative" }}
        >
          <div
            className="pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-20"
            style={{
              background: "linear-gradient(to right, hsl(var(--background)) 0%, transparent 100%)",
            }}
          />
          <div
            className="pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-20"
            style={{
              background: "linear-gradient(to left, hsl(var(--background)) 0%, transparent 100%)",
            }}
          />

          <div
            ref={trackRef}
            className="flex"
            style={{
              gap: 26,
              width: "max-content",
              animation: "designer-rec-scroll 80s linear infinite",
              paddingBottom: 12,
              paddingTop: 40,
            }}
            onMouseEnter={() =>
              trackRef.current && (trackRef.current.style.animationPlayState = "paused")
            }
            onMouseLeave={() =>
              trackRef.current && (trackRef.current.style.animationPlayState = "running")
            }
          >
            {cards.map((review, i) => (
              <LetterCard
                key={`${review._id}-${i}`}
                review={review}
                isEditing={isEditing}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
