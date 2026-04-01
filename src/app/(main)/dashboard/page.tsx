"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpenText,
  Flame,
  Layers3,
  Plus,
  Search,
  Sparkles,
  UserCircle2,
  Users,
} from "lucide-react";
import Container from "@/components/elements/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Footer from "@/components/layout/footer";
import RealmCard from "@/components/cards/realm-card";
import { useListCharacters } from "@/hooks/character/use-list-characters";
import { useListRealms } from "@/hooks/realm/use-list-realms";
import { useListPersonas } from "@/hooks/persona/use-list-personas";
import { useListLorebooks } from "@/hooks/lorebook/use-list-lorebooks";

const DashboardPage = () => {
  const { characters, total: totalCharacters, isLoading: loadingCharacters } = useListCharacters({
    filters: { page: 1, limit: 8, sortBy: "updatedAt", sortOrder: "desc" },
  });
  const { data: realmsData, isLoading: loadingRealms } = useListRealms({
    page: 1,
    limit: 8,
    sortBy: "updatedAt",
    sortOrder: "desc",
  });
  const { personas, total: totalPersonas, isLoading: loadingPersonas } = useListPersonas({
    filters: { page: 1, limit: 4, sortBy: "updatedAt", sortOrder: "desc" },
  });
  const { lorebooks, total: totalLorebooks, isLoading: loadingLorebooks } = useListLorebooks({
    filters: { page: 1, limit: 4, sortBy: "updatedAt", sortOrder: "desc" },
  });

  const realms = realmsData?.realms ?? [];
  const totalRealms = realmsData?.pagination?.total ?? 0;

  const statPills = useMemo(
    () => [
      { label: "Characters", value: totalCharacters ?? 0, href: "/characters", icon: UserCircle2, tone: "from-indigo-500/20 to-cyan-500/10" },
      { label: "Realms", value: totalRealms, href: "/realms", icon: Sparkles, tone: "from-violet-500/20 to-fuchsia-500/10" },
      { label: "Personas", value: totalPersonas ?? 0, href: "/personas", icon: Users, tone: "from-emerald-500/20 to-teal-500/10" },
      { label: "Lorebooks", value: totalLorebooks ?? 0, href: "/lorebooks", icon: BookOpenText, tone: "from-amber-500/20 to-orange-500/10" },
    ],
    [totalCharacters, totalRealms, totalPersonas, totalLorebooks]
  );

  return (
    <>
      <div className="flex-1 bg-transparent text-white">
        <Container className="py-8 md:py-10">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
            <section className="p-1 md:p-2">
              <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-white/55">Welcome back</p>
                  <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                    Discover and create across character flow
                  </h1>
                </div>
                <div className="flex gap-2">
                  <Button asChild size="sm">
                    <Link href="/characters/create">
                      <Plus className="h-4 w-4" /> Create Character
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="secondary">
                    <Link href="/realms">
                      <Search className="h-4 w-4" /> Explore
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                {statPills.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.label} href={item.href} className="block">
                      <div className={`rounded-xl border border-white/10 bg-linear-to-br ${item.tone} p-3 transition-transform duration-200 hover:-translate-y-0.5`}>
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs text-white/70">{item.label}</span>
                          <Icon className="h-4 w-4 text-white/70" />
                        </div>
                        <div className="flex items-end justify-between">
                          <p className="text-2xl font-semibold text-white">{item.value}</p>
                          <ArrowRight className="h-3.5 w-3.5 text-white/55" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>

            <section className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-white/70" />
                  <h2 className="text-sm font-medium text-white/90">For you</h2>
                </div>
                <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-hidden pb-2 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {loadingCharacters
                    ? Array.from({ length: 4 }).map((_, i) => (
                      <Card key={i} className="min-w-[270px] snap-start border-white/10 bg-card/70">
                        <CardContent className="p-3">
                          <Skeleton className="h-36 w-full rounded-lg bg-white/10" />
                        </CardContent>
                      </Card>
                    ))
                    : characters.slice(0, 4).map((character) => (
                      <Link key={character.id} href={`/chat/new/char/${character.id}`} className="min-w-[270px] ">
                        <div className="group relative h-36 overflow-hidden rounded-xl border border-white/10">
                          {character.avatar?.url ? (
                            <img
                              src={character.avatar.url}
                              alt={character.name}
                              className="h-full w-full object-cover brightness-100  transition-transform duration-500 "
                            />
                          ) : (
                            <div className="h-full w-full bg-linear-to-br from-primary/30 via-primary/10 to-transparent" />
                          )}
                          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/5 via-black/10 to-transparent opacity-30 transition-opacity duration-300 group-hover:opacity-95" />
                          <div className="absolute inset-x-0 bottom-0 p-3 transition-all duration-300">
                            <p className="truncate text-sm font-semibold text-white">{character.name}</p>
                            <p className="mt-1 line-clamp-2 text-xs text-white/80">
                              {character.description?.trim() || "Start a conversation with this character."}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <UserCircle2 className="h-4 w-4 text-white/70" />
                  <h2 className="text-sm font-medium text-white/90">Character picks</h2>
                </div>
                <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto overflow-y-hidden pb-2 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {loadingCharacters
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="min-w-[280px] max-w-[280px] sm:min-w-[320px] sm:max-w-[320px] snap-start rounded-2xl border border-white/10 bg-white/3 p-3">
                        <div className="flex items-start gap-3">
                          <Skeleton className="h-24 w-24 rounded-xl bg-white/10" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-5 w-40 bg-white/10" />
                            <Skeleton className="h-4 w-28 bg-white/10" />
                            <Skeleton className="h-4 w-52 bg-white/10" />
                            <Skeleton className="h-4 w-36 bg-white/10" />
                          </div>
                        </div>
                      </div>
                    ))
                    : characters.slice(0, 6).map((character) => (
                      <Link key={character.id} href={`/chat/new/char/${character.id}`} className="min-w-[280px] max-w-[280px] sm:min-w-[320px] sm:max-w-[320px] snap-start">
                        <div className="h-[136px] rounded-2xl border border-white/10 bg-white/3 p-2.5 transition-colors hover:bg-white/6">
                          <div className="flex items-start  gap-3">
                            <div className="h-24 w-24 overflow-hidden rounded-xl border border-white/10 bg-black/20">
                              {character.avatar?.url ? (
                                <img src={character.avatar.url} alt={character.name} className="h-full w-full object-cover brightness-110" />
                              ) : (
                                <div className="h-full w-full bg-linear-to-br from-primary/25 to-transparent" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1 ">
                              <p className="truncate text-base font-semibold leading-tight text-white">{character.name}</p>
                              <p className="mt-1.5 line-clamp-2 text-sm text-white/90">
                                {character.description?.trim() || "Start a conversation with this character."}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-white/70" />
                  <h2 className="text-sm font-medium text-white/90">Realms spotlight</h2>
                </div>
                <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-hidden pb-2 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {loadingRealms
                    ? Array.from({ length: 4 }).map((_, i) => (
                      <Card key={i} className="min-w-[288px] snap-start border-white/10 bg-card/70">
                        <CardContent className="p-3">
                          <Skeleton className="mb-3 h-20 w-full rounded-lg bg-white/10" />
                          <Skeleton className="h-4 w-36 bg-white/10" />
                          <Skeleton className="mt-1 h-3 w-24 bg-white/10" />
                        </CardContent>
                      </Card>
                    ))
                    : realms.slice(0, 4).map((realm: { id: string; name: string; description?: string; characters?: { id: string; name: string; avatar?: { url: string } }[]; isFavourite?: boolean; rating?: "SFW" | "NSFW"; visibility?: "public" | "private"; updatedAt?: string; avatar?: { url: string } }) => (
                      <RealmCard key={realm.id} folder={realm} />
                    ))}
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-white/70" />
                  <h3 className="text-sm font-medium text-white/90">Personas spotlight</h3>
                </div>
                <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto overflow-y-hidden pb-2 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {loadingPersonas ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="min-w-[280px] max-w-[280px] sm:min-w-[320px] sm:max-w-[320px] snap-start rounded-2xl border border-white/10 bg-white/3 p-3">
                        <div className="flex items-start gap-3">
                          <Skeleton className="h-24 w-24 rounded-xl bg-white/10" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-5 w-40 bg-white/10" />
                            <Skeleton className="h-4 w-28 bg-white/10" />
                            <Skeleton className="h-4 w-52 bg-white/10" />
                            <Skeleton className="h-4 w-36 bg-white/10" />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : personas.length > 0 ? (
                    personas.map((persona) => (
                      <Link key={persona.id} href={`/personas/${persona.id}`} className="min-w-[280px] max-w-[280px] sm:min-w-[320px] sm:max-w-[320px] snap-start">
                        <div className="h-[136px] rounded-2xl border border-white/10 bg-white/3 p-2.5 transition-colors hover:bg-white/6">
                          <div className="flex items-start gap-3">
                            <div className="h-24 w-24 overflow-hidden rounded-xl border border-white/10 bg-black/20">
                              {persona.avatar?.url ? (
                                <img src={persona.avatar.url} alt={persona.name} className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full bg-linear-to-br from-primary/25 to-transparent" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-base font-semibold leading-tight text-white">{persona.name}</p>
                              <p className="mt-1.5 line-clamp-2 text-sm text-white/90">
                                {persona.description?.trim() || "No description available."}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-white/60">No personas yet.</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Layers3 className="h-4 w-4 text-white/70" />
                  <h3 className="text-sm font-medium text-white/90">Lorebooks spotlight</h3>
                </div>
                <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto overflow-y-hidden pb-2 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {loadingLorebooks ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="min-w-[280px] max-w-[280px] sm:min-w-[320px] sm:max-w-[320px] snap-start rounded-2xl border border-white/10 bg-white/3 p-3">
                        <div className="flex items-start gap-3">
                          <Skeleton className="h-24 w-24 rounded-xl bg-white/10" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-5 w-40 bg-white/10" />
                            <Skeleton className="h-4 w-28 bg-white/10" />
                            <Skeleton className="h-4 w-52 bg-white/10" />
                            <Skeleton className="h-4 w-36 bg-white/10" />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : lorebooks.length > 0 ? (
                    lorebooks.map((lorebook) => {
                      const lorebookImageUrl =
                        (lorebook as { image?: { url?: string } }).image?.url ??
                        (lorebook as { avatar?: { url?: string } }).avatar?.url;
                      return (
                      <Link key={lorebook.id} href={`/lorebooks/${lorebook.id}`} className="min-w-[280px] max-w-[280px] sm:min-w-[320px] sm:max-w-[320px] snap-start">
                        <div className="h-[136px] rounded-2xl border border-white/10 bg-white/3 p-2.5 transition-colors hover:bg-white/6">
                          <div className="flex items-start gap-3">
                            <div className="h-24 w-24 overflow-hidden rounded-xl border border-white/10 bg-black/20">
                              {lorebookImageUrl ? (
                                <img src={lorebookImageUrl} alt={lorebook.name} className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full bg-linear-to-br from-primary/25 to-transparent" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-base font-semibold leading-tight text-white">{lorebook.name}</p>
                              <p className="mt-1.5 line-clamp-2 text-sm text-white/90">
                                {lorebook.description?.trim() || "No description available."}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    )})
                  ) : (
                    <p className="text-sm text-white/60">No lorebooks yet.</p>
                  )}
                </div>
              </div>
            </section>
          </div>
        </Container>
      </div>
      <Footer />
    </>
  );
};

export default DashboardPage;
