"use client";

import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lightbulb } from "lucide-react";
import type { Folder } from "@/lib/api/folders";

export type FolderModalMode = "create" | "rename";

export interface FolderModalProps {
    /** "create" = new folder (optional trigger), "rename" = edit existing (controlled open) */
    mode: FolderModalMode;
    /** For rename: folder to edit */
    folder?: Folder | null;
    /** For rename: controlled open state */
    open?: boolean;
    /** For rename: open state change */
    onOpenChange?: (open: boolean) => void;
    /** For create: trigger element (e.g. "Create New Folder" button) */
    children?: React.ReactNode;
    /** Called on create submit with name (and optional description) */
    onSubmitCreate?: (name: string, description?: string | null) => void;
    /** Called on rename submit with folderId and name (and optional description) */
    onSubmitRename?: (folderId: string, name: string, description?: string | null) => void;
    /** Disable submit while API is in progress */
    isSubmitting?: boolean;
}

export const FolderModal = ({
    mode,
    folder = null,
    open: controlledOpen,
    onOpenChange,
    children,
    onSubmitCreate,
    onSubmitRename,
    isSubmitting = false,
}: FolderModalProps) => {
    const [internalOpen, setInternalOpen] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState<string | null>(null);

    const isCreate = mode === "create";
    const isRename = mode === "rename";

    const open = isRename ? controlledOpen ?? false : (controlledOpen !== undefined ? controlledOpen : internalOpen);
    const setOpen = (value: boolean) => {
        if (onOpenChange) onOpenChange(value);
        if (isCreate && controlledOpen === undefined) setInternalOpen(value);
    };

    useEffect(() => {
        if (isRename && folder) {
            setName(folder.name);
            setDescription(folder.description ?? null);
        } else if (isCreate) {
            setName("");
            setDescription(null);
        }
    }, [isRename, isCreate, folder?.id, folder?.name, folder?.description]);

    const handleOpenChange = (value: boolean) => {
        setOpen(value);
        if (!value) {
            setName(isRename && folder ? folder.name : "");
            setDescription(isRename && folder ? (folder.description ?? null) : null);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedName = name.trim();
        if (!trimmedName) return;
        if (isCreate && onSubmitCreate) {
            onSubmitCreate(trimmedName, description ?? undefined);
            setOpen(false);
            setName("");
            setDescription(null);
        }
        if (isRename && folder && onSubmitRename) {
            onSubmitRename(folder.id, trimmedName, description ?? undefined);
            setOpen(false);
        }
    };

    const title = isCreate ? "Create Folder" : "Rename Folder";
    const submitLabel = isCreate ? "Create Folder" : "Save";
    const placeholder = "Enter Folder Name";

    const content = (
        <DialogContent
            className="sm:max-w-md rounded-3xl border border-border bg-popover text-foreground p-0 overflow-hidden shadow-2xl"
            onPointerDownOutside={(e) => !isSubmitting && handleOpenChange(false)}
        >
            <div className="p-6 space-y-5">
                <DialogHeader>
                    <DialogTitle className="text-center text-xl font-semibold tracking-tight">
                        {title}
                    </DialogTitle>
                    <DialogDescription className="text-center text-muted-foreground text-sm">
                        {isCreate
                            ? "Keep chats and files organized with folders."
                            : "Update the folder details below."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={placeholder}
                            disabled={isSubmitting}
                            className="h-11 rounded-xl border-border bg-surface-base text-foreground placeholder:text-muted-foreground"
                            autoFocus
                        />
                    </div>

                    <div className="rounded-2xl border border-border bg-surface-subtle p-4 pr-6 flex gap-3.5">
                        <div className="shrink-0 pt-0.5">
                            <Lightbulb className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground leading-snug">
                            {isCreate
                                ? "Folders keep chats, files, and custom instructions in one place. Use them for ongoing work, or just to keep things tidy."
                                : "Change the folder name. Chats inside will stay in this folder."}
                        </p>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                            disabled={isSubmitting}
                            className="rounded-full px-5"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!name.trim() || isSubmitting}
                            className="rounded-full px-6 text-sm"
                        >
                            {isSubmitting ? "Saving…" : submitLabel}
                        </Button>
                    </div>
                </form>
            </div>
        </DialogContent>
    );

    if (isCreate && children !== undefined) {
        return (
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogTrigger asChild>{children}</DialogTrigger>
                {content}
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            {content}
        </Dialog>
    );
};

/** Backward-compatible wrapper: create-only modal with trigger */
export const CreateFolderModal = ({
    children,
    onSubmitCreate,
    isSubmitting,
}: {
    children: React.ReactNode;
    onSubmitCreate?: (name: string, description?: string | null) => void;
    isSubmitting?: boolean;
}) => (
    <FolderModal
        mode="create"
        onSubmitCreate={onSubmitCreate}
        isSubmitting={isSubmitting}
    >
        {children}
    </FolderModal>
);
