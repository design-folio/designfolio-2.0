import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/router";
import { _changeEmail } from "@/network/post-request";
import Card from "./card";
import Text from "./text";
import Button from "./button";

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

    const handleEmailChange = async (data) => {
        try {
            const response = await _changeEmail(data);
            if (response) {
                updateQueryParams(data.email);
            }
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pt-[16px] pb-20">
            <Card>
                <Text
                    as="h1"
                    size={"p-large"}
                    className="text-landing-heading-text-color font-bold"
                >
                    Change Email
                </Text>
                <Text
                    size={"p-xsmall"}
                    className="mt-2 text-landing-description-text-color font-medium"
                >
                    Please enter your new email address.
                </Text>
                <div className="mt-[24px]">
                    <div>
                        <Formik
                            initialValues={{
                                email: "",
                            }}
                            validationSchema={changeEmailSchema}
                            onSubmit={(values, actions) => {
                                handleEmailChange(values);
                                actions.setSubmitting(false);
                            }}
                        >
                            {({ isSubmitting, isValid, errors, touched }) => (
                                <Form id="emailverifyform">
                                    <Text
                                        as="p"
                                        size={"p-xxsmall"}
                                        className="mt-6 font-medium"
                                        required
                                    >
                                        Email
                                    </Text>

                                    <Field
                                        type="email"
                                        name="email"
                                        className={`text-input mt-2 ${errors.email &&
                                            touched.email &&
                                            "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                                            }`}
                                        autoComplete="off"
                                    />
                                    <ErrorMessage
                                        name="email"
                                        component="div"
                                        className="error-message text-[14px]"
                                    />
                                    <Button
                                        btnType="submit"
                                        disabled={isSubmitting || !isValid}
                                        text="Confirm"
                                        form={"emailverifyform"}
                                        customClass="mt-6 w-full"
                                        isLoading={loading}
                                    />
                                </Form>
                            )}
                        </Formik>
                    </div>
                </div>
            </Card>
        </div>
    );
}