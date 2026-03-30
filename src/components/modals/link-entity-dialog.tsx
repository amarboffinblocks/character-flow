"use client";

import React, { useState, useCallback } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import LinkToField from "@/components/elements/link-to-field";

export type LinkEntityModel = "character" | "persona" | "lorebook" | "realm";

export interface LinkEntityDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    /** Which entity type to show in the selector */
    model: LinkEntityModel;
    /** Allow selecting multiple items (default: false) */
    multiSelect?: boolean;
    /** Max selectable items when multiSelect is true */
    maxCount?: number;
    /** Text on the confirm button (default: "Link") */
    confirmLabel?: string;
    /** Called with selected IDs when user confirms */
    onConfirm: (selectedIds: string[]) => Promise<void> | void;
}

const LinkEntityDialog: React.FC<LinkEntityDialogProps> = ({
    open,
    onOpenChange,
    title,
    description,
    model,
    multiSelect = false,
    maxCount,
    confirmLabel = "Link",
    onConfirm,
}) => {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const resetState = useCallback(() => {
        setSelectedIds([]);
    }, []);

    const handleOpenChange = useCallback(
        (nextOpen: boolean) => {
            if (!nextOpen) resetState();
            onOpenChange(nextOpen);
        },
        [onOpenChange, resetState]
    );

    const handleConfirm = useCallback(async () => {
        if (selectedIds.length === 0) return;
        setIsSubmitting(true);
        try {
            await onConfirm(selectedIds);
            handleOpenChange(false);
        } catch {
            // Caller handles errors via toast etc.
        } finally {
            setIsSubmitting(false);
        }
    }, [selectedIds, onConfirm, handleOpenChange]);

    const modelLabel = model.charAt(0).toUpperCase() + model.slice(1);

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="bg-primary/20 backdrop-blur-sm border-primary text-white rounded-4xl">
                <DialogHeader>
                    <DialogTitle className="text-white">{title}</DialogTitle>
                    {description && (
                        <DialogDescription className="text-white/80">
                            {description}
                        </DialogDescription>
                    )}
                </DialogHeader>

                <div className="py-2">
                    <LinkToField
                        label={`${modelLabel}${multiSelect ? "s" : ""}`}
                        placeholder={`Search and select ${multiSelect ? modelLabel.toLowerCase() + "s" : "a " + model}...`}
                        className="bg-transparent"
                        model={model}
                        multiSelect={multiSelect}
                        maxCount={maxCount}
                        value={selectedIds}
                        onValueChange={setSelectedIds}
                    />
                </div>

                <DialogFooter>
                    <Button
                        variant="ghost"
                        onClick={() => handleOpenChange(false)}
                        disabled={isSubmitting}
                        className="border-white/20 text-white hover:bg-white/10"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={selectedIds.length === 0 || isSubmitting}
                        className="bg-primary text-primary-foreground hover:bg-accent-hover"
                    >
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default LinkEntityDialog;
