import { json } from "@sveltejs/kit";
const GET = async ({ locals }) => {
  if (!locals.user) {
    return json({ user: null });
  }
  return json({ user: locals.user });
};
export {
  GET
};
