import React from "react";
import { Field, ErrorMessage } from "formik";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
            <div
                className={`bg-white dark:bg-white border-2 rounded-full transition-all duration-300 ease-out ${hasError
                        ? "border-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.12)]"
                        : "border-border hover:border-foreground/20 focus-within:border-foreground/30 focus-within:shadow-[0_0_0_4px_hsl(var(--foreground)/0.12)]"
                    } ${className}`}
            >
                <Field
                    as={Input}
                    id={name}
                    name={name}
                    type={type}
                    placeholder={placeholder}
                    className="border-0 bg-transparent h-11 px-4 focus-visible:ring-0 focus-visible:ring-offset-0 text-base text-foreground placeholder:text-base placeholder:text-muted-foreground/60"
                    {...props}
                />
            </div>
            <ErrorMessage
                name={name}
                component="div"
                className="text-sm text-red-500 mt-1"
            />
        </div>
    );
}