import { json } from "@sveltejs/kit";
import { d as db } from "../../../../../../chunks/db.js";
const GET = async ({ params, locals }) => {
  if (!locals.user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }
  const categories = await db.category.findMany({
    where: {
      workspaceId: params.id,
      workspace: { userId: locals.user.id }
    },
    include: {
      _count: {
        select: { notes: true }
      }
    },
    orderBy: { name: "asc" }
  });
  return json({ categories });
};
const POST = async ({ params, request, locals }) => {
  if (!locals.user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }
  const { name, color } = await request.json();
  if (!name) {
    return json({ error: "Name is required" }, { status: 400 });
  }
  const workspace = await db.workspace.findUnique({
    where: { id: params.id }
  });
  if (!workspace || workspace.userId !== locals.user.id) {
    return json({ error: "Not found" }, { status: 404 });
  }
  const category = await db.category.create({
    data: {
      name,
      color: color || null,
      workspaceId: params.id
    }
  });
  return json({ category });
};
export {
  GET,
  POST
};
