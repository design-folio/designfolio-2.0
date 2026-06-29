import { useGlobalContext } from "@/context/globalContext";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import Text from "./text";
import CloseIcon from "../../public/assets/svgs/close.svg";
import { _updateUser } from "@/network/post-request";

const validationSchema = Yup.object().shape({
  dribbble: Yup.string()
    .nullable()
    .notRequired()
    .url("Invalid URL")
    .matches(/(dribbble.com)/, "Invalid Dribbble link"),
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
    <div className="bg-card m-auto my-auto flex max-h-[550px] flex-col justify-between overflow-hidden rounded-2xl lg:w-[500px]">
      <div className="flex items-center justify-between p-5">
        <Text size="p-small" className="font-semibold">
          Add Portfolio Links
        </Text>
        <Button variant="outline" size="icon" type="button" onClick={closeModal}>
          <CloseIcon className="text-icon-color" />
        </Button>
      </div>
      <div>
        <Formik
          initialValues={{
            dribbble: userDetails?.portfolios?.dribbble ?? "",
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
              <div className="h-[370px] overflow-auto px-5 pb-10">
                <div>
                  <Text size={"p-xxsmall"} className="font-medium">
                    Dribbble
                  </Text>
                  <Field name="dribbble">
                    {({ field }) => (
                      <Input
                        {...field}
                        id="dribbble"
                        type="text"
                        autoComplete="off"
                        className={`mt-2 ${errors.dribbble && touched.dribbble ? "border-destructive focus-visible:ring-destructive" : ""}`}
                      />
                    )}
                  </Field>
                  <ErrorMessage name="dribbble" component="div" className="error-message" />
                </div>

                <div className="mt-[24px]">
                  <Text size={"p-xxsmall"} className="font-medium">
                    Notion
                  </Text>
                  <Field name="notion">
                    {({ field }) => (
                      <Input
                        {...field}
                        id="notion"
                        type="text"
                        autoComplete="off"
                        className={`mt-2 ${errors.notion && touched.notion ? "border-destructive focus-visible:ring-destructive" : ""}`}
                      />
                    )}
                  </Field>
                  <ErrorMessage name="notion" component="div" className="error-message" />
                </div>
                <div className="mt-[24px]">
                  <Text size={"p-xxsmall"} className="font-medium">
                    Medium
                  </Text>
                  <Field name="medium">
                    {({ field }) => (
                      <Input
                        {...field}
                        id="medium"
                        type="text"
                        autoComplete="off"
                        className={`mt-2 ${errors.medium && touched.medium ? "border-destructive focus-visible:ring-destructive" : ""}`}
                      />
                    )}
                  </Field>
                  <ErrorMessage name="medium" component="div" className="error-message" />
                </div>
              </div>

              <div className="bg-modal-footer-bg-color flex justify-end gap-2 rounded-br-[24px] rounded-bl-[24px] p-3">
                <Button variant="outline" type="button" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit" form="socialForm" disabled={isSubmitting}>
                  {isSubmitting ? "Saving…" : "Save"}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
