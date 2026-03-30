"use client";

import * as React from "react";
import { useField } from "formik";
import { FieldRules } from "@/types/form-types";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface FormCheckboxProps {
  name: string;
  defaultValue?: boolean | string | string[];
  className?: string;
  label?: string;
  disabled?: boolean;
  rules?: FieldRules;
}

const FormCheckbox: React.FC<FormCheckboxProps> = ({
  name,
  label,
  disabled,
  className = "",
  defaultValue = false,
  ...props
}) => {
  const [field, , helpers] = useField<boolean>(name);
  const { value } = field;
  const { setValue, setTouched } = helpers;

  // On mount: if value is undefined and defaultValue is set, set value
  React.useEffect(() => {
    // Only set Value if "value" is undefined or null (Formik init issue)
    if ((value === undefined || value === null) && defaultValue !== undefined) {
      // Make sure defaultValue is boolean for checkboxes
      setValue(typeof defaultValue === "boolean" ? defaultValue : false, false); // false = don't validate
    }
  }, [defaultValue, setValue, value]);

  // Handle checkbox change without triggering form-wide validation
  const handleCheckedChange = React.useCallback((checked: boolean | "indeterminate") => {
    // Update value without triggering validation (shouldValidate: false)
    // Only mark this field as touched, not the entire form
    setValue(Boolean(checked), false);
    setTouched(true, false); // false = don't validate
  }, [setValue, setTouched]);

  // Avoid passing both checked and defaultChecked
  // Set checked to always boolean (handles undefined)
  return (
    <div className={`flex items-end pt-1 gap-2 ${className}`}>
      <Checkbox
        id={name}
        checked={!!value}
        disabled={disabled}
        onCheckedChange={handleCheckedChange}
        className="size-8 cursor-pointer rounded-lg font-medium"
        {...props}
      />
      {label && (
        <Label
          htmlFor={name}
          className="text-muted-foreground text-md font-medium cursor-pointer select-none"
        >
          {label}
        </Label>
      )}
    </div>
  );
};

export default FormCheckbox;
