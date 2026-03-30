"use client"
import { Search } from 'lucide-react'
import React, { useState, useEffect, useCallback } from 'react'
import { Input } from '../ui/input'
import { cn } from '@/lib/utils'

interface Props {
    placeholder?: string
    value?: string
    onChange?: (value: string) => void
    onDebouncedChange?: (value: string) => void
    debounceMs?: number
    className?: string
}

const SearchField: React.FC<Props> = ({
    placeholder = "",
    value,
    onChange,
    onDebouncedChange,
    debounceMs = 500,
    className = "",
    ...props
}) => {
    const [internalValue, setInternalValue] = useState<string>("");

    const isControlled = value !== undefined && onChange !== undefined;
    const inputValue = isControlled ? value : internalValue;

    // Debounce effect
    useEffect(() => {
        const timer = setTimeout(() => {
            const currentValue = isControlled ? value || "" : internalValue;
            onDebouncedChange?.(currentValue);
        }, debounceMs);

        return () => clearTimeout(timer);
    }, [inputValue, debounceMs, onDebouncedChange, isControlled, value, internalValue]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;

        if (isControlled) {
            onChange?.(newValue);
        } else {
            setInternalValue(newValue);
        }
    }, [isControlled, onChange]);

    return (
        <div
            className={cn(
                "flex h-11 w-full items-center rounded-full border border-border bg-surface-subtle px-4",
                "text-foreground transition-colors",
                "focus-within:border-focus-ring focus-within:bg-surface-active",
                className
            )}
        >
            <Search className='text-muted-foreground size-4' />
            <Input
                className="h-full border-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:border-none"
                placeholder={placeholder}
                value={inputValue}
                onChange={handleChange}
                {...props}
            />
        </div>
    );
}

export default SearchField