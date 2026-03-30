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
import { BookOpen, DownloadIcon, Loader2, Menu, Plus, Trash2, TriangleAlert } from "lucide-react";
import Link from "next/link";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { PaginationComponent } from "@/components/elements/pagination-element";
import LorebookCard from "@/components/cards/lorebook-card";
import LorebookCardSkeleton from "../cards-skeletons/lorebook-card-skeleton";
import ErrorEmptyState from "../elements/error-empty-state";
import SearchField from "../elements/search-field";
import { ToggleSwitch } from "../elements/toggle-switch";
import { useListLorebooks, useDeleteLorebook, useImportLorebook, type LorebookListFilters } from "@/hooks";
import GlobalLoader from "../elements/global-loader";
import MultiSelectFilter from "../elements/multi-select-filter";
import ImportLorebookDialog from "../elements/import-lorebook-dialog";
import Footer from "@/components/layout/footer";
import { queryKeys } from "@/lib/api/shared/query-keys";

// Utility for tab mapping
const TABS = [
    { label: "All", value: "all" },
    { label: "Public", value: "public" },
    { label: "Saved", value: "saved" },
    { label: "Private", value: "private" },
    { label: "Favourites", value: "favourite" },
];

const SORT_OPTIONS: Array<{
    label: string;
    sortBy: "createdAt" | "updatedAt" | "name";
    sortOrder: "asc" | "desc";
}> = [
        {
            label: "A - Z",
            sortBy: "name",
            sortOrder: "asc",
        },
        {
            label: "Z - A",
            sortBy: "name",
            sortOrder: "desc",
        },
        {
            label: "Oldest to Newest",
            sortBy: "createdAt",
            sortOrder: "asc",
        },
        {
            label: "Newest to Oldest",
            sortBy: "createdAt",
            sortOrder: "desc",
        },
    ];

const LorebookPage = () => {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [activeTab, setActiveTab] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
    const [ratingFilter, setRatingFilter] = useState<"SFW" | "NSFW" | undefined>("SFW");
    const [sortBy, setSortBy] = useState<"createdAt" | "updatedAt" | "name">("createdAt");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [isFilterChanging, setIsFilterChanging] = useState(false);
    const [selectedLorebooks, setSelectedLorebooks] = useState<Set<string>>(new Set());
    const [includeTags, setIncludeTags] = useState<string[]>([]);
    const [excludeTags, setExcludeTags] = useState<string[]>([]);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [importDialogOpen, setImportDialogOpen] = useState(false);
    const [bulkImportDialogOpen, setBulkImportDialogOpen] = useState(false);

    // Handle debounced search change
    const handleDebouncedSearch = useCallback((value: string) => {
        setDebouncedSearchQuery(value);
        setPage(1);
    }, []);

    const handleSort = useCallback(
        (sortBy: "createdAt" | "updatedAt" | "name", sortOrder: "asc" | "desc") => {
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

    // Handle lorebook selection
    const handleLorebookSelect = useCallback((lorebookId: string, isSelected: boolean) => {
        setSelectedLorebooks((prev) => {
            const newSet = new Set(prev);
            if (isSelected) {
                newSet.add(lorebookId);
            } else {
                newSet.delete(lorebookId);
            }
            return newSet;
        });
    }, []);

    const filters = useMemo<LorebookListFilters>(() => {
        if (activeTab === "all") {
            const allFilters: LorebookListFilters = {
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

        const baseFilters: LorebookListFilters = {
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
        lorebooks,
        isLoading,
        isError,
        error,
        pagination,
        totalPages,
        refetch,
    } = useListLorebooks({
        filters,
        showErrorToast: true,
    });

    const {
        deleteLorebooksBatch,
        isLoading: isDeleting,
    } = useDeleteLorebook({
        onSuccess: () => {
            setSelectedLorebooks(new Set()); // Clear selection after deletion
            setDeleteDialogOpen(false);
            refetch(); // Refresh the list
        },
    });

    const refetchTags = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: queryKeys.tags.lists() });
        queryClient.refetchQueries({ queryKey: queryKeys.tags.lists(), type: "active" });
    }, [queryClient]);

    const { importLorebook, isImporting } = useImportLorebook({ showToasts: true });

    const handleSingleImport = useCallback(
        (files: File[]) => {
            if (files.length > 0) {
                importLorebook(files[0]).then(() => {
                    setImportDialogOpen(false);
                    refetch();
                    refetchTags();
                });
            }
        },
        [importLorebook, refetch, refetchTags]
    );

    const handleBulkImport = useCallback(
        async (files: File[]) => {
            for (const file of files) {
                await importLorebook(file);
            }
            setBulkImportDialogOpen(false);
            refetch();
            refetchTags();
        },
        [importLorebook, refetch, refetchTags]
    );

    // Handle delete selected lorebooks
    const handleDeleteClick = useCallback(() => {
        if (selectedLorebooks.size === 0) {
            return;
        }
        setDeleteDialogOpen(true);
    }, [selectedLorebooks.size]);

    // Confirm and execute delete
    const handleConfirmDelete = useCallback(() => {
        if (selectedLorebooks.size === 0) {
            return;
        }

        deleteLorebooksBatch(Array.from(selectedLorebooks));
    }, [selectedLorebooks, deleteLorebooksBatch]);

    useEffect(() => {
        if (!isLoading && lorebooks) {
            setIsFilterChanging(false);
        }
    }, [isLoading, lorebooks]);

    const skeletonCount = pagination?.limit || 20;

    return (
        <Container className="min-h-[calc(100vh-8rem)] flex flex-col relative py-6">
            <GlobalLoader isLoading={isFilterChanging && isLoading} />

            <div className="sticky top-0 z-30 bg-background pt-2 pb-3 mb-3">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Lorebooks</h1>
                        <p className="text-sm text-muted-foreground">
                            Organize, filter, and manage your lorebook collections in one place.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Link href="/lorebooks/create">
                            <Button className="rounded-full gap-2">
                                <Plus className="size-4" />
                                Create Lorebook
                            </Button>
                        </Link>
                        <Button variant="secondary" className="rounded-full gap-2" onClick={() => setImportDialogOpen(true)}>
                            <BookOpen className="size-4" />
                            Import
                        </Button>
                        <Button variant="secondary" className="rounded-full gap-2" onClick={() => setBulkImportDialogOpen(true)}>
                            <DownloadIcon className="size-4 rotate-180" />
                            Bulk Import
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button className="rounded-full shrink-0" variant="outline">
                                    Lorebook Actions <Menu className="ml-2 h-4 w-4" />
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
                                    <DropdownMenuSub>
                                        <DropdownMenuSubTrigger>Create / Import</DropdownMenuSubTrigger>
                                        <DropdownMenuPortal>
                                            <DropdownMenuSubContent>
                                                <Link href="/lorebooks/create">
                                                    <DropdownMenuItem>Create Lorebook</DropdownMenuItem>
                                                </Link>
                                                <DropdownMenuItem onClick={() => setImportDialogOpen(true)}>
                                                    Import Single Lorebook
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setBulkImportDialogOpen(true)}>
                                                    Bulk Import Lorebooks
                                                </DropdownMenuItem>
                                            </DropdownMenuSubContent>
                                        </DropdownMenuPortal>
                                    </DropdownMenuSub>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        variant="destructive"
                                        onClick={handleDeleteClick}
                                        disabled={selectedLorebooks.size === 0 || isDeleting}
                                    >
                                        Delete Selected {selectedLorebooks.size > 0 && `(${selectedLorebooks.size})`}
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            <div className="mb-4 space-y-3">
                <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                    <div className="min-w-0">
                        <SearchField
                            placeholder="Search by lorebook name or description"
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
                    {selectedLorebooks.size > 0
                        ? `${selectedLorebooks.size} selected`
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
                        <TabsList className="grid h-auto w-full grid-cols-2 gap-2 rounded-full border border-border bg-surface-subtle p-1.5 sm:grid-cols-5">
                            {TABS.map((tab) => (
                                <TabsTrigger
                                    key={tab.value}
                                    value={tab.value}
                                    className="whitespace-nowrap rounded-full text-muted-foreground data-[state=active]:bg-surface-base data-[state=active]:text-foreground"
                                >
                                    {tab.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>
                    <TabsContent value={activeTab} className="py-1 px-0 flex-1 min-h-0 mt-0">
                        {isLoading && (!lorebooks || lorebooks.length === 0) ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {Array.from({ length: skeletonCount }).map((_, index) => (
                                    <LorebookCardSkeleton key={`skeleton-${index}`} />
                                ))}
                            </div>
                        ) : isError ? (
                            <ErrorEmptyState
                                type="error"
                                error={error}
                                onRetry={refetch}
                                title="Failed to Load Lorebooks"
                                description="We encountered an issue while fetching lorebooks. Please try again."
                            />
                        ) : !lorebooks || lorebooks.length === 0 ? (
                            <ErrorEmptyState
                                type="empty"
                                title="No Lorebooks Found"
                                description="No lorebook matches the current filters. Try changing search, tags, rating, or active tab."
                            />
                        ) : (
                            <div
                                className="grid grid-cols-1 lg:grid-cols-2 gap-4 transition-opacity duration-300"
                                style={{ opacity: isLoading ? 0.5 : 1 }}
                            >
                                {lorebooks.map((lorebook) => (
                                    <LorebookCard
                                        key={lorebook.id}
                                        lorebook={lorebook}
                                        isSelected={selectedLorebooks.has(lorebook.id)}
                                        onSelect={handleLorebookSelect}
                                    />
                                ))}
                                {/* Show skeletons while loading more */}
                                {isLoading && lorebooks.length > 0 && (
                                    <>
                                        {Array.from({ length: Math.min(4, skeletonCount - lorebooks.length) }).map((_, index) => (
                                            <LorebookCardSkeleton key={`loading-skeleton-${index}`} />
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
                        <AlertDialogTitle className="text-xl font-semibold text-center leading-tight">Delete Lorebook(s)?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {selectedLorebooks.size === 1 ? (
                                <>
                                    Are you sure you want to delete this lorebook? This action cannot be undone and all associated entries will be permanently deleted.
                                </>
                            ) : (
                                <>
                                    Are you sure you want to delete {selectedLorebooks.size} lorebook(s)? This action cannot be undone and all associated entries will be permanently deleted.
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

            {/* Import Lorebook Dialog */}
            <ImportLorebookDialog
                open={importDialogOpen}
                onOpenChange={setImportDialogOpen}
                onImport={handleSingleImport}
                isLoading={isImporting}
                isBulk={false}
            />

            {/* Bulk Import Lorebooks Dialog */}
            <ImportLorebookDialog
                open={bulkImportDialogOpen}
                onOpenChange={setBulkImportDialogOpen}
                onImport={handleBulkImport}
                isLoading={isImporting}
                isBulk={true}
            />
        </Container>
    );
};

export default LorebookPage;
