import React, { useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/router";
import { _resetPassword } from "@/network/post-request";
import { AuthLayout } from "@/components/ui/auth-layout";
import { FormInput } from "@/components/ui/form-input";
import { FormButton } from "@/components/ui/form-button";
import { toast } from "react-toastify";

// Yup validation schema
const resetPasswordValidationSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Confirm password is required"),
});

export default function ResetPassword() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (values, { setFieldError }) => {
    setLoading(true);

    try {
      const { email, passwordResetOTP } = router.query;

      if (!email || !passwordResetOTP) {
        return;
      }

      const data = {
        password: values.password,
      };

      await _resetPassword(email, passwordResetOTP, data);
      toast.success("Password reset successfully. Please log in with the new password.");
      router.push("/login");
    } catch (error) {
      console.error("Reset password error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset Your Password"
      description="We've verified your email ID. Please enter your new password."
    >
      <Formik
        initialValues={{
          password: "",
          confirmPassword: "",
        }}
        validationSchema={resetPasswordValidationSchema}
        onSubmit={handleResetPassword}
      >
        {({ errors, touched, isSubmitting }) => (
          <Form className="space-y-6">
            <FormInput
              name="password"
              type="password"
              label="New Password"
              placeholder="Enter your new password"
              required
              errors={errors}
              touched={touched}
              data-testid="input-password"
            />

            <FormInput
              name="confirmPassword"
              type="password"
              label="Confirm Password"
              placeholder="Confirm your new password"
              required
              errors={errors}
              touched={touched}
              data-testid="input-confirm-password"
            />

            {/* {!errors.password && (
              <p className="text-xs text-muted-foreground -mt-2">
                Must be at least 8 characters long
              </p>
            )} */}

            <FormButton
              type="submit"
              isLoading={loading}
              disabled={isSubmitting}
              data-testid="button-reset-password"
            >
              Reset Password
            </FormButton>
          </Form>
        )}
      </Formik>
    </AuthLayout>
  );
}