"use client";

import { useParams } from "next/navigation";
import { useSearchParams } from "next/navigation";
import RealmChat from "@/components/realms/realm-chat";
import Container from "@/components/elements/container";
import { useRealmChat } from "@/hooks/realm";
import { Skeleton } from "@/components/ui/skeleton";

export default function RealmChatPage() {
  const params = useParams<{ id: string; chatId: string }>();
  const searchParams = useSearchParams();
  const realmId = params?.id;
  const chatId = params?.chatId;
  const initialPrompt = searchParams.get("q") ?? undefined;

  const { chat, isLoading, isError } = useRealmChat({
    realmId,
    chatId,
  });

  if (!realmId || !chatId) {
    return (
      <div className="flex-1 h-full flex items-center justify-center">
        <Container className="h-full w-full">
          <p className="text-destructive">Invalid realm or chat</p>
        </Container>
      </div>
    );
  }

  if (isError || (!isLoading && !chat)) {
    return (
      <div className="flex-1 h-full flex items-center justify-center">
        <Container className="h-full w-full">
          <p className="text-destructive">Chat not found</p>
        </Container>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 h-full">
        <Container className="h-full w-full">
          <div className="h-full min-h-0 flex flex-col py-3">
            <div className="flex-1 min-h-0 px-4">
              <div className="flex flex-col gap-4 pt-3">
                <div className="flex items-start gap-2">
                  <Skeleton className="size-8 rounded-full bg-white/10" />
                  <div className="space-y-2 w-full max-w-[60%]">
                    <Skeleton className="h-3 w-24 bg-white/10 rounded" />
                    <Skeleton className="h-16 w-full bg-white/10 rounded-xl" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="space-y-2 w-full max-w-[52%]">
                    <Skeleton className="h-12 w-full bg-white/10 rounded-xl" />
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Skeleton className="size-8 rounded-full bg-white/10" />
                  <div className="space-y-2 w-full max-w-[64%]">
                    <Skeleton className="h-3 w-20 bg-white/10 rounded" />
                    <Skeleton className="h-20 w-full bg-white/10 rounded-xl" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="space-y-2 w-full max-w-[50%]">
                    <Skeleton className="h-11 w-full bg-white/10 rounded-xl" />
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Skeleton className="size-8 rounded-full bg-white/10" />
                  <div className="space-y-2 w-full max-w-[58%]">
                    <Skeleton className="h-3 w-28 bg-white/10 rounded" />
                    <Skeleton className="h-16 w-full bg-white/10 rounded-xl" />
                  </div>
                </div>
              </div>
            </div>
            <div className="px-2 pt-4">
              <div className="rounded-2xl border border-border/50 bg-black/25 p-3 backdrop-blur-sm">
                <Skeleton className="h-20 w-full bg-white/10 rounded-xl" />
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-full bg-white/10" />
                    <Skeleton className="h-8 w-28 rounded-full bg-white/10" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-full bg-white/10" />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return <RealmChat realmId={realmId} chatId={chatId} initialPrompt={initialPrompt} />;
}
