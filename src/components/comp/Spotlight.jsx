import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { ChevronDown, ChevronUp, EditIcon } from "lucide-react";
import AddItem from "../addItem";
import Button from "../button";
import { useGlobalContext } from "@/context/globalContext";
import { sidebars } from "@/lib/constant";
import PlusIcon from "../../../public/assets/svgs/plus.svg";
import { useTheme } from "next-themes";
import SimpleTiptapRenderer from "../SimpleTiptapRenderer";
import DragHandle from "../DragHandle";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { _updateUser } from "@/network/post-request";
import MemoWorkExperience from "../icons/WorkExperience";

export const Spotlight = ({ userDetails, edit }) => {
  const { experiences } = userDetails || {};
  const { openSidebar, setSelectedWork, updateCache, setUserDetails } =
    useGlobalContext();
  const { theme } = useTheme();

  // Local state to manage expanded/collapsed cards and sorting
  const [expandedCards, setExpandedCards] = useState([]);
  const [sortedExperiences, setSortedExperiences] = useState(experiences || []);

  // Update sorted experiences when the prop changes
  useEffect(() => {
    setSortedExperiences(experiences || []);
  }, [experiences]);

  const handleClick = (work) => {
    setSelectedWork(work);
    openSidebar(sidebars.work);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { duration: 0.3, ease: "easeOut", staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const toggleExpand = (index) => {
    setExpandedCards((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Update the sorted order when a drag ends
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sortedExperiences.findIndex(
      (exp) => exp._id === active.id
    );
    const newIndex = sortedExperiences.findIndex((exp) => exp._id === over.id);
    const newSortedExperiences = arrayMove(
      sortedExperiences,
      oldIndex,
      newIndex
    );
    setSortedExperiences(newSortedExperiences);

    // Update global user details and sync with API
    setUserDetails((prev) => ({ ...prev, experiences: newSortedExperiences }));
    _updateUser({ experiences: newSortedExperiences })
      .then((res) => updateCache("userDetails", res?.data?.user))
      .catch((err) => console.error("Error updating user:", err));
    // (Optional) Update global context or API here if needed.
  };

  // Helper to get plain text length from Tiptap JSON
  const getTextLength = (content) => {
    if (!content) return 0;
    if (typeof content === 'string') return content.length;
    if (typeof content === 'object' && content.type === 'doc') {
      const extractText = (node) => {
        if (!node) return '';
        if (typeof node === 'string') return node;
        if (node.type === 'text') return node.text || '';
        if (node.content && Array.isArray(node.content)) {
          return node.content.map(extractText).join('');
        }
        return '';
      };
      return extractText(content).length;
    }
    return 0;
  };

  // Sortable card for each work experience
  const SortableExperienceCard = ({ experience, index }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
      useSortable({
        id: experience._id,
      });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      zIndex: isDragging ? 9999 : 1,
    };
    const isExpanded = expandedCards.includes(index);
    const descriptionLength = getTextLength(experience.description);
    const shouldShowToggle = descriptionLength > 180;

    return (
      <div ref={setNodeRef} style={style} className={isDragging ? 'relative' : ''}>
        <motion.div
          variants={itemVariants}
          className="group bg-card p-6 rounded-lg hover:bg-card/80 transition-colors relative overflow-hidden shadow-[0px_0px_16.4px_0px_rgba(0,0,0,0.02)]"
          onClick={() => handleClick(experience)}
        >
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 group-hover:animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full" />
          </div>
          <div className="relative z-10">
            <div className="flex flex-col gap-1">
              <div className="flex flex-col lg:flex-row gap-2 justify-between items-start">
                <h3 className="font-semibold text-lg">{experience.role}</h3>
                <div className="flex flex-1 gap-2 lg:justify-end w-full items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {`${experience?.startMonth} ${experience?.startYear} - ${experience?.currentlyWorking
                      ? "Present"
                      : `${experience?.endMonth} ${experience?.endYear}`
                      }`}
                  </span>
                  {edit && (
                    <div className="flex gap-4">
                      <Button
                        onClick={() => handleClick(experience)}
                        customClass="!p-0 !flex-shrink-0 border-none"
                        type={"secondary"}
                        icon={
                          <EditIcon className="text-gray-600 dark:text-gray-400 cursor-pointer" />
                        }
                      />
                      {/* Drag handle: attach the drag listeners only here */}
                      <DragHandle
                        listeners={listeners}
                        attributes={attributes}
                        className="!px-3 !py-2"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="text-base text-gray-600 dark:text-gray-400">
                {experience.company}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 relative">
                <div className={shouldShowToggle && !isExpanded ? "max-h-[110px] overflow-hidden relative" : ""}>
                  <SimpleTiptapRenderer
                    content={experience.description || ""}
                    mode="work"
                    enableBulletList={true}
                  />
                  {shouldShowToggle && !isExpanded && (
                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent pointer-events-none" />
                  )}
                </div>
                {shouldShowToggle && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(index);
                    }}
                    className="mt-2 text-foreground hover:text-foreground/80 inline-flex items-center gap-1 underline underline-offset-4"
                  >
                    {isExpanded ? (
                      <>
                        Show Less <ChevronUp className="h-3 w-3" />
                      </>
                    ) : (
                      <>
                        View More <ChevronDown className="h-3 w-3" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <section className="py-12">
      <h2 className="text-2xl font-bold mb-8">Work Experience</h2>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sortedExperiences.map((exp) => exp._id)}
          strategy={verticalListSortingStrategy}
        >
          <motion.div
            ref={ref}
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "show" : "hidden"}
            className="space-y-6"
          >
            {sortedExperiences.map((experience, index) => (
              <SortableExperienceCard
                key={experience._id}
                experience={experience}
                index={index}
              />
            ))}
          </motion.div>
        </SortableContext>
      </DndContext>
      {edit && (
        <AddItem
          className="bg-df-section-card-bg-color shadow-df-section-card-shadow mt-4"
          title="Add your work experience"
          onClick={() => openSidebar(sidebars.work)}
          iconLeft={
            sortedExperiences?.length > 0 ? (
              <Button
                type="secondary"
                icon={
                  <PlusIcon className="text-secondary-btn-text-color w-[12px] h-[12px] cursor-pointer" />
                }
                onClick={() => openSidebar(sidebars.work)}
                size="small"
              />
            ) : (
              <MemoWorkExperience />
            )
          }
          iconRight={
            sortedExperiences?.length === 0 ? (
              <Button
                type="secondary"
                icon={
                  <PlusIcon className="text-secondary-btn-text-color w-[12px] h-[12px] cursor-pointer" />
                }
                onClick={() => openSidebar(sidebars.work)}
                size="small"
              />
            ) : (
              false
            )
          }
          theme={theme}
        />
      )}
    </section>
  );
};

export default Spotlight;
