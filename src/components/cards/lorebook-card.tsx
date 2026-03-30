"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { HeartPlus, Heart, Link2, MoreHorizontal, Save, BookmarkCheck, SquarePen, Upload, Trash2, BookOpen, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils/date-utils";
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
import { useToggleLorebookFavourite, useToggleLorebookSaved, useDeleteLorebook, useCurrentUser } from "@/hooks";
import type { Lorebook } from "@/lib/api/lorebooks";
import { updateCharacter } from "@/lib/api/characters";
import { updatePersona } from "@/lib/api/personas";
import { exportLorebook } from "@/lib/api/lorebooks";
import LinkEntityDialog, { type LinkEntityModel } from "@/components/modals/link-entity-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/shared/query-keys";
import { toast } from "sonner";

interface LorebookCardProps {
    lorebook: Lorebook;
    isSelected?: boolean;
    onSelect?: (lorebookId: string, isSelected: boolean) => void;
}

const LorebookCard: React.FC<LorebookCardProps> = ({
    lorebook,
    isSelected = false,
    onSelect
}) => {
    const { user: currentUser } = useCurrentUser();
    const isOwner = currentUser?.id === lorebook.userId;
    const formattedCreatedDate = useMemo(() => formatDate(lorebook.createdAt), [lorebook.createdAt]);
    const formattedUpdatedDate = useMemo(() => formatDate(lorebook.updatedAt), [lorebook.updatedAt]);
    const avatarUrl = useMemo(() => lorebook.avatar?.url || "/logo1.png", [lorebook.avatar?.url]);
    const avatarFallback = useMemo(() => lorebook.name.charAt(0).toUpperCase() || "LB", [lorebook.name]);
    const hasTags = useMemo(() => Boolean(lorebook?.tags?.length), [lorebook?.tags]);
    const isFavourite = useMemo(() => lorebook.isFavourite || false, [lorebook.isFavourite]);
    const isSaved = useMemo(() => lorebook.isSaved || false, [lorebook.isSaved]);
    const entriesCount = lorebook.entriesCount ?? lorebook.entries?.length ?? 0;

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [linkDialogOpen, setLinkDialogOpen] = useState(false);
    const [linkDialogModel, setLinkDialogModel] = useState<LinkEntityModel>("character");
    const queryClient = useQueryClient();

    const openLinkDialog = (model: LinkEntityModel) => {
        setLinkDialogModel(model);
        setLinkDialogOpen(true);
    };

    const handleLinkConfirm = async (selectedIds: string[]) => {
        if (selectedIds.length === 0) return;
        if (linkDialogModel === "character") {
            await Promise.all(selectedIds.map((id) => updateCharacter(id, { lorebookId: lorebook.id })));
        } else if (linkDialogModel === "persona") {
            await Promise.all(selectedIds.map((id) => updatePersona(id, { lorebookId: lorebook.id })));
        }
        const count = selectedIds.length;
        const label = linkDialogModel.charAt(0).toUpperCase() + linkDialogModel.slice(1);
        toast.success(`${count} ${label}${count > 1 ? "s" : ""} linked successfully`);
        queryClient.invalidateQueries({ queryKey: queryKeys.lorebooks.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.characters.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.personas.all });
    };

    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            await exportLorebook(lorebook.id);
            toast.success("Lorebook exported as V2 JSON");
        } catch (error: unknown) {
            const description = error instanceof Error ? error.message : "Could not export lorebook";
            toast.error("Export failed", { description });
        } finally {
            setIsExporting(false);
        }
    };

    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        setImageLoaded(false);
        setImageError(false);
    }, [lorebook.id, avatarUrl]);

    const { toggleFavourite, isLoading: isTogglingFavourite } = useToggleLorebookFavourite({ showToasts: true });
    const { toggleSaved, isLoading: isTogglingSaved } = useToggleLorebookSaved({ showToasts: true });
    const { deleteLorebook, isLoading: isDeleting } = useDeleteLorebook({
        showToasts: true,
        onSuccess: () => setDeleteDialogOpen(false),
    });

    const handleToggleFavourite = useMemo(() => () => toggleFavourite(lorebook.id), [lorebook.id, toggleFavourite]);
    const handleToggleSaved = useMemo(() => () => toggleSaved(lorebook.id), [lorebook.id, toggleSaved]);
    const handleDeleteClick = useMemo(() => () => setDeleteDialogOpen(true), []);
    const handleConfirmDelete = useMemo(() => () => deleteLorebook(lorebook.id), [lorebook.id, deleteLorebook]);

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
                        id={`lorebook-${lorebook.id}`}
                        checked={isSelected}
                        onCheckedChange={(checked) => onSelect?.(lorebook.id, checked === true)}
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
                            <Button size="icon" variant="ghost" className="size-7 rounded-full bg-surface-selected hover:bg-surface-hover text-foreground transition-colors">
                                <MoreHorizontal className="size-3.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64">
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger className="w-full"><Link2 className="w-4 h-4 mr-2 text-foreground" /> Link</DropdownMenuSubTrigger>
                                <DropdownMenuPortal>
                                    <DropdownMenuSubContent>
                                        <DropdownMenuItem className="cursor-pointer" onClick={() => openLinkDialog("character")}>
                                            <Link2 className="w-4 h-4 mr-2 text-foreground" />Link to Character
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="cursor-pointer" onClick={() => openLinkDialog("persona")}>
                                            <Link2 className="w-4 h-4 mr-2 text-foreground" />Link to Persona
                                        </DropdownMenuItem>
                                    </DropdownMenuSubContent>
                                </DropdownMenuPortal>
                            </DropdownMenuSub>
                            <DropdownMenuItem className="hover:bg-surface-hover transition cursor-pointer" onClick={handleExport} disabled={isExporting}>
                                <Upload className="w-4 h-4 mr-2 text-foreground" /> {isExporting ? "Exporting..." : "Export"}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="hover:bg-surface-hover transition cursor-pointer" onClick={handleToggleFavourite} disabled={isTogglingFavourite}>
                                {isFavourite ? <><Heart className="w-4 h-4 mr-2 text-destructive fill-destructive stroke-destructive" />Remove from Favourites</> : <><HeartPlus className="w-4 h-4 mr-2 text-foreground" />Add to Favourites</>}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="hover:bg-surface-hover transition cursor-pointer" onClick={handleToggleSaved} disabled={isTogglingSaved}>
                                {isSaved ? <><BookmarkCheck className="w-4 h-4 mr-2 text-success fill-success stroke-success" />Remove from Saved</> : <><Save className="w-4 h-4 mr-2 text-foreground" />Save Lorebook</>}
                            </DropdownMenuItem>
                            {isOwner && (
                                <Link href={`/lorebooks/${lorebook.id}/edit`}>
                                    <DropdownMenuItem className="hover:bg-surface-hover transition cursor-pointer">
                                        <SquarePen className="w-4 h-4 mr-2 text-foreground" /> Edit
                                    </DropdownMenuItem>
                                </Link>
                            )}
                            <DropdownMenuItem variant="destructive" className="cursor-pointer" onClick={handleDeleteClick}>
                                <Trash2 className="mr-2 w-4 h-4" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="absolute inset-0 cursor-pointer overflow-hidden">
                    {!imageLoaded && !imageError && (
                        <Skeleton className="absolute inset-0 bg-surface-active animate-pulse" />
                    )}
                    {imageError && (
                        <div className="absolute inset-0 flex items-center justify-center bg-surface-active text-3xl font-bold text-foreground">
                            {avatarFallback}
                        </div>
                    )}
                    {!imageError && (
                        <img
                            src={avatarUrl}
                            alt={lorebook.name}
                            onLoad={() => setImageLoaded(true)}
                            onError={() => setImageError(true)}
                            className={cn(
                                "absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-300",
                                imageLoaded ? "opacity-100" : "opacity-0"
                            )}
                        />
                    )}
                </div>
            </CardHeader>

            {/* Right: Content + Footer */}
            <div className="flex flex-col flex-1 min-w-0">
                <CardContent className="space-y-3 py-4 px-5 flex-1">
                    <div className="flex justify-between items-start gap-2">
                        <CardTitle className="font-semibold text-base sm:text-lg capitalize leading-tight line-clamp-1">
                            {lorebook.name}
                        </CardTitle>
                        <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-xs text-muted-foreground tabular-nums">{entriesCount} entries</span>
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 capitalize font-normal">
                                {lorebook.rating}
                            </Badge>
                        </div>
                    </div>
                    <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                        <span className="capitalize">{lorebook.visibility}</span>
                        <span>{entriesCount} entries</span>
                    </div>
                    {hasTags && (
                        <div className="flex gap-1.5 flex-wrap">
                            {lorebook.tags?.slice(0, 5).map((tag, idx) => (
                                <Badge key={`${lorebook.id}-tag-${idx}`} variant="outline" className="text-[10px] px-2 py-0 font-normal border-border text-muted-foreground">
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    )}
                    <CardDescription className="text-sm line-clamp-3">
                        {lorebook.description || "No description"}
                    </CardDescription>
                    <div className="flex items-center justify-end">
                        {isOwner && (
                            <Link href={`/lorebooks/${lorebook.id}/edit`} onClick={(e) => e.stopPropagation()}>
                                <Button size="sm" variant="ghost" className="h-7 px-2 cursor-pointer bg-surface-selected text-xs gap-1.5 rounded-full hover:bg-surface-hover">
                                    <BookOpen className="w-3.5 h-3.5" />
                                    Edit
                                </Button>
                            </Link>
                        )}
                    </div>
                </CardContent>

                <CardFooter className="flex justify-between items-center px-5 py-2 border-t border-border text-[10px] text-muted-foreground mt-auto gap-2">
                    <span>Created {formattedCreatedDate}</span>
                    <span>Updated {formattedUpdatedDate}</span>
                </CardFooter>
            </div>

            <LinkEntityDialog
                open={linkDialogOpen}
                onOpenChange={setLinkDialogOpen}
                title={`Link to ${linkDialogModel.charAt(0).toUpperCase() + linkDialogModel.slice(1)}${linkDialogModel === "character" || linkDialogModel === "persona" ? "s" : ""}`}
                description={`Select ${linkDialogModel === "character" || linkDialogModel === "persona" ? "one or more " + linkDialogModel + "s" : "a " + linkDialogModel} to link "${lorebook.name}" to.`}
                model={linkDialogModel}
                multiSelect={linkDialogModel === "character" || linkDialogModel === "persona"}
                onConfirm={handleLinkConfirm}
            />

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className="bg-popover border-border rounded-3xl p-0 gap-0 overflow-hidden shadow-xl sm:max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="px-6 pt-6">Delete Lorebook</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {lorebook.name}? This action cannot be undone and all associated entries will be permanently deleted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="px-6 py-4 bg-surface-subtle border-t border-border gap-3 justify-center flex-wrap">
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete} disabled={isDeleting} className="rounded-full bg-destructive text-destructive-foreground hover:bg-danger border-0">
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

export default React.memo(LorebookCard);
