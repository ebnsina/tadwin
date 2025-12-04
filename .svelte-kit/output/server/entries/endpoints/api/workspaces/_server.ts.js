import { json } from "@sveltejs/kit";
import { d as db } from "../../../../chunks/db.js";
import { c as canCreateWorkspace } from "../../../../chunks/plans.js";
const GET = async ({ locals }) => {
  if (!locals.user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }
  const workspaces = await db.workspace.findMany({
    where: { userId: locals.user.id },
    include: {
      _count: {
        select: { notes: true, categories: true }
      }
    },
    orderBy: { updatedAt: "desc" }
  });
  return json({ workspaces });
};
const POST = async ({ request, locals }) => {
  if (!locals.user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }
  const { name } = await request.json();
  if (!name) {
    return json({ error: "Name is required" }, { status: 400 });
  }
  const workspaceCount = await db.workspace.count({
    where: { userId: locals.user.id }
  });
  const canCreate = canCreateWorkspace(locals.user.plan, workspaceCount);
  if (!canCreate.allowed) {
    return json(
      {
        error: "Workspace limit reached",
        message: canCreate.reason,
        code: "WORKSPACE_LIMIT_REACHED"
      },
      { status: 403 }
    );
  }
  const workspace = await db.workspace.create({
    data: {
      name,
      userId: locals.user.id
    }
  });
  return json({ workspace });
};
export {
  GET,
  POST
};
