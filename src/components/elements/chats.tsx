"use client";

import ChatMessages from "./chat-messages";
import ChatPanel from "./chat-panel";
import { useAIChat } from "@/hooks/ai/use-ai-chat";
import { useCreateChat } from "@/hooks/chat";
import { useGetChat } from "@/hooks/chat/use-get-chat";
import { useGetCharacter } from "@/hooks";
import { useCallback, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"
import { toast } from "sonner";
import Container from "./container";
import { cn } from "@/lib/utils";
import CharacterPreview from "./character-preview";
import PersonaPreview from "./persona-preview";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
    setActivePreview?: (value: "character" | "persona" | null) => void;
    chatId?: string;
}

const ChatLoadingSkeleton = () => (
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
                    <div className="space-y-2 w-full max-w-[55%]">
                        <Skeleton className="h-14 w-full bg-white/10 rounded-xl" />
                    </div>
                </div>
                <div className="flex items-start gap-2">
                    <Skeleton className="size-8 rounded-full bg-white/10" />
                    <div className="space-y-2 w-full max-w-[65%]">
                        <Skeleton className="h-3 w-20 bg-white/10 rounded" />
                        <Skeleton className="h-20 w-full bg-white/10 rounded-xl" />
                    </div>
                </div>
                <div className="flex justify-end">
                    <div className="space-y-2 w-full max-w-[52%]">
                        <Skeleton className="h-12 w-full bg-white/10 rounded-xl" />
                    </div>
                </div>
                <div className="flex items-start gap-2">
                    <Skeleton className="size-8 rounded-full bg-white/10" />
                    <div className="space-y-2 w-full max-w-[58%]">
                        <Skeleton className="h-3 w-28 bg-white/10 rounded" />
                        <Skeleton className="h-14 w-full bg-white/10 rounded-xl" />
                    </div>
                </div>
                <div className="flex justify-end">
                    <div className="space-y-2 w-full max-w-[48%]">
                        <Skeleton className="h-10 w-full bg-white/10 rounded-xl" />
                    </div>
                </div>
                <div className="flex items-start gap-2">
                    <Skeleton className="size-8 rounded-full bg-white/10" />
                    <div className="space-y-2 w-full max-w-[62%]">
                        <Skeleton className="h-3 w-24 bg-white/10 rounded" />
                        <Skeleton className="h-16 w-full bg-white/10 rounded-xl" />
                    </div>
                </div>
                <div className="flex justify-end">
                    <div className="space-y-2 w-full max-w-[50%]">
                        <Skeleton className="h-11 w-full bg-white/10 rounded-xl" />
                    </div>
                </div>
                <div className="flex items-start gap-2">
                    <Skeleton className="size-8 rounded-full bg-white/10" />
                    <div className="space-y-2 w-full max-w-[60%]">
                        <Skeleton className="h-3 w-32 bg-white/10 rounded" />
                        <Skeleton className="h-16 w-full bg-white/10 rounded-xl" />
                    </div>
                </div>
                <div className="flex justify-end">
                    <div className="space-y-2 w-full max-w-[46%]">
                        <Skeleton className="h-10 w-full bg-white/10 rounded-xl" />
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

const Chats: React.FC<Props> = ({ setActivePreview: setActivePreviewProp, chatId }) => {
    const [activePreview, setActivePreview] = useState<'character' | 'persona' | null>(null);

    const isCharacterPreview = activePreview === 'character';
    const isPersonaPreview = activePreview === 'persona';

    const router = useRouter();
    const pathname = usePathname();
    const params = useParams<{ id?: string; chatid?: string; char_id?: string }>();
    const { chat, isLoading: isChatLoading } = useGetChat({ chatId });
    const { character } = useGetCharacter(chat?.characterId ?? undefined, {
        enabled: !!chat?.characterId,
    });
    const { createChatAsync } = useCreateChat({ showToasts: false });

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
    } = useAIChat({
        chatId,
    });

    const isFetchingChat = Boolean(chatId) && (isChatLoading || isLoadingHistory);

    const handleStartNewChat = useCallback(async () => {
        if (!chat) {
            toast.error("Could not load chat details");
            return;
        }
        try {
            const res = await createChatAsync({
                characterId: chat.characterId ?? undefined,
                folderId: chat.folderId ?? undefined,
            });
            const newChatId = (res as { chat?: { id: string } })?.chat?.id;
            if (!newChatId) {
                toast.error("Failed to create chat");
                return;
            }
            const isFolderContext = pathname?.includes("/folders/") && pathname?.includes("/c/");
            const isCharacterContext = pathname?.includes("/chat/") && pathname?.includes("/char/");
            if (isFolderContext && params?.id) {
                router.push(`/folders/${params.id}/c/${newChatId}`);
            } else if (isCharacterContext && (chat.characterId ?? params?.char_id)) {
                router.push(`/chat/${newChatId}/char/${chat.characterId ?? params?.char_id}`);
            } else {
                router.push(`/chat/${newChatId}/char/${chat.characterId ?? ""}`);
            }
        } catch {
            toast.error("Failed to create chat");
        }
    }, [chat, createChatAsync, pathname, params, router]);

    const handleSubmit = useCallback(
        (message: PromptInputMessage) => {
            send(message);
        },
        [send]
    );

    return (

        <ResizablePanelGroup
            orientation="horizontal"
            className="min-h-[200px]  rounded-lg  md:min-w-[450px]"
        >
            <ResizablePanel defaultSize={isCharacterPreview || isPersonaPreview ? "80%" : "100%"}>
                <Container className={cn('h-full w-full', (isCharacterPreview || isPersonaPreview) && "float-right")} >
                    {isFetchingChat ? (
                        <ChatLoadingSkeleton />
                    ) : (
                        <div className="h-full min-h-0 flex-1 flex flex-col relative">
                            <ChatMessages
                                setActivePreview={setActivePreview}
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
                                authorNotes={character?.authorNotes}
                                characterNotes={character?.characterNotes}
                                characterName={character?.name}
                                characterAvatar={character?.avatar?.url}
                            />

                            <ChatPanel
                                chatId={chatId}
                                onSubmit={handleSubmit}
                                stop={stop}
                                status={status}
                            />
                        </div>
                    )}
                </Container>
            </ResizablePanel>

            {(isCharacterPreview || isPersonaPreview) && (
                <ResizableHandle withHandle className="bg-border" />
            )}
            {(isCharacterPreview || isPersonaPreview) && (
                <ResizablePanel defaultSize="20%">
                    {isCharacterPreview && (
                        <CharacterPreview
                            characterId={chat?.characterId ?? undefined}
                            onClose={() => setActivePreview(null)}
                        />
                    )}
                    {isPersonaPreview && (
                        <PersonaPreview
                            personaId={character?.persona?.id}
                            onClose={() => setActivePreview(null)}
                        />
                    )}
                </ResizablePanel>
            )}

        </ResizablePanelGroup>

    );
};

export default Chats;