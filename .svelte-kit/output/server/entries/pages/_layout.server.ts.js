const load = async ({ locals }) => {
  return {
    user: locals.user || null,
    meta: {
      title: "Tadwin - Markdown-First Note Taking & Knowledge Management",
      description: "A powerful, markdown-first note-taking app designed for developers, writers, and knowledge workers. Organize your thoughts with workspaces, categories, and lightning-fast search.",
      keywords: "note taking, markdown, knowledge management, notes app, workspace, productivity, offline notes, sync",
      ogImage: "/og-image.png",
      ogUrl: "https://tadwin.app",
      twitterCard: "summary_large_image",
      twitterSite: "@tadwin",
      author: "Tadwin",
      canonical: "https://tadwin.app"
    }
  };
};
export {
  load
};
