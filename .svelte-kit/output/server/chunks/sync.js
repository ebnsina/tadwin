import { m as isSyncing, g as syncQueue, i as isOffline } from "./stores.js";
import { g as get } from "./index.js";
const STORAGE_PREFIX = "tadwin_";
const QUEUE_KEY = STORAGE_PREFIX + "sync_queue";
function saveSyncQueue(queue) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}
function addToSyncQueue(item) {
  const queue = get(syncQueue);
  const newItem = {
    ...item,
    id: crypto.randomUUID(),
    timestamp: Date.now()
  };
  const newQueue = [...queue, newItem];
  syncQueue.set(newQueue);
  saveSyncQueue(newQueue);
}
async function processSyncQueue() {
  if (get(isSyncing) || get(isOffline)) return;
  const queue = get(syncQueue);
  if (queue.length === 0) return;
  isSyncing.set(true);
  const successfulItems = [];
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
              body: JSON.stringify(item.data)
            });
            break;
          case "update":
            response = await fetch(
              `/api/workspaces/${workspaceId}/notes/${item.data.id}`,
              {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(item.data)
              }
            );
            break;
          case "delete":
            response = await fetch(
              `/api/workspaces/${workspaceId}/notes/${item.data.id}`,
              {
                method: "DELETE"
              }
            );
            break;
        }
        if (response && response.ok) {
          successfulItems.push(item.id);
        } else if (response && response.status === 409) {
          successfulItems.push(item.id);
        }
      }
    } catch (error) {
      console.error("Sync error:", error);
      break;
    }
  }
  const newQueue = queue.filter((item) => !successfulItems.includes(item.id));
  syncQueue.set(newQueue);
  saveSyncQueue(newQueue);
  isSyncing.set(false);
}
if (typeof window !== "undefined") {
  setInterval(() => {
    if (!get(isOffline)) {
      processSyncQueue();
    }
  }, 3e4);
}
export {
  addToSyncQueue as a
};
