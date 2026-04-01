"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useGetCharacter } from "@/hooks";
import { cn } from "@/lib/utils";
import {
  User,
  Sparkles,
  MessageSquare,
  Hash,
  BookOpen,
  Globe,
  Calendar,
  Zap,
  Link2,
  X,
} from "lucide-react";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils/date-utils";

interface CharacterPreviewProps {
  characterId?: string;
  onClose?: () => void;
}

const DetailSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}> = ({ title, icon, children, className }) => (
  <div className={cn("space-y-2.5", className)}>
    <div className="flex items-center gap-2 text-[11px] font-semibold text-white/90 uppercase tracking-widest">
      {icon}
      {title}
    </div>
    <div className="text-sm text-white/70 leading-relaxed">{children}</div>
  </div>
);

const CharacterPreview: React.FC<CharacterPreviewProps> = ({ characterId, onClose }) => {
  const { character, isLoading } = useGetCharacter(characterId, {
    enabled: !!characterId,
  });

  if (!characterId) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center relative">
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close preview"
            className="absolute top-2 right-2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 hover:bg-primary/30 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-8 w-full max-w-[220px]">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <User className="h-7 w-7 text-primary/50" />
          </div>
          <p className="text-sm text-muted-foreground">No character in this chat</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-full animate-pulse relative">
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close preview"
            className="absolute top-2 right-2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 hover:bg-primary/30 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <div className="h-32 rounded-t-xl bg-primary/15" />
        <div className="flex justify-center -mt-14 px-4">
          <div className="h-24 w-24 rounded-full bg-primary/20 border-4 border-background shadow-lg" />
        </div>
        <div className="space-y-4 px-4 pt-6 pb-6">
          <div className="space-y-2 text-center">
            <div className="h-5 w-24 mx-auto rounded-md bg-primary/15" />
            <div className="flex justify-center gap-2">
              <div className="h-5 w-12 rounded-full bg-primary/10" />
              <div className="h-5 w-14 rounded-full bg-primary/10" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 w-full rounded bg-primary/10" />
            <div className="h-3 w-4/5 rounded bg-primary/10" />
            <div className="h-3 w-3/4 rounded bg-primary/10" />
          </div>
        </div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center relative">
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close preview"
            className="absolute top-2 right-2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 hover:bg-primary/30 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-8 w-full max-w-[220px]">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <User className="h-7 w-7 text-primary/50" />
          </div>
          <p className="text-sm text-muted-foreground">Character not found</p>
        </div>
      </div>
    );
  }

  const avatarUrl = character.avatar?.url || "/logo1.png";
  const avatarFallback = character.name.charAt(0).toUpperCase() || "CN";
  const backgroundUrl = character.backgroundImg?.url;
  const hasTags = character.tags && character.tags.length > 0;

  return (
    <div className="relative h-full border-l border-white/10 bg-linear-to-b from-[#3a3b3f] via-[#2f3034] to-[#2b2c30] text-white">
      {/* Close button stays visible while preview content scrolls */}
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Close preview"
          className="absolute top-2 right-2 z-30 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/35 text-white/90 backdrop-blur-sm transition-colors hover:bg-black/60 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      <div className="h-full overflow-y-auto">
      {/* LinkedIn-style: Background banner + overlapping avatar */}
      <div className="relative">
        {/* Background / Cover image */}
        <div
          className={cn("relative z-0 h-30 w-full bg-center bg-cover bg-white/35")}
          style={
            backgroundUrl
              ? { backgroundImage: `url(${backgroundUrl})` }
              : undefined
          }
        >

        </div>

        {/* Avatar overlapping bottom of banner */}
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-12 z-10">
          <Avatar className="h-24 w-24 rounded-full border-4 border-[#2f3034] shadow-xl ring-2 ring-white/40">
            <AvatarImage src={avatarUrl} alt={character.name} className="object-cover" />
            <AvatarFallback className="bg-primary/70 text-2xl font-semibold text-white">
              {avatarFallback}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-16 pb-6 space-y-5">
        {/* Name & meta */}
        <div className="text-center space-y-2">
          <h2 className="truncate text-3xl font-semibold text-white">
            {character.name}
          </h2>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <Badge
              variant="secondary"
              className="border border-white/20 bg-[#1f2023] px-2 py-0 text-[10px] font-medium text-white"
            >
              {character.rating}
            </Badge>
            <Badge
              variant="outline"
              className="border-white/35 bg-transparent px-2 py-0 text-[10px] font-normal text-white capitalize"
            >
              {character.visibility}
            </Badge>
            {character.tokens != null && (
              <span className="flex items-center gap-1 text-xs text-white/65">
                <Zap className="h-3.5 w-3.5" />
                {character.tokens.toLocaleString()} tokens
              </span>
            )}
          </div>
        </div>

        {/* Sections in card-like containers */}
        <div className="space-y-4">
          {character.description && (
            <div className="rounded-2xl border border-white/12 bg-white/6 p-4">
              <DetailSection title="About" icon={<User className="h-3.5 w-3.5" />}>
                <p className="line-clamp-6">{character.description}</p>
              </DetailSection>
            </div>
          )}

          {hasTags && (
            <div className="rounded-2xl border border-white/12 bg-white/6 p-4">
              <DetailSection title="Tags" icon={<Hash className="h-3.5 w-3.5" />}>
                <div className="flex flex-wrap gap-1.5">
                  {character.tags?.map((tag, idx) => (
                    <Badge
                      key={`${character.id}-tag-${idx}`}
                      variant="outline"
                      className="border-white/20 bg-[#2f3034] text-[10px] font-normal text-white/85 transition-colors hover:border-white/30"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </DetailSection>
            </div>
          )}

          {character.scenario && (
            <div className="rounded-2xl border border-white/12 bg-white/6 p-4">
              <DetailSection
                title="Scenario"
                icon={<MessageSquare className="h-3.5 w-3.5" />}
              >
                <p className="line-clamp-4">{character.scenario}</p>
              </DetailSection>
            </div>
          )}

          {character.summary && (
            <div className="rounded-2xl border border-white/12 bg-white/6 p-4">
              <DetailSection title="Summary" icon={<BookOpen className="h-3.5 w-3.5" />}>
                <p className="line-clamp-3">{character.summary}</p>
              </DetailSection>
            </div>
          )}

          {character.firstMessage && (
            <div className="rounded-2xl border border-white/12 bg-white/6 p-4">
              <DetailSection
                title="First message"
                icon={<MessageSquare className="h-3.5 w-3.5" />}
              >
                <p className="line-clamp-3 italic text-white/90">
                  &ldquo;{character.firstMessage}&rdquo;
                </p>
              </DetailSection>
            </div>
          )}

          {(character.persona || character.lorebook || character.realm) && (
            <div className="rounded-2xl border border-white/12 bg-white/6 p-4">
              <DetailSection title="Linked" icon={<Link2 className="h-3.5 w-3.5" />}>
                <div className="flex flex-wrap gap-2">
                  {character.persona && (
                    <Badge
                      variant="outline"
                      className="gap-1 border-white/20 bg-[#2f3034] text-[10px] text-white/85"
                    >
                      <User className="h-3 w-3" />
                      {character.persona.name}
                    </Badge>
                  )}
                  {character.lorebook && (
                    <Badge
                      variant="outline"
                      className="gap-1 border-white/20 bg-[#2f3034] text-[10px] text-white/85"
                    >
                      <BookOpen className="h-3 w-3" />
                      {character.lorebook.name}
                    </Badge>
                  )}
                  {character.realm && (
                    <Badge
                      variant="outline"
                      className="gap-1 border-white/20 bg-[#2f3034] text-[10px] text-white/85"
                    >
                      <Globe className="h-3 w-3" />
                      {character.realm.name}
                    </Badge>
                  )}
                </div>
              </DetailSection>
            </div>
          )}
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-between border-t border-white/12 pt-3 text-xs text-white/60">
          {character.chatCount != null && (
            <span className="flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              {character.chatCount} chats
            </span>
          )}
          {character.createdAt && (
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {formatRelativeTime(new Date(character.createdAt))}
            </span>
          )}
        </div>

        {/* CTA */}
        <Link
          href={`/characters/${character.id}`}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/12 py-3",
            "text-sm font-medium text-white/90 transition-all duration-200",
            "hover:border-primary/50 hover:bg-primary/25 hover:text-white"
          )}
        >
          <Sparkles className="h-4 w-4" />
          View full profile
        </Link>
      </div>
      </div>
    </div>
  );
};

export default CharacterPreview;
