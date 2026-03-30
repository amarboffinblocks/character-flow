import React, { useMemo } from "react";
import { useField } from "formik";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { countTokens } from "@/lib/utils/token-utils";

interface FormTextareaProps {
    name: string;
    label?: string;
    tokens?: boolean;
    className?: string
    placeholder?: string
}

const FormTextarea: React.FC<FormTextareaProps> = ({
    name,
    label,
    tokens = true,
    placeholder = '',
    className,
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

    const tokenCount = typeof field.value === "string" ? countTokens(field.value) : 0;

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

            <Textarea
                id={name}
                {...field}
                placeholder={placeholder}
                {...props}
                className={cn(errorClasses, className)}
            />

            <div className="flex justify-between items-center text-xs px-1 text-muted-foreground ">
                <span
                    id={`${name}-error`}
                    className={cn(
                        "text-destructive",
                        errorMessage ? "visible" : "invisible"
                    )}
                >
                    {errorMessage || "placeholder"}
                </span>

                {tokens === true && (
                    <span
                        className={cn(
                            errorMessage && "text-destructive",
                        )}
                    >
                        {tokenCount} Tokens
                    </span>
                )}
            </div>
        </div>
    );
};

export default FormTextarea;
