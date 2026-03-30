"use client";

import * as React from "react";
import { Check, ChevronDown, X, XCircle, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { Skeleton } from "@/components/ui/skeleton";

export interface CustomMultiSelectOption {
    label: string;
    value: string;
    meta?: any;
    disabled?: boolean;
}

export interface CustomMultiSelectProps {
    multiSelect: boolean;
    maxCount?: number;
    options: CustomMultiSelectOption[];
    onValueChange: (values: string[]) => void;
    placeholder?: string;
    className?: string;
    renderItem?: (item: CustomMultiSelectOption) => React.ReactNode;
    value?: string[];
    defaultValue?: string[];
    disabled?: boolean;
    closeOnSelect?: boolean;
    searchable?: boolean;
    searchPlaceholder?: string;
    filter?: boolean;
    filterValue?: "SFW" | "NSFW";
    setFilterValue?: (value: "SFW" | "NSFW") => void;
    onSearchChange?: (searchValue: string) => void;
    isLoading?: boolean;
    /**
     * If true, search is handled server-side and local filtering is disabled
     */
    serverSideSearch?: boolean;
}

const CustomMultiSelect: React.FC<CustomMultiSelectProps> = ({
    multiSelect,
    maxCount,
    options,
    onValueChange,
    placeholder = "Select...",
    className,
    renderItem,
    value: controlledValue,
    defaultValue,
    disabled = false,
    closeOnSelect = false,
    searchable = true,
    filter = true,
    filterValue = "SFW",
    setFilterValue,
    searchPlaceholder = "Search...",
    onSearchChange,
    isLoading = false,
    serverSideSearch = false,
}) => {
    const [open, setOpen] = React.useState(false);
    const [internalValue, setInternalValue] = React.useState<string[]>(
        defaultValue || []
    );
    const [focusedIndex, setFocusedIndex] = React.useState<number>(-1);
    const [searchValue, setSearchValue] = React.useState("");
    const listboxRef = React.useRef<HTMLDivElement>(null);
    const buttonRef = React.useRef<HTMLButtonElement>(null);
    const searchInputRef = React.useRef<HTMLInputElement>(null);
    // Use controlled value if provided, otherwise use internal state
    const selectedValues = controlledValue !== undefined ? controlledValue : internalValue;

    // Filter options based on search
    // If serverSideSearch is true, don't filter locally (server handles it)
    const filteredOptions = React.useMemo(() => {
        // If server-side search is enabled, return all options (server already filtered)
        if (serverSideSearch) {
            return options;
        }

        // Local filtering for static options
        if (!searchable || !searchValue.trim()) {
            return options;
        }
        const searchLower = searchValue.toLowerCase().trim();
        return options.filter(
            (option) =>
                option.label.toLowerCase().includes(searchLower) ||
                option.value.toLowerCase().includes(searchLower) ||
                (option.meta &&
                    typeof option.meta === "object" &&
                    JSON.stringify(option.meta).toLowerCase().includes(searchLower))
        );
    }, [options, searchValue, searchable, serverSideSearch]);

    // Get option by value
    const getOptionByValue = React.useCallback(
        (value: string): CustomMultiSelectOption | undefined => {
            return options.find((opt) => opt.value === value);
        },
        [options]
    );

    // Toggle option selection
    const toggleOption = React.useCallback(
        (optionValue: string) => {
            if (disabled) return;
            const option = getOptionByValue(optionValue);
            if (option?.disabled) return;

            let newValues: string[];

            if (multiSelect) {
                // Multi-select mode
                if (selectedValues.includes(optionValue)) {
                    // Deselect
                    newValues = selectedValues.filter((v) => v !== optionValue);
                } else {
                    // Select - check maxCount
                    if (maxCount && selectedValues.length >= maxCount) {
                        return; // Don't add if maxCount reached
                    }
                    newValues = [...selectedValues, optionValue];
                }
            } else {
                // Single-select mode (but still return array)
                newValues = selectedValues.includes(optionValue) ? [] : [optionValue];
                if (closeOnSelect || newValues.length > 0) {
                    setOpen(false);
                }
            }

            // Update state
            if (controlledValue === undefined) {
                setInternalValue(newValues);
            }

            onValueChange(newValues);
        },
        [
            disabled,
            multiSelect,
            maxCount,
            selectedValues,
            getOptionByValue,
            controlledValue,
            onValueChange,
            closeOnSelect,
        ]
    );

    // Handle remove badge
    const handleRemove = React.useCallback(
        (valueToRemove: string, e: React.MouseEvent | React.KeyboardEvent) => {
            e.stopPropagation();
            e.preventDefault();
            toggleOption(valueToRemove);
        },
        [toggleOption]
    );

    // Clear all selections
    const handleClear = React.useCallback(
        (e?: React.MouseEvent | React.KeyboardEvent) => {
            if (e) {
                e.stopPropagation();
                e.preventDefault();
            }
            if (disabled) return;

            const newValues: string[] = [];

            if (controlledValue === undefined) {
                setInternalValue(newValues);
            }

            onValueChange(newValues);
        },
        [disabled, controlledValue, onValueChange]
    );

    // Get selected options
    const selectedOptions = React.useMemo(() => {
        return options.filter((opt) => selectedValues.includes(opt.value));
    }, [options, selectedValues]);

    // Get visible options (respecting maxCount for display)
    const visibleSelectedValues = React.useMemo(() => {
        if (!maxCount || selectedValues.length <= maxCount) {
            return selectedValues;
        }
        return selectedValues.slice(0, maxCount);
    }, [selectedValues, maxCount]);

    // Handle search input keydown
    const handleSearchKeyDown = React.useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setFocusedIndex(0);
                // Focus first option
                setTimeout(() => {
                    const optionElements = listboxRef.current?.querySelectorAll(
                        '[role="option"]'
                    );
                    if (optionElements && optionElements[0]) {
                        (optionElements[0] as HTMLElement).focus();
                    }
                }, 0);
            } else if (e.key === "Escape") {
                e.preventDefault();
                setOpen(false);
                buttonRef.current?.focus();
            } else if (e.key === "Enter" && filteredOptions.length === 1) {
                // If only one option matches, select it
                e.preventDefault();
                const option = filteredOptions[0];
                if (!option.disabled) {
                    toggleOption(option.value);
                }
            }
        },
        [filteredOptions, toggleOption]
    );

    // Keyboard navigation
    const handleKeyDown = React.useCallback(
        (e: React.KeyboardEvent) => {
            if (disabled) return;

            switch (e.key) {
                case "ArrowDown":
                    e.preventDefault();
                    if (!open) {
                        setOpen(true);
                        setFocusedIndex(0);
                    } else {
                        setFocusedIndex((prev) =>
                            prev < filteredOptions.length - 1 ? prev + 1 : 0
                        );
                    }
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    if (open) {
                        setFocusedIndex((prev) =>
                            prev > 0 ? prev - 1 : filteredOptions.length - 1
                        );
                    }
                    break;
                case "Enter":
                case " ":
                    e.preventDefault();
                    if (open && focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
                        const option = filteredOptions[focusedIndex];
                        if (!option.disabled) {
                            toggleOption(option.value);
                        }
                    } else if (!open) {
                        setOpen(true);
                        setFocusedIndex(0);
                    }
                    break;
                case "Escape":
                    e.preventDefault();
                    setOpen(false);
                    setFocusedIndex(-1);
                    buttonRef.current?.focus();
                    break;
                case "Home":
                    if (open) {
                        e.preventDefault();
                        setFocusedIndex(0);
                    }
                    break;
                case "End":
                    if (open) {
                        e.preventDefault();
                        setFocusedIndex(filteredOptions.length - 1);
                    }
                    break;
            }
        },
        [disabled, open, focusedIndex, filteredOptions, toggleOption]
    );

    // Focus management
    React.useEffect(() => {
        if (open && listboxRef.current && focusedIndex >= 0) {
            const optionElements = listboxRef.current.querySelectorAll(
                '[role="option"]'
            );
            if (optionElements[focusedIndex]) {
                (optionElements[focusedIndex] as HTMLElement).focus();
            }
        }
    }, [open, focusedIndex]);

    // Reset focus when popover closes
    React.useEffect(() => {
        if (!open) {
            setFocusedIndex(-1);
        }
    }, [open]);

    // Default render function
    const defaultRenderItem = (item: CustomMultiSelectOption) => (
        <span className="text-sm">{item.label}</span>
    );

    // Reset search when popover closes
    React.useEffect(() => {
        if (!open) {
            setSearchValue("");
            setFocusedIndex(-1);
            // Reset search in parent if handler provided
            if (onSearchChange) {
                onSearchChange("");
            }
        } else if (searchable && searchInputRef.current) {
            // Focus search input when popover opens
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
        }
    }, [open, searchable, onSearchChange]);

    // Reset focused index when filtered options change
    React.useEffect(() => {
        if (focusedIndex >= filteredOptions.length) {
            setFocusedIndex(Math.max(0, filteredOptions.length - 1));
        }
    }, [filteredOptions.length, focusedIndex]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    ref={buttonRef}
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    aria-haspopup="listbox"
                    disabled={disabled}
                    onKeyDown={handleKeyDown}
                    className={cn(
                        "flex h-auto min-h-10 w-full items-center justify-between rounded-lg border-border bg-surface-subtle p-1 text-foreground shadow-xs transition-[color,box-shadow,background-color,border-color] hover:bg-surface-hover [&_svg]:pointer-events-auto",
                        disabled && "opacity-50 cursor-not-allowed",
                        className
                    )}
                >
                    {selectedValues.length > 0 ? (
                        <div className="flex justify-between items-center w-full">
                            <div className="flex items-center gap-1 flex-wrap flex-1">
                                {visibleSelectedValues.map((value) => {
                                    const option = getOptionByValue(value);
                                    if (!option) return null;

                                    return (
                                        <div
                                            key={value}
                                            // variant="secondary"
                                            className={cn(
                                                "capitalize",
                                                multiSelect ? [
                                                    "m-1 flex items-center rounded-full border border-border bg-surface-subtle px-2 py-0.5 text-foreground transition-all duration-300 ease-in-out",
                                                    "hover:bg-surface-hover",
                                                    "[&>svg]:pointer-events-auto",
                                                ]
                                                    : " px-2"
                                            )}
                                        >
                                            <span>
                                                {option.label}
                                            </span>
                                            {multiSelect && (
                                                <span
                                                    className="ml-2 h-4 w-4 cursor-pointer   rounded-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter" || e.key === " ") {
                                                            handleRemove(value, e);
                                                        }
                                                    }}
                                                    onMouseDown={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                    }}
                                                    onClick={(e) => handleRemove(value, e)}
                                                    aria-label={`Remove ${option.label} from selection`}
                                                >
                                                    <XCircle className="h-3 w-3" />
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                                {maxCount && selectedValues.length > maxCount && (
                                    <Badge
                                        className={cn(
                                            "m-1 border-border bg-surface-subtle text-foreground hover:bg-surface-hover",
                                            "[&>svg]:pointer-events-auto"
                                        )}
                                    >
                                        {`+ ${selectedValues.length - maxCount} more`}
                                        <XCircle
                                            className="ml-2 h-4 w-4 cursor-pointer"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // Clear extra options
                                                const newValues = selectedValues.slice(0, maxCount);
                                                if (controlledValue === undefined) {
                                                    setInternalValue(newValues);
                                                }
                                                onValueChange(newValues);
                                            }}
                                        />
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center justify-between">
                                {selectedValues.length > 0 && (
                                    <>
                                        <div
                                            role="button"
                                            tabIndex={0}
                                            onClick={handleClear}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" || e.key === " ") {
                                                    handleClear(e);
                                                }
                                            }}
                                            aria-label={`Clear all ${selectedValues.length} selected options`}
                                            className="flex items-center justify-center h-4 w-4 mx-2 cursor-pointer rounded-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-focus-ring"
                                        >
                                            <X className="h-4 w-4" />
                                        </div>
                                        <Separator
                                            orientation="vertical"
                                            className="flex min-h-6 h-full bg-border"
                                        />
                                    </>
                                )}
                                <ChevronDown
                                    className="h-4 mx-2 cursor-pointer text-muted-foreground"
                                    aria-hidden="true"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between w-full mx-auto">
                            <span className="mx-3 text-sm text-muted-foreground">{placeholder}</span>
                            <ChevronDown className="h-4 cursor-pointer text-muted-foreground mx-2" />
                        </div>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent
                ref={listboxRef}
                role="listbox"
                aria-multiselectable="true"
                aria-label="Available options"
                className={cn(
                    "w-auto min-w-[300px] max-h-[60vh] overflow-hidden rounded-2xl border border-border bg-popover p-0 shadow-xl",
                )}
                align="start"
                onEscapeKeyDown={() => {
                    setOpen(false);
                    buttonRef.current?.focus();
                }}
            >
                {searchable && (
                    <div className="flex h-9 items-center gap-2 border-b border-border bg-popover px-3">
                        <Search className="size-4 shrink-0 text-muted-foreground" />
                        <Input
                            ref={searchInputRef}
                            placeholder={searchPlaceholder}
                            value={searchValue}
                            onChange={(e) => {
                                const newValue = e.target.value;
                                setSearchValue(newValue);
                                setFocusedIndex(-1); // Reset focus when searching
                                // Call parent's search handler if provided
                                if (onSearchChange) {
                                    onSearchChange(newValue);
                                }
                            }}
                            onKeyDown={handleSearchKeyDown}
                            className="h-full w-full flex-1 rounded-none border-0 bg-transparent px-0 py-3 text-sm text-foreground shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                            aria-label="Search options"
                        />
                    </div>
                )}
                <div className=" max-w-md relative ">
                    {
                        filter && (
                            <div className=" sticky top-0 z-10  p-1 ">

                                <ToggleGroup
                                    type="single"
                                    className="h-8 w-full overflow-hidden rounded-2xl"
                                    value={filterValue || "SFW"}
                                    onValueChange={(value) => {
                                        if (value && setFilterValue) {
                                            setFilterValue(value as "SFW" | "NSFW");
                                        }
                                    }}
                                >
                                    <ToggleGroupItem
                                        value="SFW"
                                        aria-label="SFW"
                                        className="w-1/2 cursor-pointer border-0 bg-surface-subtle text-muted-foreground shadow-none data-[state=on]:bg-primary data-[state=on]:text-primary-foreground hover:bg-surface-hover hover:text-foreground"
                                    >
                                        SFW
                                    </ToggleGroupItem>

                                    <ToggleGroupItem
                                        value="NSFW"
                                        aria-label="NSFW"
                                        className="w-1/2 cursor-pointer border-0 bg-surface-subtle text-muted-foreground shadow-none data-[state=on]:bg-primary data-[state=on]:text-primary-foreground hover:bg-surface-hover hover:text-foreground"
                                    >
                                        NSFW
                                    </ToggleGroupItem>
                                </ToggleGroup>
                            </div>

                        )

                    }

                    <div className="p-1 max-h-[36vh] overflow-y-auto">

                        {isLoading ? (
                            // Loading skeleton - show 3-5 skeleton items
                            <div className="space-y-1">
                                {Array.from({ length: 5 }).map((_, index) => (
                                    <div
                                        key={`skeleton-${index}`}
                                        className="flex gap-3 items-center my-1 px-2 py-1.5 rounded-xl"
                                    >
                                        <Skeleton className="size-12 rounded-full bg-muted" />
                                        <div className="flex flex-col flex-1 gap-2">
                                            <Skeleton className="h-4 w-32 bg-muted" />
                                            <Skeleton className="h-3 w-48 bg-muted" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredOptions.length === 0 ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                                {searchValue.trim()
                                    ? "No results found"
                                    : "No options available"}
                            </div>
                        ) : (
                            filteredOptions.map((option, index) => {
                                const isSelected = selectedValues.includes(option.value);
                                const isDisabled =
                                    (multiSelect && maxCount
                                        ? !isSelected && selectedValues.length >= maxCount
                                        : false) || option.disabled || false;
                                const isFocused = focusedIndex === index;

                                return (
                                    <div
                                        key={option.value}
                                        role="option"
                                        aria-selected={isSelected}
                                        aria-disabled={isDisabled}
                                        tabIndex={isFocused ? 0 : -1}
                                        onClick={() => !isDisabled && toggleOption(option.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                e.preventDefault();
                                                if (!isDisabled) {
                                                    toggleOption(option.value);
                                                }
                                            } else {
                                                handleKeyDown(e);
                                            }
                                        }}
                                        className={cn(
                                            "group relative my-1 flex cursor-pointer select-none items-center rounded-xl px-2 py-1.5 text-sm text-foreground outline-none",
                                            "hover:bg-surface-hover",
                                            isSelected && "bg-surface-selected",
                                            isDisabled && "cursor-not-allowed opacity-50",
                                            isFocused && "ring-2 ring-focus-ring ring-offset-1 ring-offset-background"
                                        )}
                                    >
                                        <div className="flex-1">
                                            {renderItem ? renderItem(option) : defaultRenderItem(option)}
                                        </div>
                                    </div>
                                );
                            })

                        )}
                    </div>
                    {multiSelect && maxCount && (
                        <div className="sticky bottom-0 border-t border-border bg-popover px-2 py-1.5 text-center text-xs text-muted-foreground">
                            {selectedValues.length} / {maxCount} selected
                        </div>
                    )}
                    {selectedValues.length > 0 && (
                        <div className="flex items-center justify-between gap-1 border-t border-border bg-popover">
                            <button
                                type="button"
                                onClick={handleClear}
                                className="flex-1 cursor-pointer rounded-none px-2 py-1.5 text-sm text-foreground outline-none hover:bg-surface-hover"
                            >
                                Clear
                            </button>
                            <Separator
                                orientation="vertical"
                                className="flex min-h-6 h-full bg-border"
                            />
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="flex-1 cursor-pointer rounded-none px-2 py-1.5 text-sm text-foreground outline-none hover:bg-surface-hover"
                            >
                                Close
                            </button>
                        </div>
                    )}
                </div>

            </PopoverContent>
        </Popover>
    );
};

export default CustomMultiSelect;
