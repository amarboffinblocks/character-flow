(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/Desktop/your-universe-ai/client/src/lib/utils/lorebook-import.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Parse Chub / external lorebook JSON into our app's CreateLorebookRequest format.
 * Supports:
 * - Our format: { name, description, entries: [{ keywords, context }] }
 * - Chub format: { name, description, entries: { "1": { key/keys, content, disable, order, ... } } }
 */ __turbopack_context__.s([
    "parseLorebookImportFile",
    ()=>parseLorebookImportFile,
    "parseLorebookImportJson",
    ()=>parseLorebookImportJson
]);
function isChubEntriesObject(entries) {
    return typeof entries === "object" && entries !== null && !Array.isArray(entries) && Object.keys(entries).length > 0;
}
function normalizeChubEntry(entry, index) {
    const keywords = [];
    if (Array.isArray(entry.keys) && entry.keys.length > 0) {
        keywords.push(...entry.keys.map((k)=>String(k).trim()).filter(Boolean));
    }
    if (Array.isArray(entry.key) && entry.key.length > 0 && keywords.length === 0) {
        keywords.push(...entry.key.map((k)=>String(k).trim()).filter(Boolean));
    }
    if (keywords.length === 0 && entry.name) {
        keywords.push(entry.name.trim());
    }
    if (keywords.length === 0) {
        return null;
    }
    const context = typeof entry.content === "string" ? entry.content.trim() : typeof entry.comment === "string" ? entry.comment.trim() : "";
    const rawPriority = typeof entry.priority === "number" ? entry.priority : typeof entry.insertion_order === "number" ? entry.insertion_order : typeof entry.order === "number" ? entry.order : index + 1;
    const priority = Math.min(Math.max(0, Math.floor(Number(rawPriority))), 100);
    const isEnabled = entry.enabled !== undefined ? Boolean(entry.enabled) : entry.disable !== undefined ? !entry.disable : true;
    return {
        keywords,
        context: context || "[No context]",
        isEnabled,
        priority
    };
}
function parseLorebookImportJson(data) {
    const raw = data;
    const fallbackName = `lorebook${Math.floor(Math.random() * 10000) + 1}`;
    const resolvedName = raw && typeof raw.name === "string" && raw.name.trim() ? raw.name.trim() : fallbackName;
    let entries = [];
    const rating = raw.rating === "NSFW" || raw.rating === "SFW" ? raw.rating : "SFW";
    const visibility = raw.visibility === "public" || raw.visibility === "private" ? raw.visibility : "private";
    if (isChubEntriesObject(raw.entries)) {
        const list = Object.values(raw.entries).map((e, i)=>normalizeChubEntry(e, i)).filter((e)=>e !== null);
        // Sort by priority then by original order
        list.sort((a, b)=>(a.priority ?? 0) - (b.priority ?? 0));
        entries = list;
    } else if (Array.isArray(raw.entries)) {
        entries = raw.entries.map((e, i)=>{
            const item = e;
            const keywords = Array.isArray(item.keywords) ? item.keywords.map((k)=>String(k).trim()).filter(Boolean) : Array.isArray(item.keys) ? item.keys.map((k)=>String(k).trim()).filter(Boolean) : item.keyword ? [
                String(item.keyword).trim()
            ].filter(Boolean) : [];
            if (keywords.length === 0) return null;
            const context = typeof item.context === "string" ? item.context.trim() : typeof item.content === "string" ? item.content.trim() : "";
            const rawPriority = typeof item.priority === "number" ? item.priority : typeof item.order === "number" ? item.order : i + 1;
            return {
                keywords,
                context: context || "[No context]",
                isEnabled: item.isEnabled !== undefined ? Boolean(item.isEnabled) : !Boolean(item.disable),
                priority: Math.min(Math.max(0, Math.floor(Number(rawPriority))), 100)
            };
        }).filter((e)=>e !== null);
    }
    // Reassign priority to 1..100 so backend validation passes (max 100)
    if (entries.length > 0) {
        entries = entries.map((e, i)=>({
                ...e,
                priority: Math.min(i + 1, 100)
            }));
    }
    const description = typeof raw.description === "string" ? raw.description.trim() : undefined;
    const tags = Array.isArray(raw.tags) ? raw.tags.map((t)=>String(t).trim()).filter(Boolean) : undefined;
    return {
        name: resolvedName,
        description: description || undefined,
        rating,
        visibility,
        tags,
        favourite: Boolean(raw.favourite),
        entries: entries.length > 0 ? entries : undefined
    };
}
async function parseLorebookImportFile(file) {
    const text = await file.text();
    const data = JSON.parse(text);
    return parseLorebookImportJson(data);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=Desktop_your-universe-ai_client_src_lib_utils_lorebook-import_ts_95be40a9._.js.map