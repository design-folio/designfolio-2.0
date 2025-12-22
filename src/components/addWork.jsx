import { useGlobalContext } from "@/context/globalContext";
import { _deleteExperience, _updateUser } from "@/network/post-request";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import Text from "./text";
import Button from "./button";
import DeleteIcon from "../../public/assets/svgs/deleteIcon.svg";
import { useState, useRef, useEffect } from "react";
import SimpleTiptapEditor from "./SimpleTiptapEditor";
import { SheetWrapper } from "./ui/SheetWrapper";
import { UnsavedChangesDialog } from "./ui/UnsavedChangesDialog";
import { sidebars } from "@/lib/constant";
import { WorkValidationSchema as validationSchema } from "@/lib/validationSchemas";


// Generate year options
const yearOptions = [];
for (let year = 1998; year <= 2030; year++) {
  yearOptions.push(
    <option key={year} value={year}>
      {year}
    </option>
  );
}

// Month options
const monthOptions = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "June",
  "July",
  "Aug",
  "Sept",
  "Oct",
  "Nov",
  "Dec",
].map((month, index) => (
  <option key={index} value={month}>
    {month}
  </option>
));

export default function AddWork() {
  const {
    selectedWork,
    userDetails,
    setSelectedWork,
    userDetailsRefecth,
    updateCache,
    activeSidebar,
    closeSidebar,
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

  const formikRef = useRef(null);

  const isOpen = activeSidebar === sidebars.work;

  // Helper to compare Tiptap JSON objects
  const compareDescription = (desc1, desc2) => {
    if (!desc1 && !desc2) return true;
    if (!desc1 || !desc2) return false;
    return JSON.stringify(desc1) === JSON.stringify(desc2);
  };

  const hasUnsavedChanges = () => {
    if (!editingValues) return false;

    // If creating a new work (selectedWork is null), check if any fields have values
    if (!selectedWork) {
      return !!(
        editingValues.role ||
        editingValues.company ||
        editingValues.description ||
        editingValues.startMonth ||
        editingValues.startYear ||
        editingValues.endMonth ||
        editingValues.endYear ||
        editingValues.currentlyWorking
      );
    }

    // If editing existing work, compare with original values
    const originalEndMonth = selectedWork.currentlyWorking ? "" : (selectedWork.endMonth || "");
    const originalEndYear = selectedWork.currentlyWorking ? "" : (selectedWork.endYear || "");

    return (
      editingValues.role !== (selectedWork.role || "") ||
      editingValues.company !== (selectedWork.company || "") ||
      !compareDescription(editingValues.description, selectedWork.description) ||
      editingValues.startMonth !== (selectedWork.startMonth || "") ||
      editingValues.startYear !== (selectedWork.startYear || "") ||
      editingValues.endMonth !== originalEndMonth ||
      editingValues.endYear !== originalEndYear ||
      editingValues.currentlyWorking !== (selectedWork.currentlyWorking || false)
    );
  };

  const resetStateAndClose = () => {
    closeSidebar(true); // Force close since we're handling unsaved changes separately
    setSelectedWork(null);
    setEditingValues(null);
  };

  const handleCloseModal = () => {
    closeSidebar(); // This will check for unsaved changes
  };

  const handleCancel = () => {
    closeSidebar(); // This will check for unsaved changes
  };

  // Register unsaved changes checker
  useEffect(() => {
    if (isOpen) {
      registerUnsavedChangesChecker(sidebars.work, hasUnsavedChanges);
    }
    return () => {
      unregisterUnsavedChangesChecker(sidebars.work);
    };
  }, [isOpen, editingValues, selectedWork, registerUnsavedChangesChecker, unregisterUnsavedChangesChecker]);

  // Handle confirm discard from global context
  useEffect(() => {
    if (showUnsavedWarning && isOpen) {
      // The global context will handle the dialog, but we need to reset our state when confirmed
      // This is handled by the global context's handleConfirmDiscardSidebar
    }
  }, [showUnsavedWarning, isOpen]);

  const handleDeleteWork = () => {
    _deleteExperience(selectedWork?._id)
      .then(() => userDetailsRefecth())
      .finally(resetStateAndClose);
  };
  /* ---------------- Form ---------------- */

  // Helper to normalize description - accept JSON or string
  const normalizeDescription = (desc) => {
    if (!desc) return "";
    // Accept JSON objects or strings as-is
    return desc;
  };

  const renderFormContent = () => (
    <Formik
      key={selectedWork?._id || 'new'}
      innerRef={formikRef}
      enableReinitialize
      initialValues={{
        role: selectedWork?.role ?? "",
        company: selectedWork?.company ?? "",
        description: normalizeDescription(selectedWork?.description),
        startMonth: selectedWork?.startMonth ?? "",
        startYear: selectedWork?.startYear ?? "",
        endMonth: selectedWork?.currentlyWorking
          ? ""
          : selectedWork?.endMonth ?? "",
        endYear: selectedWork?.currentlyWorking
          ? ""
          : selectedWork?.endYear ?? "",
        currentlyWorking: selectedWork?.currentlyWorking ?? false,
      }}
      validationSchema={validationSchema}
      validate={(values) => {
        const errors = {};
        // Add your dynamic validation logic here
        if (!values.currentlyWorking) {
          if (!values.endMonth) {
            errors.endMonth = "End Month is required";
          }
          if (!values.endYear) {
            errors.endYear = "End Year is required";
          }
        }
        return errors;
      }}
      onSubmit={(values, actions) => {
        let payload = {};

        setLoading(true);

        if (!!selectedWork?.role) {
          const index = userDetails?.experiences.findIndex(
            (job) => job._id === selectedWork._id
          );
          let works = userDetails?.experiences;
          works[index] = {
            ...values,
          };
          payload = {
            experiences: works,
          };
        } else {
          payload = {
            experiences: [
              ...userDetails?.experiences,
              {
                ...values,
              },
            ],
          };
        }

        _updateUser(payload)
          .then((res) => {
            updateCache("userDetails", res?.data?.user);
            resetStateAndClose();
          })
          .catch((err) => actions.setSubmitting(false))
          .finally(() => setLoading(false));
      }}
    >
      {({ isSubmitting, errors, touched, values, setFieldValue }) => {
        useEffect(() => {
          setEditingValues(values);
        }, [values]);

        return (
          <Form id="workForm" className="flex flex-col h-full">
            <div className="flex-1 overflow-auto px-6 py-4">
              <div>
                <Text size={"p-xxsmall"} className="font-medium" required>
                  Name of the Company
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
              <Text size={"p-xxsmall"} className="font-medium mt-4" required>
                Your Role
              </Text>
              <Field
                name="role"
                type="text"
                className={`text-input mt-2  ${errors.role &&
                  touched.role &&
                  "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                  }`}
                autoComplete="off"
              />
              <ErrorMessage
                name="role"
                component="div"
                className="error-message"
              />
              <Text size={"p-xxsmall"} className="font-medium mt-4" required>
                Start Date
              </Text>
              <div className=" flex flex-col lg:flex-row gap-4 w-full">
                <div className="flex-1 select-container">
                  <Field
                    as="select"
                    name="startMonth"
                    className={`text-input !w-full text-[14px] ${!values.startMonth ? "!text-muted-foreground/60" : ""} font-inter !font-[500] custom-select mt-2  ${errors.startMonth &&
                      touched.startMonth &&
                      "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                      }`}
                  >
                    <option value="">Choose Month</option>
                    {monthOptions}
                  </Field>
                  <ErrorMessage
                    name="startMonth"
                    component="div"
                    className="error-message"
                  />
                </div>

                <div className="flex-1 select-container">
                  <Field
                    as="select"
                    name="startYear"
                    className={`text-input !w-full text-[14px] ${!values.startYear ? "!text-muted-foreground/60" : ""} font-inter !font-[500] custom-select mt-2  ${errors.startYear &&
                      touched.startYear &&
                      "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                      }`}
                  >
                    <option value="">Choose Year</option>
                    {yearOptions}
                  </Field>
                  <ErrorMessage
                    name="startYear"
                    component="div"
                    className="error-message"
                  />
                </div>
              </div>

              <div className={`${values.currentlyWorking && "opacity-50"}`}>
                <Text
                  size={"p-xxsmall"}
                  className="font-medium mt-4"
                  required={!values.currentlyWorking}
                >
                  End Date
                </Text>

                <div className="flex  flex-col lg:flex-row gap-4 w-full">
                  <div className="flex-1 select-container">
                    <Field
                      as="select"
                      name="endMonth"
                      className={`text-input !w-full text-[14px] ${!values.endMonth ? "!text-muted-foreground/60" : ""} font-inter !font-[500] custom-select mt-2  ${errors.endMonth &&
                        touched.endMonth &&
                        "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                        }`}
                      disabled={values.currentlyWorking}
                    >
                      <option value="">Choose Month</option>
                      {monthOptions}
                    </Field>
                    <ErrorMessage
                      name="endMonth"
                      component="div"
                      className="error-message"
                    />
                  </div>

                  <div className="flex-1 select-container">
                    <Field
                      as="select"
                      name="endYear"
                      className={`text-input !w-full text-[14px] ${!values.endYear ? "!text-muted-foreground/60" : ""} font-inter !font-[500] custom-select mt-2  ${errors.endYear &&
                        touched.endYear &&
                        "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                        }`}
                      disabled={values.currentlyWorking}
                    >
                      <option value="">Choose Year</option>
                      {yearOptions}
                    </Field>
                    <ErrorMessage
                      name="endYear"
                      component="div"
                      className="error-message"
                    />
                  </div>
                </div>
              </div>

              <label className="flex items-center gap-1 ml-1  mt-[24px]">
                <Field
                  name="currentlyWorking"
                  type="checkbox"
                  className="largeCheckbox"
                  onChange={(e) => {
                    setFieldValue("currentlyWorking", e.target.checked);
                    if (e.target.checked) {
                      setFieldValue("endMonth", "");
                      setFieldValue("endYear", "");
                    }
                  }}
                />

                <Text
                  size={"p-xxsmall"}
                  className="font-medium"
                  required={values.currentlyWorking}
                >
                  I am currently Working here{" "}
                </Text>
              </label>
              <div className="mt-6">
                <Text size={"p-xxsmall"} className="font-medium">
                  Description
                </Text>
                <div className="mt-2">
                  <SimpleTiptapEditor
                    mode="work"
                    enableBulletList={true}
                    content={values.description}
                    onChange={(html) => setFieldValue("description", html)}
                    placeholder="Describe your work experience..."
                  />
                </div>
                {errors.description && touched.description && (
                  <div className="error-message mt-1">{errors.description}</div>
                )}
              </div>
            </div>

            <div
              className={`flex gap-2 py-3 px-6 border-t border-border ${selectedWork?.company ? "justify-between" : "justify-end"
                }`}
            >
              {selectedWork?.company && (
                <Button
                  type="delete"
                  icon={
                    <DeleteIcon className="stroke-delete-btn-icon-color w-6 h-6 cursor-pointer" />
                  }
                  onClick={handleDeleteWork}
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
                  form="workForm"
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
        title="Work Experience"
        width="500px"
      >
        {renderFormContent()}
      </SheetWrapper>

      <UnsavedChangesDialog
        open={showUnsavedWarning && isOpen && !isSwitchingSidebar && pendingSidebarAction?.type === "close"}
        onOpenChange={(open) => {
          if (!open) {
            handleCancelDiscardSidebar();
          }
        }}
        onConfirmDiscard={() => {
          resetStateAndClose();
          handleConfirmDiscardSidebar();
        }}
        title="Unsaved Changes"
        description="You have made changes to this work experience. Are you sure you want to discard them?"
      />
    </>
  );
}
