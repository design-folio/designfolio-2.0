import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGlobalContext } from "@/context/globalContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { sidebars, DEFAULT_SECTION_ORDER, normalizeSectionOrder } from "@/lib/constant";
import styles from "@/styles/domain.module.css";
import imageCompression from "browser-image-compression";
import { Upload, RotateCcw, Check, Sun, Moon } from "lucide-react";
import DragHandle from "./DragHandle";
import React, { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { Badge } from "./ui/badge";
import { SheetWrapper } from "./ui/SheetWrapper";
import { Slider } from "./ui/slider";
import { Switch as SwitchCanvas } from "./templates/Canvas/switch-button";
import { AnimatePresence, motion } from "framer-motion";
import Text from "./text";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { _updateUser } from "@/network/post-request";
import { runThemeTransition, hasThemeSwitchEffect } from "@/hooks/use-theme-switch-audio";
import { TEMPLATE_IDS, TEMPLATES_BY_ID, TEMPLATES_LIST } from "@/lib/templates";


// Section display names mapping
const SECTION_NAMES = {
  about: 'About me',
  projects: 'Projects',
  reviews: 'Testimonials',
  tools: 'Toolbox',
  works: 'Works/Experience'
};

// Get available sections for a template
// All templates use the same default order
const getAvailableSections = (template) => {
  return DEFAULT_SECTION_ORDER;
};

// SortableSectionItem Component
const SortableSectionItem = ({ id, isMobile }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

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
        "flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer",
        "bg-muted/50 border-border",
        "hover:bg-muted",
        isDragging && "shadow-lg z-50 opacity-50"
      )}
      data-testid={isMobile ? `section-item-${id}-mobile` : `section-item-${id}`}
    >
      <DragHandle
        listeners={listeners}
        attributes={attributes}
        isButton={true}
        className="cursor-grab active:cursor-grabbing text-foreground/40 hover:text-foreground/60 transition-colors"
      />
      <span className="flex-1 text-sm font-medium">
        {SECTION_NAMES[id] || id}
      </span>
    </div>
  );
};

const ThemePanel = ({
  theme,
  changeTheme,
  template,
  changeTemplate,
  templates,
  renderTemplate,
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
}) => {
  const {
    activeSidebar,
    closeSidebar,
    registerUnsavedChangesChecker,
    unregisterUnsavedChangesChecker,
    userDetails,
    updateCache,
    setUserDetails,
  } = useGlobalContext();
  const [customWallpaper, setCustomWallpaper] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const isMobileOrTablet = useIsMobile();
  const [isDarkWallpapers, setIsDarkWallpapers] = useState(theme === 'dark' || theme === 1);
  const show = activeSidebar === sidebars.theme;

  const isMacOSTemplate = template === 4;
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
    setSectionOrder(normalizeSectionOrder(userDetails?.sectionOrder, newAvailableSections));
  }, [template, userDetails?.sectionOrder]);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
    const defaultOrder = DEFAULT_SECTION_ORDER.filter(section => availableSections.includes(section));
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
        sectionElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  // Fallback to local state if effects is not provided (backward compatibility)
  const [localEffects, setLocalEffects] = useState({
    blur: 0,
    effectType: 'blur',
    grainIntensity: 25,
    motion: true
  });

  // Use provided effects or fall back to local state
  const currentEffects = effects || localEffects;
  const currentUpdateWallpaperEffect = updateWallpaperEffect || ((key, value) => {
    setLocalEffects(prev => ({ ...prev, [key]: value }));
  });


  useEffect(() => {
    registerUnsavedChangesChecker(sidebars.theme, () => false);
    return () => {
      unregisterUnsavedChangesChecker(sidebars.theme);
    };
  }, [registerUnsavedChangesChecker, unregisterUnsavedChangesChecker]);

  const handleClose = () => {
    closeSidebar();
  };

  // Sync isDarkWallpapers with theme prop changes
  useEffect(() => {
    setIsDarkWallpapers(theme === 'dark' || theme === 1);
  }, [theme]);


  useEffect(() => {
    if (typeof wallpaper === "string") {
      setCustomWallpaper(wallpaper);
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
      const canvas = document.createElement('canvas');
      canvas.width = 1920;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, 1920, 1080);

      const resizedBlob = await new Promise((resolve) => {
        let mimeType = 'image/jpeg'; // default
        if (file.type.includes('png')) {
          mimeType = 'image/png';
        } else if (file.type.includes('gif')) {
          mimeType = 'image/gif';
        } else if (file.type.includes('jpeg') || file.type.includes('jpg')) {
          mimeType = 'image/jpeg';
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
        changeWallpaper({
          base64: reader.result,
          type: compressedFile.type,
          name: compressedFile.name
        }, compressedFile.name);
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
        changeWallpaper({
          base64: reader.result,
          type: file.type,
          name: file.name
        }, file.name);
        setIsCompressing(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderContent = (isMobile) => (
    <Tabs defaultValue="layouts" className="w-full h-full flex flex-col">
      <div className={`sticky top-0 z-50 px-6 ${isMobile ? 'pb-2' : 'pt-4 pb-2'} border-b border-border/30 bg-background/95 backdrop-blur-sm`}>
        <div className="overflow-x-auto hide-scrollbar -mx-6 px-6">
          <TabsList className="w-full bg-transparent p-0 h-auto gap-6 justify-start min-w-fit">
            <TabsTrigger
              value="layouts"
              className="bg-transparent border-b-2 border-transparent rounded-none px-0 pb-2 data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none text-foreground/60 data-[state=active]:text-foreground font-medium transition-all"
              data-testid={isMobile ? "tab-layouts-mobile" : "tab-layouts"}
            >
              Layouts
            </TabsTrigger>
            <TabsTrigger
              value="background"
              className="bg-transparent border-b-2 border-transparent rounded-none px-0 pb-2 data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none text-foreground/60 data-[state=active]:text-foreground font-medium transition-all"
              data-testid={isMobile ? "tab-background-mobile" : "tab-background"}
            >
              Background
            </TabsTrigger>
            <TabsTrigger
              value="blocks"
              className="bg-transparent border-b-2 border-transparent rounded-none px-0 pb-2 data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none text-foreground/60 data-[state=active]:text-foreground font-medium transition-all"
              data-testid={isMobile ? "tab-blocks-mobile" : "tab-blocks"}
            >
              Blocks
            </TabsTrigger>
            <TabsTrigger
              value="cursors"
              className="bg-transparent border-b-2 border-transparent rounded-none px-0 pb-2 data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none text-foreground/60 data-[state=active]:text-foreground font-medium transition-all"
              data-testid={isMobile ? "tab-cursors-mobile" : "tab-cursors"}
            >
              Cursors
            </TabsTrigger>
          </TabsList>
        </div>
      </div>

      <TabsContent value="layouts" className="flex-1 overflow-y-auto p-6 m-0 thin-scrollbar" data-testid={isMobile ? "content-layouts-mobile" : "content-layouts"}>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-border rounded-[16px] bg-black/[0.02] dark:bg-white/[0.02] mb-4">
            <span className="text-[13px] font-medium text-foreground">Appearance</span>
            {
              template === TEMPLATE_IDS.CANVAS ? (<div className="flex items-center gap-3">
                <SwitchCanvas
                  value={isMacOSTemplate ? false : (theme === 'dark' || theme === 1)}
                  onToggle={() => !isMacOSTemplate && changeTheme((theme === 'dark' || theme === 1) ? 0 : 1)}
                  iconOn={<Moon className="size-4" />}
                  iconOff={<Sun className="size-4" />}
                />
              </div>) : (<div className="inline-flex items-center gap-2">
                <span
                  className={twMerge("cursor-pointer transition-colors", (theme === 'dark' || theme === 1) ? "text-muted-foreground" : "text-foreground")}
                  onClick={() => !isMacOSTemplate && changeTheme(0)}
                >
                  <Sun className="size-4" />
                </span>
                <div ref={appearanceSwitchRefLayouts} className="inline-flex">
                  <Switch
                    checked={isMacOSTemplate ? false : (theme === 'dark' || theme === 1)}
                    onCheckedChange={(checked) => applyThemeChange(checked, appearanceSwitchRefLayouts.current)}
                    disabled={isMacOSTemplate}
                    data-testid={isMobile ? "switch-theme-mode-layouts-mobile" : "switch-theme-mode-layouts"}
                  />
                </div>
                <span
                  className={twMerge("cursor-pointer transition-colors", !(theme === 'dark' || theme === 1) ? "text-muted-foreground" : "text-foreground")}
                  onClick={() => !isMacOSTemplate && changeTheme(1)}
                >
                  <Moon className="size-4" />
                </span>
              </div>)
            }
          </div>

          <div className="text-[13px] font-medium text-muted-foreground px-1">Templates</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-6 pb-4">
            {templates.map((tmpl) => {
              const isSelected = template === tmpl.id;
              return (
                <div key={tmpl.value} className="flex flex-col gap-3 items-center">
                  <div className="relative w-full">
                    <button
                      onClick={() => changeTemplate(tmpl.id)}
                      className={twMerge(
                        "w-full aspect-square rounded-[24px] transition-all focus:outline-none cursor-pointer group",
                        isSelected
                          ? "border-[2.5px] border-df-orange-color p-1.5"
                          : "border-[2.5px] border-transparent p-1.5 hover:bg-black/5 dark:hover:bg-white/5"
                      )}
                    >
                      <div className={twMerge(
                        "w-full h-full rounded-[14px] overflow-hidden transition-all shadow-sm border border-black/5 dark:border-white/5 relative",
                        isSelected
                          ? "bg-accent"
                          : "bg-card group-hover:shadow-md"
                      )}>
                        <div className="absolute inset-0 p-3 flex flex-col gap-2 opacity-40">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-black/20 dark:bg-white/20" />
                            <div className="w-12 h-1.5 rounded-full bg-black/20 dark:bg-white/20" />
                          </div>
                          <div className="w-full h-12 mt-1 rounded-md bg-black/10 dark:bg-white/10" />
                          <div className="flex gap-2 mt-auto">
                            <div className="w-full h-8 rounded-md bg-black/10 dark:bg-white/10" />
                            <div className="w-full h-8 rounded-md bg-black/10 dark:bg-white/10" />
                          </div>
                        </div>
                      </div>
                    </button>

                    {isSelected && (
                      <div className="absolute -bottom-1 -left-1 bg-df-orange-color text-primary-foreground rounded-full p-1.5 shadow-sm flex items-center justify-center border-[2px] border-sidebar-background z-10">
                        <Check size={14} strokeWidth={3.5} />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className={twMerge(
                      "text-[14px] text-center transition-colors font-medium",
                      isSelected ? "text-primary" : "text-muted-foreground"
                    )}>
                      {tmpl.item}
                    </span>
                    {tmpl.isNew && (
                      <Badge className="bg-[#EE7F70] text-white text-[10px] font-medium px-1.5 py-0">New</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="background" className="flex-1 overflow-y-auto p-6 m-0" data-testid={isMobile ? "content-background-mobile" : "content-background"}>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-border rounded-[16px] bg-black/[0.02] dark:bg-white/[0.02] mb-4">
            <span className="text-[13px] font-medium text-foreground">Appearance</span>
            <div className="inline-flex items-center gap-2">
              <span
                className={twMerge("cursor-pointer transition-colors", (theme === 'dark' || theme === 1) ? "text-muted-foreground" : "text-foreground")}
                onClick={() => !isMacOSTemplate && changeTheme(0)}
              >
                <Sun className="size-4" />
              </span>
              <div ref={appearanceSwitchRefBackground} className="inline-flex">
                <Switch
                  checked={isMacOSTemplate ? false : (theme === 'dark' || theme === 1)}
                  onCheckedChange={(checked) => applyThemeChange(checked, appearanceSwitchRefBackground.current)}
                  disabled={isMacOSTemplate}
                  data-testid={isMobile ? "switch-wallpaper-mode-mobile" : "switch-wallpaper-mode"}
                />
              </div>
              <span
                className={twMerge("cursor-pointer transition-colors", !(theme === 'dark' || theme === 1) ? "text-muted-foreground" : "text-foreground")}
                onClick={() => !isMacOSTemplate && changeTheme(1)}
              >
                <Moon className="size-4" />
              </span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {wallpaper && wallpaper !== 0 && (
              <motion.div
                key="bg-effects"
                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                animate={{ height: "auto", opacity: 1, marginTop: 16 }}
                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                className="overflow-hidden"
              >
                <div className="p-4 rounded-xl bg-muted/50 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <Text size="p-xs-uppercase">Background Texture</Text>
                  </div>
                  <div className="flex p-1 bg-muted/50 rounded-lg gap-1 mb-4">
                    <Button
                      variant={currentEffects.effectType === 'blur' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => currentUpdateWallpaperEffect('effectType', 'blur')}
                      className="flex-1 text-xs rounded-md"
                      data-testid={isMobileOrTablet ? "button-effect-blur-mobile" : "button-effect-blur"}
                    >
                      Soft Blur
                    </Button>
                    <Button
                      variant={currentEffects.effectType === 'grain' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => {
                        if (currentEffects.grainIntensity === 0 || currentEffects.grainIntensity === undefined || currentEffects.grainIntensity === null) {
                          currentUpdateWallpaperEffect('grainIntensity', 25);
                        }
                        currentUpdateWallpaperEffect('effectType', 'grain');
                      }}
                      className="flex-1 text-xs rounded-md"
                      data-testid={isMobileOrTablet ? "button-effect-grain-mobile" : "button-effect-grain"}
                    >
                      Fine Grain
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {currentEffects.effectType === 'blur' ? (
                      <div className="animate-in fade-in slide-in-from-top-1 duration-300">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-medium text-foreground/60">Depth</span>
                          <span className="text-[11px] tabular-nums text-foreground/40">{currentEffects.blur}px</span>
                        </div>
                        <Slider

                          value={[currentEffects.blur]}
                          onValueChange={(value) => currentUpdateWallpaperEffect('blur', value[0])}
                          max={20}
                          step={1}
                          className="w-full"
                          data-testid={isMobileOrTablet ? "slider-background-blur-mobile" : "slider-background-blur"}
                        />
                      </div>
                    ) : (
                      <div className="animate-in fade-in slide-in-from-top-1 duration-300">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-medium text-foreground/60">Opacity</span>
                          <span className="text-[11px] tabular-nums text-foreground/40">{currentEffects.grainIntensity}%</span>
                        </div>
                        <Slider
                          value={[currentEffects.grainIntensity]}
                          onValueChange={(value) => currentUpdateWallpaperEffect('grainIntensity', value[0])}
                          max={100}
                          step={5}
                          className="w-full"
                          data-testid={isMobileOrTablet ? "slider-grain-intensity-mobile" : "slider-grain-intensity"}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl  bg-muted/50 mb-4">
                  <div>
                    <Text size="p-xs-uppercase" className="text-df-heading-color">Dynamic Motion</Text>
                    <p className="text-[11px] text-df-description-color mt-0.5 font-medium">Parallax zoom interaction</p>
                  </div>
                  <Switch
                    checked={currentEffects.motion}
                    onCheckedChange={(checked) => currentUpdateWallpaperEffect('motion', checked)}
                    data-testid={isMobileOrTablet ? "switch-background-motion-mobile" : "switch-background-motion"}
                    className="scale-90"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="p-4 rounded-md border border-border bg-card/50 mb-4">
            <div className="flex items-start gap-3 mb-3">
              <Upload className="w-5 h-5 text-df-heading-color  mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold mb-1">Upload Custom Background</h4>
                <p className="text-xs text-df-description-color mb-2">
                  Upload your own image. Minimum: 500x300. Maximum file size: 5MB. Image will be resized to 1920x1080.
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id={isMobile ? "custom-wallpaper-upload-mobile" : "custom-wallpaper-upload"}
                  data-testid={isMobile ? "input-custom-wallpaper-mobile" : "input-custom-wallpaper"}
                />
                <label htmlFor={isMobile ? "custom-wallpaper-upload-mobile" : "custom-wallpaper-upload"}>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                    disabled={isCompressing}
                    onClick={() => document.getElementById(isMobile ? 'custom-wallpaper-upload-mobile' : 'custom-wallpaper-upload')?.click()}
                    data-testid={isMobile ? "button-upload-wallpaper-mobile" : "button-upload-wallpaper"}
                  >
                    <Upload className="w-4 h-4" />
                    {"Choose File"}
                  </Button>
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => changeWallpaper(0)}
              className={twMerge(
                "relative rounded-md overflow-hidden border-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer",
                wallpaper === 0 ? 'border-primary-landing ' : 'border-border'
              )}
              data-testid={isMobile ? "button-wallpaper-none-mobile" : "button-wallpaper-none"}
            >
              <div className="aspect-video bg-gradient-to-br from-background to-muted flex items-center justify-center pointer-events-none">
                <span className="text-sm font-medium text-foreground/60">Default</span>
              </div>
              {wallpaper === 0 && (
                <div className="absolute top-2 right-2 bg-primary-landing  text-primary-landing -foreground rounded-full p-1 pointer-events-none">
                  <svg className="w-4 h-4" fill="background" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>

            {customWallpaper && (
              <button
                onClick={() => changeWallpaper(customWallpaper)}
                className={twMerge(
                  "relative rounded-md overflow-hidden border-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer",
                  wallpaper === customWallpaper ? 'border-primary-landing' : 'border-border'
                )}
                data-testid={isMobile ? "button-wallpaper-custom-mobile" : "button-wallpaper-custom"}
              >
                <img
                  src={customWallpaper}
                  alt="Custom wallpaper"
                  className="aspect-video object-cover w-full pointer-events-none"
                />
                <div className="absolute bottom-2 left-2 pointer-events-none">
                  <Badge variant="secondary" className="text-xs">Custom</Badge>
                </div>
                {wallpaper === customWallpaper && (
                  <div className="absolute top-2 right-2 bg-primary-landing  text-primary-landing -foreground rounded-full p-1 z-10 pointer-events-none">
                    <svg className="w-4 h-4" fill="background" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            )}

            {wallpapers.map((wp, index) => {
              if (wp.value === 0) return null;
              return (
                <button
                  key={index}
                  onClick={() => changeWallpaper(wp.value)}
                  className={twMerge(
                    "relative rounded-md overflow-hidden border-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer",
                    wallpaper === wp.value ? 'border-primary-landing ' : 'border-border'
                  )}
                  data-testid={isMobile ? `button-wallpaper-${wp.id}-mobile` : `button-wallpaper-${wp.id}`}
                >
                  <div className="w-full aspect-video [&>div]:!h-full [&>div]:!rounded-none pointer-events-none">
                    {wp.item}
                  </div>
                  {wallpaper === wp.value && (
                    <div className="absolute top-2 right-2 bg-primary-landing  text-primary-landing -foreground rounded-full p-1 z-10 pointer-events-none">
                      <svg className="w-4 h-4" fill="background" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="blocks" className="flex-1 overflow-y-auto p-6 m-0" data-testid={isMobile ? "content-blocks-mobile" : "content-blocks"}>
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-foreground/60">Re-arrange your portfolio sections</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetSectionOrder}
              className="h-8 px-2 text-xs gap-1.5 text-foreground/40 hover:text-foreground"
              data-testid={isMobile ? "button-reset-blocks-mobile" : "button-reset-blocks"}
            >
              <RotateCcw className="w-3.5 h-3.5" />
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
                  <SortableSectionItem key={id} id={id} isMobile={isMobile} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </TabsContent>

      <TabsContent value="cursors" className="flex-1 overflow-y-auto p-6 m-0" data-testid={isMobile ? "content-cursors-mobile" : "content-cursors"}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {cursors.map((c, index) => (
            <div
              key={index}
              onClick={() => handleChangeCursor(index)}
              className={twMerge(
                "px-4 py-6 flex justify-center items-center border rounded-[16px] cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]",
                "bg-transparent border-border",
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



  return (
    <SheetWrapper
      open={show}
      onClose={handleClose}
      title="Theme Settings"
      width="400px"
    >
      {renderContent(isMobileOrTablet)}
    </SheetWrapper>
  );
};

export default ThemePanel;
