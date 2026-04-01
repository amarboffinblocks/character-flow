"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Chats from "@/components/elements/chats";
import Container from "@/components/elements/container";
import { useCreateChat } from "@/hooks/chat";
import { Skeleton } from "@/components/ui/skeleton";

export default function ChatWithCharacterPage() {
  const params = useParams<{ id: string; char_id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const chatIdFromUrl = params?.id;
  const charId = params?.char_id;
  const chatIdFromQuery = searchParams.get("chatId");

  const [chatId, setChatId] = useState<string | null>(chatIdFromQuery);
  const [error, setError] = useState<string | null>(null);
  const createRequestedRef = useRef(false);

  const { createChatAsync } = useCreateChat({ showToasts: false });

  const createNewChat = useCallback(async () => {
    if (!charId) return;
    if (createRequestedRef.current) return;
    createRequestedRef.current = true;
    try {
      const res = await createChatAsync({
        characterId: charId,
        // No folderId - character chat is independent of folders
      });
      const newChatId = (res as { chat?: { id: string } })?.chat?.id;
      if (newChatId) {
        setChatId(newChatId);
      } else {
        createRequestedRef.current = false;
        setError("Failed to create chat");
      }
    } catch {
      createRequestedRef.current = false;
      setError("Failed to create chat");
    }
  }, [charId, createChatAsync]);

  useEffect(() => {
    if (!charId) {
      setError("Invalid character");
      return;
    }

    // Use chat ID from query param or from URL (when not "new")
    if (chatIdFromQuery) {
      createRequestedRef.current = true;
      setChatId(chatIdFromQuery);
      return;
    }
    if (chatIdFromUrl && chatIdFromUrl !== "new") {
      createRequestedRef.current = true;
      setChatId(chatIdFromUrl);
      return;
    }

    // When "new" - always create a fresh chat, never resume
    if (chatIdFromUrl === "new") {
      createNewChat();
    }
  }, [charId, chatIdFromQuery, chatIdFromUrl, createNewChat]);

  // Replace URL with actual chat ID when we have it (e.g. /chat/new/char/x -> /chat/chatId/char/x)
  useEffect(() => {
    if (chatId && charId && chatIdFromUrl === "new" && chatId !== "new") {
      router.replace(`/chat/${chatId}/char/${charId}`, { scroll: false });
    }
  }, [chatId, charId, chatIdFromUrl, router]);

  if (error) {
    return (
      <div className="flex-1 h-full flex items-center justify-center">
        <Container className="h-full w-full">
          <p className="text-destructive">{error}</p>
          <button
            type="button"
            onClick={() => router.back()}
            className="mt-4 text-sm text-primary hover:underline"
          >
            Go back
          </button>
        </Container>
      </div>
    );
  }

  if (!chatId) {
    return (
      <div className="flex-1 h-full">
        <Container className="h-full w-full">
          <div className="space-y-4 py-8">
            <Skeleton className="h-8 w-48 bg-white/10 rounded" />
            <Skeleton className="h-64 w-full bg-white/10 rounded" />
          </div>
        </Container>
      </div>
    );
  }

  return (
    <Chats chatId={chatId} />
  );
}
