import { CATEGORIES } from "./categories";

/**
 * Returns every category the user can pick, in display order:
 * built-in categories first, then any custom ones the workspace has added.
 * Duplicates (by name) are removed so a user-added "Groceries" doesn't appear twice.
 */
export function buildCategoryList(customNames: string[]): string[] {
  const built = CATEGORIES.map((c) => c.name);
  const seen = new Set(built.map((n) => n.toLowerCase()));
  const extra = customNames
    .map((n) => n.trim())
    .filter((n) => n.length > 0 && !seen.has(n.toLowerCase()));
  // De-dupe custom names case-insensitively
  const deduped: string[] = [];
  const seenExtra = new Set<string>();
  for (const n of extra) {
    const k = n.toLowerCase();
    if (!seenExtra.has(k)) {
      seenExtra.add(k);
      deduped.push(n);
    }
  }
  return [...built, ...deduped];
}