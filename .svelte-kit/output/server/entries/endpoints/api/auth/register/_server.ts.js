import { json } from "@sveltejs/kit";
import { d as db } from "../../../../../chunks/db.js";
import { h as hashPassword, c as createSession, s as setSessionCookie } from "../../../../../chunks/auth.js";
const POST = async ({ request, cookies }) => {
  const { email, password, name } = await request.json();
  if (!email || !password) {
    return json({ error: "Email and password are required" }, { status: 400 });
  }
  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) {
    return json({ error: "User already exists" }, { status: 400 });
  }
  const hashedPassword = await hashPassword(password);
  const user = await db.user.create({
    data: {
      email,
      password: hashedPassword,
      name: name || null
    }
  });
  await db.workspace.create({
    data: {
      name: "My Workspace",
      userId: user.id
    }
  });
  const token = await createSession(user.id);
  setSessionCookie(cookies, token);
  return json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan
    }
  });
};
export {
  POST
};
