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
import { Loader2, User, Users, Globe, BookOpen } from "lucide-react";
import LinkToField from "./link-to-field";
import { useUpdateBackground } from "@/hooks/background/use-update-background";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { LinkEntityModel } from "@/components/modals/link-entity-dialog";

interface LinkBackgroundDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    backgroundId: string;
    backgroundName?: string;
    currentLinks?: {
        characterId?: string | null;
        personaId?: string | null;
        lorebookId?: string | null;
        realmId?: string | null;
    };
}

const LinkBackgroundDialog: React.FC<LinkBackgroundDialogProps> = ({
    open,
    onOpenChange,
    backgroundId,
    backgroundName,
    currentLinks,
}) => {
    const [entityType, setEntityType] = useState<LinkEntityModel>("character");
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const { updateBackground, isLoading } = useUpdateBackground(backgroundId, {
        onSuccess: () => {
            onOpenChange(false);
            setSelectedId(null);
        },
    });

    const handleSave = useCallback(() => {
        const updateData: any = {
            characterId: entityType === "character" ? selectedId : null,
            personaId: entityType === "persona" ? selectedId : null,
            lorebookId: entityType === "lorebook" ? selectedId : null,
            realmId: entityType === "realm" ? selectedId : null,
        };
        updateBackground(updateData);
    }, [entityType, selectedId, updateBackground]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-black/90 border-gray-800 text-white">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Link Background</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Associate "{backgroundName || 'this background'}" with a specific character, persona, lorebook, or realm.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <Tabs value={entityType} onValueChange={(v) => {
                        setEntityType(v as LinkEntityModel);
                        setSelectedId(null);
                    }} className="w-full">
                        <TabsList className="grid w-full grid-cols-4 bg-gray-900 border border-gray-800 p-1">
                            <TabsTrigger
                                value="character"
                                className="flex items-center gap-2 rounded-md data-[state=active]:bg-primary data-[state=active]:text-white"
                            >
                                <User className="size-4" /> Character
                            </TabsTrigger>
                            <TabsTrigger
                                value="persona"
                                className="flex items-center gap-2 rounded-md data-[state=active]:bg-primary data-[state=active]:text-white"
                            >
                                <Users className="size-4" /> Persona
                            </TabsTrigger>
                            <TabsTrigger
                                value="realm"
                                className="flex items-center gap-2 rounded-md data-[state=active]:bg-primary data-[state=active]:text-white"
                            >
                                <Globe className="size-4" /> Realm
                            </TabsTrigger>
                            <TabsTrigger
                                value="lorebook"
                                className="flex items-center gap-2 rounded-md data-[state=active]:bg-primary data-[state=active]:text-white"
                            >
                                <BookOpen className="size-4" /> Lorebook
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <div className="bg-gray-900/50 p-4 rounded-2xl border border-gray-800">
                        <LinkToField
                            label={`Select ${entityType.charAt(0).toUpperCase() + entityType.slice(1)}`}
                            placeholder={`Search for a ${entityType}...`}
                            model={entityType}
                            multiSelect={false}
                            value={selectedId ? [selectedId] : []}
                            onValueChange={(vals) => setSelectedId(vals[0] || null)}
                        />
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                        className="bg-transparent border-gray-700 hover:bg-gray-800 hover:text-white rounded-full"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={!selectedId || isLoading}
                        className="rounded-full bg-primary hover:bg-accent-hover text-primary-foreground"
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Link Background
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default LinkBackgroundDialog;
