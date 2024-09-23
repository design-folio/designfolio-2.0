import { useGlobalContext } from "@/context/globalContext";
import { _deleteExperience, _updateUser } from "@/network/post-request";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import Text from "./text";
import Button from "./button";
import CloseIcon from "../../public/assets/svgs/close.svg";
import DeleteIcon from "../../public/assets/svgs/deleteIcon.svg";
import { useState } from "react";

// Yup validation schema
const validationSchema = Yup.object().shape({
  role: Yup.string()
    .max(50, "Role must be 50 characters or less")
    .required("Role is required"),
  company: Yup.string()
    .max(150, "Company name must be 150 characters or less")
    .required("Company Name is required"),
  description: Yup.string().max(
    800,
    "Description must be 800 characters or less"
  ),
  // .required("Description is required"),
  startMonth: Yup.string().required("Month is required"),
  startYear: Yup.string().required("Year is required"),
  currentlyWorking: Yup.boolean(),
  // Initially, do not make endMonth and endYear required
  endMonth: Yup.string(),
  endYear: Yup.string().test(
    "endDate-test",
    "End year must be greater than or equal to start year",
    function (endYear) {
      const { startYear, currentlyWorking } = this.parent;
      if (currentlyWorking) {
        return true; // Skip validation if currently working or endMonth/endYear is not provided
      }

      return +startYear <= +endYear;
    }
  ),
});

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
    closeModal,
    userDetailsRefecth,
    updateCache,
  } = useGlobalContext();
  const [loading, setLoading] = useState(false);

  const handleDeleteWork = () => {
    _deleteExperience(selectedWork?._id)
      .then(() => userDetailsRefecth())
      .finally(() => closeModal());
  };
  return (
    <div className="rounded-2xl bg-modal-bg-color flex flex-col justify-between  m-auto lg:w-[500px] max-h-[550px] my-auto overflow-hidden">
      <div className="flex p-5 justify-between items-center">
        <Text size="p-medium" className="font-medium">
          Work Experience
        </Text>
        <Button
          // customClass="lg:hidden"
          type="secondary"
          customClass="!p-2 rounded-[8px]"
          icon={<CloseIcon className="text-icon-color" />}
          onClick={closeModal}
        />
      </div>
      <div>
        <Formik
          initialValues={{
            role: selectedWork?.role ?? "",
            company: selectedWork?.company ?? "",
            description: selectedWork?.description ?? "",
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
                closeModal();
              })
              .catch((err) => actions.setSubmitting(false))
              .finally(() => setLoading(false));
          }}
        >
          {({ errors, touched, values, setFieldValue }) => (
            <Form id="workForm">
              <div className="px-5 pb-5 max-h-[370px] overflow-auto">
                <div>
                  <Text size={"p-xxsmall"} className="font-medium" required>
                    Name of the Company
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
                <Text size={"p-xxsmall"} className="font-medium mt-4" required>
                  Your Role
                </Text>
                <Field
                  name="role"
                  type="text"
                  className={`text-input mt-2  ${
                    errors.role &&
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
                      className={`text-input !w-full text-[14px] !text-[#989DA3] font-inter !font-[500] custom-select mt-2  ${
                        errors.startMonth &&
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
                      className={`text-input !w-full text-[14px] !text-[#989DA3] font-inter !font-[500] custom-select mt-2  ${
                        errors.startYear &&
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
                        className={`text-input !w-full text-[14px] !text-[#989DA3] font-inter !font-[500] custom-select mt-2  ${
                          errors.endMonth &&
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
                        className={`text-input !w-full text-[14px] !text-[#989DA3] font-inter !font-[500] custom-select mt-2  ${
                          errors.endYear &&
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
                <div className="mt-[24px]">
                  <Text size={"p-xxsmall"} className="font-medium">
                    Description
                  </Text>
                  <Field
                    name="description"
                    as="textarea"
                    className={`text-input mt-2 h-[120px] ${
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
                  selectedWork?.company ? "justify-between" : "justify-end"
                }  px-3 rounded-bl-2xl rounded-br-2xl bg-modal-footer-bg-color`}
              >
                {selectedWork?.company && (
                  <Button
                    type="delete"
                    icon={
                      <DeleteIcon className="stroke-delete-btn-icon-color w-6 h-6" />
                    }
                    onClick={handleDeleteWork}
                  />
                )}
                <div className="flex gap-2  justify-end">
                  <Button text="Cancel" onClick={closeModal} type="secondary" />
                  <Button
                    text={"Save"}
                    form="workForm"
                    btnType="submit"
                    type="modal"
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
