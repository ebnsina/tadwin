import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/server/db";
import { canCreateWorkspace } from "$lib/server/plans";

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspaces = await db.workspace.findMany({
    where: { userId: locals.user.id },
    include: {
      _count: {
        select: { notes: true, categories: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return json({ workspaces });
};

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name } = await request.json();

  if (!name) {
    return json({ error: "Name is required" }, { status: 400 });
  }

  // Check workspace limit based on user's plan
  const workspaceCount = await db.workspace.count({
    where: { userId: locals.user.id },
  });

  const canCreate = canCreateWorkspace(locals.user.plan, workspaceCount);
  if (!canCreate.allowed) {
    return json(
      {
        error: "Workspace limit reached",
        message: canCreate.reason,
        code: "WORKSPACE_LIMIT_REACHED",
      },
      { status: 403 }
    );
  }

  const workspace = await db.workspace.create({
    data: {
      name,
      userId: locals.user.id,
    },
  });

  return json({ workspace });
};
