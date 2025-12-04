export type PlanType = "free" | "pro" | "team";

export interface PlanLimits {
  maxWorkspaces: number | null; // null means unlimited
  maxNotes: number | null; // null means unlimited
  advancedSearch: boolean;
  offlineSync: boolean;
  prioritySupport: boolean;
  teamMembers: number | null; // null means unlimited
  sharedWorkspaces: boolean;
  adminControls: boolean;
}

const planLimits: Record<PlanType, PlanLimits> = {
  free: {
    maxWorkspaces: 1,
    maxNotes: 100,
    advancedSearch: false,
    offlineSync: false,
    prioritySupport: false,
    teamMembers: null,
    sharedWorkspaces: false,
    adminControls: false,
  },
  pro: {
    maxWorkspaces: null, // unlimited
    maxNotes: null, // unlimited
    advancedSearch: true,
    offlineSync: true,
    prioritySupport: true,
    teamMembers: null,
    sharedWorkspaces: false,
    adminControls: false,
  },
  team: {
    maxWorkspaces: null, // unlimited
    maxNotes: null, // unlimited
    advancedSearch: true,
    offlineSync: true,
    prioritySupport: true,
    teamMembers: 10,
    sharedWorkspaces: true,
    adminControls: true,
  },
};

export function getPlanLimits(plan: string): PlanLimits {
  const planType = (plan as PlanType) || "free";
  return planLimits[planType] || planLimits.free;
}

export function canCreateWorkspace(
  plan: string,
  currentWorkspaceCount: number
): { allowed: boolean; reason?: string } {
  const limits = getPlanLimits(plan);

  if (limits.maxWorkspaces === null) {
    return { allowed: true };
  }

  if (currentWorkspaceCount >= limits.maxWorkspaces) {
    return {
      allowed: false,
      reason: `${
        plan.charAt(0).toUpperCase() + plan.slice(1)
      } plan is limited to ${limits.maxWorkspaces} workspace${
        limits.maxWorkspaces > 1 ? "s" : ""
      }. Upgrade to Pro for unlimited workspaces.`,
    };
  }

  return { allowed: true };
}

export function canCreateNote(
  plan: string,
  currentNoteCount: number
): { allowed: boolean; reason?: string } {
  const limits = getPlanLimits(plan);

  if (limits.maxNotes === null) {
    return { allowed: true };
  }

  if (currentNoteCount >= limits.maxNotes) {
    return {
      allowed: false,
      reason: `${
        plan.charAt(0).toUpperCase() + plan.slice(1)
      } plan is limited to ${
        limits.maxNotes
      } notes. Upgrade to Pro for unlimited notes.`,
    };
  }

  return { allowed: true };
}

export function hasFeature(plan: string, feature: keyof PlanLimits): boolean {
  const limits = getPlanLimits(plan);
  const value = limits[feature];

  // For boolean features
  if (typeof value === "boolean") {
    return value;
  }

  // For numeric limits (null means unlimited/enabled)
  return value === null || value > 0;
}
