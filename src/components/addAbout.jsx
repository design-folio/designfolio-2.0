import { useGlobalContext } from "@/context/globalContext";
import { _updateUser } from "@/network/post-request";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import Button from "./button";
import Text from "./text";
import CloseIcon from "../../public/assets/svgs/close.svg";
import { AboutSchema } from "@/lib/validationSchemas";

export default function AddAbout() {
  const { closeModal, userDetails, updateCache, setUserDetails } =
    useGlobalContext();

  const initialAbout = userDetails?.about ?? "";

  const handleSubmit = (values, actions) => {
    const about = values?.about ?? "";
    const payload = { about };

    _updateUser(payload)
      .then((res) => {
        const updatedUser = res?.data?.user;
        updateCache("userDetails", updatedUser || payload);
        setUserDetails((prev) => ({ ...prev, about }));
        closeModal();
      })
      .catch((err) => {
        // Keep consistent with other modals (silent console log)
        // eslint-disable-next-line no-console
        console.log(err);
      })
      .finally(() => {
        actions.setSubmitting(false);
      });
  };

  return (
    <div
      className="bg-modal-bg-color rounded-2xl w-[95%] m-auto lg:w-[600px] overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex p-5 justify-between items-center">
        <Text className="text-modal-heading-color">About me</Text>
        <Button
          type="secondary"
          customClass="!p-2"
          icon={<CloseIcon className="text-df-icon-color cursor-pointer" />}
          onClick={closeModal}
        />
      </div>

      <Formik
        initialValues={{ about: initialAbout }}
        validationSchema={AboutSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, isSubmitting }) => (
          <Form id="about" className="px-5 pb-5">
            <div className="flex justify-between">
              <Text as="p" size="p-xxsmall" className="font-medium">
                Description
              </Text>
              <Text as="p" size="p-xxsmall" className="font-medium">
                {(values?.about?.length ?? 0)}/1200
              </Text>
            </div>

            <Field
              name="about"
              as="textarea"
              autoComplete="off"
              placeholder="Write a short bio, what you’re building, what you’re looking for…"
              className="text-input mt-2 min-h-[180px]"
            />
            <ErrorMessage
              name="about"
              component="div"
              className="error-message text-[14px] !mt-[2px]"
            />

            <div className="flex gap-2 justify-end pt-4">
              <Button
                type="secondary"
                text="Cancel"
                onClick={closeModal}
              />
              <Button
                type="modal"
                text={isSubmitting ? "Saving..." : "Save"}
                btnType="submit"
                isDisabled={isSubmitting}
              />
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}

