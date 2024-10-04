import { useGlobalContext } from "@/context/globalContext";
import { _deleteReview, _updateUser } from "@/network/post-request";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import Button from "./button";
import CloseIcon from "../../public/assets/svgs/close.svg";
import Text from "./text";
import DeleteIcon from "../../public/assets/svgs/deleteIcon.svg";
import { useState } from "react";

// Yup validation schema
const validationSchema = Yup.object().shape({
  name: Yup.string()
    .max(100, "Person name must be 100 characters or less")
    .required("Person name is required"),
  company: Yup.string()
    .max(100, "Company name must be 100 characters or less")
    .required("Company Name is required"),
  description: Yup.string()
    .max(800, "Description must be 800 characters or less")
    .required("Description is required"),
});

export default function AddReview() {
  const {
    selectedReview,
    userDetails,
    setSelectedReview,
    closeModal,
    updateCache,
    userDetailsRefecth,
  } = useGlobalContext();
  const [loading, setLoading] = useState(false);

  const handleCloseModal = () => {
    closeModal();
    setSelectedReview(null);
  };

  const handleDelete = () => {
    _deleteReview(selectedReview?._id)
      .then((res) => userDetailsRefecth())
      .finally(() => closeModal());
  };
  return (
    <div className="rounded-2xl bg-modal-bg-color m-auto lg:min-w-[500px] ">
      <div className="flex justify-between items-center p-5">
        <Text className="text-modal-heading-color">Add review details</Text>
        <Button
          // customClass="lg:hidden"
          type="secondary"
          customClass="!p-2 rounded-[8px]"
          icon={<CloseIcon className="text-icon-color" />}
          onClick={handleCloseModal}
        />
      </div>
      <div>
        <Formik
          initialValues={{
            name: selectedReview?.name ?? "",
            company: selectedReview?.company ?? "",
            description: selectedReview?.description ?? "",
          }}
          validationSchema={validationSchema}
          onSubmit={(values, actions) => {
            setLoading(true);
            let payload = {};
            if (selectedReview) {
              const filteredReview = userDetails?.reviews.filter(
                (review) => review?._id !== selectedReview?._id
              );
              payload = {
                reviews: [...filteredReview, values],
              };
            } else {
              payload = {
                reviews: [...userDetails.reviews, values],
              };
            }
            _updateUser(payload)
              .then((res) => {
                updateCache("userDetails", res?.data?.user);
                closeModal();
              })
              .catch((err) => console.log(err))
              .finally(() => setLoading(false));
            actions.setSubmitting(false);
          }}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form id="projectForm">
              <div className="px-5 pb-5 max-h-[440px] overflow-auto">
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
                    className={`text-input mt-2  ${
                      errors.name &&
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
                <div className="mt-[24px]">
                  <Text
                    size={"p-xxsmall"}
                    className="mt-6 font-medium"
                    required
                  >
                    Company Name
                  </Text>
                  <Field
                    name="company"
                    type="text"
                    className={`text-input mt-2  ${
                      errors.company &&
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
                <div className="mt-[24px]">
                  <Text
                    size={"p-xxsmall"}
                    className="mt-6 font-medium"
                    required
                  >
                    Add testimonial
                  </Text>
                  <Field
                    name="description"
                    as="textarea"
                    className={`text-input mt-2  min-h-[80px] border-b ${
                      errors.description &&
                      touched.description &&
                      "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                    }`}
                    autoComplete="off"
                  />
                  <ErrorMessage
                    name="description"
                    component="div"
                    className="error-message"
                  />
                </div>
              </div>
              <div
                className={`flex gap-2 py-3  ${
                  selectedReview?.name ? "justify-between" : "justify-end"
                }  px-3 rounded-bl-2xl rounded-br-2xl bg-modal-footer-bg-color`}
              >
                {selectedReview?.name && (
                  <Button
                    type="delete"
                    icon={
                      <DeleteIcon className="stroke-delete-btn-icon-color w-6 h-6" />
                    }
                    onClick={handleDelete}
                  />
                )}

                <div className="flex gap-2">
                  <Button
                    text={"Cancel"}
                    onClick={closeModal}
                    type="secondary"
                  />
                  <Button
                    btnType="submit"
                    text={"Save"}
                    type="modal"
                    form="projectForm"
                    isLoading={loading}
                  />
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
