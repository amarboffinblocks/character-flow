"use client";
import React, { useState, useMemo, useCallback, useEffect } from "react";
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
import { CopyPlus, Loader2, Menu, Plus, Trash2, TriangleAlert } from "lucide-react";
import Link from "next/link";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { PaginationComponent } from "@/components/elements/pagination-element";
import PersonaCard from "@/components/cards/persona-card";
import PersonaCardSkeleton from "../cards-skeletons/persona-card-skeleton";
import ErrorEmptyState from "../elements/error-empty-state";
import SearchField from "../elements/search-field";
import { ToggleSwitch } from "../elements/toggle-switch";
import { useListPersonas, useDeletePersona, useDuplicatePersona, type PersonaListFilters } from "@/hooks";
import GlobalLoader from "../elements/global-loader";
import MultiSelectFilter from "../elements/multi-select-filter";
import Footer from "@/components/layout/footer";

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

const PersonaPage = () => {
    const [page, setPage] = useState(1);
    const [activeTab, setActiveTab] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
    const [ratingFilter, setRatingFilter] = useState<"SFW" | "NSFW" | undefined>("SFW");
    const [sortBy, setSortBy] = useState<"createdAt" | "updatedAt" | "name">("createdAt");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [isFilterChanging, setIsFilterChanging] = useState(false);
    const [selectedPersonas, setSelectedPersonas] = useState<Set<string>>(new Set());
    const [includeTags, setIncludeTags] = useState<string[]>([]);
    const [excludeTags, setExcludeTags] = useState<string[]>([]);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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

    // Handle persona selection
    const handlePersonaSelect = useCallback((personaId: string, isSelected: boolean) => {
        setSelectedPersonas((prev) => {
            const newSet = new Set(prev);
            if (isSelected) {
                newSet.add(personaId);
            } else {
                newSet.delete(personaId);
            }
            return newSet;
        });
    }, []);

    const filters = useMemo<PersonaListFilters>(() => {
        if (activeTab === "all") {
            const allFilters: PersonaListFilters = {
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

        const baseFilters: PersonaListFilters = {
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
        personas,
        isLoading,
        isError,
        error,
        pagination,
        totalPages,
        refetch,
    } = useListPersonas({
        filters,
        showErrorToast: true,
    });

    const {
        deletePersonasBatch,
        isLoading: isDeleting,
    } = useDeletePersona({
        onSuccess: () => {
            setSelectedPersonas(new Set()); // Clear selection after deletion
            setDeleteDialogOpen(false);
            refetch(); // Refresh the list
        },
    });

    const {
        duplicatePersonasBatch,
        isBatchDuplicating,
    } = useDuplicatePersona({
        showToasts: true,
    });



    // Handle batch duplicate
    const handleBatchDuplicate = useCallback(async () => {
        if (selectedPersonas.size === 0) return;

        try {
            await duplicatePersonasBatch(Array.from(selectedPersonas));
            setSelectedPersonas(new Set());
            refetch();
        } catch {
            // Error handled by hook
        }
    }, [selectedPersonas, duplicatePersonasBatch, refetch]);

    // Handle delete selected personas
    const handleDeleteClick = useCallback(() => {
        if (selectedPersonas.size === 0) {
            return;
        }
        setDeleteDialogOpen(true);
    }, [selectedPersonas.size]);

    // Confirm and execute delete
    const handleConfirmDelete = useCallback(() => {
        if (selectedPersonas.size === 0) {
            return;
        }

        deletePersonasBatch(Array.from(selectedPersonas));
    }, [selectedPersonas, deletePersonasBatch]);

    useEffect(() => {
        if (!isLoading && personas) {
            setIsFilterChanging(false);
        }
    }, [isLoading, personas]);

    const skeletonCount = pagination?.limit || 20;

    return (
        <Container className="min-h-[calc(100vh-8rem)] flex flex-col relative py-6">
            <GlobalLoader isLoading={isFilterChanging && isLoading} />

            <div className="sticky top-0 z-30 bg-background pt-2 pb-3 mb-3">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Personas</h1>
                        <p className="text-sm text-muted-foreground">
                            Create and manage persona profiles with consistent filters and actions.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Link href="/personas/create">
                            <Button className="rounded-full gap-2">
                                <Plus className="size-4" />
                                Create Persona
                            </Button>
                        </Link>
                        <Button variant="secondary" className="rounded-full gap-2" onClick={handleBatchDuplicate} disabled={selectedPersonas.size === 0 || isBatchDuplicating}>
                            <CopyPlus className="size-4" />
                            {isBatchDuplicating ? "Duplicating..." : "Duplicate"}
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button className="rounded-full shrink-0" variant="outline">
                                    Persona Actions <Menu className="ml-2 h-4 w-4" />
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
                                    <Link href="/personas/create">
                                        <DropdownMenuItem>Create Persona</DropdownMenuItem>
                                    </Link>
                                    <DropdownMenuItem
                                        onClick={handleBatchDuplicate}
                                        disabled={selectedPersonas.size === 0 || isBatchDuplicating}
                                    >
                                        Duplicate Selected ({selectedPersonas.size})
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        variant="destructive"
                                        onClick={handleDeleteClick}
                                        disabled={selectedPersonas.size === 0 || isDeleting}
                                    >
                                        Delete Selected {selectedPersonas.size > 0 && `(${selectedPersonas.size})`}
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
                            placeholder="Search by persona name or description"
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
                    {selectedPersonas.size > 0
                        ? `${selectedPersonas.size} selected`
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
                        {isLoading && (!personas || personas.length === 0) ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {Array.from({ length: skeletonCount }).map((_, index) => (
                                    <PersonaCardSkeleton key={`skeleton-${index}`} />
                                ))}
                            </div>
                        ) : isError ? (
                            <ErrorEmptyState
                                type="error"
                                error={error}
                                onRetry={refetch}
                                title="Failed to Load Personas"
                                description="We encountered an issue while fetching personas. Please try again."
                            />
                        ) : !personas || personas.length === 0 ? (
                            <ErrorEmptyState
                                type="empty"
                                title="No Personas Found"
                                description="No persona matches the current filters. Try changing search, tags, rating, or active tab."
                            />
                        ) : (
                            <div
                                className="grid grid-cols-1 lg:grid-cols-2 gap-4 transition-opacity duration-300"
                                style={{ opacity: isLoading ? 0.5 : 1 }}
                            >
                                {personas.map((persona) => (
                                    <PersonaCard
                                        key={persona.id}
                                        persona={persona}
                                        isSelected={selectedPersonas.has(persona.id)}
                                        onSelect={handlePersonaSelect}
                                    />
                                ))}
                                {/* Show skeletons while loading more */}
                                {isLoading && personas.length > 0 && (
                                    <>
                                        {Array.from({ length: Math.min(4, skeletonCount - personas.length) }).map((_, index) => (
                                            <PersonaCardSkeleton key={`loading-skeleton-${index}`} />
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
                        <AlertDialogTitle className="text-xl font-semibold text-center leading-tight">Delete Persona(s)?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {selectedPersonas.size === 1 ? (
                                <>
                                    Are you sure you want to delete this persona? This action cannot be undone.
                                </>
                            ) : (
                                <>
                                    Are you sure you want to delete {selectedPersonas.size} persona(s)? This action cannot be undone.
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


        </Container>
    );
};

export default PersonaPage;
