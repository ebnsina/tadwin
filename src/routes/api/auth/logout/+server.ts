import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import {
  getSessionToken,
  deleteSession,
  deleteSessionCookie,
} from "$lib/server/auth";

export const POST: RequestHandler = async ({ cookies }) => {
  const token = getSessionToken(cookies);

  if (token) {
    await deleteSession(token);
    deleteSessionCookie(cookies);
  }

  return json({ success: true });
};
