import type { Note, SyncQueueItem } from "./types";
import { syncQueue, isSyncing, isOffline } from "./stores";
import { get } from "svelte/store";

const STORAGE_PREFIX = "tadwin_";
const NOTES_KEY = STORAGE_PREFIX + "notes";
const QUEUE_KEY = STORAGE_PREFIX + "sync_queue";

export function saveNotesLocally(workspaceId: string, notes: Note[]) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(`${NOTES_KEY}_${workspaceId}`, JSON.stringify(notes));
}

export function loadNotesLocally(workspaceId: string): Note[] {
  if (typeof localStorage === "undefined") return [];
  const data = localStorage.getItem(`${NOTES_KEY}_${workspaceId}`);
  return data ? JSON.parse(data) : [];
}

export function saveSyncQueue(queue: SyncQueueItem[]) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function loadSyncQueue(): SyncQueueItem[] {
  if (typeof localStorage === "undefined") return [];
  const data = localStorage.getItem(QUEUE_KEY);
  return data ? JSON.parse(data) : [];
}

export function addToSyncQueue(item: Omit<SyncQueueItem, "id" | "timestamp">) {
  const queue = get(syncQueue);
  const newItem: SyncQueueItem = {
    ...item,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };
  const newQueue = [...queue, newItem];
  syncQueue.set(newQueue);
  saveSyncQueue(newQueue);
}

export async function processSyncQueue() {
  if (get(isSyncing) || get(isOffline)) return;

  const queue = get(syncQueue);
  if (queue.length === 0) return;

  isSyncing.set(true);

  const successfulItems: string[] = [];

  for (const item of queue) {
    try {
      if (item.type === "note") {
        const workspaceId = item.data.workspaceId;
        let response;

        switch (item.action) {
          case "create":
            response = await fetch(`/api/workspaces/${workspaceId}/notes`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(item.data),
            });
            break;
          case "update":
            response = await fetch(
              `/api/workspaces/${workspaceId}/notes/${item.data.id}`,
              {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(item.data),
              }
            );
            break;
          case "delete":
            response = await fetch(
              `/api/workspaces/${workspaceId}/notes/${item.data.id}`,
              {
                method: "DELETE",
              }
            );
            break;
        }

        if (response && response.ok) {
          successfulItems.push(item.id);
        } else if (response && response.status === 409) {
          // Conflict - handle by LWW (server wins)
          successfulItems.push(item.id);
        }
      }
    } catch (error) {
      console.error("Sync error:", error);
      break; // Stop processing on error
    }
  }

  // Remove successful items from queue
  const newQueue = queue.filter((item) => !successfulItems.includes(item.id));
  syncQueue.set(newQueue);
  saveSyncQueue(newQueue);

  isSyncing.set(false);
}

// Auto-sync every 30 seconds when online
if (typeof window !== "undefined") {
  setInterval(() => {
    if (!get(isOffline)) {
      processSyncQueue();
    }
  }, 30000);
}
