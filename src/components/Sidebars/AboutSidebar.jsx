import { useGlobalContext } from "@/context/globalContext";
import { _updateUser } from "@/network/post-request";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Text from "../text";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { UnsavedChangesDialog } from "../ui/UnsavedChangesDialog";
import { sidebars } from "@/lib/constant";
import { AboutSchema } from "@/lib/validationSchemas";
import { DEFAULT_PEGBOARD_IMAGES, DEFAULT_PEGBOARD_STICKERS } from "@/lib/aboutConstants";
import ImageGrid from "../about/ImageGrid";
import useImageCompression from "@/hooks/useImageCompression";

export default function AddAbout() {
  const {
    activeSidebar,
    closeSidebar,
    userDetails,
    updateCache,
    setUserDetails,
    registerUnsavedChangesChecker,
    unregisterUnsavedChangesChecker,
    showUnsavedWarning,
    handleConfirmDiscardSidebar,
    handleCancelDiscardSidebar,
    isSwitchingSidebar,
    pendingSidebarAction,
  } = useGlobalContext();

  const [loading, setLoading] = useState(false);
  const [editingValues, setEditingValues] = useState(null);
  const [uploadingImageIndex, setUploadingImageIndex] = useState(null);
  const lastCompressedTargetRef = useRef(null);
  const formikRef = useRef(null);

  const { compress, compressedImage, compressionProgress } = useImageCompression();

  const isOpen = activeSidebar === sidebars.about;

  const initialImages = useMemo(() => {
    const userImages = userDetails?.about?.pegboardImages;
    if (userImages?.length > 0) {
      return userImages.map((img) => (img ? { src: img.src, isDefault: !!img.isDefault } : null));
    }
    return DEFAULT_PEGBOARD_IMAGES.map((img) => ({ ...img, isDefault: true }));
  }, [userDetails?.about?.pegboardImages]);

  const initialStickers = useMemo(() => {
    const userStickers = userDetails?.about?.pegboardStickers;
    if (userStickers?.length > 0) {
      return userStickers.map((s) => (s ? { src: s.src, isDefault: !!s.isDefault } : null));
    }
    return DEFAULT_PEGBOARD_STICKERS.map((s) => ({ ...s, isDefault: true }));
  }, [userDetails?.about?.pegboardStickers]);

  // Helper to convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle compression result
  useEffect(() => {
    if (
      compressionProgress === 100 &&
      compressedImage &&
      formikRef.current &&
      lastCompressedTargetRef.current
    ) {
      const { type, index } = lastCompressedTargetRef.current;
      const fieldName = type === "image" ? "pegboardImages" : "pegboardStickers";
      const currentItems = formikRef.current.values[fieldName];
      const updatedItems = [...currentItems];

      updatedItems[index] = {
        src: URL.createObjectURL(compressedImage),
        isDefault: false,
        file: compressedImage,
      };

      formikRef.current.setFieldValue(fieldName, updatedItems);
      lastCompressedTargetRef.current = null;
      if (type === "image") setUploadingImageIndex(null);
    }
  }, [compressionProgress, compressedImage]);

  // Deep comparison for arrays (ignoring file objects and blob URLs)
  const arraysEqual = (arr1, arr2) => {
    if (!arr1 && !arr2) return true;
    if (!arr1 || !arr2) return false;
    if (arr1.length !== arr2.length) return false;

    return arr1.every((item, index) => {
      const item2 = arr2[index];
      if (!item && !item2) return true;
      if (!item || !item2) return false;
      // If it's a new upload (has file or blob src), it's different from initial
      if (item.file || (item.src && item.src.startsWith("blob:"))) return false;
      return item.src === item2.src;
    });
  };

  const hasUnsavedChanges = useCallback(() => {
    if (!editingValues) return false;
    const initialDescription = userDetails?.about?.description || "";
    return (
      editingValues.description !== initialDescription ||
      !arraysEqual(editingValues.pegboardImages, initialImages) ||
      !arraysEqual(editingValues.pegboardStickers, initialStickers)
    );
  }, [editingValues, userDetails?.about?.description, initialImages, initialStickers]);

  const resetState = useCallback(() => {
    setEditingValues(null);
    setUploadingImageIndex(null);
    lastCompressedTargetRef.current = null;
  }, []);

  const resetStateAndClose = () => {
    resetState();
    closeSidebar(true);
  };

  const handleCancel = () => {
    closeSidebar();
  };

  // Clear state when sidebar closes
  useEffect(() => {
    if (!isOpen) {
      queueMicrotask(() => resetState());
    }
  }, [isOpen, resetState]);

  // Register unsaved changes checker
  useEffect(() => {
    if (isOpen) {
      registerUnsavedChangesChecker(sidebars.about, hasUnsavedChanges);
    }
    return () => {
      unregisterUnsavedChangesChecker(sidebars.about);
    };
  }, [isOpen, hasUnsavedChanges, registerUnsavedChangesChecker, unregisterUnsavedChangesChecker]);

  // Handle image upload
  const handleImageUpload = async (file, index, setFieldValue, currentImages) => {
    setUploadingImageIndex(index);
    lastCompressedTargetRef.current = { type: "image", index };

    const maxSizeInBytes = 2 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      compress(file);
    } else {
      // Small enough to use directly
      const updatedImages = [...currentImages];
      updatedImages[index] = {
        src: URL.createObjectURL(file),
        isDefault: false,
        file: file,
      };
      setFieldValue("pegboardImages", updatedImages);
      setUploadingImageIndex(null);
      lastCompressedTargetRef.current = null;
    }
  };

  // Handle image delete
  const handleImageDelete = (index, setFieldValue, currentImages) => {
    const updatedImages = [...currentImages];
    updatedImages[index] = null;
    setFieldValue("pegboardImages", updatedImages);
  };

  const renderFormContent = () => (
    <Formik
      key="about-form"
      innerRef={formikRef}
      enableReinitialize
      initialValues={{
        description: userDetails?.about?.description || "",
        pegboardImages: initialImages,
        pegboardStickers: initialStickers,
      }}
      validationSchema={AboutSchema}
      onSubmit={async (values, actions) => {
        setLoading(true);

        try {
          // Process images: convert new files to base64
          const processedImages = await Promise.all(
            values.pegboardImages.map(async (img) => {
              if (img && img.file) {
                const base64 = await fileToBase64(img.file);
                return {
                  src: base64,
                  isDefault: false,
                  originalName: img.file.name,
                  extension: img.file.type.split("/")[1],
                };
              }
              // For existing images, strip unnecessary properties
              return img
                ? {
                    src: img.src,
                    isDefault: !!img.isDefault,
                  }
                : null;
            })
          );

          // Process stickers
          const processedStickers = await Promise.all(
            values.pegboardStickers.map(async (s) => {
              if (s && s.file) {
                const base64 = await fileToBase64(s.file);
                return {
                  src: base64,
                  isDefault: false,
                  originalName: s.file.name,
                  extension: s.file.type.split("/")[1],
                };
              }
              return s
                ? {
                    src: s.src,
                    isDefault: !!s.isDefault,
                  }
                : null;
            })
          );

          const payload = {
            about: {
              description: values.description,
              pegboardImages: processedImages,
              pegboardStickers: processedStickers,
            },
          };

          const res = await _updateUser(payload);
          updateCache("userDetails", res?.data?.user);
          setUserDetails((prev) => ({
            ...prev,
            about: res?.data?.user?.about || payload.about,
          }));
          resetStateAndClose();
        } catch (err) {
          console.error("Error updating about:", err);
          actions.setSubmitting(false);
        } finally {
          setLoading(false);
        }
      }}
    >
      {({ errors, touched, values, setFieldValue }) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          setEditingValues(values);
        }, [values]);

        return (
          <Form id="aboutForm" className="flex h-full flex-col">
            <div className="flex-1 overflow-auto px-6 py-4">
              {/* Description Section */}
              <div>
                <div className="mb-2 flex justify-between">
                  <Text size="p-xxsmall" className="font-medium">
                    Description
                  </Text>
                  <Text size="p-xxsmall" className="text-muted-foreground font-medium">
                    {values?.description?.length || 0}/1200
                  </Text>
                </div>
                <Field name="description">
                  {({ field }) => (
                    <Textarea
                      {...field}
                      id="description"
                      autoComplete="off"
                      placeholder="Tell visitors about yourself..."
                      className={`mt-2 min-h-[120px] ${errors.description && touched.description ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    />
                  )}
                </Field>
                <ErrorMessage
                  name="description"
                  component="div"
                  className="error-message !mt-[2px] text-[14px]"
                />
              </div>

              {/* Pegboard Images Section */}
              <div className="mt-6">
                <ImageGrid
                  items={values.pegboardImages}
                  maxItems={4}
                  onUpload={(file, index) =>
                    handleImageUpload(file, index, setFieldValue, values.pegboardImages)
                  }
                  onDelete={(index) =>
                    handleImageDelete(index, setFieldValue, values.pegboardImages)
                  }
                  type="image"
                  label="Pegboard Photos"
                  uploadingIndex={uploadingImageIndex}
                />
              </div>

              {/* Stickers Section — temporarily hidden */}
            </div>

            {/* Footer */}
            <div className="border-border flex justify-end gap-2 border-t px-6 py-3">
              <Button variant="outline" type="button" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" form="aboutForm" disabled={loading}>
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
          if (!open) {
            handleCancelDiscardSidebar();
          }
        }}
        onConfirmDiscard={() => {
          handleConfirmDiscardSidebar();
          resetStateAndClose();
        }}
        title="Unsaved Changes"
        description="You have made changes to your about section. Are you sure you want to discard them?"
      />
    </>
  );
}
