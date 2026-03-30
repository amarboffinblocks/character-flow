"use client";

import React, { useMemo, useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import CustomMultiSelect, { CustomMultiSelectOption } from "./custom-multi-select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDynamicModelOptions } from "@/hooks/use-dynamic-model-options";

/** Static option shape for the options prop */
export interface LinkToFieldOption {
    label: string;
    value: string;
    [key: string]: unknown;
}

interface LinkToFieldProps {
    name?: string;
    label?: string;
    placeholder?: string;
    value?: string | string[];
    defaultValue?: string | string[] | boolean | undefined;
    onValueChange?: (value: string[]) => void;
    className?: string;
    min?: number;
    max?: number;
    accept?: string[];
    options?: LinkToFieldOption[];
    model?: string;
    multiSelect?: boolean;
    maxCount?: number;
    error?: string;
    disabled?: boolean;
}

const LinkToField: React.FC<LinkToFieldProps> = ({
    name,
    label,
    placeholder = "Select...",
    value: valueProp,
    defaultValue,
    onValueChange,
    className = "",
    min,
    max,
    accept,
    options: optionsProp,
    model,
    multiSelect = true,
    maxCount,
    error: errorProp,
    disabled = false,
}) => {
    const [internalValue, setInternalValue] = useState<string[]>(() => {
        if (defaultValue === undefined) return [];
        if (Array.isArray(defaultValue)) {
            return defaultValue.filter((item): item is string => typeof item === "string").map((s) => s.trim()).filter(Boolean);
        }
        if (typeof defaultValue === "string" && defaultValue.trim()) return [defaultValue.trim()];
        return [];
    });

    const isControlled = valueProp !== undefined;
    const rawValue = isControlled ? valueProp : internalValue;

    const [selectedCategory, setSelectedCategory] = useState<"SFW" | "NSFW">("SFW");
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
    const [isDebouncing, setIsDebouncing] = useState(false);

    // Debounce search query to avoid too many API calls
    useEffect(() => {
        setIsDebouncing(true);
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
            setIsDebouncing(false);
        }, 300);

        return () => {
            clearTimeout(timer);
            setIsDebouncing(false);
        };
    }, [searchQuery]);

    // Fetch options dynamically when model is provided
    const { options: dynamicOptions, isLoading: isLoadingOptions } = useDynamicModelOptions({
        model,
        category: selectedCategory,
        enabled: !!model,
        limit: 100,
        search: debouncedSearchQuery,
    });

    // Normalize value to ensure it's always string[]
    const normalizedValue = useMemo((): string[] => {
        const currentValue = rawValue as string[] | string | undefined | null;

        if (Array.isArray(currentValue)) {
            return currentValue
                .filter((item): item is string => typeof item === "string")
                .map((item) => item.trim())
                .filter((item) => item.length > 0);
        }
        if (currentValue && typeof currentValue === "string") {
            const trimmed = currentValue.trim();
            return trimmed.length > 0 ? [trimmed] : [];
        }
        return [];
    }, [rawValue]);

    // Use dynamic options when model is provided, otherwise use static options prop
    const options = useMemo<CustomMultiSelectOption[]>(() => {
        if (model) {
            return dynamicOptions;
        }
        if (optionsProp?.length) {
            return optionsProp.map((opt) => ({
                label: opt.label,
                value: opt.value,
                meta: opt,
            }));
        }
        return [];
    }, [model, optionsProp, dynamicOptions]);

    const handleValueChange = (newValues: string[]) => {
        if (!isControlled) setInternalValue(newValues);
        onValueChange?.(newValues);
    };

    const hasError = Boolean(errorProp);

    return (
        <div className={cn("w-full space-y-2")}>
            {label && (
                <Label
                    htmlFor={name}
                    className={cn("block text-sm font-medium", hasError && "text-destructive")}
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
                filter={!!model}
                filterValue={selectedCategory}
                setFilterValue={setSelectedCategory}
                searchable={true}
                disabled={disabled || isLoadingOptions}
                isLoading={isLoadingOptions || isDebouncing}
                onSearchChange={setSearchQuery}
                serverSideSearch={!!model}
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
                    hasError && "border-destructive ring-2 ring-destructive",
                    className
                )}
            />
        </div>
    );
};

export default LinkToField;
