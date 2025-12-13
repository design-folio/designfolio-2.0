import React, { useState,useEffect } from "react";
import { Button } from "@/components/ui/buttonNew";
import { Badge } from "./ui/badge";
import { twMerge } from "tailwind-merge";
import styles from "@/styles/domain.module.css";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetHeader, SheetTitle, SheetPortal, SheetOverlay } from "@/components/ui/sheet";
import { X, Upload } from "lucide-react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

// Locally defined variants to ensure styling matches without needing to export it from ui/sheet
const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b border-border data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t border-border data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r border-border data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-full w-3/4 border-l border-border data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
);

// Locally defined SheetContent to fix missing forwardRef issue in original UI component
const SheetContent = React.forwardRef(({ side = "right", className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(sheetVariants({ side }), className)}
      {...props}
    >
      {children}
      <SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </SheetPrimitive.Close>
    </SheetPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = SheetPrimitive.Content.displayName;


import { useIsMobile } from "@/hooks/use-mobile";
import CustomSheet from "./CustomSheet";

const ThemePanel = ({
  show,
  handleClose,
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
}) => {
  const [customWallpaper, setCustomWallpaper] = useState(null);
  const isMobileOrTablet = useIsMobile();
  const [isDarkWallpapers, setIsDarkWallpapers] = useState(theme === 'dark' || theme === 1);

  // Sync isDarkWallpapers with theme prop changes
  useEffect(() => {
    setIsDarkWallpapers(theme === 'dark' || theme === 1);
  }, [theme]);


  useEffect(() => {
    if (typeof wallpaper === "string") {
      setCustomWallpaper(wallpaper);
    }
  }, [wallpaper]);

  const handleFileUpload = (e) => {
    // Placeholder logic for file upload as requested by UI structure
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomWallpaper(url);
      
      // Convert to Base64 for API payload
      const reader = new FileReader();
      reader.onloadend = () => {
        changeWallpaper({
          base64: reader.result,
          type: file.type,
          name: file.name
        }, file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderContent = (isMobile) => (
    <Tabs defaultValue="layouts" className="w-full h-full flex flex-col">
       {/* ... existing content ... */}
       <div className={`sticky top-0 z-50 bg-background px-6 ${isMobile ? 'pb-2' : 'pt-4 pb-2'} border-b border-border/30`}>
        <TabsList className="w-full bg-transparent p-0 h-auto gap-6 justify-start">
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
            value="cursors" 
            className="bg-transparent border-b-2 border-transparent rounded-none px-0 pb-2 data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none text-foreground/60 data-[state=active]:text-foreground font-medium transition-all" 
            data-testid={isMobile ? "tab-cursors-mobile" : "tab-cursors"}
          >
            Cursors
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="layouts" className="flex-1 overflow-y-auto p-6 m-0" data-testid={isMobile ? "content-layouts-mobile" : "content-layouts"}>
        <div className="grid grid-cols-2 gap-4">
          {templates.map((tmpl, index) => (
            <div
              key={tmpl.value}
              onClick={() => changeTemplate(index)}
              className={twMerge(
                "px-4 py-6 flex flex-col justify-center items-center border rounded-[16px] cursor-pointer transition-all",
                "bg-default-cursor-box-bg border-default-cursor-box-border",
                "hover:bg-default-cursor-bg-hover",
                getTemplateStyles(index)
              )}
            >
              <div className="flex gap-2 items-center mb-2">
                <p className="text-[14px] md:text-[16px] text-popover-heading-color font-inter font-[500] cursor-pointer">
                  {tmpl.item}
                </p>
                {tmpl.isNew && (
                  <Badge className="bg-[#EE7F70] text-white text-[12px] font-medium">New</Badge>
                )}
              </div>
              <img src={renderTemplate(tmpl.value)} alt="" className="cursor-pointer" />
              {tmpl.id !== 1 && <div className={`mt-4 ${styles.templateBadgePro}`}>Pro</div>}
            </div>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="background" className="flex-1 overflow-y-auto p-6 m-0" data-testid={isMobile ? "content-background-mobile" : "content-background"}>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-md bg-muted/50 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Light Mode</span>
            </div>
            <Switch
              className="data-[state=unchecked]:bg-[#CFC4AF]"
              checked={theme === 'dark' || theme === 1}
              onCheckedChange={(checked) => changeTheme(checked ? 1 : 0)}
              data-testid={isMobile ? "switch-wallpaper-mode-mobile" : "switch-wallpaper-mode"}
            />
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Dark Mode</span>
            </div>
          </div>

          <div className="p-4 rounded-md border border-border bg-card/50 mb-4">
            <div className="flex items-start gap-3 mb-3">
              <Upload className="w-5 h-5 text-primary-landing  mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold mb-1">Upload Custom Background</h4>
                <p className="text-xs text-foreground/60 mb-2">
                  Upload your own image as background. Recommended ratio: 1920x1080. Maximum file size: 5MB.
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
                    onClick={() => document.getElementById(isMobile ? 'custom-wallpaper-upload-mobile' : 'custom-wallpaper-upload')?.click()}
                    data-testid={isMobile ? "button-upload-wallpaper-mobile" : "button-upload-wallpaper"}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </Button>
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => changeWallpaper(0)}
              className={twMerge(
                "relative rounded-md overflow-hidden border-2 transition-all hover:scale-[1.02] active:scale-[0.98]",
                wallpaper === 0 ? 'border-primary-landing ' : 'border-border'
              )}
              data-testid={isMobile ? "button-wallpaper-none-mobile" : "button-wallpaper-none"}
            >
              <div className="aspect-video bg-gradient-to-br from-background to-muted flex items-center justify-center">
                <span className="text-sm font-medium text-foreground/60">Default</span>
              </div>
              {wallpaper === 0 && (
                <div className="absolute top-2 right-2 bg-primary-landing  text-primary-landing -foreground rounded-full p-1">
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
                  "relative rounded-md overflow-hidden border-2 transition-all hover:scale-[1.02] active:scale-[0.98]",
                  wallpaper === customWallpaper ? 'border-primary-landing' : 'border-border'
                )}
                data-testid={isMobile ? "button-wallpaper-custom-mobile" : "button-wallpaper-custom"}
              >
                <img 
                  src={customWallpaper} 
                  alt="Custom wallpaper"
                  className="aspect-video object-cover w-full"
                />
                <div className="absolute bottom-2 left-2">
                  <Badge variant="secondary" className="text-xs">Custom</Badge>
                </div>
                {wallpaper === customWallpaper && (
                  <div className="absolute top-2 right-2 bg-primary-landing  text-primary-landing -foreground rounded-full p-1 z-10">
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
                      "relative rounded-md overflow-hidden border-2 transition-all hover:scale-[1.02] active:scale-[0.98]",
                      wallpaper === wp.value ? 'border-primary-landing ' : 'border-border'
                    )}
                    data-testid={isMobile ? `button-wallpaper-${wp.id}-mobile` : `button-wallpaper-${wp.id}`}
                  >
                    <div className="w-full aspect-video [&>div]:!h-full [&>div]:!rounded-none">
                        {wp.item}
                    </div>
                    {wallpaper === wp.value && (
                      <div className="absolute top-2 right-2 bg-primary-landing  text-primary-landing -foreground rounded-full p-1 z-10">
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

      <TabsContent value="cursors" className="flex-1 overflow-y-auto p-6 m-0" data-testid={isMobile ? "content-cursors-mobile" : "content-cursors"}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {cursors.map((c, index) => (
            <div
              key={index}
              onClick={() => handleChangeCursor(index)}
              className={twMerge(
                "px-4 py-6 flex justify-center items-center border rounded-[16px] cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]",
                "bg-default-cursor-box-bg border-default-cursor-box-border",
                "hover:bg-default-cursor-bg-hover",
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
    <>
      {/* Desktop Panel */}
      {!isMobileOrTablet && (
        <CustomSheet open={show} onClose={handleClose}>
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-6 border-b border-border pt-4 pb-4">
              <h2 className="text-lg font-semibold" data-testid="text-theme-panel-title">Theme Settings</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="h-8 w-8"
                data-testid="button-close-theme-panel"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
               {renderContent(false)}
            </div>
          </div>
        </CustomSheet>
      )}
      
      {/* Mobile/Tablet Panel */}
      {isMobileOrTablet && (
        <Sheet open={show} onOpenChange={(open) => !open && handleClose()}>
           {/* ... existing mobile sheet content ... */}
          <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">
            <SheetHeader className="px-6 py-4 border-b border-border/30 flex-row items-center justify-between space-y-0">
               <SheetTitle className="flex items-center gap-3">
                <span className="font-semibold font-inter" data-testid="text-theme-panel-title-mobile">Theme Settings</span>
              </SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-hidden flex flex-col h-full bg-background">
               {renderContent(true)}
            </div>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
};

export default ThemePanel;
