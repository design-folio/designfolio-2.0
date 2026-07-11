import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGlobalContext } from "@/context/globalContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { sidebars, DEFAULT_SECTION_ORDER, normalizeSectionOrder } from "@/lib/constant";
import { BACKGROUND_MODE, BACKGROUND_COLORS } from "@/lib/wallpaper";
import { TYPOGRAPHY } from "@/lib/typography";
import styles from "@/styles/domain.module.css";
import imageCompression from "browser-image-compression";
import { Upload, RotateCcw, Check, Sun, Moon, Eye, EyeOff, ChevronDown } from "lucide-react";
import DragHandle from "../DragHandle";
import React, { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { Badge } from "../ui/badge";
import { Slider } from "../ui/slider";
import { Switch as SwitchCanvas } from "../templates/Canvas/switch-button";
import { AnimatePresence, motion } from "motion/react";
import Text from "../text";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { _updateUser } from "@/network/post-request";
import { runThemeTransition, hasThemeSwitchEffect } from "@/hooks/use-theme-switch-audio";
import { useTheme } from "next-themes";
import { TEMPLATE_IDS, TEMPLATES_BY_ID, getTemplateThumbnailSrc } from "@/lib/templates";
import { PROFESSIONAL_DEFAULT_ORDER } from "@/components/templates/Professional/professional-utils";

function TemplateCardPlaceholder() {
  return (
    <div className="absolute inset-0 flex flex-col gap-2 p-3 opacity-40">
      <div className="flex items-center gap-2">
        <div className="h-5 w-5 rounded-full bg-black/20 dark:bg-white/20" />
        <div className="h-1.5 w-12 rounded-full bg-black/20 dark:bg-white/20" />
      </div>
      <div className="mt-1 h-12 w-full rounded-md bg-black/10 dark:bg-white/10" />
      <div className="mt-auto flex gap-2">
        <div className="h-8 w-full rounded-md bg-black/10 dark:bg-white/10" />
        <div className="h-8 w-full rounded-md bg-black/10 dark:bg-white/10" />
      </div>
    </div>
  );
}

function TemplateCard({ tmpl, isSelected, onChange, previewSrc }) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setImageFailed(false));
  }, [previewSrc]);

  const showThumbnail = Boolean(previewSrc) && !imageFailed;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-full">
        <button
          type="button"
          onClick={() => onChange(tmpl.id)}
          className={twMerge(
            "group/card aspect-square w-full cursor-pointer rounded-[24px] transition-colors focus:outline-none",
            isSelected
              ? "border-df-orange-color border-[2.5px] p-1.5"
              : "border-[2.5px] border-transparent p-1.5 hover:bg-black/5 dark:hover:bg-white/5"
          )}
        >
          <div
            className={twMerge(
              "pointer-events-none relative h-full w-full overflow-hidden rounded-[14px] border border-black/5 shadow-sm dark:border-white/5",
              "transition-[box-shadow,background-color] duration-200 ease-out",
              isSelected ? "bg-accent" : "bg-card group-hover/card:shadow-md"
            )}
          >
            {showThumbnail ? (
              <img
                src={previewSrc}
                alt=""
                className="pointer-events-none absolute inset-0 h-full w-full object-cover object-top"
                onError={() => setImageFailed(true)}
              />
            ) : (
              <div className="pointer-events-none absolute inset-0">
                <TemplateCardPlaceholder />
              </div>
            )}
          </div>
        </button>

        {isSelected && (
          <div className="bg-df-orange-color text-primary-foreground border-sidebar pointer-events-none absolute -bottom-1 -left-1 z-10 flex items-center justify-center rounded-full border-2 p-1.5 shadow-sm">
            <Check size={14} strokeWidth={3.5} />
          </div>
        )}
      </div>

      <div className="pointer-events-none flex items-center gap-1.5">
        <span
          className={twMerge(
            "text-center text-[14px] font-medium transition-colors",
            isSelected ? "text-primary" : "text-muted-foreground"
          )}
        >
          {tmpl.item}
        </span>
        {tmpl.isNew && (
          <Badge className="bg-[#EE7F70] px-1.5 py-0 text-[10px] font-medium text-white">New</Badge>
        )}
        {tmpl.isPro && (
          <Badge className="bg-[#EE7F70] px-1.5 py-0 text-[10px] font-medium text-white">Pro</Badge>
        )}
      </div>
    </div>
  );
}

const DEFAULT_VISIBLE_WALLPAPERS = 2;

// Section display names mapping
const SECTION_NAMES = {
  about: "About me",
  projects: "Projects",
  reviews: "Testimonials",
  tools: "Toolbox",
  works: "Works/Experience",
  contact: "Contact",
};

// Get available sections for a template
const getAvailableSections = (template) => {
  if (template === TEMPLATE_IDS.PROFESSIONAL) return PROFESSIONAL_DEFAULT_ORDER;
  return DEFAULT_SECTION_ORDER;
};

// SortableSectionItem Component
const SortableSectionItem = ({ id, isMobile, isHidden, onToggleHide }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={twMerge(
        "flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all",
        "bg-muted/50 border-border",
        "hover:bg-muted",
        isDragging && "z-50 opacity-50 shadow-lg"
      )}
      data-testid={isMobile ? `section-item-${id}-mobile` : `section-item-${id}`}
    >
      <DragHandle
        listeners={listeners}
        attributes={attributes}
        isButton={true}
        className="text-foreground/40 hover:text-foreground/60 cursor-grab transition-colors active:cursor-grabbing"
      />
      <span className="flex-1 text-sm font-medium">{SECTION_NAMES[id] || id}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleHide();
        }}
        className="text-foreground/40 hover:text-foreground rounded-md p-1 transition-colors"
        aria-label={isHidden ? "Show section" : "Hide section"}
        type="button"
      >
        {isHidden ? <EyeOff className="h-4 w-4 text-amber-500" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
};

const ThemePanel = ({
  theme,
  changeTheme,
  template,
  changeTemplate,
  templates,
  getTemplateStyles,
  cursor,
  handleChangeCursor,
  cursors,
  getStyles,
  wallpaper,
  changeWallpaper,
  wallpapers,
  effects,
  updateWallpaperEffect,
  backgroundMode,
  changeBackgroundMode,
  wallpaperColor,
  changeWallpaperColor,
  typography,
  changeTypography,
}) => {
  const {
    registerUnsavedChangesChecker,
    unregisterUnsavedChangesChecker,
    userDetails,
    updateCache,
    setUserDetails,
  } = useGlobalContext();
  const [customWallpaper, setCustomWallpaper] = useState(null);
  const [customColor, setCustomColor] = useState("#D4C5F9");
  const colorInputRef = useRef(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [showMoreWallpapers, setShowMoreWallpapers] = useState(false);
  const isMobileOrTablet = useIsMobile();
  const isDarkWallpapers = theme === "dark" || theme === 1;

  const isMacOSTemplate = template === 4;
  const isChatfolioTemplate = template === 1;
  const useThemeSwitchEffect = hasThemeSwitchEffect(template);
  const appearanceSwitchRefLayouts = useRef(null);
  const appearanceSwitchRefBackground = useRef(null);

  const applyThemeChange = (checked, originElement) => {
    const apply = () => changeTheme(checked ? 1 : 0);
    if (useThemeSwitchEffect && !isMacOSTemplate) {
      runThemeTransition(originElement, apply, { playSound: true, ripple: true });
    } else {
      apply();
    }
  };

  const availableSections = getAvailableSections(template);

  // Initialize sectionOrder from userDetails or use template default
  const [sectionOrder, setSectionOrder] = useState(() => {
    return normalizeSectionOrder(userDetails?.sectionOrder, availableSections);
  });

  // Update sectionOrder when template or userDetails changes
  useEffect(() => {
    const newAvailableSections = getAvailableSections(template);
    queueMicrotask(() =>
      setSectionOrder(normalizeSectionOrder(userDetails?.sectionOrder, newAvailableSections))
    );
  }, [template, userDetails?.sectionOrder]);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const hiddenSections = userDetails?.hiddenSections || [];

  const toggleSectionHide = (sectionId) => {
    const newHidden = hiddenSections.includes(sectionId)
      ? hiddenSections.filter((id) => id !== sectionId)
      : [...hiddenSections, sectionId];
    setUserDetails((prev) => ({ ...prev, hiddenSections: newHidden }));
    updateCache("userDetails", (prev) => ({ ...prev, hiddenSections: newHidden }));
    _updateUser({ hiddenSections: newHidden });
  };

  // Change section order function
  const changeSectionOrder = (newOrder) => {
    // Guard against empty arrays - use default order instead
    if (!newOrder || !Array.isArray(newOrder) || newOrder.length === 0) {
      const defaultOrder = DEFAULT_SECTION_ORDER;
      newOrder = defaultOrder;
    }

    _updateUser({ sectionOrder: newOrder })
      .then((res) => {
        const updatedUser = res?.data?.user;
        updateCache("userDetails", { sectionOrder: newOrder });
        setUserDetails((prev) => ({ ...prev, sectionOrder: newOrder }));
        setSectionOrder(newOrder);
      })
      .catch((error) => {
        console.error("Error updating section order:", error);
      });
  };

  // Reset to template default
  const resetSectionOrder = () => {
    // Filter default order to only include available sections for current template
    const defaultOrder = DEFAULT_SECTION_ORDER.filter((section) =>
      availableSections.includes(section)
    );
    setSectionOrder(defaultOrder);
    changeSectionOrder(defaultOrder);
  };

  // Handle drag end
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Guard against empty sectionOrder
    if (!sectionOrder || sectionOrder.length === 0) {
      const defaultOrder = DEFAULT_SECTION_ORDER;
      setSectionOrder(defaultOrder);
      changeSectionOrder(defaultOrder);
      return;
    }

    const oldIndex = sectionOrder.indexOf(active.id);
    const newIndex = sectionOrder.indexOf(over.id);

    // Guard against invalid indices
    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const newOrder = arrayMove(sectionOrder, oldIndex, newIndex);

    // Guard against empty result
    if (!newOrder || newOrder.length === 0) {
      const defaultOrder = DEFAULT_SECTION_ORDER;
      setSectionOrder(defaultOrder);
      changeSectionOrder(defaultOrder);
      return;
    }

    setSectionOrder(newOrder);
    changeSectionOrder(newOrder);

    // Scroll to moved section
    setTimeout(() => {
      const sectionElement = document.getElementById(`section-${active.id}`);
      if (sectionElement) {
        sectionElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  };

  // Fallback to local state if effects is not provided (backward compatibility)
  const [localEffects, setLocalEffects] = useState({
    blur: 0,
    effectType: "blur",
    grainIntensity: 25,
    motion: true,
  });

  // Use provided effects or fall back to local state
  const currentEffects = effects || localEffects;
  const currentUpdateWallpaperEffect =
    updateWallpaperEffect ||
    ((key, value) => {
      setLocalEffects((prev) => ({ ...prev, [key]: value }));
    });

  useEffect(() => {
    registerUnsavedChangesChecker(sidebars.theme, () => false);
    return () => {
      unregisterUnsavedChangesChecker(sidebars.theme);
    };
  }, [registerUnsavedChangesChecker, unregisterUnsavedChangesChecker]);

  useEffect(() => {
    if (typeof wallpaper === "string") {
      queueMicrotask(() => setCustomWallpaper(wallpaper));
    }
  }, [wallpaper]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB. Please choose a smaller image.");
      return;
    }

    setIsCompressing(true);

    try {
      const img = new Image();
      const imageUrl = URL.createObjectURL(file);

      await new Promise((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = imageUrl;
      });

      // Simple minimum size check
      if (img.width < 500 || img.height < 300) {
        URL.revokeObjectURL(imageUrl);
        setIsCompressing(false);
        alert("Image is too small. Please use an image at least 500x300 pixels.");
        return;
      }

      // Always resize to 1920x1080
      const canvas = document.createElement("canvas");
      canvas.width = 1920;
      canvas.height = 1080;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, 1920, 1080);

      const resizedBlob = await new Promise((resolve) => {
        let mimeType = "image/jpeg"; // default
        if (file.type.includes("png")) {
          mimeType = "image/png";
        } else if (file.type.includes("gif")) {
          mimeType = "image/gif";
        } else if (file.type.includes("jpeg") || file.type.includes("jpg")) {
          mimeType = "image/jpeg";
        }
        canvas.toBlob(resolve, mimeType, 0.9);
      });

      const fileToCompress = new File([resizedBlob], file.name, { type: resizedBlob.type });
      URL.revokeObjectURL(imageUrl);

      // Compress the image
      const compressedFile = await imageCompression(fileToCompress, {
        maxSizeMB: 2,
        useWebWorker: true,
      });

      // Create preview URL from compressed file
      const url = URL.createObjectURL(compressedFile);
      setCustomWallpaper(url);

      // Convert compressed file to Base64 for API payload
      const reader = new FileReader();
      reader.onloadend = () => {
        changeWallpaper(
          {
            base64: reader.result,
            type: compressedFile.type,
            name: compressedFile.name,
          },
          compressedFile.name
        );
        setIsCompressing(false);
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error("Error compressing image:", error);
      // Fallback to original file if compression fails
      const url = URL.createObjectURL(file);
      setCustomWallpaper(url);
      const reader = new FileReader();
      reader.onloadend = () => {
        changeWallpaper(
          {
            base64: reader.result,
            type: file.type,
            name: file.name,
          },
          file.name
        );
        setIsCompressing(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderContent = (isMobile) => (
    <Tabs defaultValue="layouts" className="flex h-full w-full flex-col">
      <div
        className={`sticky top-0 z-50 px-6 ${isMobile ? "pb-2" : "pt-4 pb-2"} border-border/30 border-b backdrop-blur-sm`}
      >
        <div className="hide-scrollbar -mx-6 overflow-x-auto px-6">
          <TabsList className="h-auto w-full min-w-fit justify-start gap-6 bg-transparent p-0">
            <TabsTrigger
              value="layouts"
              className="data-[state=active]:border-foreground text-foreground/60 data-[state=active]:text-foreground rounded-none border-b-2 border-transparent bg-transparent px-0 pb-2 font-medium transition-all data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              data-testid={isMobile ? "tab-layouts-mobile" : "tab-layouts"}
            >
              Layouts
            </TabsTrigger>
            <TabsTrigger
              value="background"
              className="data-[state=active]:border-foreground text-foreground/60 data-[state=active]:text-foreground rounded-none border-b-2 border-transparent bg-transparent px-0 pb-2 font-medium transition-all data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              data-testid={isMobile ? "tab-background-mobile" : "tab-background"}
            >
              Background
            </TabsTrigger>
            {!isMacOSTemplate && (
              <TabsTrigger
                value="blocks"
                className="data-[state=active]:border-foreground text-foreground/60 data-[state=active]:text-foreground rounded-none border-b-2 border-transparent bg-transparent px-0 pb-2 font-medium transition-all data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                data-testid={isMobile ? "tab-blocks-mobile" : "tab-blocks"}
              >
                Blocks
              </TabsTrigger>
            )}
            <TabsTrigger
              value="cursors"
              className="data-[state=active]:border-foreground text-foreground/60 data-[state=active]:text-foreground rounded-none border-b-2 border-transparent bg-transparent px-0 pb-2 font-medium transition-all data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              data-testid={isMobile ? "tab-cursors-mobile" : "tab-cursors"}
            >
              Cursors
            </TabsTrigger>
          </TabsList>
        </div>
      </div>

      <TabsContent
        value="layouts"
        className="thin-scrollbar m-0 flex-1 overflow-y-auto p-6"
        data-testid={isMobile ? "content-layouts-mobile" : "content-layouts"}
      >
        <div className="space-y-4">
          {!isMacOSTemplate && (
            <div className="border-border mb-4 flex items-center justify-between rounded-[16px] border bg-black/[0.02] p-4 dark:bg-white/[0.02]">
              <span className="text-foreground text-[13px] font-medium">Appearance</span>
              {template === TEMPLATE_IDS.CANVAS ? (
                <div className="flex items-center gap-3">
                  <SwitchCanvas
                    value={theme === "dark" || theme === 1}
                    onToggle={() => changeTheme(theme === "dark" || theme === 1 ? 0 : 1)}
                    iconOn={<Moon className="size-4" />}
                    iconOff={<Sun className="size-4" />}
                  />
                </div>
              ) : (
                <div className="inline-flex items-center gap-2">
                  <span
                    className={twMerge(
                      "cursor-pointer transition-colors",
                      theme === "dark" || theme === 1 ? "text-muted-foreground" : "text-foreground"
                    )}
                    onClick={() => changeTheme(0)}
                  >
                    <Sun className="size-4" />
                  </span>
                  <div ref={appearanceSwitchRefLayouts} className="inline-flex">
                    <Switch
                      checked={theme === "dark" || theme === 1}
                      onCheckedChange={(checked) =>
                        applyThemeChange(checked, appearanceSwitchRefLayouts.current)
                      }
                      className="data-[state=checked]:!bg-df-orange-color"
                      data-testid={
                        isMobile ? "switch-theme-mode-layouts-mobile" : "switch-theme-mode-layouts"
                      }
                    />
                  </div>
                  <span
                    className={twMerge(
                      "cursor-pointer transition-colors",
                      !(theme === "dark" || theme === 1)
                        ? "text-muted-foreground"
                        : "text-foreground"
                    )}
                    onClick={() => changeTheme(1)}
                  >
                    <Moon className="size-4" />
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Typography */}
          {!isMacOSTemplate && (
            <div className="space-y-3 pt-2">
              <div className="text-muted-foreground px-1 text-[13px] font-medium">Typography</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    value: TYPOGRAPHY.COMPACT,
                    label: "Compact",
                    description: "Tight, focused sizing",
                  },
                  {
                    value: TYPOGRAPHY.EXPRESSIVE,
                    label: "Expressive",
                    description: "Bolder type hierarchy",
                  },
                ].map((opt) => {
                  const isActive = typography === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => changeTypography(opt.value)}
                      className={twMerge(
                        "relative flex cursor-pointer flex-col gap-1 rounded-2xl border px-3 py-3 text-left transition-all focus:outline-none",
                        isActive
                          ? "border-df-orange-color bg-df-orange-color/5"
                          : "border-border hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
                      )}
                    >
                      <span
                        className={twMerge(
                          "text-[13px] font-medium transition-colors",
                          isActive ? "text-df-orange-color" : "text-foreground"
                        )}
                      >
                        {opt.label}
                      </span>
                      <span className="text-muted-foreground text-[11px] leading-tight">
                        {opt.description}
                      </span>
                      {isActive && (
                        <div className="bg-df-orange-color absolute top-2.5 right-2.5 flex h-4 w-4 items-center justify-center rounded-full">
                          <Check size={9} strokeWidth={3.5} className="text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="text-muted-foreground px-1 text-[13px] font-medium">Templates</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-6 pb-4">
            {templates.map((tmpl) => (
              <TemplateCard
                key={tmpl.value}
                tmpl={tmpl}
                isSelected={template === tmpl.id}
                onChange={changeTemplate}
                previewSrc={getTemplateThumbnailSrc(
                  tmpl.id,
                  theme === "dark" || theme === 1 ? "dark" : "light"
                )}
              />
            ))}
          </div>
        </div>
      </TabsContent>

      <TabsContent
        value="background"
        className="m-0 flex-1 overflow-y-auto p-6"
        data-testid={isMobile ? "content-background-mobile" : "content-background"}
      >
        <div className="space-y-4">
          {!isMacOSTemplate && (
            <div className="border-border mb-4 flex items-center justify-between rounded-[16px] border bg-black/[0.02] p-4 dark:bg-white/[0.02]">
              <span className="text-foreground text-[13px] font-medium">Appearance</span>
              <div className="inline-flex items-center gap-2">
                <span
                  className={twMerge(
                    "cursor-pointer transition-colors",
                    theme === "dark" || theme === 1 ? "text-muted-foreground" : "text-foreground"
                  )}
                  onClick={() => changeTheme(0)}
                >
                  <Sun className="size-4" />
                </span>
                <div ref={appearanceSwitchRefBackground} className="inline-flex">
                  <Switch
                    checked={theme === "dark" || theme === 1}
                    onCheckedChange={(checked) =>
                      applyThemeChange(checked, appearanceSwitchRefBackground.current)
                    }
                    className="data-[state=checked]:!bg-df-orange-color"
                    data-testid={
                      isMobile ? "switch-wallpaper-mode-mobile" : "switch-wallpaper-mode"
                    }
                  />
                </div>
                <span
                  className={twMerge(
                    "cursor-pointer transition-colors",
                    !(theme === "dark" || theme === 1) ? "text-muted-foreground" : "text-foreground"
                  )}
                  onClick={() => changeTheme(1)}
                >
                  <Moon className="size-4" />
                </span>
              </div>
            </div>
          )}

          {/* Display mode — header only vs full page (wallpaper-capable templates, not MacOS) */}
          {!isMacOSTemplate && (
            <div className="mb-4 space-y-2">
              <p className="text-muted-foreground px-1 text-[12px] font-medium">Display mode</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    value: BACKGROUND_MODE.HEADER,
                    label: "Header only",
                    description: "Image in top section",
                  },
                  {
                    value: BACKGROUND_MODE.FULL_PAGE,
                    label: "Full page",
                    description: "Image behind all sections",
                  },
                ].map((opt) => {
                  const isActive = backgroundMode === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => changeBackgroundMode(opt.value)}
                      className={twMerge(
                        "relative flex cursor-pointer flex-col gap-1 rounded-2xl border px-3 py-3 text-left transition-all focus:outline-none",
                        isActive
                          ? "border-foreground/20 bg-black/[0.04] dark:bg-white/[0.06]"
                          : "border-border hover:border-foreground/15 bg-transparent"
                      )}
                    >
                      {/* Mini visual preview */}
                      <div
                        className="border-border mb-1 w-full overflow-hidden rounded-lg border"
                        style={{ aspectRatio: "16/7" }}
                      >
                        {opt.value === BACKGROUND_MODE.HEADER ? (
                          <div className="flex h-full w-full flex-col">
                            <div className="flex-[0_0_45%] bg-linear-to-br from-amber-200/60 to-orange-200/60 dark:from-amber-900/40 dark:to-orange-900/40" />
                            <div className="bg-muted flex-1" />
                          </div>
                        ) : (
                          <div className="relative h-full w-full bg-linear-to-br from-amber-200/60 to-orange-200/60 dark:from-amber-900/40 dark:to-orange-900/40">
                            <div className="absolute inset-x-2 top-2 bottom-2 rounded bg-white/30 backdrop-blur-[1px] dark:bg-black/20" />
                          </div>
                        )}
                      </div>
                      <span className="text-foreground text-[12px] leading-tight font-medium">
                        {opt.label}
                      </span>
                      <span className="text-muted-foreground text-[11px] leading-tight">
                        {opt.description}
                      </span>
                      {isActive && (
                        <div className="bg-foreground absolute top-2 right-2 flex h-3.5 w-3.5 items-center justify-center rounded-full">
                          <Check size={8} strokeWidth={3} className="text-background" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {
            <>
              <AnimatePresence mode="wait">
                {/* Wallpaper effects (blur/grain/motion) apply in full-page mode for both image and solid color backgrounds */}
                {(wallpaperColor || (wallpaper && wallpaper !== 0)) &&
                  backgroundMode === BACKGROUND_MODE.FULL_PAGE && (
                    <motion.div
                      key="bg-effects"
                      initial={{ height: 0, opacity: 0, marginTop: 0 }}
                      animate={{ height: "auto", opacity: 1, marginTop: 16 }}
                      exit={{ height: 0, opacity: 0, marginTop: 0 }}
                      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="bg-muted/50 mb-4 rounded-xl p-4">
                        <div className="mb-4 flex items-center justify-between">
                          <Text size="p-xs-uppercase">Background Texture</Text>
                        </div>
                        <div className="bg-muted/50 mb-4 flex gap-1 rounded-lg p-1">
                          <Button
                            variant={currentEffects.effectType === "blur" ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => currentUpdateWallpaperEffect("effectType", "blur")}
                            className="flex-1 rounded-md text-xs"
                            data-testid={
                              isMobileOrTablet ? "button-effect-blur-mobile" : "button-effect-blur"
                            }
                          >
                            Soft Blur
                          </Button>
                          <Button
                            variant={currentEffects.effectType === "grain" ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => {
                              if (
                                currentEffects.grainIntensity === 0 ||
                                currentEffects.grainIntensity === undefined ||
                                currentEffects.grainIntensity === null
                              ) {
                                currentUpdateWallpaperEffect("grainIntensity", 25);
                              }
                              currentUpdateWallpaperEffect("effectType", "grain");
                            }}
                            className="flex-1 rounded-md text-xs"
                            data-testid={
                              isMobileOrTablet
                                ? "button-effect-grain-mobile"
                                : "button-effect-grain"
                            }
                          >
                            Fine Grain
                          </Button>
                        </div>

                        <div className="space-y-4">
                          {currentEffects.effectType === "blur" ? (
                            <div className="animate-in fade-in slide-in-from-top-1 duration-300">
                              <div className="mb-2 flex items-center justify-between">
                                <span className="text-foreground/60 text-[11px] font-medium">
                                  Depth
                                </span>
                                <span className="text-foreground/40 text-[11px] tabular-nums">
                                  {currentEffects.blur}px
                                </span>
                              </div>
                              <Slider
                                value={[currentEffects.blur]}
                                onValueChange={(value) =>
                                  currentUpdateWallpaperEffect("blur", value[0])
                                }
                                max={20}
                                step={1}
                                className="w-full"
                                data-testid={
                                  isMobileOrTablet
                                    ? "slider-background-blur-mobile"
                                    : "slider-background-blur"
                                }
                              />
                            </div>
                          ) : (
                            <div className="animate-in fade-in slide-in-from-top-1 duration-300">
                              <div className="mb-2 flex items-center justify-between">
                                <span className="text-foreground/60 text-[11px] font-medium">
                                  Opacity
                                </span>
                                <span className="text-foreground/40 text-[11px] tabular-nums">
                                  {currentEffects.grainIntensity}%
                                </span>
                              </div>
                              <Slider
                                value={[currentEffects.grainIntensity]}
                                onValueChange={(value) =>
                                  currentUpdateWallpaperEffect("grainIntensity", value[0])
                                }
                                max={100}
                                step={5}
                                className="w-full"
                                data-testid={
                                  isMobileOrTablet
                                    ? "slider-grain-intensity-mobile"
                                    : "slider-grain-intensity"
                                }
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-muted/50 mb-4 flex items-center justify-between rounded-xl p-4">
                        <div>
                          <Text size="p-xs-uppercase" className="text-df-heading-color">
                            Dynamic Motion
                          </Text>
                          <p className="text-df-description-color mt-0.5 text-[11px] font-medium">
                            Parallax zoom interaction
                          </p>
                        </div>
                        <Switch
                          checked={currentEffects.motion}
                          onCheckedChange={(checked) =>
                            currentUpdateWallpaperEffect("motion", checked)
                          }
                          data-testid={
                            isMobileOrTablet
                              ? "switch-background-motion-mobile"
                              : "switch-background-motion"
                          }
                          className="scale-90"
                        />
                      </div>
                    </motion.div>
                  )}
              </AnimatePresence>
              <div className="border-border bg-card/50 mb-4 rounded-md border p-4">
                <div className="mb-3 flex items-start gap-3">
                  <Upload className="text-df-heading-color mt-0.5 h-5 w-5" />
                  <div className="flex-1">
                    <h4 className="mb-1 text-sm font-semibold">Upload Custom Background</h4>
                    <p className="text-df-description-color mb-2 text-xs">
                      Upload your own image. Minimum: 500x300. Maximum file size: 5MB. Image will be
                      resized to 1920x1080.
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id={isMobile ? "custom-wallpaper-upload-mobile" : "custom-wallpaper-upload"}
                      data-testid={
                        isMobile ? "input-custom-wallpaper-mobile" : "input-custom-wallpaper"
                      }
                    />
                    <label
                      htmlFor={
                        isMobile ? "custom-wallpaper-upload-mobile" : "custom-wallpaper-upload"
                      }
                    >
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="cursor-pointer"
                        disabled={isCompressing}
                        onClick={() =>
                          document
                            .getElementById(
                              isMobile
                                ? "custom-wallpaper-upload-mobile"
                                : "custom-wallpaper-upload"
                            )
                            ?.click()
                        }
                        data-testid={
                          isMobile ? "button-upload-wallpaper-mobile" : "button-upload-wallpaper"
                        }
                      >
                        <Upload className="h-4 w-4" />
                        {"Choose File"}
                      </Button>
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <button
                  onClick={() => changeWallpaper(0)}
                  className={twMerge(
                    "group/card relative cursor-pointer rounded-[14px] border-[2.5px] transition-colors focus:outline-none",
                    wallpaper === 0 && !wallpaperColor
                      ? "border-df-orange-color"
                      : "border-transparent hover:bg-black/5 dark:hover:bg-white/5"
                  )}
                  data-testid={isMobile ? "button-wallpaper-none-mobile" : "button-wallpaper-none"}
                >
                  <div
                    className={twMerge(
                      "pointer-events-none relative aspect-video w-full overflow-hidden rounded-[14px] border border-black/5 shadow-sm dark:border-white/5",
                      "transition-[box-shadow,background-color] duration-200 ease-out",
                      wallpaper === 0 && !wallpaperColor ? "bg-accent" : "bg-card"
                    )}
                  >
                    {isMacOSTemplate ? (
                      <img
                        src={
                          isDarkWallpapers ? "/wallpaper/darkui/wall8.png" : "/wallpaper/wall8.png"
                        }
                        alt="Default"
                        className="pointer-events-none h-full w-full object-cover"
                      />
                    ) : (
                      <div className="from-background to-muted flex h-full w-full items-center justify-center bg-linear-to-br">
                        <span className="text-foreground/60 text-sm font-medium">Default</span>
                      </div>
                    )}
                  </div>
                  {wallpaper === 0 && !wallpaperColor && (
                    <div className="bg-df-orange-color border-sidebar pointer-events-none absolute -bottom-1 -left-1 z-10 flex items-center justify-center rounded-full border-2 p-1.5 shadow-sm">
                      <Check size={14} strokeWidth={3.5} className="text-primary-foreground" />
                    </div>
                  )}
                </button>

                {customWallpaper && (
                  <button
                    onClick={() => changeWallpaper(customWallpaper)}
                    className={twMerge(
                      "group/card relative cursor-pointer rounded-[14px] border-[2.5px] transition-colors focus:outline-none",
                      wallpaper === customWallpaper
                        ? "border-df-orange-color"
                        : "border-transparent hover:bg-black/5 dark:hover:bg-white/5"
                    )}
                    data-testid={
                      isMobile ? "button-wallpaper-custom-mobile" : "button-wallpaper-custom"
                    }
                  >
                    <div
                      className={twMerge(
                        "pointer-events-none relative aspect-video w-full overflow-hidden rounded-[14px] border border-black/5 shadow-sm dark:border-white/5",
                        "transition-[box-shadow,background-color] duration-200 ease-out",
                        wallpaper === customWallpaper ? "bg-accent" : "bg-card"
                      )}
                    >
                      <img
                        src={customWallpaper}
                        alt="Custom wallpaper"
                        className="pointer-events-none h-full w-full object-cover"
                      />
                      <div className="pointer-events-none absolute bottom-2 left-2">
                        <Badge variant="secondary" className="text-xs">
                          Custom
                        </Badge>
                      </div>
                    </div>
                    {wallpaper === customWallpaper && (
                      <div className="bg-df-orange-color border-sidebar pointer-events-none absolute -bottom-1 -left-1 z-10 flex items-center justify-center rounded-full border-2 p-1.5 shadow-sm">
                        <Check size={14} strokeWidth={3.5} className="text-primary-foreground" />
                      </div>
                    )}
                  </button>
                )}

                {(() => {
                  const presetWallpapers = wallpapers.filter(
                    (wp) => wp.value !== 0 && !(isMacOSTemplate && wp.value === 8)
                  );
                  const visibleWallpapers = showMoreWallpapers
                    ? presetWallpapers
                    : presetWallpapers.slice(0, DEFAULT_VISIBLE_WALLPAPERS);
                  const remainingCount = presetWallpapers.length - DEFAULT_VISIBLE_WALLPAPERS;

                  return (
                    <>
                      {visibleWallpapers.map((wp, index) => {
                        const isRevealed = index >= DEFAULT_VISIBLE_WALLPAPERS;
                        return (
                          <motion.div
                            key={wp.id}
                            layout
                            initial={isRevealed ? { opacity: 0, y: 6, scale: 0.96 } : false}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{
                              duration: 0.3,
                              delay: isRevealed ? (index - DEFAULT_VISIBLE_WALLPAPERS) * 0.05 : 0,
                              ease: [0.32, 0.72, 0, 1],
                            }}
                          >
                            <button
                              onClick={() => changeWallpaper(wp.value)}
                              className={twMerge(
                                "group/card relative w-full cursor-pointer rounded-[14px] border-[2.5px] transition-colors focus:outline-none",
                                wallpaper === wp.value
                                  ? "border-df-orange-color"
                                  : "border-transparent hover:bg-black/5 dark:hover:bg-white/5"
                              )}
                              data-testid={
                                isMobile
                                  ? `button-wallpaper-${wp.id}-mobile`
                                  : `button-wallpaper-${wp.id}`
                              }
                            >
                              <div
                                className={twMerge(
                                  "pointer-events-none relative aspect-video w-full overflow-hidden rounded-[14px] border border-black/5 shadow-sm dark:border-white/5",
                                  "transition-[box-shadow,background-color] duration-200 ease-out",
                                  wallpaper === wp.value ? "bg-accent" : "bg-card"
                                )}
                              >
                                <div className="pointer-events-none h-full w-full [&>div]:h-full! [&>div]:rounded-none!">
                                  {wp.item}
                                </div>
                              </div>
                              {wallpaper === wp.value && (
                                <div className="bg-df-orange-color border-sidebar pointer-events-none absolute -bottom-1 -left-1 z-10 flex items-center justify-center rounded-full border-2 p-1.5 shadow-sm">
                                  <Check
                                    size={14}
                                    strokeWidth={3.5}
                                    className="text-primary-foreground"
                                  />
                                </div>
                              )}
                            </button>
                          </motion.div>
                        );
                      })}

                      {remainingCount > 0 && (
                        <AnimatePresence mode="popLayout" initial={false}>
                          {!showMoreWallpapers && (
                            <motion.button
                              key="view-more-wallpapers"
                              layout
                              type="button"
                              initial={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
                              onClick={() => setShowMoreWallpapers(true)}
                              className={twMerge(
                                "group/card relative flex aspect-video w-full cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden rounded-[14px] border border-dashed border-black/10 bg-transparent transition-all focus:outline-none",
                                "hover:border-black/20 dark:border-white/10 dark:hover:border-white/20"
                              )}
                              data-testid={
                                isMobile
                                  ? "button-wallpapers-view-more-mobile"
                                  : "button-wallpapers-view-more"
                              }
                            >
                              <ChevronDown className="text-foreground h-4 w-4" />
                              <span className="text-foreground text-[11px] font-medium">
                                View {remainingCount} more
                              </span>
                            </motion.button>
                          )}
                        </AnimatePresence>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* Colors — a solid background colour, an alternative to an image wallpaper.
                  Picking one clears the image; blur/motion don't apply to a flat colour, so
                  only grain is offered. Hidden for MacOS (full-screen desktop wallpaper only). */}
              {!isMacOSTemplate && (
                <div className="mt-6 space-y-3">
                  <p className="text-muted-foreground px-1 text-[12px] font-medium">Colors</p>
                  <div className="grid grid-cols-5 gap-2">
                    {/* None — clears the colour (and any image) */}
                    {(() => {
                      return (
                        <div className="flex flex-col items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => changeWallpaperColor(null)}
                            title="None"
                            className="border-border relative h-10 w-10 overflow-hidden rounded-full border-2 transition-all hover:scale-105 focus:outline-none"
                            data-testid={
                              isMobile ? "button-bg-color-none-mobile" : "button-bg-color-none"
                            }
                          >
                            <div className="bg-background/50 absolute inset-0">
                              <svg
                                className="text-df-orange-color absolute inset-0 h-full w-full"
                                viewBox="0 0 40 40"
                                preserveAspectRatio="none"
                              >
                                <line
                                  x1="4"
                                  y1="36"
                                  x2="36"
                                  y2="4"
                                  stroke="currentColor"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                />
                              </svg>
                            </div>
                          </button>
                          <span className="text-muted-foreground text-[10px] leading-tight font-medium">
                            None
                          </span>
                        </div>
                      );
                    })()}

                    {BACKGROUND_COLORS.map((p) => {
                      const isSelected = wallpaperColor === p.color;
                      return (
                        <div key={p.id} className="flex flex-col items-center gap-1.5">
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => changeWallpaperColor(p.color)}
                              title={p.label}
                              className={twMerge(
                                "relative h-10 w-10 overflow-hidden rounded-full border-2 transition-all focus:outline-none",
                                isSelected
                                  ? "border-df-orange-color scale-110 shadow-md"
                                  : "border-border hover:scale-105"
                              )}
                              data-testid={
                                isMobile
                                  ? `button-bg-color-${p.id}-mobile`
                                  : `button-bg-color-${p.id}`
                              }
                            >
                              {/* Light half (top-left) + dark half (bottom-right) */}
                              <div
                                className="absolute inset-0"
                                style={{
                                  backgroundColor: p.color,
                                  clipPath: "polygon(0 0, 100% 0, 0 100%)",
                                }}
                              />
                              <div
                                className="absolute inset-0"
                                style={{
                                  backgroundColor: p.darkColor,
                                  clipPath: "polygon(100% 0, 100% 100%, 0 100%)",
                                }}
                              />
                            </button>
                            {isSelected && (
                              <div className="bg-df-orange-color border-sidebar absolute -right-1 -bottom-1 flex h-4 w-4 items-center justify-center rounded-full border-2 text-white shadow-sm">
                                <Check
                                  size={8}
                                  strokeWidth={3.5}
                                  className="text-primary-foreground"
                                />
                              </div>
                            )}
                          </div>
                          <span
                            className={twMerge(
                              "text-[10px] leading-tight font-medium",
                              isSelected ? "text-df-orange-color" : "text-muted-foreground"
                            )}
                          >
                            {p.label}
                          </span>
                        </div>
                      );
                    })}

                    {/* Custom colour picker (native OS picker — no shadcn equivalent) */}
                    {(() => {
                      const presetColors = new Set(BACKGROUND_COLORS.map((p) => p.color));
                      const isCustomActive = !!wallpaperColor && !presetColors.has(wallpaperColor);
                      return (
                        <div className="flex flex-col items-center gap-1.5">
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => colorInputRef.current?.click()}
                              title="Custom color"
                              className={twMerge(
                                "relative h-10 w-10 overflow-hidden rounded-full border-2 transition-all focus:outline-none",
                                isCustomActive
                                  ? "border-df-orange-color scale-110 shadow-md"
                                  : "border-border hover:scale-105"
                              )}
                              data-testid={
                                isMobile
                                  ? "button-bg-color-custom-mobile"
                                  : "button-bg-color-custom"
                              }
                            >
                              {isCustomActive ? (
                                <div
                                  className="absolute inset-0"
                                  style={{ backgroundColor: wallpaperColor }}
                                />
                              ) : (
                                <div
                                  className="absolute inset-0"
                                  style={{
                                    background:
                                      "conic-gradient(from 0deg, #ff6b6b, #ffd93d, #6bcb77, #4d96ff, #c77dff, #ff6b6b)",
                                  }}
                                />
                              )}
                            </button>
                            {isCustomActive && (
                              <div className="bg-df-orange-color border-sidebar absolute -right-1 -bottom-1 flex h-4 w-4 items-center justify-center rounded-full border-2 text-white shadow-sm">
                                <Check
                                  size={8}
                                  strokeWidth={3.5}
                                  className="text-primary-foreground"
                                />
                              </div>
                            )}
                            <input
                              ref={colorInputRef}
                              type="color"
                              value={isCustomActive ? wallpaperColor : customColor}
                              onChange={(e) => {
                                setCustomColor(e.target.value);
                                changeWallpaperColor(e.target.value);
                              }}
                              className="sr-only"
                              aria-label="Pick a custom background color"
                            />
                          </div>
                          <span
                            className={twMerge(
                              "text-[10px] leading-tight font-medium",
                              isCustomActive ? "text-df-orange-color" : "text-muted-foreground"
                            )}
                          >
                            Custom
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </>
          }
        </div>
      </TabsContent>

      {!isMacOSTemplate && (
        <TabsContent
          value="blocks"
          className="m-0 flex-1 overflow-y-auto p-6"
          data-testid={isMobile ? "content-blocks-mobile" : "content-blocks"}
        >
          <div className="space-y-4">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-foreground/60 text-sm font-medium">
                Re-arrange your portfolio sections
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetSectionOrder}
                className="text-foreground/40 hover:text-foreground h-8 gap-1.5 px-2 text-xs"
                data-testid={isMobile ? "button-reset-blocks-mobile" : "button-reset-blocks"}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </Button>
            </div>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={sectionOrder} strategy={rectSortingStrategy}>
                <div className="space-y-4">
                  {sectionOrder.map((id) => (
                    <SortableSectionItem
                      key={id}
                      id={id}
                      isMobile={isMobile}
                      isHidden={hiddenSections.includes(id)}
                      onToggleHide={() => toggleSectionHide(id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </TabsContent>
      )}

      <TabsContent
        value="cursors"
        className="m-0 flex-1 overflow-y-auto p-6"
        data-testid={isMobile ? "content-cursors-mobile" : "content-cursors"}
      >
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {cursors.map((c, index) => (
            <div
              key={index}
              onClick={() => handleChangeCursor(index)}
              className={twMerge(
                "flex cursor-pointer items-center justify-center rounded-[16px] border px-4 py-6 transition-all hover:scale-[1.02] active:scale-[0.98]",
                "border-border bg-transparent",
                "hover:bg-muted",
                getStyles(index)
              )}
            >
              {c.item}
            </div>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );

  return renderContent(isMobileOrTablet);
};

export default ThemePanel;
