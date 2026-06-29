import React, { useCallback, useEffect, useRef, useState } from "react";
import * as Yup from "yup";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { _checkUsername, _updateUsername } from "@/network/post-request";
import { toast } from "react-toastify";
import { useGlobalContext } from "@/context/globalContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatTimestamp } from "@/lib/times";
import { Clock, CheckCircle2, XCircle } from "lucide-react";

const DomainValidationSchema = Yup.object().shape({
  domain: Yup.string()
    .matches(/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})?$/, "Invalid subdomain")
    .required("Username is required"),
});

export default function DefaultDomain() {
  const [isAvailable, setIsAvailable] = useState(true);
  const [domainValue, setDomainValue] = useState("");
  const { userDetails, setUserDetails } = useGlobalContext();
  const debounceRef = useRef(null);

  const handleClaim = () => {
    _updateUsername({ username: domainValue }).then(() => {
      setUserDetails((prev) => ({ ...prev, username: domainValue }));
      toast.success("Username has been updated.");
    });
  };

  const checkUsername = useCallback(
    (value) => {
      if (value === userDetails?.username) {
        setIsAvailable(true);
        return;
      }

      if (value.length !== 0) {
        _checkUsername({ username: value })
          .then((response) => {
            setIsAvailable(response?.data?.available ?? false);
          })
          .catch((error) => console.error(error));
      } else {
        setIsAvailable(true);
      }
    },
    [userDetails?.username]
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleChange = (e, setFieldValue) => {
    const { value, name } = e.target;
    setFieldValue(name, value);
    setDomainValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => checkUsername(value), 200);
  };

  const formatedValue = formatTimestamp(userDetails?.latestPublishDate);

  if (!userDetails?.username) return null;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-[18px] font-semibold text-[#1A1A1A] dark:text-[#F0EDE7]">Base domain</p>
        <Badge className="items-center gap-1 border-0 bg-[#DCFCE7] text-[#15803D] dark:bg-[#14532D]/30 dark:text-[#4ADE80]">
          <span className="inline-block h-2 w-2 rounded-full bg-[#22C55E]" />
          Connected
        </Badge>
      </div>
      <p className="mt-1 text-[13px] leading-relaxed text-[#7A736C] dark:text-[#B5AFA5]">
        This is your current Designfolio link. You can change your username anytime (if it&apos;s
        available).
      </p>

      <Formik
        initialValues={{ domain: userDetails?.username ?? "" }}
        validationSchema={DomainValidationSchema}
        onSubmit={(values, actions) => {
          if (values.domain) {
            handleClaim();
            actions.setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting, isValid, setFieldValue, values, errors, touched }) => (
          <Form
            id="usernameForm"
            className="mt-6 flex w-full flex-col items-start gap-4 lg:flex-row lg:items-center"
          >
            <div className="w-full flex-1">
              <div className="relative">
                <Field name="domain">
                  {({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      placeholder="your-name"
                      autoComplete="off"
                      className={`pr-44 ${
                        (touched.domain && !!errors.domain) ||
                        (touched.domain &&
                          values.domain &&
                          values.domain !== userDetails?.username &&
                          !errors.domain &&
                          !isAvailable)
                          ? "border-destructive focus-visible:ring-destructive"
                          : ""
                      }`}
                      onChange={(e) => handleChange(e, setFieldValue)}
                    />
                  )}
                </Field>
                <div className="absolute top-1/2 right-1.5 flex -translate-y-1/2 items-center gap-2 rounded-lg bg-[#F4F6FA] px-3 py-1.5 dark:bg-[#35302A]">
                  <span className="text-[13px] font-semibold text-[#1A1A1A] dark:text-[#F0EDE7]">
                    designfolio.me
                  </span>
                  {domainValue &&
                    values.domain !== userDetails?.username &&
                    (isAvailable ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    ))}
                </div>
              </div>
              <ErrorMessage
                name="domain"
                component="p"
                className="text-destructive mt-1 text-[13px]"
              />
            </div>

            <Button
              type="submit"
              form="usernameForm"
              disabled={isSubmitting || !isValid || values.domain === userDetails?.username}
              className="w-full lg:w-fit"
            >
              Change username
            </Button>
          </Form>
        )}
      </Formik>

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#22C55E]" />
          <p className="text-[13px] font-medium text-[#7A736C] dark:text-[#B5AFA5]">
            Published &amp; optimized
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-[#7A736C] dark:text-[#B5AFA5]" />
          <p className="text-[13px] font-medium text-[#7A736C] dark:text-[#B5AFA5]">
            Updated {formatedValue}
          </p>
        </div>
      </div>
    </div>
  );
}
