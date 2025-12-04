import { json } from "@sveltejs/kit";
import { d as db } from "../../../../../chunks/db.js";
import { v as verifyPassword, c as createSession, s as setSessionCookie } from "../../../../../chunks/auth.js";
const POST = async ({ request, cookies }) => {
  const { email, password, rememberMe } = await request.json();
  if (!email || !password) {
    return json({ error: "Email and password are required" }, { status: 400 });
  }
  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    return json({ error: "Invalid credentials" }, { status: 401 });
  }
  const isValid = await verifyPassword(password, user.password);
  if (!isValid) {
    return json({ error: "Invalid credentials" }, { status: 401 });
  }
  const token = await createSession(user.id, rememberMe);
  setSessionCookie(cookies, token, rememberMe);
  return json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    }
  });
};
export {
  POST
};
