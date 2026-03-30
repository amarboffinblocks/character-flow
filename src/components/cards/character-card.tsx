"use client";
import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CopyPlus, FolderPlus, Heart, HeartPlus, Link2, MoreHorizontal, Save, BookmarkCheck, SquarePen, Upload, Trash2, MessagesSquare, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils/date-utils";
import Chat from "../icons/chat";
import { Checkbox } from "../ui/checkbox";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToggleFavourite, useToggleSaved, useDeleteCharacter, useDuplicateCharacter, useExportCharacter, useExportEntity, useCurrentUser } from "@/hooks";
import type { Character } from "@/lib/api/characters";
import { getCharacter, updateCharacter } from "@/lib/api/characters";
import LinkEntityDialog, { type LinkEntityModel } from "@/components/modals/link-entity-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/shared/query-keys";
import { toast } from "sonner";

interface CharacterCardProps {
    character: Character;
    isSelected?: boolean;
    onSelect?: (characterId: string, isSelected: boolean) => void;
}


const CharacterCard: React.FC<CharacterCardProps> = ({
    character,
    isSelected = false,
    onSelect
}) => {
    const router = useRouter();
    const { user: currentUser } = useCurrentUser();
    const isOwner = currentUser?.id === character.userId;

    // Memoize computed values
    const formattedCreatedDate = useMemo(() => formatDate(character.createdAt), [character.createdAt]);
    const formattedUpdatedDate = useMemo(() => formatDate(character.updatedAt), [character.updatedAt]);
    const tokens = useMemo(() => character?.tokens ?? 0, [character?.tokens]);
    const avatarUrl = useMemo(() => character.avatar?.url || "/logo1.png", [character.avatar?.url]);
    const avatarFallback = useMemo(() => character.name.charAt(0).toUpperCase() || "CN", [character.name]);
    const hasTags = useMemo(() => Boolean(character?.tags?.length), [character?.tags]);
    const isFavourite = useMemo(() => character.isFavourite || false, [character.isFavourite]);
    const isSaved = useMemo(() => character.isSaved || false, [character.isSaved]);

    // Toggle favourite hook
    const { toggleFavourite, isLoading: isTogglingFavourite } = useToggleFavourite({
        showToasts: true,
    });

    // Toggle saved hook
    const { toggleSaved, isLoading: isTogglingSaved } = useToggleSaved({
        showToasts: true,
    });

    // Delete dialog state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    // Link dialog state
    const [linkDialogOpen, setLinkDialogOpen] = useState(false);
    const [linkDialogModel, setLinkDialogModel] = useState<LinkEntityModel>("persona");
    const queryClient = useQueryClient();

    const openLinkDialog = (model: LinkEntityModel) => {
        setLinkDialogModel(model);
        setLinkDialogOpen(true);
    };

    const handleLinkConfirm = async (selectedIds: string[]) => {
        const id = selectedIds[0];
        if (!id) return;
        const payload: Record<string, string> = {};
        if (linkDialogModel === "persona") payload.personaId = id;
        else if (linkDialogModel === "lorebook") payload.lorebookId = id;
        else if (linkDialogModel === "realm") payload.realmId = id;
        await updateCharacter(character.id, payload);
        toast.success(`${linkDialogModel.charAt(0).toUpperCase() + linkDialogModel.slice(1)} linked successfully`);
        queryClient.invalidateQueries({ queryKey: queryKeys.characters.all });
        if (linkDialogModel === "realm") queryClient.invalidateQueries({ queryKey: queryKeys.realms.all });
        if (linkDialogModel === "persona") queryClient.invalidateQueries({ queryKey: queryKeys.personas.all });
        if (linkDialogModel === "lorebook") queryClient.invalidateQueries({ queryKey: queryKeys.lorebooks.all });
    };

    // Delete character hook
    const { deleteCharactersBatch, isLoading: isDeleting } = useDeleteCharacter({
        showToasts: true,
        onSuccess: () => {
            setDeleteDialogOpen(false);
        },
    });

    // Duplicate character hook
    const { duplicateCharactersBatch, isLoading: isDuplicating } = useDuplicateCharacter({
        showToasts: true,
    });

    // Export character hook (Server-side)
    const { exportCharacter, isLoading: isExportingJson } = useExportCharacter({
        showToasts: true,
    });

    // Client-side Export hook (PNG/JSON)
    const { exportPng, isExporting: isExportingPng } = useExportEntity({
        showToasts: true,
    });

    // Handle favourite toggle
    const handleToggleFavourite = useMemo(() => {
        return () => {
            toggleFavourite(character.id);
        };
    }, [character.id, toggleFavourite]);

    // Handle saved toggle
    const handleToggleSaved = useMemo(() => {
        return () => {
            toggleSaved(character.id);
        };
    }, [character.id, toggleSaved]);

    // Handle duplicate click
    const handleDuplicateClick = useMemo(() => {
        return () => {
            duplicateCharactersBatch([character.id]);
        };
    }, [character.id, duplicateCharactersBatch]);

    // Handle delete click
    const handleDeleteClick = useMemo(() => {
        return () => {
            setDeleteDialogOpen(true);
        };
    }, []);

    // Handle confirm delete
    const handleConfirmDelete = useMemo(() => {
        return () => {
            deleteCharactersBatch([character.id]);
        };
    }, [character.id, deleteCharactersBatch]);

    // Handle JSON export click
    const handleExportJsonClick = useMemo(() => {
        return () => {
            exportCharacter(character.id, "json");
        };
    }, [character.id, exportCharacter]);

    // Handle PNG export click
    const handleExportPngClick = useMemo(() => {
        return async () => {
            // Prepare clean character data for embedding
            const exportData = {
                name: character.name,
                description: character.description,
                scenario: character.scenario,
                summary: character.summary,
                rating: character.rating,
                visibility: character.visibility,
                tags: character.tags,
                firstMessage: character.firstMessage,
                alternateMessages: character.alternateMessages,
                exampleDialogues: character.exampleDialogues,
                authorNotes: character.authorNotes,
                characterNotes: character.characterNotes,
                exportedAt: new Date().toISOString(),
                version: "1.0",
                source: "BoffinBlocks"
            };
            let exportImageUrl = avatarUrl;
            try {
                const latest = await getCharacter(character.id, { requireAuth: true });
                exportImageUrl = latest?.data?.character?.avatar?.url || exportImageUrl;
            } catch {
                // If refreshing URL fails, continue with current avatar URL.
            }
            await exportPng(exportData, character.name, exportImageUrl);
        };
    }, [character, exportPng, avatarUrl]);

    const chatCount = character.chatCount ?? 0;
    const chatCountFormatted = chatCount >= 1000 ? `${(chatCount / 1000).toFixed(1)}k` : chatCount.toString();

    return (
        <Card
            className={cn(
                "group w-full overflow-hidden border border-border bg-surface-base",
                "hover:border-focus-ring hover:bg-surface-hover",
                "transition-colors duration-200 relative flex min-h-[220px] flex-col sm:flex-row",
                isSelected && "border-focus-ring bg-surface-selected"
            )}
        >
            <CardHeader className="p-0 m-0 relative shrink-0 h-40 sm:h-auto sm:w-[38%] sm:min-w-[38%] self-stretch overflow-hidden border-b sm:border-b-0 sm:border-r border-border">
                <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 text-foreground">
                    <Checkbox
                        id={`character-${character.id}`}
                        checked={isSelected}
                        onCheckedChange={(checked) => {
                            onSelect?.(character.id, checked === true);
                        }}
                        className="bg-surface-active border-border data-[state=checked]:bg-primary cursor-pointer data-[state=checked]:text-primary-foreground text-foreground rounded-full size-6"
                    />
                </div>

                <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5">
                    <Button
                        size="icon"
                        variant="ghost"
                        className="size-7 rounded-full bg-surface-selected hover:bg-surface-hover text-foreground transition-colors"
                        onClick={(e) => { e.stopPropagation(); handleToggleFavourite(); }}
                        disabled={isTogglingFavourite}
                    >
                        {isFavourite ? <Heart className="size-3.5 fill-destructive text-destructive" /> : <HeartPlus className="size-3.5" />}
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="size-7 rounded-full bg-surface-selected hover:bg-surface-hover text-foreground transition-colors"
                            >
                                <MoreHorizontal className="size-3.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64">
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger className="w-full"><Link2 className="w-4 h-4 mr-2 text-foreground" /> Link</DropdownMenuSubTrigger>
                                <DropdownMenuPortal>
                                    <DropdownMenuSubContent>
                                        <DropdownMenuItem className="cursor-pointer" onClick={() => openLinkDialog("persona")}>
                                            <Link2 className="w-4 h-4 mr-2 text-foreground" />Link to Persona
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="cursor-pointer" onClick={() => openLinkDialog("lorebook")}>
                                            <Link2 className="w-4 h-4 mr-2 text-foreground" />Link to Lorebook
                                        </DropdownMenuItem>
                                    </DropdownMenuSubContent>
                                </DropdownMenuPortal>
                            </DropdownMenuSub>

                            <DropdownMenuItem className="hover:bg-surface-hover transition cursor-pointer" onClick={() => openLinkDialog("realm")}>
                                <FolderPlus className="w-4 h-4 mr-2 text-foreground" /> Add to Realm
                            </DropdownMenuItem>

                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger className="w-full"><Upload className="w-4 h-4 mr-2 text-foreground" /> Export</DropdownMenuSubTrigger>
                                <DropdownMenuPortal>
                                    <DropdownMenuSubContent>
                                        <DropdownMenuItem
                                            onClick={handleExportPngClick}
                                            disabled={isExportingPng}
                                        >
                                            <Upload className="w-4 h-4 mr-2 text-foreground" /> .png
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={handleExportJsonClick}
                                            disabled={isExportingJson}
                                        >
                                            <Upload className="w-4 h-4 mr-2 text-foreground" /> .json
                                        </DropdownMenuItem>
                                    </DropdownMenuSubContent>
                                </DropdownMenuPortal>
                            </DropdownMenuSub>
                            <DropdownMenuItem
                                className="hover:bg-surface-hover transition cursor-pointer"
                                onClick={handleToggleFavourite}
                                disabled={isTogglingFavourite}
                            >
                                {isFavourite ? (
                                    <>
                                        <Heart className="w-4 h-4 mr-2 text-destructive fill-destructive stroke-destructive" />
                                        Remove from Favourites
                                    </>
                                ) : (
                                    <>
                                        <HeartPlus className="w-4 h-4 mr-2 text-foreground" />
                                        Add to Favourites
                                    </>
                                )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="hover:bg-surface-hover transition cursor-pointer"
                                onClick={handleToggleSaved}
                                disabled={isTogglingSaved}
                            >
                                {isSaved ? (
                                    <>
                                        <BookmarkCheck className="w-4 h-4 mr-2 text-success fill-success stroke-success" />
                                        Remove from Saved
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2 text-foreground" />
                                        Save Character
                                    </>
                                )}
                            </DropdownMenuItem>
                            {isOwner && (
                                <DropdownMenuItem
                                    className="hover:bg-surface-hover transition cursor-pointer"
                                    onClick={() => {
                                        router.push(`/characters/${character.id}/edit`);
                                        router.refresh();
                                    }}
                                >
                                    <SquarePen className="w-4 h-4 mr-2 text-foreground" /> Edit
                                </DropdownMenuItem>
                            )}
                            <Link href={`/chat/new/char/${character.id}`}>
                                <DropdownMenuItem className="hover:bg-surface-hover transition cursor-pointer">
                                    <Chat className="mr-2 w-4 h-4 text-foreground" /> Chat With Me
                                </DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem
                                className="hover:bg-surface-hover transition cursor-pointer"
                                onClick={handleDuplicateClick}
                                disabled={isDuplicating}
                            >
                                <CopyPlus className="mr-2 w-4 h-4 text-foreground" /> Duplicate Character
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                variant="destructive"
                                className="cursor-pointer"
                                onClick={handleDeleteClick}
                                disabled={isDeleting}
                            >
                                <Trash2 className="mr-2 w-4 h-4" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <Avatar className="absolute inset-0 cursor-pointer rounded-none w-full h-full">
                    <AvatarImage
                        src={avatarUrl}
                        alt={character.name}
                        className="aspect-auto object-cover object-center w-full h-full"
                    />
                    <AvatarFallback className="rounded-none w-full h-full bg-surface-active text-3xl font-bold text-foreground flex items-center justify-center">
                        {avatarFallback}
                    </AvatarFallback>
                </Avatar>
            </CardHeader>

            {/* Right: Content + Footer */}
            <div className="flex flex-col flex-1 min-w-0">
                <CardContent className="space-y-3 py-4 px-5 flex-1">
                    <div className="flex justify-between items-start gap-2">
                        <CardTitle className="font-semibold text-base sm:text-lg capitalize leading-tight line-clamp-1">
                            {character.name}
                        </CardTitle>
                        <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-xs text-muted-foreground tabular-nums">{tokens.toLocaleString()} tokens</span>
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 capitalize font-normal">
                                {character.rating}
                            </Badge>
                        </div>
                    </div>
                    <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                        <span className="capitalize">{character.visibility}</span>
                        <span>{chatCountFormatted} chats</span>
                    </div>
                    {hasTags && (
                        <div className="flex gap-1.5 flex-wrap">
                            {character.tags?.slice(0, 5).map((tag, idx) => (
                                <Badge key={`${character.id}-tag-${idx}`} variant="outline" className="text-[10px] px-2 py-0 font-normal border-border text-muted-foreground">
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    )}
                    <CardDescription className="text-sm line-clamp-3">
                        {character.description || "No description"}
                    </CardDescription>
                    <div className="flex items-center justify-end">
                        <Link href={`/chat/new/char/${character.id}`} onClick={(e) => e.stopPropagation()}>
                            <Button size="sm" variant="ghost" className="h-7 px-2 cursor-pointer text-xs gap-1.5 rounded-full bg-surface-selected hover:bg-surface-hover">
                                <MessagesSquare className="w-3.5 h-3.5" />
                                Chat
                            </Button>
                        </Link>
                    </div>
                </CardContent>

                <CardFooter className="flex justify-between items-center px-5 py-2 border-t border-border text-[10px] text-muted-foreground mt-auto gap-2">
                    <span>Created {formattedCreatedDate}</span>
                    <span>Updated {formattedUpdatedDate}</span>
                </CardFooter>
            </div>

            {/* Link Entity Dialog */}
            <LinkEntityDialog
                open={linkDialogOpen}
                onOpenChange={setLinkDialogOpen}
                title={`Link to ${linkDialogModel.charAt(0).toUpperCase() + linkDialogModel.slice(1)}`}
                description={`Select a ${linkDialogModel} to link "${character.name}" to.`}
                model={linkDialogModel}
                onConfirm={handleLinkConfirm}
            />

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className="bg-popover border-border rounded-3xl p-0 gap-0 overflow-hidden shadow-xl sm:max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="px-6 pt-6">Delete Character</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {character.name}? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="px-6 py-4 bg-surface-subtle border-t border-border gap-3 justify-center flex-wrap">
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            disabled={isDeleting}
                            className="rounded-full bg-destructive text-destructive-foreground hover:bg-danger border-0"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </>
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
};

export default React.memo(CharacterCard);
