import React from "react";
import { Field, ErrorMessage } from "formik";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function FormInput({
    name,
    label,
    type = "text",
    placeholder,
    required = false,
    className = "",
    errors,
    touched,
    ...props
}) {
    const hasError = errors && touched && errors[name] && touched[name];

    return (
        <div className="space-y-2">
            <Label
                htmlFor={name}
                className="text-sm font-medium text-foreground"
            >
                {label}
                {required && <span className="text-red-500">*</span>}
            </Label>

            <Field
                as={Input}
                id={name}
                name={name}
                type={type}
                placeholder={placeholder}
                className={cn(hasError ? "border-destructive focus-visible:ring-destructive" : "", className)}
                {...props}
            />
            <ErrorMessage
                name={name}
                component="div"
                className="text-sm text-red-500 mt-1"
            />
        </div>
    );
}