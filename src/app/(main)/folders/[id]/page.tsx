"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { Folder, MessageSquare, Sparkles, MoreVertical, Pencil, Trash2 } from "lucide-react";
import ChatPanel from "@/components/elements/chat-panel";
import Container from "@/components/elements/container";
import Footer from "@/components/layout/footer";
import { PaginationComponent } from "@/components/elements/pagination-element";
import { useGetFolder } from "@/hooks/folder";
import { useCreateChat, useDeleteChat, useListChats, useUpdateChat } from "@/hooks/chat";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import LinkToField from "@/components/elements/link-to-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Chat } from "@/lib/api/chats";
import { toast } from "sonner";

const FOLDER_ID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

function getFolderIdFromParam(param: string | undefined): string | undefined {
  if (!param) return undefined;
  const match = param.match(FOLDER_ID_REGEX);
  return match ? match[0] : param;
}

function formatChatDate(iso: string): string {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function FolderPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const folderId = getFolderIdFromParam(params?.id);

  const CHATS_PER_PAGE = 12;
  const [page, setPage] = useState(1);
  const [characterId, setCharacterId] = useState<string | undefined>();
  const [chatToDelete, setChatToDelete] = useState<Chat | null>(null);
  const [chatToRename, setChatToRename] = useState<Chat | null>(null);
  const [renameTitle, setRenameTitle] = useState("");
  const [selectCharacterDialogOpen, setSelectCharacterDialogOpen] = useState(false);
  const [dialogCharacterId, setDialogCharacterId] = useState<string | undefined>();
  /** Chat title typed by user - stored when opening character dialog so we don't lose it */
  const [pendingChatTitle, setPendingChatTitle] = useState("");

  const { folder, isLoading } = useGetFolder({ folderId });
  const { chats, pagination, isLoading: chatsLoading, refetch } = useListChats({
    filters: {
      folderId: folderId ?? "",
      sortBy: "updatedAt",
      sortOrder: "desc",
      page,
      limit: CHATS_PER_PAGE,
    },
    enabled: !!folderId,
  });

  const totalPages = pagination?.totalPages ?? 1;
  const { createChatAsync } = useCreateChat({ showToasts: false });
  const { deleteChatAsync, isDeleting } = useDeleteChat({ showToasts: true });
  const { updateChatAsync, isUpdating } = useUpdateChat({ showToasts: true });

  const folderName = folder?.name ?? "Folder";

  const handleConfirmDeleteChat = useCallback(async () => {
    if (!chatToDelete) return;
    try {
      await deleteChatAsync(chatToDelete.id);
      setChatToDelete(null);
      refetch();
      // If we deleted the last item on a page > 1, go back a page
      if (chats.length === 1 && page > 1) {
        setPage((p) => Math.max(1, p - 1));
      }
    } catch {
      // Error handled by hook
    }
  }, [chatToDelete, deleteChatAsync, refetch, chats.length, page]);

  const handleOpenRename = useCallback((chat: Chat) => {
    setChatToRename(chat);
    setRenameTitle(chat.title || "");
  }, []);

  const handleConfirmRename = useCallback(async () => {
    if (!chatToRename) return;
    const newTitle = renameTitle.trim() || null;
    try {
      await updateChatAsync({
        chatId: chatToRename.id,
        data: { title: newTitle },
      });
      setChatToRename(null);
      setRenameTitle("");
      refetch();
    } catch {
      // Error handled by hook
    }
  }, [chatToRename, renameTitle, updateChatAsync, refetch]);

  const chatListSlug = folderId && folderName ? `${folderId}-${folderName.toLowerCase().replace(/\s+/g, "-")}` : "";

  const handleCreateChat = useCallback(
    async (message?: { text?: string }) => {
      if (!folderId) return;
      const chatTitle = message?.text?.trim() || pendingChatTitle?.trim() || undefined;
      if (!characterId) {
        setPendingChatTitle(chatTitle ?? "");
        setDialogCharacterId(undefined);
        setSelectCharacterDialogOpen(true);
        return;
      }
      try {
        const res = await createChatAsync({
          title: chatTitle,
          characterId: characterId ?? undefined,
          folderId,
        });
        const newChatId = (res as { chat?: { id: string } })?.chat?.id;
        if (newChatId) {
          setPendingChatTitle("");
          refetch();
          const chatUrl = chatListSlug
            ? `/folders/${chatListSlug}/c/${newChatId}`
            : `/folders/${folderId}/c/${newChatId}`;
          router.push(chatUrl);
        }
      } catch {
        // Error handled by hook
      }
    },
    [folderId, pendingChatTitle, characterId, chatListSlug, createChatAsync, refetch, router]
  );

  const handleConfirmSelectCharacter = useCallback(async () => {
    const idToUse = dialogCharacterId;
    if (!idToUse) {
      toast.error("Please select a character first, then continue chatting");
      return;
    }
    setSelectCharacterDialogOpen(false);
    setCharacterId(idToUse);
    if (!folderId) return;
    const chatTitle = pendingChatTitle?.trim() || undefined;
    try {
      const res = await createChatAsync({
        title: chatTitle,
        characterId: idToUse,
        folderId,
      });
      const newChatId = (res as { chat?: { id: string } })?.chat?.id;
      if (newChatId) {
        setPendingChatTitle("");
        refetch();
        const chatUrl = chatListSlug
          ? `/folders/${chatListSlug}/c/${newChatId}`
          : `/folders/${folderId}/c/${newChatId}`;
        router.push(chatUrl);
      }
    } catch {
      // Error handled by hook
    }
  }, [dialogCharacterId, folderId, pendingChatTitle, chatListSlug, createChatAsync, refetch, router]);

  return (
    <div className="flex-1 flex flex-col relative min-h-0">
      <div className="flex-1 overflow-auto">
        <Container className="h-full w-full pt-20  ">
          <div className={cn("flex-1 flex flex-col relative min-h-full ")}>
            {/* Header */}
            <div className="flex gap-x-3 items-center text-3xl min-w-0 mb-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/30 backdrop-blur-sm border border-white/10">
                <Folder className="h-6 w-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                {isLoading ? (
                  <Skeleton className="h-8 w-48 bg-white/10 rounded" />
                ) : (
                  <h1 className="text-white font-semibold truncate">{folderName}</h1>
                )}
                {pagination?.total != null && (
                  <p className="text-sm text-white/60 mt-0.5">
                    {pagination.total} chat{pagination.total !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </div>

            {/* New chat input - chat title */}
            <div className="mb-8">
              <ChatPanel
                footer={false}
                placeholder="Write a chat title…"
                handleSubmit={handleCreateChat}
              />
            </div>

            {/* Chat list */}
            {chatsLoading && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-xl bg-white/10" />
                ))}
              </div>
            )}

            {!chatsLoading && chats.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/20 border border-white/10 mb-4">
                  <MessageSquare className="h-10 w-10 text-white/60" />
                </div>
                <h3 className="text-lg font-medium text-white mb-1">No chats yet</h3>
                <p className="text-sm text-white/60 max-w-sm">
                  Start a new chat above to begin a conversation in this folder.
                </p>
              </div>
            )}

            {!chatsLoading && chats.length > 0 && folderId && (
              <div className="relative flex-1 flex flex-col  min-h-full space-y-4 ">
                <div className="flex-1 ">
                  <div className="grid   gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {chats.map((chat) => (
                      <div
                        key={chat.id}
                        className="group relative flex flex-col rounded-xl border border-white/10 bg-surface-base hover:bg-surface-hover duration-500  p-4  "
                      >
                        <Link
                          href={chatListSlug ? `/folders/${chatListSlug}/c/${chat.id}` : "#"}
                          className="min-w-0 flex-1 block"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 shrink-0 border border-white/10 rounded-full">
                              {chat.character?.avatar?.url ? (
                                <AvatarImage
                                  src={chat.character.avatar.url}
                                  alt={chat.character.name || "Character"}
                                  className="object-cover"
                                />
                              ) : null}
                              <AvatarFallback className="bg-primary/40 text-white font-semibold">
                                {(chat.character?.name || chat.title || "C")[0]?.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-white truncate group-hover:text-white pr-8">
                                {chat.title || "New chat"}
                              </p>
                              <div className="flex items-center gap-2 mt-1 text-xs text-white/60">
                                <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                                <span>
                                  {chat.messageCount ?? 0} message{(chat.messageCount ?? 0) !== 1 ? "s" : ""}
                                </span>
                                <span>·</span>
                                <span>{formatChatDate(chat.updatedAt)}</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                type="button"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="bg-[#1a1a1a] border-white/10 text-white"
                            >
                              <DropdownMenuItem
                                className="cursor-pointer text-xs flex items-center gap-2 hover:bg-white/10"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleOpenRename(chat);
                                }}
                              >
                                <Pencil className="h-3 w-3" /> Rename
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer text-xs flex items-center gap-2 text-red-400 hover:bg-red-500/10 hover:text-red-400"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setChatToDelete(chat);
                                }}
                              >
                                <Trash2 className="h-3 w-3" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="  flex justify-center">
                    <PaginationComponent
                      currentPage={page}
                      totalPages={totalPages}
                      onPageChange={setPage}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </Container>
      </div>
      <div className="shrink-0">
        <Footer />
      </div>

      <Dialog open={!!chatToRename} onOpenChange={(open) => !open && (setChatToRename(null), setRenameTitle(""))}>
        <DialogContent className="bg-primary/20 backdrop-blur-xl border-primary/60 text-white rounded-3xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Rename chat</DialogTitle>
            <DialogDescription className="text-white/60">
              Enter a new title for this chat.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rename-title" className="text-white/80">
                Title
              </Label>
              <Input
                id="rename-title"
                value={renameTitle}
                onChange={(e) => setRenameTitle(e.target.value)}
                placeholder="Chat title"
                className="bg-white/5 border-white/10"
                maxLength={500}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
              onClick={() => setChatToRename(null)}
            >
              Cancel
            </Button>
            <Button
              className="bg-primary text-primary-foreground hover:bg-accent-hover"
              onClick={handleConfirmRename}
              disabled={isUpdating}
            >
              {isUpdating ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!chatToDelete} onOpenChange={(open) => !open && setChatToDelete(null)}>
        <AlertDialogContent className="bg-primary/20 backdrop-blur-sm rounded-2xl border-primary text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete chat</AlertDialogTitle>
            <AlertDialogDescription>
              {chatToDelete
                ? `Are you sure you want to delete "${chatToDelete.title || "New chat"}"? This cannot be undone.`
                : "This chat will be permanently deleted."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-white/80 border-none bg-primary/30">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDeleteChat();
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white "
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={selectCharacterDialogOpen} onOpenChange={setSelectCharacterDialogOpen}>
        <DialogContent className="max-w-[540px] border border-primary/50 text-white  rounded-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-semibold tracking-tight text-white">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20">
                <Sparkles className="h-4 w-4 text-white/90" />
              </span>
              Select a character
            </DialogTitle>
            <DialogDescription className="text-base text-white/75">
              Please select a character first, then continue chatting.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <LinkToField
              model="character"
              label="Characters"
              placeholder="Search and select a character..."
              className="bg-transparent text-white"
              value={dialogCharacterId ? [dialogCharacterId] : []}
              onValueChange={(v) => setDialogCharacterId(v?.[0])}
              multiSelect={false}
              maxCount={1}
            />
          </div>
          <DialogFooter className="mt-1 gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={() => setSelectCharacterDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmSelectCharacter}
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
