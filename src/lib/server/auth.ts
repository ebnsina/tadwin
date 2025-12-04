import { db } from "./db";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import type { Cookies } from "@sveltejs/kit";

const SESSION_COOKIE_NAME = "session";
const SESSION_DURATION = 1000 * 60 * 60 * 24 * 7; // 7 days
const REMEMBER_ME_DURATION = 1000 * 60 * 60 * 24 * 30; // 30 days

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(): string {
  return randomBytes(32).toString("hex");
}

export async function createSession(
  userId: string,
  rememberMe: boolean = false
): Promise<string> {
  const token = generateToken();
  const duration = rememberMe ? REMEMBER_ME_DURATION : SESSION_DURATION;
  const expiresAt = new Date(Date.now() + duration);

  await db.session.create({
    data: {
      userId,
      token,
      expiresAt,
      rememberMe,
    },
  });

  return token;
}

export async function getSessionUser(token: string) {
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
          updatedAt: true,
        },
      },
    },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await db.session.delete({ where: { id: session.id } });
    }
    return null;
  }

  return session.user;
}

export async function deleteSession(token: string) {
  await db.session.delete({ where: { token } }).catch(() => {});
}

export function setSessionCookie(
  cookies: Cookies,
  token: string,
  rememberMe: boolean = false
) {
  const maxAge = rememberMe
    ? REMEMBER_ME_DURATION / 1000
    : SESSION_DURATION / 1000;

  cookies.set(SESSION_COOKIE_NAME, token, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge,
  });
}

export function deleteSessionCookie(cookies: Cookies) {
  cookies.delete(SESSION_COOKIE_NAME, {
    path: "/",
  });
}

export function getSessionToken(cookies: Cookies): string | undefined {
  return cookies.get(SESSION_COOKIE_NAME);
}
