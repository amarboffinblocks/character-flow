import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardDescription } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "../ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
    MoreVertical,
    SquarePen,
    HeartPlus,
    Heart,
    Trash
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Button } from "@/components/ui/button";
import ChatIcon from "../icons/chat";
import { useUpdateRealm, useDeleteRealm, useToggleFavouriteRealm, useRealmChats } from "@/hooks";


interface Character {
    id: string;
    name: string;
    avatar?: { url: string };
    description?: string;
}

interface Realm {
    id: string;
    name: string;
    tags?: string[];
    description?: string;
    characters?: Character[];
    isFavourite?: boolean;
    rating?: "SFW" | "NSFW";
    visibility?: "public" | "private";
}
interface RealmCardProps {
    folder: Realm;
}

const RealmCard: React.FC<RealmCardProps> = ({
    folder, ...props
}) => {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const { chats: realmChats } = useRealmChats({
        realmId: folder.id,
        params: { limit: 3, sortBy: "updatedAt", sortOrder: "desc" },
    });

    const { deleteRealm, isDeleting } = useDeleteRealm({
        onSuccess: () => setDeleteDialogOpen(false)
    });

    const { toggleFavourite, isToggling } = useToggleFavouriteRealm();

    const isFavourite = folder.isFavourite || false;

    return (
        <div {...props} className="group relative rounded-3xl transition-all duration-300 ">
            {/* Folder Tab Effect */}
            <div className="absolute -top-10 left-0 h-10 w-32 bg-surface-subtle border-t border-x border-border rounded-t-2xl flex items-center px-4">
                <div className="flex items-center gap-2">
                    <Checkbox
                        id={`realm-${folder.id}`}
                        className="size-5 border-border rounded-full bg-surface-selected data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{folder?.rating}</span>
                </div>
            </div>

            {/* Main Card Body */}
            <Card className="relative overflow-hidden p-6 rounded-none rounded-b-3xl rounded-tr-3xl border border-border group-hover:border-focus-ring transition-colors duration-300 bg-surface-base">
                {/* Glow Effect */}
                <div className="absolute -right-20 -top-20 size-40 bg-surface-subtle rounded-full pointer-events-none" />
                <div className="absolute -left-20 -bottom-20 size-40 bg-surface-subtle rounded-full pointer-events-none" />

                <div className="relative z-10 space-y-4">
                    {/* Header */}
                    <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1 flex-1">
                            <h2 className="text-xl font-bold text-foreground group-hover:text-foreground transition-colors duration-300 tracking-tight">
                                {folder.name}
                            </h2>
                            <div className="flex gap-1.5 flex-wrap">
                                {folder.tags?.map((tag: string, idx: number) => (
                                    <Badge
                                        key={idx}
                                        className="bg-surface-selected text-muted-foreground border-border text-sm px-3 py-1 "
                                    >
                                        #{tag}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="bg-surface-selected hover:bg-surface-hover size-8 text-muted-foreground hover:text-foreground rounded-full transition-all"
                                >
                                    <MoreVertical className="size-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem
                                    className="hover:bg-surface-hover transition cursor-pointer"
                                    onClick={() => toggleFavourite(folder.id, isFavourite)}
                                    disabled={isToggling}
                                >
                                    {isFavourite ? (
                                        <>
                                            <Heart className="w-4 h-4 mr-2 text-destructive fill-destructive" />
                                            Remove Favourite
                                        </>
                                    ) : (
                                        <>
                                            <HeartPlus className="w-4 h-4 mr-2" />
                                            Add to Favourites
                                        </>
                                    )}
                                </DropdownMenuItem>

                                <Link href={`/realms/${folder.id}/edit`}>
                                    <DropdownMenuItem className="hover:bg-surface-hover transition cursor-pointer">
                                        <SquarePen className="w-4 h-4 mr-2" /> Edit
                                    </DropdownMenuItem>
                                </Link>

                                <Link href={`/realms/${folder.id}/chat`}>
                                    <DropdownMenuItem className="hover:bg-surface-hover transition cursor-pointer">
                                        <ChatIcon className="text-foreground w-4 h-4 mr-2" /> Chat with {folder.name}
                                    </DropdownMenuItem>
                                </Link>

                                <DropdownMenuItem
                                    variant="destructive"
                                    className="cursor-pointer"
                                    onClick={() => setDeleteDialogOpen(true)}
                                    disabled={isDeleting}
                                >
                                    <Trash className="w-4 h-4 mr-2" /> Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Description */}
                    <CardDescription className="text-sm leading-relaxed line-clamp-3 italic">
                        "{folder.description}"
                    </CardDescription>

                    {/* Characters Section */}
                    {folder.characters && folder.characters.length > 0 && (
                        <div className="pt-2 border-t border-border">
                            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-3">Members</h3>
                            <Accordion type="single" collapsible className="w-full space-y-2 border-none">
                                {folder.characters.map((char: Character) => (
                                    <AccordionItem
                                        key={char.id}
                                        value={`item-${char.id}`}
                                        className="border-none bg-surface-subtle rounded-xl overflow-hidden px-1 transition-all "
                                    >
                                        <AccordionTrigger className="flex items-center text-foreground py-2 px-3 hover:no-underline group/item">
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <Avatar className="size-8 border border-border transition-all duration-500">
                                                        {char.avatar?.url ? (
                                                            <AvatarImage
                                                                src={char.avatar.url}
                                                                alt={char.name}
                                                                className="object-cover"
                                                            />
                                                        ) : (
                                                            <AvatarFallback className="bg-surface-selected text-[10px]">
                                                                {char.name.slice(0, 2).toUpperCase()}
                                                            </AvatarFallback>
                                                        )}
                                                    </Avatar>
                                                </div>
                                                <span className="text-sm font-medium tracking-wide">{char.name}</span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-4 pb-3">
                                            <div className=" ">
                                                <p className="text-muted-foreground text-xs leading-relaxed italic line-clamp-5">
                                                    {char.description || "No description available for this initiate."}
                                                </p>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </div>
                    )}

                    {/* Recent realm chats */}
                    {/* {realmChats.length > 0 && (
                        <div className="pt-2 border-t border-white/10">
                            <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2">Recent chats</h3>
                            <ul className="space-y-1">
                                {realmChats.map((chat: { id: string; title?: string | null }) => (
                                    <li key={chat.id}>
                                        <Link
                                            href={`/realms/${folder.id}/chat/${chat.id}`}
                                            className="text-sm text-white/70 hover:text-white transition-colors line-clamp-1"
                                        >
                                            {chat.title || "Untitled chat"}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )} */}
                </div>
            </Card>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>

                <AlertDialogContent className="bg-popover border border-border">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Realm</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{folder.name}"? This action cannot be undone and will permanently remove the character.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteRealm(folder.id)}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-danger"
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default RealmCard;
