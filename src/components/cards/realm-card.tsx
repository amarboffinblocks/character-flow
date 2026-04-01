import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useDeleteRealm, useToggleFavouriteRealm, useRealmChats } from "@/hooks";


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
    updatedAt?: string;
    avatar?: { url: string };
}
interface RealmCardProps {
    folder: Realm;
}

const RealmCard: React.FC<RealmCardProps> = ({
    folder, ...props
}) => {
    const router = useRouter();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const { chats: realmChats } = useRealmChats({
        realmId: folder.id,
        params: { limit: 6, sortBy: "updatedAt", sortOrder: "desc" },
    });

    const { deleteRealm, isDeleting } = useDeleteRealm({
        onSuccess: () => setDeleteDialogOpen(false)
    });

    const { toggleFavourite, isToggling } = useToggleFavouriteRealm();

    const isFavourite = folder.isFavourite || false;
    const stackImages = useMemo(() => {
        const characterImages = (folder.characters ?? [])
            .map((c) => c.avatar?.url)
            .filter((url): url is string => Boolean(url));

        if (characterImages.length >= 5) {
            if (characterImages.length === 5) {
                return characterImages;
            }
            const shuffled = [...characterImages];
            for (let i = shuffled.length - 1; i > 0; i -= 1) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled.slice(0, 5);
        }

        if (characterImages.length > 0) {
            const repeated = Array.from({ length: 5 }, (_, idx) => characterImages[idx % characterImages.length]);
            return repeated;
        }

        if (folder.avatar?.url) {
            return Array.from({ length: 5 }, () => folder.avatar!.url);
        }

        return Array.from({ length: 5 }, () => "/placeholder.svg");
    }, [folder.characters, folder.avatar?.url]);
    const updatedLabel = useMemo(() => {
        if (!folder.updatedAt) return "";
        const d = new Date(folder.updatedAt);
        if (Number.isNaN(d.getTime())) return "";
        return d.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
    }, [folder.updatedAt]);
    const handleCardClick = (event: React.MouseEvent<HTMLDivElement>) => {
        const target = event.target as HTMLElement;
        if (target.closest("button, a, input, [role='menuitem'], [data-state]")) {
            return;
        }
        router.push(`/realms/${folder.id}`);
    };

    const handleCardKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            router.push(`/realms/${folder.id}`);
        }
    };

    return (
        <div
            {...props}
            role="link"
            tabIndex={0}
            onClick={handleCardClick}
            onKeyDown={handleCardKeyDown}
            className="group relative cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="relative w-[288px]" style={{ perspective: "1200px" }}>
                <div
                    className="relative z-0 rounded-2xl transition-all duration-500"
                    style={{
                        height: "224px",
                        transformStyle: "preserve-3d",
                        transformOrigin: "center bottom",
                        transform: isHovered ? "rotateX(15deg)" : "rotateX(0deg)",
                        background: "#1e1e1e",
                        border: "1px solid rgba(255, 255, 255, 0.06)",
                    }}
                >
                    <div className="absolute inset-0">
                        {stackImages.map((imageUrl, idx) => {
                            const center = Math.floor((stackImages.length - 1) / 2);
                            const distance = Math.abs(idx - center);
                            const spacing = 42;
                            const hoverSpacing = 58;
                            const xFromCenter = idx - center;
                            const baseX = xFromCenter * spacing;
                            const hoverX = xFromCenter * hoverSpacing;
                            const baseRotate = xFromCenter * 7;
                            const hoverRotate = xFromCenter * 10;
                            const z = 10 - distance;
                            const x = isHovered ? hoverX : baseX;
                            const y = isHovered
                                ? (idx === center ? -28 : -10 + distance * 7)
                                : 8 + distance * 5;
                            const rotate = isHovered ? hoverRotate : baseRotate;
                            const scale = isHovered
                                ? (idx === center ? 1.16 : distance === 1 ? 1.03 : 0.94)
                                : (idx === center ? 1.04 : distance === 1 ? 0.97 : 0.9);
                            return (
                                <div
                                    key={idx}
                                    className="absolute left-1/2 top-0"
                                    style={{
                                        transform: `translateX(calc(-50% + ${x}px)) translateY(${y}px) rotate(${rotate}deg) scale(${scale})`,
                                        zIndex: z,
                                        transition: "transform 520ms cubic-bezier(0.22, 1, 0.36, 1)",
                                    }}
                                >
                                    <div className="h-[186px] w-[118px] overflow-hidden rounded-xl border border-white/10">
                                        <img
                                            src={imageUrl}
                                            alt={folder.name}
                                            className="h-full w-full object-cover transition-transform duration-500"
                                            style={{
                                                filter: isHovered
                                                    ? distance === 0
                                                        ? "brightness(1.02)"
                                                        : distance === 1
                                                            ? "brightness(0.72)"
                                                            : "brightness(0.46)"
                                                    : distance === 0
                                                        ? "brightness(0.95)"
                                                        : distance === 1
                                                            ? "brightness(0.58)"
                                                            : "brightness(0.34)",
                                                transform: isHovered ? "scale(1.07)" : "scale(1)",
                                                transition: "filter 420ms cubic-bezier(0.22, 1, 0.36, 1), transform 620ms cubic-bezier(0.22, 1, 0.36, 1)",
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div
                    className="absolute bottom-0 left-0 right-0 z-10 rounded-2xl overflow-hidden transition-all duration-500"
                    style={{
                        background: "rgba(26, 26, 26, 0.8)",
                        border: "1px solid rgba(255, 255, 255, 0.06)",
                        transformStyle: "preserve-3d",
                        transformOrigin: "center bottom",
                        transform: isHovered ? "rotateX(-25deg)" : "rotateX(0deg)",
                        backdropFilter: "blur(16px)",
                        WebkitBackdropFilter: "blur(16px)",
                    }}
                >
                    <div className="relative px-4 py-4 min-h-11">
                        <h3 className="font-semibold text-white/70 text-base leading-snug line-clamp-2 min-h-11 transition-colors duration-300 group-hover:text-white">
                            {folder.name}
                        </h3>
                    </div>
                    <div className="relative h-[48px]">
                        <div className="absolute inset-x-0 top-0 h-px bg-white/4" />
                        <div className="absolute inset-0 flex items-center justify-between px-2 pl-4">
                            <div className="flex items-center gap-1.5">
                                <span className="text-[13px] text-white/60">{realmChats.length}</span>
                                <span className="text-[13px] text-white/60">clips</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-white/50">{updatedLabel}</span>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={(e) => e.stopPropagation()}
                                            className="size-8 rounded-md text-white/60 hover:text-white hover:bg-white/10"
                                        >
                                            <MoreVertical className="size-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48" onClick={(e) => e.stopPropagation()}>
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

                                        <Link href={`/realms/${folder.id}`}>
                                            <DropdownMenuItem className="hover:bg-surface-hover transition cursor-pointer">
                                                <ChatIcon className="text-foreground w-4 h-4 mr-2" /> Open {folder.name}
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
                        </div>
                    </div>
                </div>
            </div>

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
