import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/server/db";
import {
  hashPassword,
  createSession,
  setSessionCookie,
} from "$lib/server/auth";

export const POST: RequestHandler = async ({ request, cookies }) => {
  const { email, password, name } = await request.json();

  if (!email || !password) {
    return json({ error: "Email and password are required" }, { status: 400 });
  }

  // Check if user already exists
  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) {
    return json({ error: "User already exists" }, { status: 400 });
  }

  // Create user
  const hashedPassword = await hashPassword(password);
  const user = await db.user.create({
    data: {
      email,
      password: hashedPassword,
      name: name || null,
    },
  });

  // Create default workspace
  await db.workspace.create({
    data: {
      name: "My Workspace",
      userId: user.id,
    },
  });

  // Create session
  const token = await createSession(user.id);
  setSessionCookie(cookies, token);

  return json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
    },
  });
};
