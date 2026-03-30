"use client";

import * as React from "react";
import { useField } from "formik";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { FieldRules } from "@/types/form-types";

interface FormToggleProps {
    name: string;
    defaultValue?: string | boolean | string[] | undefined;
    className?: string;
    rules?: FieldRules;
}

const FormToggle: React.FC<FormToggleProps> = ({
    name,
    defaultValue,
    rules,
    className = "",
}) => {
    const [field, , helpers] = useField(name);
    const { value } = field;
    const { setValue } = helpers;

    const options = rules?.options || [];
    const initialValue = value || defaultValue || options[0]?.value;

    // ✅ Set Formik field value on mount if not already set
    React.useEffect(() => {
        if (!value && initialValue) {
            setValue(initialValue);
        }
    }, [value, initialValue, setValue]);

    const handleChange = (val: string) => {
        if (val) setValue(val);
    };

    return (
        <ToggleGroup
            type="single"
            value={value || initialValue}
            onValueChange={handleChange}
            className={cn(
                "flex h-9 w-full max-w-full gap-0.5 rounded-full border border-border bg-surface-subtle p-0.5",
                className
            )}
        >
            {options.map(({ label, value: optValue }) => (
                <ToggleGroupItem
                    key={optValue}
                    value={optValue}
                    className={cn(
                        "h-8 min-w-0 flex-1 !rounded-full border-0 !shadow-none px-3 text-sm font-medium",
                        "text-muted-foreground transition-colors",
                        "hover:bg-surface-hover hover:text-foreground",
                        "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:hover:bg-primary data-[state=on]:hover:text-primary-foreground",
                        "focus-visible:z-10"
                    )}
                >
                    {label}
                </ToggleGroupItem>
            ))}
        </ToggleGroup>
    );
};

export default FormToggle;
