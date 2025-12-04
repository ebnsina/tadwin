export interface User {
  id: string;
  email: string;
  name: string | null;
  plan: string;
}

export interface Workspace {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  color: string | null;
  workspaceId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  workspaceId: string;
  categoryId: string | null;
  isPinned: boolean;
  isArchived: boolean;
  isTrashed: boolean;
  lastModified: Date;
  clientRev: number;
  createdAt: Date;
  updatedAt: Date;
  category?: Category;
}

export interface SyncQueueItem {
  id: string;
  action: "create" | "update" | "delete";
  type: "note";
  data: any;
  timestamp: number;
}
