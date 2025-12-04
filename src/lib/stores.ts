import { writable, derived } from "svelte/store";
import type { User, Workspace, Category, Note, SyncQueueItem } from "./types";

// User store
export const user = writable<User | null>(null);

// Current workspace
export const currentWorkspace = writable<Workspace | null>(null);

// Workspaces
export const workspaces = writable<Workspace[]>([]);

// Categories for current workspace
export const categories = writable<Category[]>([]);

// Notes for current workspace
export const notes = writable<Note[]>([]);

// Selected note
export const selectedNote = writable<Note | null>(null);

// UI state
export const sidebarOpen = writable(true);
export const searchQuery = writable("");
export const selectedCategoryId = writable<string | null>(null);
export const showArchived = writable(false);
export const showTrashed = writable(false);

// Sync queue
export const syncQueue = writable<SyncQueueItem[]>([]);
export const isSyncing = writable(false);
export const isOffline = writable(false);

// Saving state
export const isSaving = writable(false);
export const lastSaved = writable<Date | null>(null);

// Filtered notes based on current filters
export const filteredNotes = derived(
  [notes, searchQuery, selectedCategoryId, showArchived, showTrashed],
  ([
    $notes,
    $searchQuery,
    $selectedCategoryId,
    $showArchived,
    $showTrashed,
  ]) => {
    return $notes.filter((note) => {
      // Filter by trash
      if ($showTrashed) {
        return note.isTrashed;
      }
      if (note.isTrashed) {
        return false;
      }

      // Filter by archived
      if ($showArchived) {
        if (!note.isArchived) return false;
      } else {
        if (note.isArchived) return false;
      }

      // Filter by category
      if ($selectedCategoryId && note.categoryId !== $selectedCategoryId) {
        return false;
      }

      // Filter by search
      if ($searchQuery) {
        const query = $searchQuery.toLowerCase();
        return (
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }
);

// Listen for online/offline events
if (typeof window !== "undefined") {
  // Check actual online status after a brief delay to prevent flickering on page load
  setTimeout(() => {
    isOffline.set(!navigator.onLine);
  }, 500);

  window.addEventListener("online", () => isOffline.set(false));
  window.addEventListener("offline", () => isOffline.set(true));
}
