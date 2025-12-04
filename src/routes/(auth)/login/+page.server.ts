import { redirect } from "@sveltejs/kit";

export const load = async ({ locals }) => {
  // If user is already logged in, redirect to app
  if (locals.user) {
    throw redirect(302, "/app");
  }

  return {};
};
