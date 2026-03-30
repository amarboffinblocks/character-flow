"use client";

import React, { useMemo, useCallback, useState, useEffect } from "react";
import { useField, useFormikContext } from "formik";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { cn } from "@/lib/utils";
import { useListTags, useCreateTag, usePopularTags, useListCharacters } from "@/hooks";

interface FormMultiSelectProps {
    name: string;
    label?: string;
    placeholder?: string;
    defaultValue?: string | string[] | boolean | undefined;
    className?: string;
    maxCount?: number;
    singleLine?: boolean;
    /**
     * Category filter for tags (SFW or NSFW)
     * If not provided, shows all tags
     */
    category?: "SFW" | "NSFW";
    /**
     * Whether to show popular tags initially
     */
    showPopular?: boolean;
    /**
     * Limit for popular tags (default: 20)
     */
    popularLimit?: number;
    /**
     * Enable tag creation functionality (Add SFW/NSFW buttons)
     * When false, the add buttons will not be shown (useful for filters)
     * Default: true
     */
    addFunctionality?: boolean;
    rules?: {
        model?: string;
    };
}

const FormMultiSelect: React.FC<FormMultiSelectProps> = (props) => {
    const {
        name,
        label,
        placeholder = "Select tags",
        defaultValue = [],
        className = "",
        maxCount,
        singleLine = true,
        category = 'SFW',
        showPopular = false,
        popularLimit = 20,
        addFunctionality = true,
    } = props;
    const [field, meta, helpers] = useField<string[]>(name);
    const { value } = field;
    const { setValue, setTouched } = helpers;
    const { setFieldValue, validateField } = useFormikContext();
    const [selectedCategory, setSelectedCategory] = useState<"SFW" | "NSFW">(category);

    // Update selectedCategory when category prop changes
    useEffect(() => {
        setSelectedCategory(category);
    }, [category]);

    // Normalize value to ensure it's always string[] (never comma-separated string)
    // Also converts to lowercase to match MultiSelect option values
    const normalizeValue = useCallback((val: unknown): string[] => {
        if (Array.isArray(val)) {
            return val
                .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
                .map(item => item.toLowerCase().trim()); // Convert to lowercase to match option values
        }
        if (typeof val === 'string') {
            // Handle comma-separated strings (legacy format)
            if (val.includes(',')) {
                return val.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag.length > 0);
            }
            return val.trim() ? [val.trim().toLowerCase()] : [];
        }
        return [];
    }, []);

    // Normalize the value from Formik
    const normalizedValue = useMemo(() => {
        return normalizeValue(value);
    }, [value, normalizeValue]);

    // Track initial value to create a stable key that only changes when switching between different initial states
    // const initialValueKeyRef = React.useRef<string>(JSON.stringify(normalizedValue));

    // Update key when value changes significantly (e.g., switching characters)
    // useEffect(() => {
    //     const currentKey = JSON.stringify(normalizedValue);
    //     const prevKey = initialValueKeyRef.current;
    //     // Only update if it's a significant change (different length or different values)
    //     const prevValues = JSON.parse(prevKey || '[]');
    //     if (prevValues.length !== normalizedValue.length ||
    //         !prevValues.every((v: string) => normalizedValue.includes(v))) {
    //         initialValueKeyRef.current = currentKey;
    //     }
    // }, [normalizedValue]);

    // Ensure Formik always stores string[] with lowercase values (to match option values)
    // This handles both format issues (comma-separated) and case mismatches
    useEffect(() => {
        const normalized = normalizeValue(value);
        // Always normalize to ensure values match option format (lowercase)
        // Only update if normalized value is different from current value
        if (JSON.stringify(value) !== JSON.stringify(normalized)) {
            setValue(normalized);
        }
    }, [value, normalizeValue, setValue]);

    // Fetch tags based on category
    const { tags, isLoading: isLoadingTags, refetch: refetchTags } = useListTags({
        filters: {
            category: selectedCategory,
            limit: 100,
            sortBy: "name",
            sortOrder: "asc",
        },
        enabled: true,
        showErrorToast: false,
    });

    // Fetch popular tags if enabled
    const { tags: popularTags } = usePopularTags({
        limit: popularLimit,
        category: selectedCategory,
        enabled: showPopular,
        showErrorToast: false,
    });

    // Create tag mutation
    const { createTagAsync, isLoading: isCreatingTag } = useCreateTag({
        showToasts: true,
        onSuccess: () => {
            refetchTags();
        },
    });

    // Convert API tags to MultiSelectOption format
    const tagOptions = useMemo(() => {
        const tagsToUse = showPopular && popularTags.length > 0 ? popularTags : tags;
        return tagsToUse
            .filter(tag => !selectedCategory || tag.category === selectedCategory)
            .map((tag) => ({
                label: tag.name.charAt(0).toUpperCase() + tag.name.slice(1),
                value: tag.name.toLowerCase(),
            }))
            .sort((a, b) => a.label.localeCompare(b.label));
    }, [tags, popularTags, selectedCategory, showPopular]);

    // Fetch characters if model is "characters"
    const { characters, isLoading: isLoadingCharacters } = useListCharacters({
        filters: {
            limit: 100,
            sortBy: "name",
            sortOrder: "asc",
        },
        enabled: props.rules?.model === "characters",
    });

    const characterOptions = useMemo(() => {
        // Deduplicate characters by ID to prevent duplicate offerings in the select menu
        const uniqueCharacters = Array.from(new Map(characters.map(char => [char.id, char])).values());

        return uniqueCharacters.map((char: any) => ({
            label: char.name,
            value: char.id,
        })).sort((a: any, b: any) => a.label.localeCompare(b.label));
    }, [characters]);

    const options = useMemo(() => {
        if (props.rules?.model === "characters") {
            return characterOptions;
        }
        return tagOptions;
    }, [props.rules?.model, tagOptions, characterOptions]);

    // Handle value change - ALWAYS set string[] in Formik (lowercase to match option values)
    const handleValueChange = useCallback((newValue: string[]) => {
        // Ensure it's always a valid string array with lowercase values
        const normalized = Array.isArray(newValue)
            ? newValue
                .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
                .map(item => item.toLowerCase().trim()) // Convert to lowercase to match option values
            : [];

        // Use setFieldValue with shouldValidate=true to trigger validation immediately
        // This ensures the error clears as soon as the first tag is selected
        setFieldValue(name, normalized, true);
        setTouched(true, false); // Don't trigger validation on setTouched (already done above)
    }, [setFieldValue, setTouched, name]);

    // Handle tag creation
    const handleCreateTag = useCallback(
        async (option: { label: string; value: string }, tagCategory: "SFW" | "NSFW") => {
            try {
                const response = await createTagAsync({
                    name: option.value.toLowerCase().trim(),
                    category: tagCategory,
                });

                // Get the created tag name (API might normalize it)
                const createdTagName = response?.data?.tag?.name?.toLowerCase() || option.value.toLowerCase().trim();

                // Get current value from Formik (not memoized value to avoid stale closures)
                const currentValue = normalizeValue(value);
                if (!currentValue.includes(createdTagName)) {
                    const newValue = [...currentValue, createdTagName];
                    // Use handleValueChange which now includes validation
                    handleValueChange(newValue);
                }

                return response;
            } catch (error) {
                throw error;
            }
        },
        [createTagAsync, value, normalizeValue, handleValueChange]
    );

    // Handle adding new option (wraps handleCreateTag for MultiSelect)
    const handleAddNewOption = useCallback(
        (option: { label: string; value: string }, category?: "SFW" | "NSFW") => {
            // Use provided category or fallback to selected category
            const tagCategory = category || selectedCategory;
            handleCreateTag(option, tagCategory);
        },
        [handleCreateTag, selectedCategory]
    );

    return (
        <div className={cn("w-full space-y-1", className)}>
            {label && (
                <Label
                    className={cn(
                        "block text-sm font-medium",
                        meta.touched && meta.error && "text-destructive"
                    )}
                >
                    {label}
                </Label>
            )}

            <MultiSelect
                key={name}
                options={options}
                defaultValue={normalizedValue}
                onValueChange={handleValueChange}
                onAddNewOption={addFunctionality ? handleAddNewOption : undefined}
                addFunctionality={addFunctionality}
                placeholder={placeholder}
                setSelectedCategory={setSelectedCategory}
                selectedCategory={selectedCategory}
                maxCount={maxCount}
                singleLine={singleLine}
                deduplicateOptions={true}
                className={cn(
                    meta.touched && meta.error && "border-destructive ring-2 ring-destructive"
                )}
                disabled={isLoadingTags || isCreatingTag}
                resetOnDefaultValueChange={true}
                emptyIndicator={
                    isLoadingTags ? (
                        <span className="text-muted-foreground">Loading tags...</span>
                    ) : (
                        <span className="text-muted-foreground text-sm">
                            {addFunctionality ? "No tags found. Type to create a new tag." : "No tags found."}
                        </span>
                    )
                }
            />
            <p
                className={cn(
                    "text-xs text-destructive",
                    meta.touched && meta.error ? "visible" : "invisible"
                )}
            >
                {meta.error || "placeholder"}
            </p>
        </div>
    );
};

export default FormMultiSelect;