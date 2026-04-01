"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { MessageSquare, Sparkles, MoreVertical, Pencil, Trash2 } from "lucide-react";
import ChatPanel from "@/components/elements/chat-panel";
import Container from "@/components/elements/container";
import Footer from "@/components/layout/footer";
import { PaginationComponent } from "@/components/elements/pagination-element";
import { useCreateRealmChat, useGetRealm, useRealmChats } from "@/hooks/realm";
import { useDeleteChat, useUpdateChat } from "@/hooks/chat";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Chat } from "@/lib/api/chats";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function formatChatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function RealmPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const realmId = params?.id;

  const CHATS_PER_PAGE = 18;
  const [page, setPage] = useState(1);
  const [chatToDelete, setChatToDelete] = useState<Chat | null>(null);
  const [chatToRename, setChatToRename] = useState<Chat | null>(null);
  const [renameTitle, setRenameTitle] = useState("");

  const { realm, isLoading: isRealmLoading } = useGetRealm(realmId);
  const { chats, pagination, isLoading: chatsLoading, refetch } = useRealmChats({
    realmId,
    params: {
      sortBy: "updatedAt",
      sortOrder: "desc",
      page,
      limit: CHATS_PER_PAGE,
    },
    enabled: !!realmId,
  });
  const { createRealmChatAsync } = useCreateRealmChat({ realmId, showToasts: false });
  const { deleteChatAsync, isDeleting } = useDeleteChat({ showToasts: true });
  const { updateChatAsync, isUpdating } = useUpdateChat({ showToasts: true });

  const realmName = realm?.name ?? "Realm";
  const totalPages = pagination?.totalPages ?? 1;

  const handleCreateChat = useCallback(
    async (message?: { text?: string }) => {
      if (!realmId) return;
      const initialPrompt = message?.text?.trim() || "";
      try {
        const res = await createRealmChatAsync({
          title: undefined,
        });
        const newChatId =
          (res as { data?: { chat?: { id: string } } })?.data?.chat?.id ??
          (res as { chat?: { id: string } })?.chat?.id;
        if (newChatId) {
          refetch();
          const encodedPrompt = encodeURIComponent(initialPrompt);
          const nextUrl = initialPrompt
            ? `/realms/${realmId}/chat/${newChatId}?q=${encodedPrompt}`
            : `/realms/${realmId}/chat/${newChatId}`;
          router.push(nextUrl);
        }
      } catch {
        // Hook handles error toasts when enabled.
      }
    },
    [realmId, createRealmChatAsync, refetch, router]
  );

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

  const handleConfirmDeleteChat = useCallback(async () => {
    if (!chatToDelete) return;
    try {
      await deleteChatAsync(chatToDelete.id);
      setChatToDelete(null);
      refetch();
      if (chats.length === 1 && page > 1) {
        setPage((p) => Math.max(1, p - 1));
      }
    } catch {
      // Error handled by hook
    }
  }, [chatToDelete, deleteChatAsync, refetch, chats.length, page]);

  return (
    <div className="flex-1 flex flex-col relative min-h-0">
      <div className="flex-1 overflow-auto">
        <Container className="h-full w-full pt-20 flex flex-col">
          <div className={cn("grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start flex-1")}>
            <div className="flex-1 flex flex-col relative min-h-full">
              <div className="mb-6 rounded-xl border border-white/10 bg-surface-base p-4 sm:p-5">
                <div className="flex gap-3 items-start justify-between text-3xl min-w-0">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/30 backdrop-blur-sm border border-white/10">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    {isRealmLoading ? (
                      <Skeleton className="h-8 w-48 bg-white/10 rounded" />
                    ) : (
                      <h1 className="text-white font-semibold truncate">{realmName}</h1>
                    )}
                    {pagination?.total != null && (
                      <p className="text-sm text-white/60 mt-0.5">
                        {pagination.total} chat{pagination.total !== 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {realmId && (
                      <Button asChild variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                        <Link href={`/realms/${realmId}/edit`}>Edit Realm</Link>
                      </Button>
                    )}
                    <Button asChild size="sm">
                      <Link href="/realms/create">Create Realm</Link>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <ChatPanel
                  footer={false}
                  placeholder="Ask your first question..."
                  handleSubmit={handleCreateChat}
                />
              </div>

              {chatsLoading && (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full rounded-xl bg-white/10" />
                  ))}
                </div>
              )}

              {!chatsLoading && chats.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-white/10 bg-surface-base">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/20 border border-white/10 mb-4">
                    <MessageSquare className="h-10 w-10 text-white/60" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-1">No chats yet</h3>
                  <p className="text-sm text-white/60 max-w-sm">
                    Start a new chat above to begin a conversation in this realm.
                  </p>
                </div>
              )}

              {!chatsLoading && chats.length > 0 && realmId && (
                <div className="relative flex-1 flex flex-col min-h-full">
                  <div className="flex-1">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {chats.map((chat) => (
                        <div
                          key={chat.id}
                          className="group relative flex flex-col rounded-xl border border-white/10 bg-surface-base hover:bg-surface-hover duration-500 p-4"
                        >
                          <Link
                            href={`/realms/${realmId}/chat/${chat.id}`}
                            className="min-w-0 flex-1 block"
                          >
                            <div className="flex items-center gap-3">
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-white truncate group-hover:text-white pr-8">
                                  {chat.title || "New chat"}
                                </p>
                                <div className="flex items-center gap-2 mt-1 text-xs text-white/60">
                                  <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                                  <span>
                                    {chat.messageCount ?? 0} message{(chat.messageCount ?? 0) !== 1 ? "s" : ""}
                                  </span>
                                  <span>-</span>
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

                </div>
              )}
            </div>
            <aside className="lg:sticky lg:top-20">
              <div className="rounded-2xl border border-white/10 bg-linear-to-b from-surface-base to-surface-subtle/40 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Characters</h3>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-white/70">
                    {(realm?.characters?.length ?? 0)}
                  </span>
                </div>
                {isRealmLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-11 w-full bg-white/10 rounded-xl" />
                    <Skeleton className="h-11 w-full bg-white/10 rounded-xl" />
                    <Skeleton className="h-11 w-full bg-white/10 rounded-xl" />
                  </div>
                ) : (realm?.characters?.length ?? 0) > 0 ? (
                  <div className="space-y-2">
                    {realm?.characters?.map((character) => (
                      <div
                        key={character.id}
                        className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/4 px-3 py-2"
                      >
                        <Avatar className="h-8 w-8 border border-white/10">
                          {character.avatar?.url ? (
                            <AvatarImage src={character.avatar.url} alt={character.name} className="object-cover" />
                          ) : null}
                          <AvatarFallback className="bg-primary/40 text-white text-[11px] font-semibold">
                            {character.name?.slice(0, 1)?.toUpperCase() || "C"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-white">{character.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-white/15 bg-white/2 px-3 py-4 text-center">
                    <p className="text-xs text-white/60">No characters in this realm.</p>
                  </div>
                )}
              </div>
            </aside>
          </div>
          {!chatsLoading && chats.length > 0 && totalPages > 1 && (
            <div className="mt-auto flex justify-center border-t border-white/10 pt-4">
              <PaginationComponent
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
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
              {isUpdating ? "Saving..." : "Save"}
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
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
