import { useGlobalContext } from "@/context/globalContext";
import { _getTools } from "@/network/get-request";
import { _updateUser } from "@/network/post-request";
import { Form, Formik } from "formik";
import { useEffect, useRef, useState } from "react";
import * as Yup from "yup";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { SheetWrapper } from "./ui/SheetWrapper";
import { UnsavedChangesDialog } from "./ui/UnsavedChangesDialog";
import { sidebars } from "@/lib/constant";
import { motion } from "framer-motion";
import { Plus, Search } from "lucide-react";

const validationSchema = Yup.object().shape({
  selectedTools: Yup.array()
    .of(Yup.object())
    .min(3, "Please select at least 3 tools"),
});

export default function AddTools() {
  const {
    activeSidebar,
    closeSidebar,
    userDetails,
    updateCache,
    registerUnsavedChangesChecker,
    unregisterUnsavedChangesChecker,
    showUnsavedWarning,
    handleConfirmDiscardSidebar,
    handleCancelDiscardSidebar,
    isSwitchingSidebar,
    pendingSidebarAction,
  } = useGlobalContext();

  const [toolsOptions, setToolsOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingValues, setEditingValues] = useState(null);
  const [toolSearchQuery, setToolSearchQuery] = useState("");
  const formikRef = useRef(null);

  const isOpen = activeSidebar === sidebars.tools;

  useEffect(() => {
    _getTools()
      .then((res) => setToolsOptions(res.data.tools))
      .catch(() => {});
  }, []);

  // Reset search when panel closes
  useEffect(() => {
    if (!isOpen) {
      setEditingValues(null);
      setToolSearchQuery("");
    }
  }, [isOpen]);

  const hasUnsavedChanges = () => {
    if (!editingValues) return false;
    const initial = JSON.stringify(userDetails?.tools ?? []);
    const current = JSON.stringify(editingValues.selectedTools ?? []);
    return initial !== current;
  };

  const resetStateAndClose = () => {
    setEditingValues(null);
    closeSidebar(true);
  };

  useEffect(() => {
    if (isOpen) {
      registerUnsavedChangesChecker(sidebars.tools, hasUnsavedChanges);
    }
    return () => unregisterUnsavedChangesChecker(sidebars.tools);
  }, [isOpen, editingValues, registerUnsavedChangesChecker, unregisterUnsavedChangesChecker]);

  const renderFormContent = () => (
    <Formik
      key="tools-form"
      innerRef={formikRef}
      enableReinitialize
      initialValues={{ selectedTools: userDetails?.tools ?? [] }}
      validationSchema={validationSchema}
      onSubmit={(values, actions) => {
        setLoading(true);
        _updateUser({ tools: values.selectedTools })
          .then((res) => {
            updateCache("userDetails", res?.data?.user);
            resetStateAndClose();
            actions.setSubmitting(false);
          })
          .catch(() => actions.setSubmitting(false))
          .finally(() => setLoading(false));
      }}
    >
      {({ values, setFieldValue, errors, touched }) => {
        useEffect(() => {
          setEditingValues(values);
        }, [values]);

        const selectedTools = values.selectedTools ?? [];

        const handleAddTool = (tool) => {
          if (!selectedTools.some((t) => t.value === tool.value)) {
            setFieldValue("selectedTools", [...selectedTools, tool]);
          }
        };

        const handleRemoveTool = (tool) => {
          setFieldValue(
            "selectedTools",
            selectedTools.filter((t) => t.value !== tool.value)
          );
        };

        const filteredTools = toolsOptions
          .filter((t) =>
            t.label.toLowerCase().includes(toolSearchQuery.toLowerCase())
          )
          .sort((a, b) => {
            const isASelected = selectedTools.some((t) => t.value === a.value);
            const isBSelected = selectedTools.some((t) => t.value === b.value);
            if (isASelected === isBSelected) return a.label.localeCompare(b.label);
            return isASelected ? -1 : 1;
          });

        return (
          <Form id="toolsForm" className="flex flex-col h-full">
            <div className="flex-1 overflow-auto px-6 py-5 space-y-5">
              {/* Search */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground ml-1">
                  Search Tools
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30 pointer-events-none" />
                  <Input
                    placeholder="Search for a tool..."
                    value={toolSearchQuery}
                    onChange={(e) => setToolSearchQuery(e.target.value)}
                    className="pl-9"
                    autoComplete="off"
                  />
                </div>
              </div>

              {/* Count */}
              {selectedTools.length > 0 && (
                <p className="text-xs text-foreground/40 px-1">
                  {selectedTools.length} tool{selectedTools.length !== 1 ? "s" : ""} selected
                </p>
              )}

              {/* Tool Pills */}
              <motion.div layout className="flex flex-wrap gap-2">
                {filteredTools.map((tool) => {
                  const isSelected = selectedTools.some((t) => t.value === tool.value);
                  return (
                    <motion.button
                      layout
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      key={`tool-${tool.value}`}
                      type="button"
                      onClick={() =>
                        isSelected ? handleRemoveTool(tool) : handleAddTool(tool)
                      }
                      className={`group h-[34px] px-3.5 rounded-xl flex items-center gap-2.5 text-[13px] font-medium transition-colors border ${
                        isSelected
                          ? "bg-muted border-border text-foreground shadow-sm"
                          : "bg-transparent border-transparent text-foreground/50 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] hover:text-foreground"
                      }`}
                    >
                      <div className="relative w-4 h-4 flex items-center justify-center shrink-0">
                        {tool.image && (
                          <img
                            src={tool.image}
                            alt={tool.label}
                            className={`absolute inset-0 w-4 h-4 object-contain transition-all duration-200 ${
                              isSelected
                                ? "grayscale-0 opacity-100"
                                : "grayscale opacity-50 group-hover:opacity-0 group-hover:scale-50 group-hover:-rotate-45"
                            }`}
                          />
                        )}
                        {!isSelected && (
                          <Plus className="absolute inset-0 w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-200 scale-50 group-hover:scale-100 rotate-45 group-hover:rotate-0" />
                        )}
                      </div>
                      {tool.label}
                    </motion.button>
                  );
                })}

                {filteredTools.length === 0 && (
                  <p className="text-sm text-foreground/40 py-4 w-full text-center">
                    No tools found for &ldquo;{toolSearchQuery}&rdquo;
                  </p>
                )}
              </motion.div>

              {errors.selectedTools && touched.selectedTools && (
                <p className="error-message text-[13px]">{errors.selectedTools}</p>
              )}
            </div>

            <div className="flex gap-2 py-3 px-6 border-t border-border justify-end flex-shrink-0 bg-sidebar-background">
              <Button variant="outline" type="button" onClick={() => closeSidebar()}>
                Cancel
              </Button>
              <Button type="submit" form="toolsForm" disabled={loading}>
                {loading ? "Saving…" : "Save"}
              </Button>
            </div>
          </Form>
        );
      }}
    </Formik>
  );

  return (
    <>
      <SheetWrapper
        open={isOpen}
        onClose={() => closeSidebar()}
        title="Edit Stack"
        width="400px"
      >
        {renderFormContent()}
      </SheetWrapper>

      <UnsavedChangesDialog
        open={
          showUnsavedWarning &&
          isOpen &&
          !isSwitchingSidebar &&
          pendingSidebarAction?.type === "close"
        }
        onOpenChange={(open) => {
          if (!open) handleCancelDiscardSidebar();
        }}
        onConfirmDiscard={() => {
          handleConfirmDiscardSidebar();
          resetStateAndClose();
        }}
        title="Unsaved Changes"
        description="You have unsaved changes to your tools. Are you sure you want to discard them?"
      />
    </>
  );
}
