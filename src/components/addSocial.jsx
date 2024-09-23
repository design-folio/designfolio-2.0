import { useGlobalContext } from "@/context/globalContext";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Text from "./text";
import Button from "./button";
import CloseIcon from "../../public/assets/svgs/close.svg";
import { _updateUser } from "@/network/post-request";

const validationSchema = Yup.object().shape({
  instagram: Yup.string()
    .nullable()
    .notRequired()
    .url("Invalid URL")
    .matches(/(instagram.com)/, "Invalid Instagram link"),
  linkedin: Yup.string()
    .nullable()
    .notRequired()
    .url("Invalid URL")
    .matches(/(linkedin.com)/, "Invalid LinkedIn link"),
  twitter: Yup.string()
    .nullable()
    .notRequired()
    .url("Invalid URL")
    .matches(/(x.com)/, "Invalid Twitter link"),
});

export default function AddSocial() {
  const { userDetails, closeModal, updateCache } = useGlobalContext();

  return (
    <div className="rounded-2xl bg-modal-bg-color flex flex-col justify-between  m-auto lg:w-[500px] max-h-[550px] my-auto overflow-hidden">
      <div className="flex p-5 justify-between items-center">
        <Text size="p-medium" className="font-medium">
          Add Social Links
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
            instagram: userDetails?.socials?.instagram ?? "",
            linkedin: userDetails?.socials?.linkedin ?? "",
            twitter: userDetails?.socials?.twitter ?? "",
          }}
          validationSchema={validationSchema}
          onSubmit={(values, actions) => {
            const payload = {
              socials: values,
            };
            _updateUser(payload)
              .then((res) => {
                updateCache("userDetails", res?.data?.user);
                closeModal();
                actions.setSubmitting(false);
              })
              .catch((err) => actions.setSubmitting(false));
          }}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form id="socialForm">
              <div className="px-5 pb-10">
                <div>
                  <Text size={"p-xxsmall"} className="font-medium">
                    Instagram
                  </Text>
                  <Field
                    name="instagram"
                    type="text"
                    className={`text-input mt-2  ${
                      errors.instagram &&
                      touched.instagram &&
                      "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                    }`}
                    autoComplete="off"
                  />
                  <ErrorMessage
                    name="instagram"
                    component="div"
                    className="error-message"
                  />
                </div>

                <div className="mt-[24px]">
                  <Text size={"p-xxsmall"} className="font-medium">
                    LinkedIn
                  </Text>
                  <Field
                    name="linkedin"
                    type="text"
                    className={`text-input mt-2  ${
                      errors.linkedin &&
                      touched.linkedin &&
                      "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                    }`}
                    autoComplete="off"
                  />
                  <ErrorMessage
                    name="linkedin"
                    component="div"
                    className="error-message"
                  />
                </div>

                <div className="mt-[24px]">
                  <Text size={"p-xxsmall"} className="font-medium">
                    Twitter
                  </Text>
                  <Field
                    name="twitter"
                    type="text"
                    className={`text-input mt-2  ${
                      errors.twitter &&
                      touched.twitter &&
                      "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                    }`}
                    autoComplete="off"
                  />
                  <ErrorMessage
                    name="twitter"
                    component="div"
                    className="error-message"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-[26px] justify-end p-3 bg-modal-footer-bg-color rounded-br-[24px] rounded-bl-[24px]">
                <Button text={"Cancel"} type="secondary" onClick={closeModal} />
                <Button
                  btnType="submit"
                  text={"Save"}
                  form="socialForm"
                  type="modal"
                  isLoading={isSubmitting}
                />
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
