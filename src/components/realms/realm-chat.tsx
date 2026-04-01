"use client";

import ChatMessages from "@/components/elements/chat-messages";
import ChatPanel from "@/components/elements/chat-panel";
import Container from "@/components/elements/container";
import { useGetRealm, useRealmAIChat } from "@/hooks/realm";
import { useCreateRealmChat } from "@/hooks/realm";
import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface RealmChatProps {
  realmId: string;
  chatId: string;
  initialPrompt?: string;
}

const RealmChatLoadingSkeleton = () => (
  <div className="h-full min-h-0 flex-1 flex flex-col relative">
    <div className="flex-1 min-h-0 px-4 pb-0">
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
          <div className="space-y-2 w-full max-w-[62%]">
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

    <div className="sticky bottom-4 px-2">
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
);

export default function RealmChat({ realmId, chatId, initialPrompt }: RealmChatProps) {
  const router = useRouter();
  const { realm } = useGetRealm(realmId);
  const { createRealmChatAsync } = useCreateRealmChat({ realmId, showToasts: false });
  const hasSentInitialPromptRef = useRef(false);

  const {
    messages,
    send,
    reload,
    edit,
    removeMessage,
    stop,
    error,
    status,
    apiMessages,
    isLoadingHistory,
  } = useRealmAIChat({ realmId, chatId });

  const handleStartNewChat = useCallback(async () => {
    try {
      const res = await createRealmChatAsync({});
      const newChatId = (res as { data?: { chat?: { id: string } } })?.data?.chat?.id ?? (res as { chat?: { id: string } })?.chat?.id;
      if (newChatId) {
        router.push(`/realms/${realmId}/chat/${newChatId}`);
      } else {
        toast.error("Failed to create chat");
      }
    } catch {
      toast.error("Failed to create chat");
    }
  }, [realmId, createRealmChatAsync, router]);



  const handleSubmit = useCallback(
    (message: PromptInputMessage) => {
      send(message);
    },
    [send]
  );

  useEffect(() => {
    const prompt = initialPrompt?.trim();
    if (!prompt) return;
    if (hasSentInitialPromptRef.current) return;
    if (messages.length > 0) return;
    if (status !== "ready") return;

    hasSentInitialPromptRef.current = true;
    send({ text: prompt, files: [] });
    router.replace(`/realms/${realmId}/chat/${chatId}`, { scroll: false });
  }, [initialPrompt, messages.length, status, send, router, realmId, chatId]);

  return (
    <Container className="h-full w-full">
      {isLoadingHistory && messages.length === 0 ? (
        <RealmChatLoadingSkeleton />
      ) : (
        <div className="h-full min-h-0 flex-1 flex flex-col relative">
          <ChatMessages
            setActivePreview={() => { }}
            messages={messages}
            apiMessages={apiMessages}
            isSending={status === "submitted"}
            isStreaming={status === "streaming"}
            error={error}
            chatId={chatId}
            onReload={reload}
            onEditMessage={edit}
            onDeleteMessage={removeMessage}
            onStartNewChat={handleStartNewChat}
            characterName={realm?.name}
          />

          <ChatPanel
            chatId={chatId}
            onSubmit={handleSubmit}
            stop={stop}
            status={status}
            placeholder="Ask anything..."
          />
        </div>
      )}
    </Container>
  );
}
