export type PlanType = "free" | "pro" | "team";

export interface PlanLimits {
  maxWorkspaces: number | null;
  maxNotes: number | null;
  advancedSearch: boolean;
  offlineSync: boolean;
  prioritySupport: boolean;
  teamMembers: number | null;
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
    maxWorkspaces: null,
    maxNotes: null,
    advancedSearch: true,
    offlineSync: true,
    prioritySupport: true,
    teamMembers: null,
    sharedWorkspaces: false,
    adminControls: false,
  },
  team: {
    maxWorkspaces: null,
    maxNotes: null,
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

export function getPlanDisplayName(plan: string): string {
  const names: Record<string, string> = {
    free: "Free",
    pro: "Pro",
    team: "Team",
  };
  return names[plan] || "Free";
}

export function getPlanPrice(plan: string): string {
  const prices: Record<string, string> = {
    free: "$0",
    pro: "$9",
    team: "$29",
  };
  return prices[plan] || "$0";
}

export function formatUsage(current: number, limit: number | null): string {
  if (limit === null) {
    return `${current}`;
  }
  return `${current} / ${limit}`;
}

export function isNearLimit(current: number, limit: number | null): boolean {
  if (limit === null) return false;
  return current >= limit * 0.8; // 80% threshold
}
