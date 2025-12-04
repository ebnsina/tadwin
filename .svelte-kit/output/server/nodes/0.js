import * as server from '../entries/pages/_layout.server.ts.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { server };
export const server_id = "src/routes/+layout.server.ts";
export const imports = ["_app/immutable/nodes/0.DJvd9z8L.js","_app/immutable/chunks/BexDkSge.js","_app/immutable/chunks/D4NGhvwl.js","_app/immutable/chunks/CCAJ6pJL.js","_app/immutable/chunks/CXTF55Ck.js","_app/immutable/chunks/u5Wf2QY9.js","_app/immutable/chunks/CgbIzcwP.js"];
export const stylesheets = ["_app/immutable/assets/0.DpNMd00R.css"];
export const fonts = [];
