import { useGlobalContext } from "@/context/globalContext";
import { _getTools } from "@/network/get-request";
import { _updateUser } from "@/network/post-request";
import { Form, Formik } from "formik";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import * as Yup from "yup";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { UnsavedChangesDialog } from "../ui/UnsavedChangesDialog";
import { sidebars } from "@/lib/constant";
import { motion } from "motion/react";
import { Plus, Search } from "lucide-react";

const validationSchema = Yup.object().shape({
  selectedTools: Yup.array().of(Yup.object()).min(3, "Please select at least 3 tools"),
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

  const { data: toolsOptions = [] } = useQuery({
    queryKey: ["tools"],
    queryFn: () =>
      _getTools()
        .then((res) => res?.data?.tools ?? [])
        .catch(() => []),
    staleTime: 5 * 60 * 1000,
  });
  const [loading, setLoading] = useState(false);
  const [editingValues, setEditingValues] = useState(null);
  const [toolSearchQuery, setToolSearchQuery] = useState("");
  const formikRef = useRef(null);

  const isOpen = activeSidebar === sidebars.tools;

  const hasUnsavedChanges = useCallback(() => {
    if (!editingValues) return false;
    const initial = JSON.stringify(userDetails?.tools ?? []);
    const current = JSON.stringify(editingValues.selectedTools ?? []);
    return initial !== current;
  }, [editingValues, userDetails?.tools]);

  // Reset search when panel closes
  useEffect(() => {
    if (!isOpen) {
      queueMicrotask(() => {
        setEditingValues(null);
        setToolSearchQuery("");
      });
    }
  }, [isOpen]);

  const resetStateAndClose = () => {
    setEditingValues(null);
    closeSidebar(true);
  };

  useEffect(() => {
    if (isOpen) {
      registerUnsavedChangesChecker(sidebars.tools, hasUnsavedChanges);
    }
    return () => unregisterUnsavedChangesChecker(sidebars.tools);
  }, [isOpen, hasUnsavedChanges, registerUnsavedChangesChecker, unregisterUnsavedChangesChecker]);

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
        // eslint-disable-next-line react-hooks/rules-of-hooks
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
          .filter((t) => t.label.toLowerCase().includes(toolSearchQuery.toLowerCase()))
          .sort((a, b) => {
            const isASelected = selectedTools.some((t) => t.value === a.value);
            const isBSelected = selectedTools.some((t) => t.value === b.value);
            if (isASelected === isBSelected) return a.label.localeCompare(b.label);
            return isASelected ? -1 : 1;
          });

        return (
          <Form id="toolsForm" className="flex h-full flex-col">
            <div className="flex-1 space-y-5 overflow-auto px-6 py-5">
              {/* Search */}
              <div className="space-y-2">
                <Label className="text-foreground ml-1 text-sm font-medium">Search Tools</Label>
                <div className="relative">
                  <Search className="text-foreground/30 pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
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
                <p className="text-foreground/40 px-1 text-xs">
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
                      onClick={() => (isSelected ? handleRemoveTool(tool) : handleAddTool(tool))}
                      className={`group flex h-[34px] items-center gap-2.5 rounded-xl border px-3.5 text-[13px] font-medium transition-colors ${
                        isSelected
                          ? "bg-muted border-border text-foreground shadow-sm"
                          : "text-foreground/50 hover:text-foreground border-transparent bg-transparent hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="relative flex h-4 w-4 shrink-0 items-center justify-center">
                        {tool.image && (
                          <img
                            src={tool.image}
                            alt={tool.label}
                            className={`absolute inset-0 h-4 w-4 object-contain transition-all duration-200 ${
                              isSelected
                                ? "opacity-100 grayscale-0"
                                : "opacity-50 grayscale group-hover:scale-50 group-hover:-rotate-45 group-hover:opacity-0"
                            }`}
                          />
                        )}
                        {!isSelected && (
                          <Plus className="absolute inset-0 h-4 w-4 scale-50 rotate-45 opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:rotate-0 group-hover:opacity-100" />
                        )}
                      </div>
                      {tool.label}
                    </motion.button>
                  );
                })}

                {filteredTools.length === 0 && (
                  <p className="text-foreground/40 w-full py-4 text-center text-sm">
                    No tools found for &ldquo;{toolSearchQuery}&rdquo;
                  </p>
                )}
              </motion.div>

              {errors.selectedTools && touched.selectedTools && (
                <p className="error-message text-[13px]">{errors.selectedTools}</p>
              )}
            </div>

            <div className="border-border bg-sidebar flex shrink-0 justify-end gap-2 border-t px-6 py-3">
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
      {renderFormContent()}

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
