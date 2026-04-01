"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { PaginationComponent } from "@/components/elements/pagination-element";
import RealmCardSkeleton from "@/components/cards-skeletons/realm-card-skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Container from "@/components/elements/container";
import Footer from "@/components/layout/footer";
import MultiSelectFilter from "@/components/elements/multi-select-filter";
import SearchField from "@/components/elements/search-field";
import { ToggleSwitch } from "@/components/elements/toggle-switch";
import ErrorEmptyState from "@/components/elements/error-empty-state";
import GlobalLoader from "@/components/elements/global-loader";
import { useListRealms } from "@/hooks/realm";
import RealmCard from "@/components/cards/realm-card";
import { NewRealmSlot } from "@/components/cards/new-realm-slot";

const TABS = [
  { label: "All", value: "all" },
  { label: "Public", value: "public" },
  { label: "Private", value: "private" },
  { label: "Favourites", value: "favourite" },
] as const;

const SORT_OPTIONS = [
  { label: "A - Z", sortBy: "name" as const, sortOrder: "asc" as const },
  { label: "Z - A", sortBy: "name" as const, sortOrder: "desc" as const },
  { label: "Oldest to Newest", sortBy: "createdAt" as const, sortOrder: "asc" as const },
  { label: "Newest to Oldest", sortBy: "createdAt" as const, sortOrder: "desc" as const },
] satisfies Array<{
  label: string;
  sortBy: "createdAt" | "updatedAt" | "name";
  sortOrder: "asc" | "desc";
}>;

const RealmsPage = () => {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState<"SFW" | "NSFW" | undefined>("SFW");
  const [sortBy, setSortBy] = useState<"createdAt" | "updatedAt" | "name">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isFilterChanging, setIsFilterChanging] = useState(false);
  const [includeTags, setIncludeTags] = useState<string[]>([]);
  const [excludeTags, setExcludeTags] = useState<string[]>([]);

  const handleDebouncedSearch = useCallback((value: string) => {
    setDebouncedSearch(value);
    setPage(1);
  }, []);

  const handleSort = useCallback(
    (by: "createdAt" | "updatedAt" | "name", order: "asc" | "desc") => {
      setIsFilterChanging(true);
      setSortBy(by);
      setSortOrder(order);
      setPage(1);
    },
    []
  );

  const onTabChange = useCallback((value: string) => {
    setIsFilterChanging(true);
    setActiveTab(value);
    setPage(1);
  }, []);

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

  const filters = useMemo(() => {
    const base: {
      page: number;
      limit: number;
      sortBy: "createdAt" | "updatedAt" | "name";
      sortOrder: "asc" | "desc";
      rating?: "SFW" | "NSFW";
      search?: string;
      tags?: string[];
      excludeTags?: string[];
      visibility?: "public" | "private";
      isFavourite?: boolean;
    } = {
      page,
      limit: 12,
      sortBy,
      sortOrder,
    };

    if (ratingFilter) {
      base.rating = ratingFilter;
    }
    if (debouncedSearch.trim()) {
      base.search = debouncedSearch.trim();
    }
    if (includeTags.length > 0) {
      base.tags = includeTags;
    }
    if (excludeTags.length > 0) {
      base.excludeTags = excludeTags;
    }

    switch (activeTab) {
      case "public":
        base.visibility = "public";
        break;
      case "private":
        base.visibility = "private";
        break;
      case "favourite":
        base.isFavourite = true;
        break;
      default:
        break;
    }

    return base;
  }, [
    page,
    activeTab,
    debouncedSearch,
    ratingFilter,
    sortBy,
    sortOrder,
    includeTags,
    excludeTags,
  ]);

  const { data, isLoading, isError, error, refetch } = useListRealms(filters);

  const realms = data?.realms ?? [];
  const totalPages = data?.pagination?.totalPages ?? 1;

  useEffect(() => {
    if (!isLoading && data !== undefined) {
      setIsFilterChanging(false);
    }
  }, [isLoading, data]);

  const masonryClass =
    "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-x-4 gap-y-6";

  return (
    <Container className="relative flex min-h-[calc(100vh-8rem)] flex-col py-6">
      <GlobalLoader isLoading={isFilterChanging && isLoading} />

      <div className="sticky top-0 z-30 mb-3 pb-3 pt-2">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Realms</h1>
            <p className="text-sm text-muted-foreground">
              Create themed spaces, link characters, and open realm chats from one place.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/realms/create">
              <Button className="gap-2 rounded-full">
                <Plus className="size-4" />
                Create Realm
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="shrink-0 rounded-full" variant="outline">
                  Realm Actions <Menu className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-72" align="end">
                <DropdownMenuLabel>View &amp; sort</DropdownMenuLabel>
                <DropdownMenuGroup>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Sort: Name</DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        {SORT_OPTIONS.slice(0, 2).map((opt) => (
                          <DropdownMenuItem
                            key={opt.label}
                            onClick={() => handleSort(opt.sortBy, opt.sortOrder)}
                          >
                            {opt.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Sort: Date</DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        {SORT_OPTIONS.slice(2).map((opt) => (
                          <DropdownMenuItem
                            key={opt.label}
                            onClick={() => handleSort(opt.sortBy, opt.sortOrder)}
                          >
                            {opt.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                  <DropdownMenuSeparator />
                  <Link href="/realms/create">
                    <DropdownMenuItem>Create Realm</DropdownMenuItem>
                  </Link>
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
              placeholder="Search by realm name or description"
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
              className="rounded-full border-border bg-surface-base"
            />
          </div>
          <div className="min-w-0">
            <MultiSelectFilter
              placeholder="Exclude tags"
              value={excludeTags}
              onChange={handleExcludeTagsChange}
              defaultCategory={ratingFilter || "SFW"}
              className="rounded-full border-border bg-surface-base"
            />
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          Use tabs and filters to browse realms. Realm cards support actions from each card menu.
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <Tabs value={activeTab} onValueChange={onTabChange} className="flex min-h-0 flex-1 flex-col">
          <div className="sticky top-24 z-20 mb-3 ">
            <TabsList className="grid h-auto w-full grid-cols-2 gap-2 sm:grid-cols-4">
              {TABS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="whitespace-nowrap">
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value={activeTab} className="mt-0 min-h-0 flex-1 px-0 py-1">
            {isLoading && realms.length === 0 ? (
              <div className={`mt-4 grid ${masonryClass}`}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <RealmCardSkeleton key={`skeleton-${i}`} />
                ))}
              </div>
            ) : isError ? (
              <ErrorEmptyState
                type="error"
                error={error}
                onRetry={() => refetch()}
                title="Failed to load realms"
                description="Something went wrong while fetching realms. Try again."
              />
            ) : !realms.length ? (
              <ErrorEmptyState
                type="empty"
                title="No realms found"
                description="No realm matches the current filters. Try another tab, search, tags, or rating."
              />
            ) : (
              <div className="mt-4" style={{ opacity: isLoading ? 0.5 : 1 }}>
                <div className={`grid ${masonryClass}`}>
                  <NewRealmSlot onClick={() => router.push("/realms/create")} />
                  {realms.map((realm) => (
                    <RealmCard key={realm.id} folder={realm} />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {!isLoading && !isError && totalPages > 1 && (
          <div className="mt-6 flex justify-center border-t border-border pt-4">
            <PaginationComponent
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      <div className="mt-auto flex-none">
        <Footer />
      </div>
    </Container>
  );
};

export default RealmsPage;
