"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { useQueryClient } from "@tanstack/react-query";
import type { UIMessage } from "ai";
import { useAITransport } from "./use-ai-transport";
import { useChatMessages } from "@/hooks/chat/use-chat-messages";
import { apiMessagesToUIMessages } from "@/lib/ai";
import type { EditContextRef } from "@/lib/ai";
import type { ApiMessage } from "@/lib/api/chats/types";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import { queryKeys } from "@/lib/api/shared/query-keys";
import { deleteMessage as deleteMessageApi } from "@/lib/api/chats";
import { toast } from "sonner";

const HISTORY_LIMIT = 100;

export interface UseAIChatOptions {
  chatId?: string;
  onError?: (error: Error) => void;
}

/**
 * AI chat with message persistence.
 * Follows [AI SDK UI Chatbot Message Persistence](https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-message-persistence):
 * - Loads existing messages via `messages` prop
 * - Uses prepareSendMessagesRequest to send only the last message (backend loads history from DB)
 */
export function useAIChat(chatIdOrOptions?: string | UseAIChatOptions) {
  const options: UseAIChatOptions =
    typeof chatIdOrOptions === "string"
      ? { chatId: chatIdOrOptions }
      : chatIdOrOptions ?? {};

  const { chatId, onError } = options;
  const queryClient = useQueryClient();
  const editContextRef = useRef<{ messageId: string } | null>(null) as EditContextRef;
  const transport = useAITransport(chatId, editContextRef);
  const { messages: apiMessages, isLoading: isLoadingHistory } = useChatMessages({
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
    if (prev === "streaming" && chat.status === "ready" && chatId) {
      queryClient.invalidateQueries({ queryKey: queryKeys.chats.messages(chatId) });
      // Title can be auto-updated on backend after first meaningful user message.
      // Refresh chat detail + chat lists so UI reflects new title immediately.
      queryClient.invalidateQueries({ queryKey: queryKeys.chats.detail(chatId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.chats.all });
    }
  }, [chat.status, chatId, queryClient]);

  const send = useCallback(
    (message: PromptInputMessage) => {
      const hasText = Boolean(message.text?.trim());
      const hasFiles = Boolean(message.files?.length);

      if (!chatId || (!hasText && !hasFiles)) return;

      chat.sendMessage({
        text: message.text?.trim() || "",
        files: message.files?.length ? message.files : undefined,
      });
    },
    [chatId, chat.sendMessage]
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
      if (!chatId) return;

      const msgIndex = chat.messages.findIndex((m) => m.id === uiMessageId);
      const apiMsg = (apiMessages as ApiMessage[])[msgIndex];
      const realId = apiMsg && UUID_RE.test(apiMsg.id) ? apiMsg.id : UUID_RE.test(uiMessageId) ? uiMessageId : null;

      if (!realId) {
        toast.error("Cannot delete this message yet. Please reload the page.");
        return;
      }

      chat.setMessages(chat.messages.filter((m) => m.id !== uiMessageId));

      try {
        await deleteMessageApi(chatId, realId);
        queryClient.invalidateQueries({ queryKey: queryKeys.chats.messages(chatId) });
      } catch {
        toast.error("Failed to delete message");
        queryClient.invalidateQueries({ queryKey: queryKeys.chats.messages(chatId) });
      }
    },
    [chatId, chat.messages, chat.setMessages, apiMessages, queryClient]
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
