import { useGlobalContext } from "@/context/globalContext";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Text from "./text";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
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
    <div className="rounded-2xl bg-card flex flex-col justify-between  m-auto lg:w-[500px] max-h-[550px] my-auto overflow-hidden">
      <div className="flex p-5 justify-between items-center">
        <Text size="p-small" className="font-semibold">
          Add Social Links
        </Text>
        <Button variant="outline" size="icon" type="button" onClick={closeModal}>
          <CloseIcon className="text-icon-color" />
        </Button>
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
                  <Field name="instagram">
                    {({ field }) => (
                      <Input
                        {...field}
                        id="instagram"
                        type="text"
                        autoComplete="off"
                        className={`mt-2 ${errors.instagram && touched.instagram ? "border-destructive focus-visible:ring-destructive" : ""}`}
                      />
                    )}
                  </Field>
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
                  <Field name="linkedin">
                    {({ field }) => (
                      <Input
                        {...field}
                        id="linkedin"
                        type="text"
                        autoComplete="off"
                        className={`mt-2 ${errors.linkedin && touched.linkedin ? "border-destructive focus-visible:ring-destructive" : ""}`}
                      />
                    )}
                  </Field>
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
                  <Field name="twitter">
                    {({ field }) => (
                      <Input
                        {...field}
                        id="twitter"
                        type="text"
                        autoComplete="off"
                        className={`mt-2 ${errors.twitter && touched.twitter ? "border-destructive focus-visible:ring-destructive" : ""}`}
                      />
                    )}
                  </Field>
                  <ErrorMessage
                    name="twitter"
                    component="div"
                    className="error-message"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-[26px] justify-end p-3 bg-modal-footer-bg-color rounded-br-[24px] rounded-bl-[24px]">
                <Button variant="outline" type="button" onClick={closeModal}>Cancel</Button>
                <Button type="submit" form="socialForm" disabled={isSubmitting}>{isSubmitting ? "Saving…" : "Save"}</Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
