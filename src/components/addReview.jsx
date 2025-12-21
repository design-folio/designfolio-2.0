import { useGlobalContext } from "@/context/globalContext";
import { _deleteReview, _updateUser } from "@/network/post-request";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import Button from "./button";
import CloseIcon from "../../public/assets/svgs/close.svg";
import Text from "./text";
import DeleteIcon from "../../public/assets/svgs/deleteIcon.svg";
import { useState, useRef, useEffect } from "react";
import SimpleTiptapEditor from "./SimpleTiptapEditor";
import { SheetWrapper } from "./ui/SheetWrapper";
import { UnsavedChangesDialog } from "./ui/UnsavedChangesDialog";
import { modals } from "@/lib/constant";
import { Upload } from "lucide-react";
import useImageCompression from "@/hooks/useImageCompression";
import { ReviewValidationSchema as validationSchema } from "@/lib/validationSchemas";
import { handleImageFile, validateImageFile } from "@/lib/imageValidation";

export default function AddReview() {
  const {
    selectedReview,
    userDetails,
    setSelectedReview,
    closeModal,
    updateCache,
    userDetailsRefecth,
    showModal,
  } = useGlobalContext();

  const [loading, setLoading] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [editingValues, setEditingValues] = useState(null);

  const formikRef = useRef(null);

  const { compress, compressedImage, compressionProgress } =
    useImageCompression();

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  const isOpen = showModal === modals.review;


  useEffect(() => {
    if (selectedReview?.avatar) {
      // Handle avatar as object with url/key or as string
      const avatarUrl = typeof selectedReview.avatar === 'object'
        ? (selectedReview.avatar.url || selectedReview.avatar.key || null)
        : selectedReview.avatar;
      setAvatarPreview(avatarUrl);
    } else {
      setAvatarPreview(null);
    }
    setAvatarFile(null);
  }, [selectedReview]);

  useEffect(() => {
    if (compressionProgress === 100 && compressedImage) {
      setAvatarFile(compressedImage);
      setAvatarPreview(URL.createObjectURL(compressedImage));
    }
  }, [compressionProgress, compressedImage]);

  /* ---------------- Helpers ---------------- */

  // Helper to compare Tiptap JSON objects
  const compareDescription = (desc1, desc2) => {
    if (!desc1 && !desc2) return true;
    if (!desc1 || !desc2) return false;
    return JSON.stringify(desc1) === JSON.stringify(desc2);
  };

  const hasUnsavedChanges = () => {
    if (!editingValues || !selectedReview) return false;

    return (
      editingValues.name !== selectedReview.name ||
      editingValues.company !== selectedReview.company ||
      editingValues.linkedinLink !== (selectedReview.linkedinLink || "") ||
      !compareDescription(editingValues.description, selectedReview.description) ||
      avatarFile !== null
    );
  };

  const resetStateAndClose = () => {
    closeModal();
    setSelectedReview(null);
    setEditingValues(null);
    setAvatarPreview(null);
    setAvatarFile(null);
  };

  const handleCloseModal = () => {
    if (hasUnsavedChanges()) {
      setShowUnsavedWarning(true);
      setPendingAction("close");
    } else {
      resetStateAndClose();
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges()) {
      setShowUnsavedWarning(true);
      setPendingAction("cancel");
    } else {
      resetStateAndClose();
    }
  };

  const handleConfirmDiscard = () => {
    setShowUnsavedWarning(false);
    setPendingAction(null);
    resetStateAndClose();
  };

  const handleDelete = () => {
    _deleteReview(selectedReview?._id)
      .then(() => userDetailsRefecth())
      .finally(resetStateAndClose);
  };

  const handleImageChange = (event) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    const validation = validateImageFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }
    const maxSizeInBytes = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSizeInBytes) {
      compress(file);
    } else {
      // For smaller files, still compress for optimization
      compress(file);
    }
  };


  const renderFormContent = () => (
    <Formik
      innerRef={formikRef}
      initialValues={{
        name: selectedReview?.name || "",
        company: selectedReview?.company || "",
        description: selectedReview?.description || "",
        linkedinLink: selectedReview?.linkedinLink || "",
      }}
      validationSchema={validationSchema}
      onSubmit={(values, actions) => {
        setLoading(true);

        const processSubmit = (avatarData) => {
          const reviewData = {
            ...values,
            ...(avatarData && { avatar: avatarData }),
            ...(!avatarData &&
              selectedReview?.avatar && { avatar: selectedReview.avatar }),
          };

          const reviews = selectedReview
            ? userDetails.reviews.filter(
              (r) => r._id !== selectedReview._id
            )
            : userDetails.reviews;

          _updateUser({ reviews: [...reviews, reviewData] })
            .then((res) => {
              updateCache("userDetails", res?.data?.user);
              resetStateAndClose();
            })
            .finally(() => setLoading(false));

          actions.setSubmitting(false);
        };

        if (avatarFile) {
          const reader = new FileReader();
          reader.onloadend = () =>
            processSubmit({
              key: reader.result,
              originalName: avatarFile.name,
              extension: avatarFile.type.split("/")[1],
            });
          reader.readAsDataURL(avatarFile);
        } else {
          processSubmit();
        }
      }}
    >
      {({ isSubmitting, errors, touched, values, setFieldValue }) => {
        useEffect(() => {
          setEditingValues(values);
        }, [values]);

        return (
          <Form id="reviewForm" className="flex flex-col h-full">
            <div className="flex-1 overflow-auto px-6 py-4">
              <div>
                <Text
                  size={"p-xxsmall"}
                  className="mt-6 font-medium"
                  required
                >
                  Name of the Person
                </Text>
                <Field
                  name="name"
                  type="text"
                  className={`text-input mt-2  ${errors.name &&
                    touched.name &&
                    "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                    }`}
                  autoComplete="off"
                />
                <ErrorMessage
                  name="name"
                  component="div"
                  className="error-message"
                />
              </div>

              <div className="mt-6">
                <Text
                  size={"p-xxsmall"}
                  className="font-medium"
                >
                  LinkedIn Link
                </Text>
                <Field
                  name="linkedinLink"
                  type="text"
                  className={`text-input mt-2  ${errors.linkedinLink &&
                    touched.linkedinLink &&
                    "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                    }`}
                  autoComplete="off"
                  placeholder="https://linkedin.com/in/..."
                />
                <ErrorMessage
                  name="linkedinLink"
                  component="div"
                  className="error-message"
                />
              </div>

              <div className="mt-6">
                <Text
                  size={"p-xxsmall"}
                  className="font-medium"
                  required
                >
                  Company Name
                </Text>
                <Field
                  name="company"
                  type="text"
                  className={`text-input mt-2  ${errors.company &&
                    touched.company &&
                    "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                    }`}
                  autoComplete="off"
                />
                <ErrorMessage
                  name="company"
                  component="div"
                  className="error-message"
                />
              </div>

              <div className="mt-6">
                <Text
                  size={"p-xxsmall"}
                  className="font-medium"
                  required
                >
                  Add testimonial
                </Text>
                <div className="mt-2">
                  <SimpleTiptapEditor
                    mode="review"
                    enableBulletList={false}
                    content={values.description}
                    onChange={(html) => setFieldValue("description", html)}
                    placeholder="Write your testimonial here..."
                  />
                </div>
                {errors.description && touched.description && (
                  <div className="error-message mt-1">{errors.description}</div>
                )}
              </div>

              <div className="mt-6">
                <Text
                  size={"p-xxsmall"}
                  className="font-medium"
                >
                  Photo of the Person
                </Text>
                <div className="flex justify-start mt-2">
                  <label
                    htmlFor="review-avatar"
                    className="relative w-24 h-24 rounded-full border-2 border-border bg-muted hover:border-foreground/30 cursor-pointer flex items-center justify-center transition-all duration-300 ease-out hover:shadow-[0_0_0_4px_hsl(var(--foreground)/0.12)] overflow-hidden group"
                  >
                    {avatarPreview ? (
                      <>
                        <img
                          src={avatarPreview}
                          alt="Avatar preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <Upload className="w-5 h-5 text-white" />
                        </div>
                      </>
                    ) : (
                      <Upload className="w-6 h-6 text-foreground/40 group-hover:text-foreground/60 transition-colors" />
                    )}
                  </label>
                </div>
                <input
                  id="review-avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>

            <div
              className={`flex gap-2 py-3 px-6 border-t border-border ${selectedReview?.name ? "justify-between" : "justify-end"
                }`}
            >
              {selectedReview?.name && (
                <Button
                  type="delete"
                  icon={
                    <DeleteIcon className="stroke-delete-btn-icon-color w-6 h-6 cursor-pointer" />
                  }
                  onClick={handleDelete}
                />
              )}

              <div className="flex gap-2">
                <Button
                  text={"Cancel"}
                  onClick={handleCancel}
                  type="secondary"
                />
                <Button
                  btnType="submit"
                  text={"Save"}
                  type="modal"
                  form="reviewForm"
                  isLoading={loading}
                />
              </div>
            </div>
          </Form>
        );
      }}
    </Formik>
  );

  /* ---------------- Layout ---------------- */

  return (
    <>
      <SheetWrapper
        open={isOpen}
        onClose={handleCloseModal}
        title="Add review details"
        width="320px"
      >
        {renderFormContent()}
      </SheetWrapper>

      <UnsavedChangesDialog
        open={showUnsavedWarning}
        onOpenChange={setShowUnsavedWarning}
        onConfirmDiscard={handleConfirmDiscard}
      />
    </>
  );
}
