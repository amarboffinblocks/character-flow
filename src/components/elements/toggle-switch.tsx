"use client";

import * as React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

interface ToggleSwitchProps {
    options: { label: string; value: string }[];
    defaultValue?: string;
    onChange?: (value: string) => void;
    className?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
    options,
    defaultValue,
    onChange,
    className,
}) => {
    const [active, setActive] = React.useState(defaultValue || options[0]?.value);

    const handleChange = (val: string) => {
        if (!val) return;
        setActive(val);
        onChange?.(val);
    };

    return (
        <ToggleGroup
            type="single"
            value={active}
            onValueChange={handleChange}
            className={cn(
                "rounded-full border border-border bg-surface-subtle p-1",
                className
            )}
        >
            {options.map((option) => (
                <ToggleGroupItem
                    key={option.value}
                    value={option.value}
                    className={cn(
                        "h-8 !rounded-full px-4 text-sm font-medium transition-colors",
                        "text-muted-foreground hover:bg-surface-hover hover:text-foreground",
                        "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                    )}
                >
                    {option.label}
                </ToggleGroupItem>
            ))}
        </ToggleGroup>
    );
};
