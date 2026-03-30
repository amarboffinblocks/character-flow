"use client";

import React, { useMemo, useEffect, useState } from "react";
import { useField } from "formik";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import CustomMultiSelect, { CustomMultiSelectOption } from "../custom-multi-select";
import { FieldRules } from "@/types/form-types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDynamicModelOptions } from "@/hooks/use-dynamic-model-options";

interface FormLinkToProps {
  name: string;
  label?: string;
  placeholder?: string;
  defaultValue?: string | string[] | boolean | undefined;
  className?: string;
  rules?: FieldRules;
  multiSelect?: boolean;
  maxCount?: number;
}

const FormLinkTo: React.FC<FormLinkToProps> = ({
  name,
  label,
  placeholder = "Select...",
  defaultValue,
  className = "",
  rules,
  multiSelect: propMultiSelect,
  maxCount: propMaxCount,
}) => {
  const [field, meta, helpers] = useField<string[]>(name);
  const { value } = field;
  const [selectedCategory, setSelectedCategory] = useState<"SFW" | "NSFW">("SFW");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [isDebouncing, setIsDebouncing] = useState(false);

  const { setValue, setTouched } = helpers;

  // Debounce search query to avoid too many API calls
  useEffect(() => {
    setIsDebouncing(true);
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setIsDebouncing(false);
    }, 300); // 300ms debounce

    return () => {
      clearTimeout(timer);
      setIsDebouncing(false);
    };
  }, [searchQuery]);

  // Fetch options dynamically based on model from rules
  const { options: dynamicOptions, isLoading: isLoadingOptions } = useDynamicModelOptions({
    model: rules?.model,
    category: selectedCategory,
    enabled: !!rules?.model,
    limit: 100,
    search: debouncedSearchQuery,
  });

  // Determine multiSelect mode - prioritize rules, then prop, then default to true
  const multiSelect = useMemo(() => {
    if (rules?.multiSelect !== undefined) {
      return Boolean(rules.multiSelect);
    }
    return propMultiSelect !== undefined ? propMultiSelect : true;
  }, [rules?.multiSelect, propMultiSelect]);

  // Determine maxCount - prioritize rules, then prop
  const maxCount = useMemo(() => {
    if (rules?.maxCount !== undefined) {
      return rules.maxCount;
    }
    return propMaxCount;
  }, [rules?.maxCount, propMaxCount]);

  // Normalize value to ensure it's always string[]
  const normalizedValue = useMemo((): string[] => {
    const currentValue = value as string[] | string | undefined | null;

    if (Array.isArray(currentValue)) {
      return currentValue
        .filter((item): item is string => typeof item === 'string')
        .map(item => item.trim())
        .filter(item => item.length > 0);
    }
    if (currentValue && typeof currentValue === 'string') {
      const trimmed = currentValue.trim();
      return trimmed.length > 0 ? [trimmed] : [];
    }
    return [];
  }, [value]);

  // Use dynamic options if model is provided, otherwise fallback to rules.options
  const options = useMemo<CustomMultiSelectOption[]>(() => {
    // If model is provided, use dynamic options from API (even if empty during loading)
    if (rules?.model) {
      return dynamicOptions;
    }

    // Fallback to static options from rules
    if (rules?.options && Array.isArray(rules.options)) {
      return rules.options.map((opt) => ({
        label: opt.label,
        value: opt.value,
        meta: opt,
      }));
    }

    return [];
  }, [rules?.model, rules?.options, dynamicOptions]);

  // Handle defaultValue
  useEffect(() => {
    if (defaultValue !== undefined && (!value || (Array.isArray(value) && value.length === 0))) {
      let normalizedDefault: string[] = [];

      if (Array.isArray(defaultValue)) {
        normalizedDefault = defaultValue
          .filter((item): item is string => typeof item === 'string')
          .map(item => item.trim())
          .filter(item => item.length > 0);
      } else if (typeof defaultValue === 'string') {
        const trimmed = defaultValue.trim();
        if (trimmed.length > 0) {
          normalizedDefault = [trimmed];
        }
      }

      if (normalizedDefault.length > 0) {
        setValue(normalizedDefault);
      }
    }
  }, [defaultValue, value, setValue]);

  // Ensure Formik always stores string[]
  useEffect(() => {
    if (!Array.isArray(value)) {
      const normalized = normalizedValue;
      if (normalized.length > 0 || value !== undefined) {
        setValue(normalized);
      }
    }
  }, [value, normalizedValue, setValue]);

  const handleValueChange = (newValues: string[]) => {
    setValue(newValues);
    setTouched(true, false); // Mark as touched without triggering validation
  };

  return (
    <div className={cn("w-full space-y-2", className)}>
      {label && (
        <Label
          htmlFor={name}
          className={cn(
            "block text-sm font-medium",
            meta.touched && meta.error && "text-destructive"
          )}
        >
          {label}
        </Label>
      )}

      <CustomMultiSelect
        multiSelect={multiSelect}
        maxCount={maxCount}
        options={options}
        onValueChange={handleValueChange}
        placeholder={isLoadingOptions ? "Loading..." : placeholder}
        value={normalizedValue}
        filter={!!rules?.model}
        filterValue={selectedCategory}
        setFilterValue={setSelectedCategory}
        searchable={true}
        disabled={isLoadingOptions}
        isLoading={isLoadingOptions || isDebouncing}
        onSearchChange={setSearchQuery}
        serverSideSearch={!!rules?.model}
        renderItem={(item) => (
          <div className="flex gap-3 items-center">
            <Avatar className="size-12 rounded-full">
              {item.meta?.avatar && (
                <AvatarImage src={item.meta.avatar} alt={item.label} />
              )}
              <AvatarFallback className="rounded-full">
                {item.label.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{item.label}</p>
              {item.meta?.description && (
                <span className="text-xs text-muted-foreground line-clamp-1">
                  {item.meta.description}
                </span>
              )}
            </div>
          </div>
        )}
        className={cn(
          meta.touched &&
            meta.error &&
            "border-destructive ring-2 ring-destructive"
        )}
      />

      <p
        className={cn(
          "text-xs text-destructive min-h-[20px]",
          meta.touched && meta.error ? "visible" : "invisible"
        )}
      >
        {meta.error || "placeholder"}
      </p>
    </div>
  );
};

export default FormLinkTo;
