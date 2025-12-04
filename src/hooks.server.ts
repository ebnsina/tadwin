import type { Handle } from "@sveltejs/kit";
import { getSessionToken, getSessionUser } from "$lib/server/auth";

export const handle: Handle = async ({ event, resolve }) => {
  const token = getSessionToken(event.cookies);

  if (token) {
    const user = await getSessionUser(token);
    if (user) {
      event.locals.user = user;
    }
  }

  return resolve(event);
};
