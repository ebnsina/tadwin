const planLimits = {
  free: {
    maxWorkspaces: 1,
    maxNotes: 100,
    advancedSearch: false,
    offlineSync: false,
    prioritySupport: false,
    teamMembers: null,
    sharedWorkspaces: false,
    adminControls: false
  },
  pro: {
    maxWorkspaces: null,
    // unlimited
    maxNotes: null,
    // unlimited
    advancedSearch: true,
    offlineSync: true,
    prioritySupport: true,
    teamMembers: null,
    sharedWorkspaces: false,
    adminControls: false
  },
  team: {
    maxWorkspaces: null,
    // unlimited
    maxNotes: null,
    // unlimited
    advancedSearch: true,
    offlineSync: true,
    prioritySupport: true,
    teamMembers: 10,
    sharedWorkspaces: true,
    adminControls: true
  }
};
function getPlanLimits(plan) {
  const planType = plan || "free";
  return planLimits[planType] || planLimits.free;
}
function canCreateWorkspace(plan, currentWorkspaceCount) {
  const limits = getPlanLimits(plan);
  if (limits.maxWorkspaces === null) {
    return { allowed: true };
  }
  if (currentWorkspaceCount >= limits.maxWorkspaces) {
    return {
      allowed: false,
      reason: `${plan.charAt(0).toUpperCase() + plan.slice(1)} plan is limited to ${limits.maxWorkspaces} workspace${limits.maxWorkspaces > 1 ? "s" : ""}. Upgrade to Pro for unlimited workspaces.`
    };
  }
  return { allowed: true };
}
function canCreateNote(plan, currentNoteCount) {
  const limits = getPlanLimits(plan);
  if (limits.maxNotes === null) {
    return { allowed: true };
  }
  if (currentNoteCount >= limits.maxNotes) {
    return {
      allowed: false,
      reason: `${plan.charAt(0).toUpperCase() + plan.slice(1)} plan is limited to ${limits.maxNotes} notes. Upgrade to Pro for unlimited notes.`
    };
  }
  return { allowed: true };
}
export {
  canCreateNote as a,
  canCreateWorkspace as c
};
