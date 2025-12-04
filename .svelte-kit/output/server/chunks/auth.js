import { d as db } from "./db.js";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";
const SESSION_COOKIE_NAME = "session";
const SESSION_DURATION = 1e3 * 60 * 60 * 24 * 7;
const REMEMBER_ME_DURATION = 1e3 * 60 * 60 * 24 * 30;
async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}
async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}
function generateToken() {
  return randomBytes(32).toString("hex");
}
async function createSession(userId, rememberMe = false) {
  const token = generateToken();
  const duration = rememberMe ? REMEMBER_ME_DURATION : SESSION_DURATION;
  const expiresAt = new Date(Date.now() + duration);
  await db.session.create({
    data: {
      userId,
      token,
      expiresAt,
      rememberMe
    }
  });
  return token;
}
async function getSessionUser(token) {
  const session = await db.session.findUnique({
    where: { token },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          plan: true,
          createdAt: true,
          updatedAt: true
        }
      }
    }
  });
  if (!session || session.expiresAt < /* @__PURE__ */ new Date()) {
    if (session) {
      await db.session.delete({ where: { id: session.id } });
    }
    return null;
  }
  return session.user;
}
async function deleteSession(token) {
  await db.session.delete({ where: { token } }).catch(() => {
  });
}
function setSessionCookie(cookies, token, rememberMe = false) {
  const maxAge = rememberMe ? REMEMBER_ME_DURATION / 1e3 : SESSION_DURATION / 1e3;
  cookies.set(SESSION_COOKIE_NAME, token, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge
  });
}
function deleteSessionCookie(cookies) {
  cookies.delete(SESSION_COOKIE_NAME, {
    path: "/"
  });
}
function getSessionToken(cookies) {
  return cookies.get(SESSION_COOKIE_NAME);
}
export {
  deleteSessionCookie as a,
  getSessionUser as b,
  createSession as c,
  deleteSession as d,
  getSessionToken as g,
  hashPassword as h,
  setSessionCookie as s,
  verifyPassword as v
};
