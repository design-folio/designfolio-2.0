import React, { useState } from "react";
import { Formik, Form } from "formik";
import { useRouter } from "next/router";
import { _changeEmail } from "@/network/post-request";
import { AuthLayout } from "@/components/ui/auth-layout";
import { FormInput } from "@/components/ui/form-input";
import { FormButton } from "@/components/ui/form-button";
import * as Yup from "yup";

// Yup validation schema
const changeEmailSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
});

export default function ChangeEmail() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const updateQueryParams = (email) => {
    router.push(
      {
        pathname: router.pathname,
        query: { email: email },
      },
      undefined,
      { shallow: true }
    );
  };

  const handleEmailChange = async (values, { setFieldError }) => {
    setLoading(true);

    try {
      const response = await _changeEmail(values);
      if (response) {
        updateQueryParams(values.email);
      }
    } catch (error) {
      console.error("Change email error:", error);
      const errorMessage = error.response?.data?.message || "Failed to change email. Please try again.";
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push("/email-verify");
  };

  return (
    <AuthLayout
      title="Change Email"
      description="Please enter your new email address."
      showBackButton={true}
      onBack={handleBack}
    >
      <Formik
        initialValues={{
          email: "",
        }}
        validationSchema={changeEmailSchema}
        onSubmit={handleEmailChange}
      >
        {({ errors, touched, isSubmitting, values }) => (
          <Form className="space-y-6">
            <FormInput
              name="email"
              type="email"
              label="Email address"
              placeholder="john@example.com"
              required
              errors={errors}
              touched={touched}
              data-testid="input-email"
            />

            <FormButton
              type="submit"
              isLoading={loading}
              disabled={isSubmitting || !values.email.trim()}
              data-testid="button-confirm"
            >
              Confirm
            </FormButton>
          </Form>
        )}
      </Formik>
    </AuthLayout>
  );
}