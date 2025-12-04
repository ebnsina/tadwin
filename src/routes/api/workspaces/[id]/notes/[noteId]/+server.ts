import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/server/db";

export const GET: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const note = await db.note.findFirst({
    where: {
      id: params.noteId,
      workspace: { userId: locals.user.id },
    },
    include: {
      category: true,
    },
  });

  if (!note) {
    return json({ error: "Not found" }, { status: 404 });
  }

  return json({ note });
};

export const PUT: RequestHandler = async ({ params, request, locals }) => {
  if (!locals.user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await request.json();

  const note = await db.note.findFirst({
    where: {
      id: params.noteId,
      workspace: { userId: locals.user.id },
    },
  });

  if (!note) {
    return json({ error: "Not found" }, { status: 404 });
  }

  // Handle conflict resolution (Last Write Wins)
  if (data.clientRev !== undefined && data.clientRev < note.clientRev) {
    return json({ error: "Conflict detected", note }, { status: 409 });
  }

  const updated = await db.note.update({
    where: { id: params.noteId },
    data: {
      ...data,
      lastModified: new Date(),
      clientRev: note.clientRev + 1,
    },
    include: {
      category: true,
    },
  });

  return json({ note: updated });
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const note = await db.note.findFirst({
    where: {
      id: params.noteId,
      workspace: { userId: locals.user.id },
    },
  });

  if (!note) {
    return json({ error: "Not found" }, { status: 404 });
  }

  await db.note.delete({ where: { id: params.noteId } });

  return json({ success: true });
};
