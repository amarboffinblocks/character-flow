/**
 * Query Keys Factory
 * Centralized query key management for TanStack Query
 * Organized by feature/module for better cache management
 */

/**
 * Base query keys
 */
export const queryKeys = {
  /**
   * Authentication related query keys
   */
  auth: {
    all: ["auth"] as const,
    login: () => [...queryKeys.auth.all, "login"] as const,
    usernameCheck: (username?: string) => [...queryKeys.auth.all, "username-check", username] as const,
    refresh: () => [...queryKeys.auth.all, "refresh"] as const,
    logout: () => [...queryKeys.auth.all, "logout"] as const,
    user: () => [...queryKeys.auth.all, "user"] as const,
  },

  /**
   * User related query keys
   */
  user: {
    all: ["user"] as const,
    current: () => [...queryKeys.user.all, "current"] as const,
    profile: () => [...queryKeys.user.all, "profile"] as const,
    updateProfile: () => [...queryKeys.user.all, "update-profile"] as const,
    updateProfilePicture: () => [...queryKeys.user.all, "update-profile-picture"] as const,
  },

  /**
   * Characters related query keys
   */
  characters: {
    all: ["characters"] as const,
    lists: () => [...queryKeys.characters.all, "list"] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.characters.lists(), filters] as const,
    details: () => [...queryKeys.characters.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.characters.details(), id] as const,
    create: () => [...queryKeys.characters.all, "create"] as const,
  },

  /**
   * Personas related query keys
   */
  personas: {
    all: ["personas"] as const,
    lists: () => [...queryKeys.personas.all, "list"] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.personas.lists(), filters] as const,
    details: () => [...queryKeys.personas.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.personas.details(), id] as const,
  },

  /**
   * Lorebooks related query keys
   */
  lorebooks: {
    all: ["lorebooks"] as const,
    lists: () => [...queryKeys.lorebooks.all, "list"] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.lorebooks.lists(), filters] as const,
    details: () => [...queryKeys.lorebooks.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.lorebooks.details(), id] as const,
    create: () => [...queryKeys.lorebooks.all, "create"] as const,
  },

  /**
   * Tags related query keys
   */
  tags: {
    all: ["tags"] as const,
    lists: () => [...queryKeys.tags.all, "list"] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.tags.lists(), filters] as const,
    details: () => [...queryKeys.tags.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.tags.details(), id] as const,
    popular: (category?: string) => [...queryKeys.tags.all, "popular", category] as const,
    create: () => [...queryKeys.tags.all, "create"] as const,
  },

  /**
   * Folders related query keys
   */
  folders: {
    all: ["folders"] as const,
    lists: () => [...queryKeys.folders.all, "list"] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.folders.lists(), filters] as const,
    details: () => [...queryKeys.folders.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.folders.details(), id] as const,
  },

  chats: {
    all: ["chats"] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.chats.all, "list", filters] as const,
    detail: (id: string) => [...queryKeys.chats.all, "detail", id] as const,
    messages: (chatId: string) => [...queryKeys.chats.all, "messages", chatId] as const,
  },

  models: {
    all: ["models"] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.models.all, "list", filters] as const,
  },

  /**
   * Backgrounds related query keys
   */
  backgrounds: {
    all: ["backgrounds"] as const,
    lists: () => [...queryKeys.backgrounds.all, "list"] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.backgrounds.lists(), filters] as const,
    details: () => [...queryKeys.backgrounds.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.backgrounds.details(), id] as const,
  },

  /**
   * Realms related query keys
   */
  realms: {
    all: ["realms"] as const,
    lists: () => [...queryKeys.realms.all, "list"] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.realms.lists(), filters] as const,
    details: () => [...queryKeys.realms.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.realms.details(), id] as const,
    create: () => [...queryKeys.realms.all, "create"] as const,
    /** Realm-scoped chats (separate from global chats) */
    chats: (realmId: string) => [...queryKeys.realms.all, "chats", realmId] as const,
    realmChatList: (realmId: string, filters?: Record<string, unknown>) =>
      [...queryKeys.realms.chats(realmId), "list", filters] as const,
    realmChatDetail: (realmId: string, chatId: string) =>
      [...queryKeys.realms.chats(realmId), "detail", chatId] as const,
    realmChatMessages: (realmId: string, chatId: string) =>
      [...queryKeys.realms.chats(realmId), "messages", chatId] as const,
  },
} as const;

