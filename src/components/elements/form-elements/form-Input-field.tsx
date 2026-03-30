"use client"
import React, { useMemo } from "react";
import { useField } from "formik";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface FormInputFieldProps {
    name: string;
    label?: string;
    className?: string
    placeholder?: string
    disabled?: boolean
}

const FormInputField: React.FC<FormInputFieldProps> = ({
    name,
    label,
    className,
    placeholder = '',
    disabled = false,
    ...props
}) => {
    const [field, meta] = useField(name);

    const errorMessage = meta.touched && meta.error ? meta.error : "";
    const errorClasses = useMemo(
        () =>
            errorMessage
                ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive"
                : "",
        [errorMessage]
    );


    return (
        <div className="w-full space-y-2">
            {label && (
                <Label
                    htmlFor={name}
                    className={cn(errorMessage && "text-destructive")}
                >
                    {label}
                </Label>
            )}

            <Input
                id={name}
                {...field}
                {...props}
                disabled={disabled}
                placeholder={placeholder}
                className={cn(errorClasses, '', className)}
            />

            <div className="flex justify-between items-center text-xs px-1 text-muted-foreground">
                <span
                    id={`${name}-error`}
                    className={cn(
                        "text-destructive",
                        errorMessage ? "visible" : "invisible"
                    )}
                >
                    {errorMessage || "placeholder"}
                </span>

            </div>
        </div>
    );
};

export default FormInputField;
