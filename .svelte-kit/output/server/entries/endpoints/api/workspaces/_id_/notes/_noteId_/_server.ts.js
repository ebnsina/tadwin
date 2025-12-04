import { json } from "@sveltejs/kit";
import { d as db } from "../../../../../../../chunks/db.js";
const GET = async ({ params, locals }) => {
  if (!locals.user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }
  const note = await db.note.findFirst({
    where: {
      id: params.noteId,
      workspace: { userId: locals.user.id }
    },
    include: {
      category: true
    }
  });
  if (!note) {
    return json({ error: "Not found" }, { status: 404 });
  }
  return json({ note });
};
const PUT = async ({ params, request, locals }) => {
  if (!locals.user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }
  const data = await request.json();
  const note = await db.note.findFirst({
    where: {
      id: params.noteId,
      workspace: { userId: locals.user.id }
    }
  });
  if (!note) {
    return json({ error: "Not found" }, { status: 404 });
  }
  if (data.clientRev !== void 0 && data.clientRev < note.clientRev) {
    return json({ error: "Conflict detected", note }, { status: 409 });
  }
  const updated = await db.note.update({
    where: { id: params.noteId },
    data: {
      ...data,
      lastModified: /* @__PURE__ */ new Date(),
      clientRev: note.clientRev + 1
    },
    include: {
      category: true
    }
  });
  return json({ note: updated });
};
const DELETE = async ({ params, locals }) => {
  if (!locals.user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }
  const note = await db.note.findFirst({
    where: {
      id: params.noteId,
      workspace: { userId: locals.user.id }
    }
  });
  if (!note) {
    return json({ error: "Not found" }, { status: 404 });
  }
  await db.note.delete({ where: { id: params.noteId } });
  return json({ success: true });
};
export {
  DELETE,
  GET,
  PUT
};
