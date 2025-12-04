import { json } from "@sveltejs/kit";
import { g as getSessionToken, d as deleteSession, a as deleteSessionCookie } from "../../../../../chunks/auth.js";
const POST = async ({ cookies }) => {
  const token = getSessionToken(cookies);
  if (token) {
    await deleteSession(token);
    deleteSessionCookie(cookies);
  }
  return json({ success: true });
};
export {
  POST
};
