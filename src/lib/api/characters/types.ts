/**
 * Character API Types
 * Type definitions for character-related endpoints
 */

import { ApiResponse, PaginationInfo } from "../shared/types";

/**
 * Character Rating
 */
export type CharacterRating = "SFW" | "NSFW";

/**
 * Character Visibility
 */
export type CharacterVisibility = "public" | "private";

/**
 * Create Character Request
 * Supports both File objects (for multipart/form-data) and strings (for JSON)
 */
export interface CreateCharacterRequest {
  name: string;
  description?: string;
  scenario?: string;
  summary?: string;
  rating: CharacterRating;
  visibility: CharacterVisibility;
  tags?: string[];
  firstMessage?: string;
  alternateMessages?: string[];
  exampleDialogues?: string[];
  authorNotes?: string;
  characterNotes?: string;
  personaId?: string | null;
  lorebookId?: string | null;
  realmId?: string | null;
  favourite?: boolean;
  avatar?: File | string;
  tokens?: number;
}

/**
 * Update Character Request
 * Supports both File objects (for multipart/form-data) and strings (for JSON)
 * All fields are optional for updates
 */
export interface UpdateCharacterRequest {
  name?: string;
  description?: string;
  scenario?: string;
  summary?: string;
  rating?: CharacterRating;
  visibility?: CharacterVisibility;
  tags?: string[];
  firstMessage?: string;
  alternateMessages?: string[];
  exampleDialogues?: string[];
  authorNotes?: string;
  characterNotes?: string;
  personaId?: string | null;
  lorebookId?: string | null;
  realmId?: string | null;
  favourite?: boolean;
  avatar?: File | string;
  tokens?: number;
}

/**
 * Character Image Asset
 */
export interface CharacterImage {
  url: string;
}

/**
 * Persona Reference
 */
export interface PersonaReference {
  id: string;
  name: string;
}

/**
 * Lorebook Reference
 */
export interface LorebookReference {
  id: string;
  name: string;
}

/**
 * Realm Reference
 */
export interface RealmReference {
  id: string;
  name: string;
}

/**
 * Character Response Data
 * Matches the API response structure
 */
export interface Character {
  id: string;
  name: string;
  slug: string;
  description?: string;
  scenario?: string;
  summary?: string;
  rating: CharacterRating;
  visibility: CharacterVisibility;
  isFavourite: boolean;
  isSaved: boolean;
  avatar?: CharacterImage;
  backgroundImg?: CharacterImage;
  tags?: string[];
  firstMessage?: string;
  alternateMessages?: string[];
  exampleDialogues?: string[];
  authorNotes?: string;
  characterNotes?: string;
  persona?: PersonaReference | null;
  lorebook?: LorebookReference | null;
  realm?: RealmReference | null;
  chatCount?: number;
  createdAt: string;
  updatedAt: string;
  userId?: string;
  tokens?: number | null;
}

/**
 * Create Character Response
 */
export interface CreateCharacterResponse {
  character: Character;
  message?: string;
}

/**
 * Update Character Response
 */
export interface UpdateCharacterResponse {
  character: Character;
  message?: string;
}

/**
 * Get Character Response
 */
export interface GetCharacterResponse {
  character: Character;
}

/**
 * Pagination Info
 */


/**
 * List Characters Response
 */
export interface ListCharactersResponse {
  characters: Character[];
  pagination: PaginationInfo;
}

/**
 * Batch Duplicate Characters Response
 */
export interface BatchDuplicateCharactersResponse {
  characters: Character[];
  message?: string;
}

/**
 * Delete Character Response
 */
export interface DeleteCharacterResponse {
  message: string;
}

/**
 * Batch Delete Characters Response
 */
export interface BatchDeleteCharactersResponse {
  success: number;
  failed: number;
  errors: Array<{ id: string; error: string }>;
}

/**
 * Import Character Response
 */
export interface ImportCharacterResponse {
  character: Character;
  message?: string;
}

/**
 * Bulk Import Characters Response
 */
export interface BulkImportCharactersResponse {
  imported: number;
  failed: number;
  characters: Character[];
  errors: Array<{ name: string; error: string }>;
  message?: string;
}
