import { useGlobalContext } from "@/context/globalContext";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Button from "./button";
import Text from "./text";
import CloseIcon from "../../public/assets/svgs/close.svg";
import { _updateUser } from "@/network/post-request";

const validationSchema = Yup.object().shape({
  dribbble: Yup.string()
    .nullable()
    .notRequired()
    .url("Invalid URL")
    .matches(/(dribbble.com)/, "Invalid Dribbble link"),
  behance: Yup.string()
    .nullable()
    .notRequired()
    .url("Invalid URL")
    .matches(/(behance.net)/, "Invalid Behance link"),
  notion: Yup.string()
    .nullable()
    .notRequired()
    .url("Invalid URL")
    .matches(/(notion\.so|notion\.site)/, "Invalid Notion link"),
  medium: Yup.string()
    .nullable()
    .notRequired()
    .url("Invalid URL")
    .matches(/(medium.com)/, "Invalid Medium link"),
});

export default function AddPortfolioLinks() {
  const { userDetails, closeModal, updateCache } = useGlobalContext();

  return (
    <div className="rounded-2xl bg-modal-bg-color flex flex-col justify-between  m-auto lg:w-[500px] max-h-[550px] my-auto overflow-hidden">
      <div className="flex p-5 justify-between items-center">
        <Text size="p-small" className="font-semibold">
          Add Portfolio Links
        </Text>
        <Button
          // customClass="lg:hidden"
          type="secondary"
          customClass="!p-2 rounded-[8px]"
          icon={<CloseIcon className="text-icon-color cursor-pointer" />}
          onClick={closeModal}
        />
      </div>
      <div>
        <Formik
          initialValues={{
            dribbble: userDetails?.portfolios?.dribbble ?? "",
            behance: userDetails?.portfolios?.behance ?? "",
            notion: userDetails?.portfolios?.notion ?? "",
            medium: userDetails?.portfolios?.medium ?? "",
          }}
          validationSchema={validationSchema}
          onSubmit={(values, actions) => {
            const payload = {
              portfolios: values,
            };
            _updateUser(payload)
              .then((res) => {
                updateCache("userDetails", res?.data?.user);
                actions.setSubmitting(false);
                closeModal();
              })
              .catch((err) => actions.setSubmitting(false));
          }}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form id="socialForm">
              <div className="px-5 pb-10 h-[370px] overflow-auto">
                <div>
                  <Text size={"p-xxsmall"} className="font-medium">
                    Dribbble
                  </Text>
                  <Field
                    name="dribbble"
                    type="text"
                    className={`text-input mt-2  ${
                      errors.dribbble &&
                      touched.dribbble &&
                      "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                    }`}
                    autoComplete="off"
                  />
                  <ErrorMessage
                    name="dribbble"
                    component="div"
                    className="error-message"
                  />
                </div>

                <div className="mt-[24px]">
                  <Text size={"p-xxsmall"} className="font-medium">
                    Behance
                  </Text>
                  <Field
                    name="behance"
                    type="text"
                    className={`text-input mt-2  ${
                      errors.behance &&
                      touched.behance &&
                      "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                    }`}
                    autoComplete="off"
                  />
                  <ErrorMessage
                    name="behance"
                    component="div"
                    className="error-message"
                  />
                </div>

                <div className="mt-[24px]">
                  <Text size={"p-xxsmall"} className="font-medium">
                    Notion
                  </Text>
                  <Field
                    name="notion"
                    type="text"
                    className={`text-input mt-2  ${
                      errors.notion &&
                      touched.notion &&
                      "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                    }`}
                    autoComplete="off"
                  />
                  <ErrorMessage
                    name="notion"
                    component="div"
                    className="error-message"
                  />
                </div>
                <div className="mt-[24px]">
                  <Text size={"p-xxsmall"} className="font-medium">
                    Medium
                  </Text>
                  <Field
                    name="medium"
                    type="text"
                    className={`text-input mt-2  ${
                      errors.medium &&
                      touched.medium &&
                      "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                    }`}
                    autoComplete="off"
                  />
                  <ErrorMessage
                    name="medium"
                    component="div"
                    className="error-message"
                  />
                </div>
              </div>

              <div className="flex gap-2  justify-end p-3 bg-modal-footer-bg-color rounded-br-[24px] rounded-bl-[24px]">
                <Button text="Cancel" onClick={closeModal} type="secondary" />
                <Button
                  btnType="submit"
                  isLoading={isSubmitting}
                  form="socialForm"
                  text={"Save"}
                  type="modal"
                />
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
