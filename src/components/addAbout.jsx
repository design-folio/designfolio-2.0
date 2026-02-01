import { useGlobalContext } from "@/context/globalContext";
import { _updateUser } from "@/network/post-request";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { useState, useRef, useEffect } from "react";
import Text from "./text";
import Button from "./button";
import { SheetWrapper } from "./ui/SheetWrapper";
import { UnsavedChangesDialog } from "./ui/UnsavedChangesDialog";
import { sidebars } from "@/lib/constant";
import { AboutSchema } from "@/lib/validationSchemas";
import { DEFAULT_PEGBOARD_IMAGES, DEFAULT_PEGBOARD_STICKERS } from "@/lib/aboutConstants";
import ImageGrid from "./about/ImageGrid";
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
  const [uploadingStickerIndex, setUploadingStickerIndex] = useState(null);
  const [lastCompressedTarget, setLastCompressedTarget] = useState(null);
  const formikRef = useRef(null);

  const { compress, compressedImage, compressionProgress } = useImageCompression();

  const isOpen = activeSidebar === sidebars.about;

  // Initialize images and stickers
  const getInitialImages = () => {
    const userImages = userDetails?.about?.pegboardImages;
    if (userImages && userImages.length > 0) {
      return userImages.map(img => img ? {
        src: img.src,
        isDefault: !!img.isDefault
      } : null);
    }
    return DEFAULT_PEGBOARD_IMAGES.map(img => ({ ...img, isDefault: true }));
  };

  const getInitialStickers = () => {
    const userStickers = userDetails?.about?.pegboardStickers;
    if (userStickers && userStickers.length > 0) {
      return userStickers.map(s => s ? {
        src: s.src,
        isDefault: !!s.isDefault
      } : null);
    }
    return DEFAULT_PEGBOARD_STICKERS.map(s => ({ ...s, isDefault: true }));
  };

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
    if (compressionProgress === 100 && compressedImage && formikRef.current && lastCompressedTarget) {
      const { type, index } = lastCompressedTarget;
      const fieldName = type === 'image' ? 'pegboardImages' : 'pegboardStickers';
      const currentItems = formikRef.current.values[fieldName];
      const updatedItems = [...currentItems];

      updatedItems[index] = {
        src: URL.createObjectURL(compressedImage),
        isDefault: false,
        file: compressedImage // Store File object for submission
      };

      formikRef.current.setFieldValue(fieldName, updatedItems);
      setLastCompressedTarget(null);
      if (type === 'image') setUploadingImageIndex(null);
      else setUploadingStickerIndex(null);
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
      if (item.file || (item.src && item.src.startsWith('blob:'))) return false;
      return item.src === item2.src;
    });
  };

  const hasUnsavedChanges = () => {
    if (!editingValues) return false;

    const initialDescription = userDetails?.about?.description || "";
    const initialImages = getInitialImages();
    const initialStickers = getInitialStickers();

    return (
      editingValues.description !== initialDescription ||
      !arraysEqual(editingValues.pegboardImages, initialImages) ||
      !arraysEqual(editingValues.pegboardStickers, initialStickers)
    );
  };

  const resetState = () => {
    setEditingValues(null);
    setUploadingImageIndex(null);
    setUploadingStickerIndex(null);
    setLastCompressedTarget(null);
  };

  const resetStateAndClose = () => {
    resetState();
    closeSidebar(true);
  };

  const handleCloseModal = () => {
    closeSidebar();
  };

  const handleCancel = () => {
    closeSidebar();
  };

  // Clear state when sidebar closes
  useEffect(() => {
    if (!isOpen) {
      resetState();
    }
  }, [isOpen]);

  // Register unsaved changes checker
  useEffect(() => {
    if (isOpen) {
      registerUnsavedChangesChecker(sidebars.about, hasUnsavedChanges);
    }
    return () => {
      unregisterUnsavedChangesChecker(sidebars.about);
    };
  }, [isOpen, editingValues, registerUnsavedChangesChecker, unregisterUnsavedChangesChecker]);

  // Handle image upload
  const handleImageUpload = async (file, index, setFieldValue, currentImages) => {
    setUploadingImageIndex(index);
    setLastCompressedTarget({ type: 'image', index });

    const maxSizeInBytes = 2 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      compress(file);
    } else {
      // Small enough to use directly
      const updatedImages = [...currentImages];
      updatedImages[index] = {
        src: URL.createObjectURL(file),
        isDefault: false,
        file: file
      };
      setFieldValue("pegboardImages", updatedImages);
      setUploadingImageIndex(null);
      setLastCompressedTarget(null);
    }
  };

  // Handle sticker upload
  const handleStickerUpload = async (file, index, setFieldValue, currentStickers) => {
    setUploadingStickerIndex(index);
    setLastCompressedTarget({ type: 'sticker', index });

    const maxSizeInBytes = 2 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      compress(file);
    } else {
      const updatedStickers = [...currentStickers];
      updatedStickers[index] = {
        src: URL.createObjectURL(file),
        isDefault: false,
        file: file
      };
      setFieldValue("pegboardStickers", updatedStickers);
      setUploadingStickerIndex(null);
      setLastCompressedTarget(null);
    }
  };

  // Handle image delete
  const handleImageDelete = (index, setFieldValue, currentImages) => {
    const updatedImages = [...currentImages];
    updatedImages[index] = null;
    setFieldValue("pegboardImages", updatedImages);
  };

  // Handle sticker delete
  const handleStickerDelete = (index, setFieldValue, currentStickers) => {
    const updatedStickers = [...currentStickers];
    updatedStickers[index] = null;
    setFieldValue("pegboardStickers", updatedStickers);
  };

  const renderFormContent = () => (
    <Formik
      key="about-form"
      innerRef={formikRef}
      enableReinitialize
      initialValues={{
        description: userDetails?.about?.description || "",
        pegboardImages: getInitialImages(),
        pegboardStickers: getInitialStickers(),
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
                  extension: img.file.type.split("/")[1]
                };
              }
              // For existing images, strip unnecessary properties
              return img ? {
                src: img.src,
                isDefault: !!img.isDefault
              } : null;
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
                  extension: s.file.type.split("/")[1]
                };
              }
              return s ? {
                src: s.src,
                isDefault: !!s.isDefault
              } : null;
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
      {({ isSubmitting, errors, touched, values, setFieldValue }) => {
        useEffect(() => {
          setEditingValues(values);
        }, [values]);

        return (
          <Form id="aboutForm" className="flex flex-col h-full">
            <div className="flex-1 overflow-auto px-6 py-4">
              {/* Description Section */}
              <div>
                <div className="flex justify-between mb-2">
                  <Text size="p-xxsmall" className="font-medium">
                    Description
                  </Text>
                  <Text size="p-xxsmall" className="font-medium text-muted-foreground">
                    {(values?.description?.length || 0)}/1200
                  </Text>
                </div>
                <Field
                  name="description"
                  as="textarea"
                  autoComplete="off"
                  placeholder="Tell visitors about yourself..."
                  className={`text-input mt-2 min-h-[120px] ${errors.description && touched.description
                      ? "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                      : ""
                    }`}
                />
                <ErrorMessage
                  name="description"
                  component="div"
                  className="error-message text-[14px] !mt-[2px]"
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

              {/* Stickers Section */}
              <div className="mt-6">
                <ImageGrid
                  items={values.pegboardStickers}
                  maxItems={2}
                  onUpload={(file, index) =>
                    handleStickerUpload(file, index, setFieldValue, values.pegboardStickers)
                  }
                  onDelete={(index) =>
                    handleStickerDelete(index, setFieldValue, values.pegboardStickers)
                  }
                  type="sticker"
                  label="Stickers"
                  uploadingIndex={uploadingStickerIndex}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-2 py-3 px-6 border-t border-border justify-end">
              <Button text="Cancel" onClick={handleCancel} type="secondary" />
              <Button
                btnType="submit"
                text="Save"
                type="modal"
                form="aboutForm"
                isLoading={loading}
              />
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
        onClose={handleCloseModal}
        title="Edit About Me"
        width="320px"
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
