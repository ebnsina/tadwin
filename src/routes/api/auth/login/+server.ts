import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/server/db";
import {
  verifyPassword,
  createSession,
  setSessionCookie,
} from "$lib/server/auth";

export const POST: RequestHandler = async ({ request, cookies }) => {
  const { email, password, rememberMe } = await request.json();

  if (!email || !password) {
    return json({ error: "Email and password are required" }, { status: 400 });
  }

  // Find user
  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    return json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Verify password
  const isValid = await verifyPassword(password, user.password);
  if (!isValid) {
    return json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Create session
  const token = await createSession(user.id, rememberMe);
  setSessionCookie(cookies, token, rememberMe);

  return json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  });
};
