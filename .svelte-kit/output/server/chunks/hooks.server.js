import { g as getSessionToken, b as getSessionUser } from "./auth.js";
const handle = async ({ event, resolve }) => {
  const token = getSessionToken(event.cookies);
  if (token) {
    const user = await getSessionUser(token);
    if (user) {
      event.locals.user = user;
    }
  }
  return resolve(event);
};
export {
  handle
};
