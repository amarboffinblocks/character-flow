"use client";
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Container from "@/components/elements/container";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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
import { DownloadIcon, Loader2, Menu, Plus, Trash2, TriangleAlert, UserRound } from "lucide-react";
import Link from "next/link";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { PaginationComponent } from "@/components/elements/pagination-element";
import CharacterCard from "@/components/cards/character-card";
import CharacterCardSkeleton from "../cards-skeletons/character-card-skeleton";
import ErrorEmptyState from "../elements/error-empty-state";
import SearchField from "../elements/search-field";
import { ToggleSwitch } from "../elements/toggle-switch";
import { extractCharacterCardMetadata } from "@/lib/utils/png-metadata";
import { useListCharacters, useDuplicateCharacter, useDeleteCharacter, useImportCharacter, useBulkImportCharacters, type CharacterListFilters } from "@/hooks";
import GlobalLoader from "../elements/global-loader";
import MultiSelectFilter from "../elements/multi-select-filter";
import ImportCharacterDialog from "../elements/import-character-dialog";
import { toast } from "sonner";
import Footer from "@/components/layout/footer";
import { queryKeys } from "@/lib/api/shared/query-keys";

// Utility for tab mapping (avoids duplicate strings)
const TABS = [
  { label: "All", value: "all" },
  { label: "Public", value: "public" },
  { label: "Saved", value: "saved" },
  { label: "Private", value: "private" },
  { label: "Favourites", value: "favourite" },
];

const SORT_OPTIONS = [
  {
    label: "A - Z",
    sortBy: "name",
    sortOrder: "asc" as const,
  },
  {
    label: "Z - A",
    sortBy: "name",
    sortOrder: "desc" as const,
  },
  {
    label: "Oldest to Newest",
    sortBy: "createdAt",
    sortOrder: "asc" as const,
  },
  {
    label: "Newest to Oldest",
    sortBy: "createdAt",
    sortOrder: "desc" as const,
  },
] satisfies Array<{
  label: string;
  sortBy: "createdAt" | "updatedAt" | "name" | "chatCount";
  sortOrder: "asc" | "desc";
}>;

const CharacterPage = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
  const [ratingFilter, setRatingFilter] = useState<"SFW" | "NSFW" | undefined>("SFW");
  const [sortBy, setSortBy] = useState<"createdAt" | "updatedAt" | "name" | "chatCount">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isFilterChanging, setIsFilterChanging] = useState(false);
  const [selectedCharacters, setSelectedCharacters] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteMode, setDeleteMode] = useState<"only" | "with-current-chat" | "with-all-chats" | null>(null);
  const [includeTags, setIncludeTags] = useState<string[]>([]);
  const [excludeTags, setExcludeTags] = useState<string[]>([]);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [bulkImportDialogOpen, setBulkImportDialogOpen] = useState(false);

  // Handle debounced search change
  const handleDebouncedSearch = useCallback((value: string) => {
    setDebouncedSearchQuery(value);
    setPage(1);
  }, []);

  const handleSort = useCallback(
    (sortBy: "createdAt" | "updatedAt" | "name" | "chatCount", sortOrder: "asc" | "desc") => {
      setIsFilterChanging(true);
      setSortBy(sortBy);
      setSortOrder(sortOrder);
      setPage(1);
    },
    []
  );

  const onTabChange = useCallback(
    (value: string) => {
      setIsFilterChanging(true);
      setActiveTab(value);
      setPage(1);
    },
    []
  );

  const handleRatingChange = useCallback((value: string) => {
    setIsFilterChanging(true);
    setRatingFilter(value as "SFW" | "NSFW" | undefined);
    setPage(1);
  }, []);

  const handleIncludeTagsChange = useCallback((tags: string[]) => {
    setIsFilterChanging(true);
    setIncludeTags(tags);
    setPage(1);
  }, []);

  const handleExcludeTagsChange = useCallback((tags: string[]) => {
    setIsFilterChanging(true);
    setExcludeTags(tags);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((p: number) => {
    setPage(p);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  // Handle character selection
  const handleCharacterSelect = useCallback((characterId: string, isSelected: boolean) => {
    setSelectedCharacters((prev) => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(characterId);
      } else {
        newSet.delete(characterId);
      }
      return newSet;
    });
  }, []);

  const filters = useMemo<CharacterListFilters>(() => {

    if (activeTab === "all") {
      const allFilters: CharacterListFilters = {
        page,
        limit: 10,
        sortBy,
        sortOrder,
        rating: ratingFilter
      };
      if (debouncedSearchQuery.trim()) {
        allFilters.search = debouncedSearchQuery.trim();
      }
      if (includeTags.length > 0) {
        allFilters.tags = includeTags;
      }
      if (excludeTags.length > 0) {
        allFilters.excludeTags = excludeTags;
      }
      return allFilters;
    }

    const baseFilters: CharacterListFilters = {
      page,
      limit: 20,
      sortBy,
      sortOrder,
    };

    if (ratingFilter) {
      baseFilters.rating = ratingFilter;
    }

    if (debouncedSearchQuery.trim()) {
      baseFilters.search = debouncedSearchQuery.trim();
    }

    if (includeTags.length > 0) {
      baseFilters.tags = includeTags;
    }

    if (excludeTags.length > 0) {
      baseFilters.excludeTags = excludeTags;
    }

    switch (activeTab) {
      case "public":
        baseFilters.visibility = "public";
        break;
      case "private":
        baseFilters.visibility = "private";
        break;
      case "favourite":
        baseFilters.isFavourite = true;
        break;
      case "saved":
        baseFilters.isSaved = true;
        break;
      default:
        break;
    }
    return baseFilters;
  }, [page, activeTab, debouncedSearchQuery, ratingFilter, sortBy, sortOrder, includeTags, excludeTags]);

  const {
    characters,
    isLoading,
    isError,
    error,
    pagination,
    totalPages,
    refetch,
  } = useListCharacters({
    filters,
    showErrorToast: true,
  });

  const {
    duplicateCharactersBatch,
    isLoading: isDuplicating,
  } = useDuplicateCharacter({
    onSuccess: () => {
      setSelectedCharacters(new Set()); // Clear selection after duplication
      refetch(); // Refresh the list
    },
  });

  const refetchTags = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.tags.lists() });
    queryClient.refetchQueries({ queryKey: queryKeys.tags.lists(), type: "active" });
  }, [queryClient]);

  const {
    importCharacter,
    isLoading: isImporting,
  } = useImportCharacter({
    onSuccess: () => {
      setImportDialogOpen(false);
      refetch(); // Refresh the list
      refetchTags(); // Refresh tags after import adds new tags
    },
  });

  const {
    bulkImportCharacters,
    isLoading: isBulkImporting,
  } = useBulkImportCharacters({
    onSuccess: () => {
      setBulkImportDialogOpen(false);
      refetch(); // Refresh the list
      refetchTags(); // Refresh tags after import adds new tags
    },
  });

  // Handle single file import wrapper
  // Backend supports JSON (V1/V2) and PNG with embedded metadata directly
  const handleSingleImport = useCallback(
    (files: File[]) => {
      if (files.length > 0) {
        importCharacter(files[0]);
      }
    },
    [importCharacter]
  );

  // Handle bulk file import wrapper
  const handleBulkImport = useCallback(async (files: File[]) => {
    if (files.length === 0) return;

    try {
      // 1. Process all files (JSON or PNG)
      const filePromises = files.map(async (file) => {
        try {
          if (file.type === "image/png") {
            const buffer = await file.arrayBuffer();
            const metadata = extractCharacterCardMetadata(buffer);
            if (metadata) {
              try {
                // Metadata may be base64-encoded or raw JSON
                let jsonStr = metadata;
                try {
                  const decoded = atob(metadata.trim());
                  if (decoded.startsWith("{") || decoded.startsWith("[")) {
                    jsonStr = decoded;
                  }
                } catch {
                  // Not base64, use as-is
                }
                const json = JSON.parse(jsonStr);
                return { name: file.name, content: json };
              } catch {
                return { name: file.name, content: null };
              }
            }
          } else if (file.type === "application/json") {
            return new Promise<{ name: string; content: unknown }>((resolve) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                try {
                  const json = JSON.parse(e.target?.result as string);
                  resolve({ name: file.name, content: json });
                } catch {
                  resolve({ name: file.name, content: null });
                }
              };
              reader.readAsText(file);
            });
          }
          return { name: file.name, content: null };
        } catch (err) {
          console.error(`Error processing file ${file.name}:`, err);
          return { name: file.name, content: null };
        }
      });

      const results = await Promise.all(filePromises);
      const mergedCharacters: Record<string, unknown>[] = [];
      let ignoredFiles = 0;

      // 2. Filter and merge
      results.forEach(result => {
        if (!result.content) return; // Skip invalid JSON

        if (Array.isArray(result.content)) {
          // Ignore files that are already arrays (per user request)
          ignoredFiles++;
        } else if (typeof result.content === "object") {
          // Add single character object
          mergedCharacters.push(result.content as Record<string, unknown>);
        }
      });

      if (ignoredFiles > 0) {
        toast.info(`Ignored ${ignoredFiles} file(s) containing arrays of characters.`);
      }

      if (mergedCharacters.length === 0) {
        toast.warning("No valid single-character files found to import.");
        return;
      }

      // 3. Create merged file
      const mergedContent = JSON.stringify(mergedCharacters);
      const mergedFile = new File([mergedContent], "bulk_import.json", {
        type: "application/json",
      });

      // 4. Send to backend
      bulkImportCharacters(mergedFile);

    } catch (error) {
      console.error("Error processing bulk files:", error);
      toast.error("Failed to process files for bulk import.");
    }
  }, [bulkImportCharacters]);

  const {
    deleteCharactersBatch,
    isLoading: isDeleting,
  } = useDeleteCharacter({
    onSuccess: () => {
      setSelectedCharacters(new Set()); // Clear selection after deletion
      setDeleteDialogOpen(false);
      setDeleteMode(null);
      refetch(); // Refresh the list
    },
  });

  // Handle duplicate selected characters (optimized batch operation)
  const handleDuplicateSelected = useCallback(() => {
    if (selectedCharacters.size === 0) {
      return;
    }

    // Use batch duplication to avoid multiple API calls
    duplicateCharactersBatch(Array.from(selectedCharacters));
  }, [selectedCharacters, duplicateCharactersBatch]);

  // Handle delete selected characters
  const handleDeleteClick = useCallback((mode: "only" | "with-current-chat" | "with-all-chats") => {
    if (selectedCharacters.size === 0) {
      return;
    }
    setDeleteMode(mode);
    setDeleteDialogOpen(true);
  }, [selectedCharacters.size]);

  // Confirm and execute delete
  const handleConfirmDelete = useCallback(() => {
    if (selectedCharacters.size === 0 || !deleteMode) {
      return;
    }

    // Note: The backend automatically deletes associated chats due to cascade delete
    // The deleteMode is kept for UI clarity, but all modes perform the same operation
    deleteCharactersBatch(Array.from(selectedCharacters));
  }, [selectedCharacters, deleteMode, deleteCharactersBatch]);

  useEffect(() => {
    if (!isLoading && characters) {
      setIsFilterChanging(false);
    }
  }, [isLoading, characters]);

  const skeletonCount = pagination?.limit || 20;

  return (
    <Container className="min-h-[calc(100vh-8rem)] flex flex-col relative py-6">
      <GlobalLoader isLoading={isFilterChanging && isLoading} />

      <div className="sticky top-0 z-30 bg-background pt-2 pb-3 mb-3">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">Characters</h1>
              <p className="text-sm text-muted-foreground">
                Discover, organize, and manage character cards with consistent filters and actions.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link href="/characters/create">
                <Button className="rounded-full gap-2">
                  <Plus className="size-4" />
                  Create Character
                </Button>
              </Link>
              <Button
                variant="secondary"
                className="rounded-full gap-2"
                onClick={() => setImportDialogOpen(true)}
              >
                <UserRound className="size-4" />
                Import
              </Button>
              <Button
                variant="secondary"
                className="rounded-full gap-2"
                onClick={() => setBulkImportDialogOpen(true)}
              >
                <DownloadIcon className="size-4 rotate-180" />
                Bulk Import
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="rounded-full shrink-0" variant="outline">
                    Character Actions <Menu className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-72" align="end">
                  <DropdownMenuLabel>Batch Actions</DropdownMenuLabel>
                  <DropdownMenuGroup>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>Sort: Name</DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                          {SORT_OPTIONS.slice(0, 2).map((option) => (
                            <DropdownMenuItem
                              key={option.label}
                              onClick={() => handleSort(option.sortBy, option.sortOrder)}
                            >
                              {option.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>Sort: Date</DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                          {SORT_OPTIONS.slice(2).map((option) => (
                            <DropdownMenuItem
                              key={option.label}
                              onClick={() => handleSort(option.sortBy, option.sortOrder)}
                            >
                              {option.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleDuplicateSelected}
                      disabled={selectedCharacters.size === 0 || isDuplicating}
                    >
                      {isDuplicating
                        ? `Duplicating ${selectedCharacters.size} character(s)...`
                        : `Duplicate Selected (${selectedCharacters.size})`}
                    </DropdownMenuItem>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>Create / Import</DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                          <Link href="/characters/create">
                            <DropdownMenuItem>Create Character</DropdownMenuItem>
                          </Link>
                          <DropdownMenuItem onClick={() => setImportDialogOpen(true)}>
                            Import Character
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setBulkImportDialogOpen(true)}>
                            Bulk Import Characters
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                    <DropdownMenuSeparator />
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>Delete Character</DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick("only")}
                            disabled={selectedCharacters.size === 0 || isDeleting}
                          >
                            Delete selected Character(s) only
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick("with-current-chat")}
                            disabled
                          >
                            Delete selected Character(s) and current chat
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick("with-all-chats")}
                            disabled
                          >
                            Delete selected Character(s), saved chat and current chat
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4 space-y-3">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="min-w-0">
            <SearchField
              placeholder="Search by character name or description"
              value={searchQuery}
              onChange={setSearchQuery}
              onDebouncedChange={handleDebouncedSearch}
              debounceMs={500}
              className="bg-surface-base"
            />
          </div>
          <div className="flex items-center gap-2">
            <ToggleSwitch
              options={[
                { label: "NSFW", value: "NSFW" },
                { label: "SFW", value: "SFW" },
              ]}
              defaultValue={ratingFilter || "SFW"}
              onChange={handleRatingChange}
              className="bg-surface-base"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="min-w-0">
            <MultiSelectFilter
              placeholder="Include tags"
              value={includeTags}
              onChange={handleIncludeTagsChange}
              defaultCategory={ratingFilter || "SFW"}
              className="rounded-full bg-surface-base border-border"
            />
          </div>
          <div className="min-w-0">
            <MultiSelectFilter
              placeholder="Exclude tags"
              value={excludeTags}
              onChange={handleExcludeTagsChange}
              defaultCategory={ratingFilter || "SFW"}
              className="rounded-full bg-surface-base border-border"
            />
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          {selectedCharacters.size > 0
            ? `${selectedCharacters.size} selected`
            : "Select cards to apply batch actions"}
        </div>
      </div>
      <div className="flex-1 min-h-0 flex flex-col">
        <Tabs
          value={activeTab}
          onValueChange={onTabChange}
          className="flex flex-col min-h-0 flex-1"
        >
          <div className="sticky top-24 z-20 bg-background py-2 mb-3">
            <TabsList className="grid h-auto w-full grid-cols-2 gap-2 sm:grid-cols-5">
              {TABS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="whitespace-nowrap">
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          <TabsContent value={activeTab} className="py-1 px-0 flex-1 min-h-0 mt-0">

            {isLoading && (!characters || characters.length === 0) ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: skeletonCount }).map((_, index) => (
                  <CharacterCardSkeleton key={`skeleton-${index}`} />
                ))}
              </div>
            ) : isError ? (
              <ErrorEmptyState
                type="error"
                error={error}
                onRetry={refetch}
                title="Failed to Load Characters"
                description="We encountered an issue while fetching characters. Please try again."
              />
            ) : !characters || characters.length === 0 ? (
              <ErrorEmptyState
                type="empty"
                title="No Characters Found"
                description="No character matches the current filters. Try changing search, tags, rating, or active tab."
              />
            ) : (
              <div
                className="grid grid-cols-1 lg:grid-cols-2 gap-4 transition-opacity duration-300"
                style={{ opacity: isLoading ? 0.5 : 1 }}
              >
                {characters.map((character) => (
                  <CharacterCard
                    key={character.id}
                    character={character}
                    isSelected={selectedCharacters.has(character.id)}
                    onSelect={handleCharacterSelect}
                  />
                ))}
                {/* Show skeletons while loading more */}
                {isLoading && characters.length > 0 && (
                  <>
                    {Array.from({ length: Math.min(4, skeletonCount - characters.length) }).map((_, index) => (
                      <CharacterCardSkeleton key={`loading-skeleton-${index}`} />
                    ))}
                  </>
                )}
              </div>
            )}

          </TabsContent>
        </Tabs>

        {!isLoading && !isError && pagination && totalPages && totalPages > 1 && (
          <div className="mt-6 pt-4 border-t border-border flex justify-center">
            <PaginationComponent
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      <div className="flex-none mt-auto">
        <Footer />
      </div>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-popover border-border rounded-3xl p-0 gap-0 overflow-hidden shadow-xl sm:max-w-md">
          <AlertDialogHeader className="px-6 pt-8 pb-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="flex size-14 items-center justify-center rounded-full bg-surface-active border-2 border-border">
                <TriangleAlert className="size-7 text-warning" aria-hidden />
              </div>
            </div>
            <AlertDialogTitle className="text-xl font-semibold text-center leading-tight">Delete Character(s)?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedCharacters.size === 1 ? (
                <>
                  Are you sure you want to delete this character? This action cannot be undone.
                  {deleteMode === "with-current-chat" || deleteMode === "with-all-chats" ? (
                    <span className="block mt-2 font-semibold text-destructive">
                      All associated chats will also be permanently deleted.
                    </span>
                  ) : null}
                </>
              ) : (
                <>
                  Are you sure you want to delete {selectedCharacters.size} character(s)? This action cannot be undone.
                  {deleteMode === "with-current-chat" || deleteMode === "with-all-chats" ? (
                    <span className="block mt-2 font-semibold text-destructive">
                      All associated chats will also be permanently deleted.
                    </span>
                  ) : null}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="px-6 py-4 bg-surface-subtle border-t border-border gap-3 justify-center flex-wrap">
            <AlertDialogCancel
              disabled={isDeleting}
              className="rounded-full border-border hover:bg-surface-hover text-foreground flex-1 sm:flex-initial"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="rounded-full bg-destructive text-destructive-foreground hover:bg-danger border-0 flex-1 sm:flex-initial"
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

      {/* Import Character Dialog */}
      <ImportCharacterDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImport={handleSingleImport}
        isLoading={isImporting}
        isBulk={false}
      />

      {/* Bulk Import Characters Dialog */}
      <ImportCharacterDialog
        open={bulkImportDialogOpen}
        onOpenChange={setBulkImportDialogOpen}
        onImport={handleBulkImport}
        isLoading={isBulkImporting}
        isBulk={true}
      />
    </Container >
  );
};

export default CharacterPage;