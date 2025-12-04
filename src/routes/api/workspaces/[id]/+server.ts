import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/server/db";

export const PUT: RequestHandler = async ({ params, request, locals }) => {
  if (!locals.user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name } = await request.json();

  const workspace = await db.workspace.findUnique({
    where: { id: params.id },
  });

  if (!workspace || workspace.userId !== locals.user.id) {
    return json({ error: "Not found" }, { status: 404 });
  }

  const updated = await db.workspace.update({
    where: { id: params.id },
    data: { name },
  });

  return json({ workspace: updated });
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspace = await db.workspace.findUnique({
    where: { id: params.id },
  });

  if (!workspace || workspace.userId !== locals.user.id) {
    return json({ error: "Not found" }, { status: 404 });
  }

  await db.workspace.delete({ where: { id: params.id } });

  return json({ success: true });
};
