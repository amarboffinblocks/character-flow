"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, Folder, Sparkles, UserCircle2, Palette, BookOpenText, Users, ChevronUp, ChevronRight, PanelLeft, Settings, Plus, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCreateFolder, useDeleteChat, useDeleteFolder, useListChats, useListFolders, useUpdateChat, useUpdateFolder } from "@/hooks";
import { useListRealms } from "@/hooks/realm";
import { useCurrentUser } from "@/hooks/user/use-current-user";
import { listChats, type Chat } from "@/lib/api/chats";
import { listRealmChats } from "@/lib/api/realms";
import { queryKeys } from "@/lib/api/shared/query-keys";
import type { Folder as FolderType } from "@/lib/api/folders";
import type { Realm } from "@/lib/api/realms";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FolderModal } from "@/components/modals/create-folder-modal";
import { updateRealm, deleteRealm } from "@/lib/api/realms/endpoints";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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

interface AppSidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const FOLDER_ID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

function toFolderSlug(folder: FolderType): string {
  return `${folder.id}-${folder.name.toLowerCase().trim().replace(/\s+/g, "-")}`;
}

function getFolderIdFromParam(param: string | undefined): string | undefined {
  if (!param) return undefined;
  const match = param.match(FOLDER_ID_REGEX);
  return match ? match[0] : param;
}

function chatLabel(chat: Chat): string {
  const title = chat.title?.trim();
  if (title) return title;
  return "New chat";
}

export default function AppSidebar({ mobileOpen, onCloseMobile }: AppSidebarProps) {
  const pathname = usePathname();
  const [realmsOpen, setRealmsOpen] = useState(true);
  const [foldersOpen, setFoldersOpen] = useState(true);
  const [chatsOpen, setChatsOpen] = useState(true);
  const [folderToRename, setFolderToRename] = useState<FolderType | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<FolderType | null>(null);
  const [realmToRename, setRealmToRename] = useState<Realm | null>(null);
  const [realmRenameName, setRealmRenameName] = useState("");
  const [realmToDelete, setRealmToDelete] = useState<Realm | null>(null);
  const [chatToRename, setChatToRename] = useState<Chat | null>(null);
  const [chatRenameTitle, setChatRenameTitle] = useState("");
  const [chatToDelete, setChatToDelete] = useState<Chat | null>(null);
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();
  const { chats, isLoading: chatsLoading } = useListChats({
    filters: { sortBy: "updatedAt", sortOrder: "desc", page: 1, limit: 25 },
  });
  const { folders, isLoading: foldersLoading } = useListFolders({
    filters: { sortBy: "updatedAt", sortOrder: "desc", limit: 20 },
  });
  const { createFolder, isLoading: isCreatingFolder } = useCreateFolder({ showToasts: true });
  const { updateFolder, isLoading: isUpdatingFolder } = useUpdateFolder({
    showToasts: true,
    onSuccess: () => setFolderToRename(null),
  });
  const { deleteFolder: deleteFolderAction, isLoading: isDeletingFolder } = useDeleteFolder({
    showToasts: true,
    onSuccess: () => setFolderToDelete(null),
  });
  const { updateChat, isUpdating: isUpdatingChat } = useUpdateChat({
    showToasts: true,
    onSuccess: () => {
      setChatToRename(null);
      setChatRenameTitle("");
    },
  });
  const { deleteChat, isDeleting: isDeletingChat } = useDeleteChat({
    showToasts: true,
    onSuccess: () => setChatToDelete(null),
  });
  const { data: realmsData, isLoading: realmsLoading } = useListRealms({
    page: 1,
    limit: 20,
    sortBy: "updatedAt",
    sortOrder: "desc",
  });
  const realms = realmsData?.realms ?? [];
  const renameRealmMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => updateRealm(id, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.realms.all });
      toast.success("Realm renamed");
      setRealmToRename(null);
      setRealmRenameName("");
    },
    onError: (error: Error) => toast.error(error.message || "Failed to rename realm"),
  });
  const deleteRealmMutation = useMutation({
    mutationFn: async (id: string) => deleteRealm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.realms.all });
      toast.success("Realm deleted");
      setRealmToDelete(null);
    },
    onError: (error: Error) => toast.error(error.message || "Failed to delete realm"),
  });

  const folderChatsQueries = useQueries({
    queries: folders.map((folder) => ({
      queryKey: queryKeys.chats.list({ folderId: folder.id, sortBy: "updatedAt", sortOrder: "desc", page: 1, limit: 8 }),
      queryFn: async () => {
        const res = await listChats({ folderId: folder.id, sortBy: "updatedAt", sortOrder: "desc", page: 1, limit: 8 });
        return res.data.chats;
      },
      staleTime: 60 * 1000,
    })),
  });

  const realmChatsQueries = useQueries({
    queries: realms.map((realm: Realm) => ({
      queryKey: queryKeys.realms.realmChatList(realm.id, { sortBy: "updatedAt", sortOrder: "desc", page: 1, limit: 8 }),
      queryFn: async () => {
        const res = await listRealmChats(realm.id, { sortBy: "updatedAt", sortOrder: "desc", page: 1, limit: 8 });
        return res.data.chats;
      },
      staleTime: 60 * 1000,
    })),
  });

  const topLevelChats = useMemo(
    () => chats.filter((chat) => !chat.folderId && !chat.realmId && !!chat.characterId).slice(0, 10),
    [chats]
  );

  const accountInitial = (user?.name || user?.email || "U").charAt(0).toUpperCase();
  const mainNavItems = [
    { href: "/characters", label: "Characters", icon: UserCircle2 },
    { href: "/lorebooks", label: "Lorebooks", icon: BookOpenText },
    { href: "/personas", label: "Personas", icon: Users },
    { href: "/realms", label: "Realms", icon: Sparkles },
    { href: "/background", label: "Background", icon: Palette },
  ];

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-30 bg-black/60 lg:hidden",
          mobileOpen ? "block" : "hidden"
        )}
        onClick={onCloseMobile}
      />
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-[300px] border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-screen flex-col">
          <div className="px-3 py-3">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md border border-sidebar-border bg-sidebar-accent">
                <PanelLeft className="h-4 w-4 text-sidebar-foreground" />
              </div>
              <p className="text-xs font-medium tracking-wide text-muted-foreground">Workspace</p>
            </div>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
            <section>
              <h3 className="px-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">Navigation</h3>
              <div className="mt-2 space-y-1">
                {mainNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onCloseMobile}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm",
                        isActive
                          ? "border border-sidebar-border bg-sidebar-accent text-sidebar-foreground"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground"
                      )}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </section>

            <section>
              <button
                type="button"
                onClick={() => setRealmsOpen((prev) => !prev)}
                className="flex w-full items-center justify-between rounded-md px-2.5 py-1 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground hover:bg-sidebar-accent/70"
              >
                <span>Realms</span>
                <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", realmsOpen && "rotate-90")} />
              </button>
              {realmsOpen && (
                <div className="mt-2 space-y-1">
                  <Link
                    href="/realms/create"
                    onClick={onCloseMobile}
                    className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground"
                  >
                    <Plus className="h-3.5 w-3.5 shrink-0" />
                    <span>New Realm</span>
                  </Link>
                  {realmsLoading ? (
                    <p className="px-2.5 text-xs text-muted-foreground">Loading realms...</p>
                  ) : realms.length === 0 ? (
                    <p className="px-2.5 text-xs text-muted-foreground">No realms</p>
                  ) : (
                    realms.map((realm, idx) => {
                      const realmChats = (realmChatsQueries[idx]?.data ?? []) as Chat[];
                      return (
                        <div key={realm.id} className="group rounded-md">
                          <div className="flex items-center rounded-md hover:bg-sidebar-accent/70">
                            <Link
                              href={`/realms/${realm.id}/chat`}
                              onClick={onCloseMobile}
                              className="flex min-w-0 flex-1 items-center gap-2 px-2.5 py-1.5 text-sm text-sidebar-foreground/90"
                            >
                              <Sparkles className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{realm.name}</span>
                            </Link>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <button
                                  type="button"
                                  onClick={(e) => e.stopPropagation()}
                                  className="mr-1 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-sidebar-accent/70 hover:text-sidebar-foreground group-hover:opacity-100"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenuItem
                                  onSelect={(e) => {
                                    e.preventDefault();
                                    setRealmToRename(realm);
                                    setRealmRenameName(realm.name);
                                  }}
                                >
                                  Rename
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onSelect={(e) => {
                                    e.preventDefault();
                                    setRealmToDelete(realm);
                                  }}
                                >
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <div className="mt-1 space-y-1 pl-7">
                            {realmChats.length === 0 ? (
                              <p className="px-2.5 py-1 text-xs text-muted-foreground">No chats</p>
                            ) : (
                              realmChats.map((chat) => (
                                <div key={chat.id} className="group/chat flex items-center rounded-md hover:bg-sidebar-accent/70">
                                  <Link
                                    href={`/realms/${realm.id}/chat/${chat.id}`}
                                    onClick={onCloseMobile}
                                    className={cn(
                                      "min-w-0 flex-1 truncate px-2.5 py-1.5 text-sm text-sidebar-foreground/80 hover:text-sidebar-foreground",
                                      pathname?.includes(`/realms/${realm.id}/chat/${chat.id}`) && "text-sidebar-foreground"
                                    )}
                                  >
                                    {chatLabel(chat)}
                                  </Link>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                      <button
                                        type="button"
                                        onClick={(e) => e.stopPropagation()}
                                        className="mr-1 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-sidebar-accent/70 hover:text-sidebar-foreground group-hover/chat:opacity-100"
                                      >
                                        <MoreHorizontal className="h-4 w-4" />
                                      </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                      <DropdownMenuItem
                                        onSelect={(e) => {
                                          e.preventDefault();
                                          setChatToRename(chat);
                                          setChatRenameTitle(chat.title?.trim() || "");
                                        }}
                                      >
                                        Rename
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onSelect={(e) => {
                                          e.preventDefault();
                                          setChatToDelete(chat);
                                        }}
                                      >
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </section>

            <section>
              <button
                type="button"
                onClick={() => setFoldersOpen((prev) => !prev)}
                className="flex w-full items-center justify-between rounded-md px-2.5 py-1 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground hover:bg-sidebar-accent/70"
              >
                <span>Folders</span>
                <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", foldersOpen && "rotate-90")} />
              </button>
              {foldersOpen && (
                <div className="mt-2 space-y-1">
                  <FolderModal
                    mode="create"
                    onSubmitCreate={(name, description) => createFolder({ name, description: description ?? undefined })}
                    isSubmitting={isCreatingFolder}
                  >
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground"
                    >
                      <Plus className="h-3.5 w-3.5 shrink-0" />
                      <span>New Folder</span>
                    </button>
                  </FolderModal>
                  {foldersLoading ? (
                    <p className="px-2.5 text-xs text-muted-foreground">Loading folders...</p>
                  ) : folders.length === 0 ? (
                    <p className="px-2.5 text-xs text-muted-foreground">No folders</p>
                  ) : (
                    folders.map((folder, idx) => {
                      const folderChats = (folderChatsQueries[idx]?.data ?? []) as Chat[];
                      const folderSlug = toFolderSlug(folder);
                      return (
                        <div key={folder.id} className="group rounded-md">
                          <div className="flex items-center rounded-md hover:bg-sidebar-accent/70">
                            <Link
                              href={`/folders/${folderSlug}`}
                              onClick={onCloseMobile}
                              className="flex min-w-0 flex-1 items-center gap-2 px-2.5 py-1.5 text-sm text-sidebar-foreground/90"
                            >
                              <Folder className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{folder.name}</span>
                            </Link>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <button
                                  type="button"
                                  onClick={(e) => e.stopPropagation()}
                                  className="mr-1 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-sidebar-accent/70 hover:text-sidebar-foreground group-hover:opacity-100"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenuItem
                                  onSelect={(e) => {
                                    e.preventDefault();
                                    setFolderToRename(folder);
                                  }}
                                >
                                  Rename
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onSelect={(e) => {
                                    e.preventDefault();
                                    setFolderToDelete(folder);
                                  }}
                                >
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <div className="mt-1 space-y-1 pl-7">
                            {folderChats.length === 0 ? (
                              <p className="px-2.5 py-1 text-xs text-muted-foreground">No chats</p>
                            ) : (
                              folderChats.map((chat) => (
                                <div key={chat.id} className="group/chat flex items-center rounded-md hover:bg-sidebar-accent/70">
                                  <Link
                                    href={`/folders/${folderSlug}/c/${chat.id}`}
                                    onClick={onCloseMobile}
                                    className={cn(
                                      "min-w-0 flex-1 truncate px-2.5 py-1.5 text-sm text-sidebar-foreground/80 hover:text-sidebar-foreground",
                                      pathname?.includes(`/c/${chat.id}`) && "text-sidebar-foreground"
                                    )}
                                  >
                                    {chatLabel(chat)}
                                  </Link>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                      <button
                                        type="button"
                                        onClick={(e) => e.stopPropagation()}
                                        className="mr-1 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-sidebar-accent/70 hover:text-sidebar-foreground group-hover/chat:opacity-100"
                                      >
                                        <MoreHorizontal className="h-4 w-4" />
                                      </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                      <DropdownMenuItem
                                        onSelect={(e) => {
                                          e.preventDefault();
                                          setChatToRename(chat);
                                          setChatRenameTitle(chat.title?.trim() || "");
                                        }}
                                      >
                                        Rename
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onSelect={(e) => {
                                          e.preventDefault();
                                          setChatToDelete(chat);
                                        }}
                                      >
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </section>

            <section>
              <button
                type="button"
                onClick={() => setChatsOpen((prev) => !prev)}
                className="flex w-full items-center justify-between rounded-md px-2.5 py-1 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground hover:bg-sidebar-accent/70"
              >
                <span>Chats</span>
                <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", chatsOpen && "rotate-90")} />
              </button>
              {chatsOpen && (
                <div className="mt-2 space-y-1">
                  {chatsLoading ? (
                    <p className="px-2.5 text-xs text-muted-foreground">Loading chats...</p>
                  ) : topLevelChats.length === 0 ? (
                    <p className="px-2.5 text-xs text-muted-foreground">No recent chats</p>
                  ) : (
                    topLevelChats.map((chat) => (
                      <div key={chat.id} className="group/chat flex items-center rounded-md hover:bg-sidebar-accent/70">
                        <Link
                          href={`/chat/${chat.id}/char/${chat.characterId}`}
                          onClick={onCloseMobile}
                          className={cn(
                            "flex min-w-0 flex-1 items-center gap-2 px-2.5 py-1.5 text-sm text-sidebar-foreground/80 hover:text-sidebar-foreground",
                            pathname?.includes(`/chat/${chat.id}/`) && "text-sidebar-foreground"
                          )}
                        >
                          <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{chatLabel(chat)}</span>
                        </Link>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={(e) => e.stopPropagation()}
                              className="mr-1 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-sidebar-accent/70 hover:text-sidebar-foreground group-hover/chat:opacity-100"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenuItem
                              onSelect={(e) => {
                                e.preventDefault();
                                setChatToRename(chat);
                                setChatRenameTitle(chat.title?.trim() || "");
                              }}
                            >
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={(e) => {
                                e.preventDefault();
                                setChatToDelete(chat);
                              }}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))
                  )}
                </div>
              )}
            </section>
          </div>

          <div className="mt-auto bg-sidebar p-2.5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sidebar-foreground/90 hover:bg-sidebar-accent/70"
                >
                  <Avatar className="size-8">
                    {user?.avatar ? <AvatarImage src={user.avatar} alt={user.name || user.email} /> : null}
                    <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground">
                      {accountInitial}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-sidebar-foreground">{user?.name || "Account"}</p>
                    <p className="truncate text-xs text-muted-foreground">{user?.email || "Signed in"}</p>
                  </div>
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="top" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/profile" onClick={onCloseMobile}>
                    <UserCircle2 className="h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/background" onClick={onCloseMobile}>
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <FolderModal
          mode="rename"
          folder={folderToRename}
          open={!!folderToRename}
          onOpenChange={(open) => {
            if (!open) setFolderToRename(null);
          }}
          onSubmitRename={(folderId, name, description) =>
            updateFolder({ folderId, name, description: description ?? undefined })
          }
          isSubmitting={isUpdatingFolder}
        />
        <Dialog
          open={!!realmToRename}
          onOpenChange={(open) => {
            if (!open) {
              setRealmToRename(null);
              setRealmRenameName("");
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rename realm</DialogTitle>
            </DialogHeader>
            <Input
              value={realmRenameName}
              onChange={(e) => setRealmRenameName(e.target.value)}
              placeholder="Realm name"
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setRealmToRename(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (!realmToRename || !realmRenameName.trim()) return;
                  renameRealmMutation.mutate({ id: realmToRename.id, name: realmRenameName.trim() });
                }}
                disabled={renameRealmMutation.isPending || !realmRenameName.trim()}
              >
                {renameRealmMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <AlertDialog open={!!folderToDelete} onOpenChange={(open) => !open && setFolderToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete folder</AlertDialogTitle>
              <AlertDialogDescription>
                {folderToDelete ? `Delete "${folderToDelete.name}" and all chats in it?` : "Delete this folder?"}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  if (folderToDelete) deleteFolderAction(folderToDelete.id);
                }}
                disabled={isDeletingFolder}
              >
                {isDeletingFolder ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <AlertDialog open={!!realmToDelete} onOpenChange={(open) => !open && setRealmToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete realm</AlertDialogTitle>
              <AlertDialogDescription>
                {realmToDelete ? `Delete "${realmToDelete.name}" and its chats?` : "Delete this realm?"}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  if (realmToDelete) deleteRealmMutation.mutate(realmToDelete.id);
                }}
                disabled={deleteRealmMutation.isPending}
              >
                {deleteRealmMutation.isPending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Dialog
          open={!!chatToRename}
          onOpenChange={(open) => {
            if (!open) {
              setChatToRename(null);
              setChatRenameTitle("");
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rename chat</DialogTitle>
            </DialogHeader>
            <Input
              value={chatRenameTitle}
              onChange={(e) => setChatRenameTitle(e.target.value)}
              placeholder="Chat title"
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setChatToRename(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (!chatToRename) return;
                  updateChat({ chatId: chatToRename.id, data: { title: chatRenameTitle.trim() || null } });
                }}
                disabled={isUpdatingChat}
              >
                {isUpdatingChat ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <AlertDialog open={!!chatToDelete} onOpenChange={(open) => !open && setChatToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete chat</AlertDialogTitle>
              <AlertDialogDescription>
                {chatToDelete ? `Delete "${chatLabel(chatToDelete)}"? This cannot be undone.` : "Delete this chat?"}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  if (chatToDelete) deleteChat(chatToDelete.id);
                }}
                disabled={isDeletingChat}
              >
                {isDeletingChat ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </aside>
    </>
  );
}
