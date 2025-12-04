import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/server/db";
import { canCreateNote } from "$lib/server/plans";

export const GET: RequestHandler = async ({ params, url, locals }) => {
  if (!locals.user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const categoryId = url.searchParams.get("categoryId");
  const search = url.searchParams.get("search");
  const archived = url.searchParams.get("archived") === "true";
  const trashed = url.searchParams.get("trashed") === "true";

  const where: any = {
    workspaceId: params.id,
    workspace: { userId: locals.user.id },
  };

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { content: { contains: search, mode: "insensitive" } },
    ];
  }

  if (trashed) {
    where.isTrashed = true;
  } else {
    where.isTrashed = false;
    if (archived) {
      where.isArchived = true;
    } else {
      where.isArchived = false;
    }
  }

  const notes = await db.note.findMany({
    where,
    include: {
      category: true,
    },
    orderBy: [{ isPinned: "desc" }, { lastModified: "desc" }],
  });

  return json({ notes });
};

export const POST: RequestHandler = async ({ params, request, locals }) => {
  if (!locals.user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, content, categoryId } = await request.json();

  // Verify workspace ownership
  const workspace = await db.workspace.findUnique({
    where: { id: params.id },
  });

  if (!workspace || workspace.userId !== locals.user.id) {
    return json({ error: "Not found" }, { status: 404 });
  }

  // Check note limit based on user's plan
  const noteCount = await db.note.count({
    where: {
      workspaceId: params.id,
      isTrashed: false, // Don't count trashed notes towards limit
    },
  });

  const canCreate = canCreateNote(locals.user.plan, noteCount);
  if (!canCreate.allowed) {
    return json(
      {
        error: "Note limit reached",
        message: canCreate.reason,
        code: "NOTE_LIMIT_REACHED",
      },
      { status: 403 }
    );
  }

  const note = await db.note.create({
    data: {
      title: title || "Untitled",
      content: content || "",
      workspaceId: params.id,
      categoryId: categoryId || null,
      lastModified: new Date(),
    },
    include: {
      category: true,
    },
  });

  return json({ note });
};
