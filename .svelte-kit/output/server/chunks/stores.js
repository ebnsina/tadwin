import { d as derived, w as writable } from "./index.js";
const currentWorkspace = writable(null);
const workspaces = writable([]);
const categories = writable([]);
const notes = writable([]);
const selectedNote = writable(null);
const sidebarOpen = writable(true);
const searchQuery = writable("");
const selectedCategoryId = writable(null);
const showArchived = writable(false);
const showTrashed = writable(false);
const syncQueue = writable([]);
const isSyncing = writable(false);
const isOffline = writable(false);
const isSaving = writable(false);
const lastSaved = writable(null);
const filteredNotes = derived(
  [notes, searchQuery, selectedCategoryId, showArchived, showTrashed],
  ([
    $notes,
    $searchQuery,
    $selectedCategoryId,
    $showArchived,
    $showTrashed
  ]) => {
    return $notes.filter((note) => {
      if ($showTrashed) {
        return note.isTrashed;
      }
      if (note.isTrashed) {
        return false;
      }
      if ($showArchived) {
        if (!note.isArchived) return false;
      } else {
        if (note.isArchived) return false;
      }
      if ($selectedCategoryId && note.categoryId !== $selectedCategoryId) {
        return false;
      }
      if ($searchQuery) {
        const query = $searchQuery.toLowerCase();
        return note.title.toLowerCase().includes(query) || note.content.toLowerCase().includes(query);
      }
      return true;
    });
  }
);
if (typeof window !== "undefined") {
  setTimeout(() => {
    isOffline.set(!navigator.onLine);
  }, 500);
  window.addEventListener("online", () => isOffline.set(false));
  window.addEventListener("offline", () => isOffline.set(true));
}
export {
  categories as a,
  searchQuery as b,
  currentWorkspace as c,
  showArchived as d,
  showTrashed as e,
  sidebarOpen as f,
  syncQueue as g,
  selectedNote as h,
  isOffline as i,
  filteredNotes as j,
  isSaving as k,
  lastSaved as l,
  isSyncing as m,
  notes as n,
  selectedCategoryId as s,
  workspaces as w
};
