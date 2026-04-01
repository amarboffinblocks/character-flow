"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { useQueryClient } from "@tanstack/react-query";
import type { UIMessage } from "ai";
import { createRealmChatTransport } from "@/lib/ai";
import { apiMessagesToUIMessages } from "@/lib/ai";
import type { EditContextRef } from "@/lib/ai";
import { useRealmChatMessages } from "./use-realm-chat-messages";
import type { ApiMessage } from "@/lib/api/chats/types";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import { queryKeys } from "@/lib/api/shared/query-keys";
import { deleteRealmChatMessage } from "@/lib/api/realms/realm-chats";
import { toast } from "sonner";

const HISTORY_LIMIT = 100;
const GENERIC_TITLES = new Set(["new chat", "untitled", "untitled chat", "chat", "new conversation"]);

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function isMeaningfulTitle(title: string | null | undefined): boolean {
  if (!title) return false;
  const normalized = normalizeWhitespace(title).toLowerCase();
  return normalized.length > 0 && !GENERIC_TITLES.has(normalized);
}

function buildTitleFromInput(input: string): string | null {
  const normalized = normalizeWhitespace(input)
    .replace(/^["'`]+|["'`]+$/g, "")
    .replace(/\s*[?.!,;:]+\s*$/g, "");
  if (!normalized) return null;
  if (normalized.length < 4) return null;
  if (!/[a-z0-9]/i.test(normalized)) return null;
  const words = normalized.split(" ").filter(Boolean).slice(0, 10);
  if (words.length === 0) return null;
  const joined = words.join(" ");
  return joined.length > 70 ? `${joined.slice(0, 69).trimEnd()}…` : joined;
}

export interface UseRealmAIChatOptions {
  realmId: string | undefined;
  chatId: string | undefined;
  onError?: (error: Error) => void;
}

/**
 * Realm AI chat: loads messages from realm chat API and sends via realm message endpoint.
 */
export function useRealmAIChat(options: UseRealmAIChatOptions) {
  const { realmId, chatId, onError } = options;

  const queryClient = useQueryClient();
  const editContextRef = useRef<{ messageId: string } | null>(null) as EditContextRef;

  const transport = useMemo(
    () => createRealmChatTransport(realmId, chatId, editContextRef),
    [realmId, chatId, editContextRef]
  );

  const {
    messages: apiMessages,
    isLoading: isLoadingHistory,
  } = useRealmChatMessages({
    realmId,
    chatId,
    params: { sortOrder: "asc", limit: HISTORY_LIMIT },
  });

  const initialMessages = useMemo(() => {
    const messages = (apiMessages ?? []) as ApiMessage[];
    return apiMessagesToUIMessages(messages) as UIMessage[];
  }, [apiMessages]);

  const chat = useChat({
    id: chatId,
    transport,
    messages: initialMessages,
    onError: (err) => onError?.(err),
  });

  useEffect(() => {
    if (isLoadingHistory || apiMessages.length === 0 || chat.messages.length > 0) return;
    chat.setMessages(apiMessagesToUIMessages(apiMessages as ApiMessage[]) as UIMessage[]);
  }, [isLoadingHistory, apiMessages, chat.messages.length, chat.setMessages]);

  const prevStatusRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    const prev = prevStatusRef.current;
    prevStatusRef.current = chat.status;
    const hasJustFinishedRequest =
      chat.status === "ready" && (prev === "streaming" || prev === "submitted");
    if (hasJustFinishedRequest && chatId && realmId) {
      queryClient.invalidateQueries({ queryKey: queryKeys.realms.realmChatMessages(realmId, chatId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.realms.realmChatDetail(realmId, chatId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.realms.chats(realmId) });
      queryClient.refetchQueries({ queryKey: queryKeys.realms.chats(realmId), type: "active" });
    }
  }, [chat.status, chatId, realmId, queryClient]);

  const send = useCallback(
    (message: PromptInputMessage) => {
      const hasText = Boolean(message.text?.trim());
      const hasFiles = Boolean(message.files?.length);
      if (!chatId || (!hasText && !hasFiles)) return;

      const optimisticTitle = hasText ? buildTitleFromInput(message.text?.trim() || "") : null;
      if (optimisticTitle && realmId) {
        queryClient.setQueriesData<{ chat?: { id?: string; title?: string | null } }>(
          { queryKey: queryKeys.realms.realmChatDetail(realmId, chatId) },
          (old) => {
            if (!old?.chat || isMeaningfulTitle(old.chat.title)) return old;
            return { ...old, chat: { ...old.chat, title: optimisticTitle } };
          }
        );
        queryClient.setQueriesData<{ chats?: Array<{ id: string; title?: string | null }> }>(
          { queryKey: queryKeys.realms.chats(realmId) },
          (old) => {
            if (!old?.chats) return old;
            return {
              ...old,
              chats: old.chats.map((chatItem) =>
                chatItem.id === chatId && !isMeaningfulTitle(chatItem.title)
                  ? { ...chatItem, title: optimisticTitle }
                  : chatItem
              ),
            };
          }
        );
      }

      chat.sendMessage({
        text: message.text?.trim() || "",
        files: message.files?.length ? message.files : undefined,
      });
    },
    [chatId, realmId, chat.sendMessage, queryClient]
  );

  const reload = useCallback(() => {
    if (!chatId) return;
    chat.regenerate();
  }, [chatId, chat.regenerate]);

  const edit = useCallback(
    (uiMessageId: string, apiMessageId: string, newContent: string) => {
      if (!chatId) return;

      const msgIndex = chat.messages.findIndex((m) => m.id === uiMessageId || m.id === apiMessageId);
      if (msgIndex >= 0) {
        chat.setMessages(chat.messages.slice(0, msgIndex));
      }

      editContextRef.current = { messageId: apiMessageId };
      chat.sendMessage({ text: newContent });
    },
    [chatId, chat.messages, chat.setMessages, chat.sendMessage, editContextRef]
  );

  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  const removeMessage = useCallback(
    async (uiMessageId: string) => {
      if (!chatId || !realmId) return;

      const msgIndex = chat.messages.findIndex((m) => m.id === uiMessageId);
      const apiMsg = (apiMessages as ApiMessage[])[msgIndex];
      const realId = apiMsg && UUID_RE.test(apiMsg.id) ? apiMsg.id : UUID_RE.test(uiMessageId) ? uiMessageId : null;

      if (!realId) {
        toast.error("Cannot delete this message yet. Please reload the page.");
        return;
      }

      chat.setMessages(chat.messages.filter((m) => m.id !== uiMessageId));

      try {
        await deleteRealmChatMessage(realmId, chatId, realId);
        queryClient.invalidateQueries({ queryKey: queryKeys.realms.realmChatMessages(realmId, chatId) });
      } catch {
        toast.error("Failed to delete message");
        queryClient.invalidateQueries({ queryKey: queryKeys.realms.realmChatMessages(realmId, chatId) });
      }
    },
    [chatId, realmId, chat.messages, chat.setMessages, apiMessages, queryClient]
  );

  return {
    ...chat,
    send,
    reload,
    edit,
    removeMessage,
    isLoadingHistory,
    apiMessages: apiMessages as ApiMessage[],
  };
}
