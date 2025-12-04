import { s as store_get, a as attr_class, e as ensure_array_like, b as attr_style, c as stringify, u as unsubscribe_stores } from "../../../chunks/index2.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils.js";
import { a as attr } from "../../../chunks/attributes.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/state.svelte.js";
import { T as Tooltip } from "../../../chunks/Tooltip.js";
import { c as currentWorkspace, s as selectedCategoryId, w as workspaces, a as categories, b as searchQuery, d as showArchived, e as showTrashed, n as notes, f as sidebarOpen, i as isOffline, g as syncQueue } from "../../../chunks/stores.js";
import "../../../chunks/sync.js";
import { U as escape_html } from "../../../chunks/utils2.js";
function _layout($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let { data, children } = $$props;
    let showWorkspaceDropdown = false;
    let categoriesCollapsed = false;
    let currentTheme = "teal";
    async function loadWorkspaceData(workspaceId) {
      const catResponse = await fetch(`/api/workspaces/${workspaceId}/categories`);
      const catData = await catResponse.json();
      if (catResponse.ok) {
        categories.set(catData.categories);
      }
      await loadNotes(workspaceId);
    }
    async function loadNotes(workspaceId) {
      const params = new URLSearchParams();
      if (store_get($$store_subs ??= {}, "$selectedCategoryId", selectedCategoryId)) params.set("categoryId", store_get($$store_subs ??= {}, "$selectedCategoryId", selectedCategoryId));
      if (store_get($$store_subs ??= {}, "$searchQuery", searchQuery)) params.set("search", store_get($$store_subs ??= {}, "$searchQuery", searchQuery));
      if (store_get($$store_subs ??= {}, "$showArchived", showArchived)) params.set("archived", "true");
      if (store_get($$store_subs ??= {}, "$showTrashed", showTrashed)) params.set("trashed", "true");
      const response = await fetch(`/api/workspaces/${workspaceId}/notes?${params}`);
      const data2 = await response.json();
      if (response.ok) {
        notes.set(data2.notes);
      }
    }
    async function handleWorkspaceChange(workspace) {
      currentWorkspace.set(workspace);
      selectedCategoryId.set(null);
      await loadWorkspaceData(workspace.id);
    }
    $$renderer2.push(`<div class="flex h-screen bg-slate-50 overflow-hidden">`);
    if (store_get($$store_subs ??= {}, "$sidebarOpen", sidebarOpen)) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<aside${attr_class("w-72 bg-white border-r border-slate-200 flex flex-col", void 0, { "lg:flex": true })}><div class="p-3 md:p-4 border-b border-slate-200 bg-gradient-conic relative"><div class="relative"><div class="flex items-center justify-between mb-3"><div class="flex items-center gap-1.5">`);
      Tooltip($$renderer2, {
        text: "Tadwīn (تدوين) - Arabic for: writing, recording, documenting",
        children: ($$renderer3) => {
          $$renderer3.push(`<h1 class="text-lg md:text-xl font-extrabold text-primary tracking-tight cursor-help">Tadwin</h1>`);
        }
      });
      $$renderer2.push(`<!----> `);
      if (data?.user?.plan === "free") {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide bg-white/90 text-slate-700">Free</span>`);
      } else {
        $$renderer2.push("<!--[!-->");
        if (data?.user?.plan === "pro") {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide bg-white/90 text-teal-700">Pro</span>`);
        } else {
          $$renderer2.push("<!--[!-->");
          if (data?.user?.plan === "team") {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide bg-white/90 text-purple-700">Team</span>`);
          } else {
            $$renderer2.push("<!--[!-->");
          }
          $$renderer2.push(`<!--]-->`);
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]--></div> <button class="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded" aria-label="Close sidebar"><svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><line x1="9" x2="9" y1="3" y2="21"></line></svg></button></div> <div class="space-y-2.5"><div class="flex gap-1.5 relative workspace-dropdown-container">`);
      $$renderer2.select(
        {
          onchange: (e) => {
            const ws = store_get($$store_subs ??= {}, "$workspaces", workspaces).find((w) => w.id === e.currentTarget.value);
            if (ws) handleWorkspaceChange(ws);
          },
          value: store_get($$store_subs ??= {}, "$currentWorkspace", currentWorkspace)?.id || "",
          class: "flex-1 px-3 py-2 bg-white/80 backdrop-blur-md border-0 rounded-lg text-sm font-semibold text-slate-900 focus:ring-0 focus:bg-white transition-all shadow-sm"
        },
        ($$renderer3) => {
          $$renderer3.push(`<!--[-->`);
          const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$workspaces", workspaces));
          for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
            let workspace = each_array[$$index];
            $$renderer3.option({ value: workspace.id }, ($$renderer4) => {
              $$renderer4.push(`${escape_html(workspace.name)}`);
            });
          }
          $$renderer3.push(`<!--]-->`);
        }
      );
      $$renderer2.push(` <button class="px-2.5 py-2 bg-white/80 hover:bg-white backdrop-blur-md text-slate-900 rounded-lg transition-all shadow-sm" aria-label="Workspace actions"${attr("aria-expanded", showWorkspaceDropdown)}><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path></svg></button> `);
      {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div> <button class="w-full px-3 py-2 bg-white/80 hover:bg-white backdrop-blur-md text-slate-900 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg> New Workspace</button></div></div></div> <nav class="flex-1 overflow-y-auto p-2 md:p-4"><div class="space-y-1"><button${attr_class("w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-xs md:text-sm font-semibold transition-all", void 0, {
        "bg-primary-bg": !store_get($$store_subs ??= {}, "$selectedCategoryId", selectedCategoryId) && !store_get($$store_subs ??= {}, "$showArchived", showArchived) && !store_get($$store_subs ??= {}, "$showTrashed", showTrashed),
        "text-primary": !store_get($$store_subs ??= {}, "$selectedCategoryId", selectedCategoryId) && !store_get($$store_subs ??= {}, "$showArchived", showArchived) && !store_get($$store_subs ??= {}, "$showTrashed", showTrashed)
      })}><div class="flex items-center gap-3"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg> All Notes</div></button> `);
      if (store_get($$store_subs ??= {}, "$categories", categories).length > 0) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="pt-6"><div class="flex items-center justify-between px-3 mb-1.5"><h3 class="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">Categories</h3> <button class="text-slate-400 hover:text-slate-600 transition-colors"${attr("aria-label", "Collapse categories")}><svg${attr_class("w-4 h-4 transition-transform duration-200", void 0, { "rotate-180": categoriesCollapsed })} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg></button></div> `);
        {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<div><!--[-->`);
          const each_array_1 = ensure_array_like(store_get($$store_subs ??= {}, "$categories", categories));
          for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
            let category = each_array_1[$$index_1];
            $$renderer2.push(`<button${attr_class("w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-xs md:text-sm font-semibold flex items-center transition-all", void 0, {
              "bg-primary-bg": store_get($$store_subs ??= {}, "$selectedCategoryId", selectedCategoryId) === category.id,
              "text-primary": store_get($$store_subs ??= {}, "$selectedCategoryId", selectedCategoryId) === category.id
            })}>`);
            if (category.color) {
              $$renderer2.push("<!--[-->");
              $$renderer2.push(`<span class="w-3 h-3 rounded-full mr-3 ring-2 ring-white"${attr_style(`background-color: ${stringify(category.color)}`)}></span>`);
            } else {
              $$renderer2.push("<!--[!-->");
            }
            $$renderer2.push(`<!--]--> ${escape_html(category.name)}</button>`);
          }
          $$renderer2.push(`<!--]--></div>`);
        }
        $$renderer2.push(`<!--]--></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> <div class="pt-6 border-t border-slate-200 mt-6 space-y-1"><button${attr_class("w-full text-left px-4 py-2 rounded-xl hover:bg-slate-50 text-sm font-semibold transition-all flex items-center gap-3", void 0, {
        "bg-primary-bg": store_get($$store_subs ??= {}, "$showArchived", showArchived),
        "text-primary": store_get($$store_subs ??= {}, "$showArchived", showArchived)
      })}><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg> Archived</button> <button${attr_class("w-full text-left px-4 py-2 rounded-xl hover:bg-slate-50 text-sm font-semibold transition-all flex items-center gap-3", void 0, {
        "bg-primary-bg": store_get($$store_subs ??= {}, "$showTrashed", showTrashed),
        "text-primary": store_get($$store_subs ??= {}, "$showTrashed", showTrashed)
      })}><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg> Trash</button></div></div></nav> <div class="p-2 md:p-4 border-t border-slate-200 bg-slate-50 space-y-3">`);
      if (store_get($$store_subs ??= {}, "$isOffline", isOffline)) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="px-2.5 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-[10px] md:text-xs font-semibold"><div class="flex items-center gap-2"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clip-rule="evenodd"></path></svg> Offline mode `);
        if (store_get($$store_subs ??= {}, "$syncQueue", syncQueue).length > 0) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<span class="ml-auto font-bold">(${escape_html(store_get($$store_subs ??= {}, "$syncQueue", syncQueue).length)})</span>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--></div></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> <div class="flex items-center justify-center gap-3 px-3 py-2"><button class="group relative" aria-label="Teal theme"><div${attr_class("w-7 h-7 rounded-xl bg-teal-400 border-2 transition-all cursor-pointer", void 0, {
        "border-slate-300": currentTheme !== "teal",
        "border-teal-600": currentTheme === "teal",
        "ring-2": currentTheme === "teal",
        "ring-teal-200": currentTheme === "teal",
        "ring-offset-2": currentTheme === "teal"
      })}>`);
      {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<svg class="w-full h-full text-white p-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>`);
      }
      $$renderer2.push(`<!--]--></div></button> <button class="group relative" aria-label="Orange theme"><div${attr_class("w-7 h-7 rounded-xl bg-orange-400 border-2 transition-all cursor-pointer", void 0, {
        "border-slate-300": currentTheme !== "orange",
        "border-orange-600": currentTheme === "orange",
        "ring-2": currentTheme === "orange",
        "ring-orange-200": currentTheme === "orange",
        "ring-offset-2": currentTheme === "orange"
      })}>`);
      {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div></button> <button class="group relative" aria-label="Pink theme"><div${attr_class("w-7 h-7 rounded-xl bg-pink-400 border-2 transition-all cursor-pointer", void 0, {
        "border-slate-300": currentTheme !== "pink",
        "border-pink-600": currentTheme === "pink",
        "ring-2": currentTheme === "pink",
        "ring-pink-200": currentTheme === "pink",
        "ring-offset-2": currentTheme === "pink"
      })}>`);
      {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div></button> <button class="group relative" aria-label="Lime theme"><div${attr_class("w-7 h-7 rounded-xl bg-lime-500 border-2 transition-all cursor-pointer", void 0, {
        "border-slate-300": currentTheme !== "lime",
        "border-lime-700": currentTheme === "lime",
        "ring-2": currentTheme === "lime",
        "ring-lime-200": currentTheme === "lime",
        "ring-offset-2": currentTheme === "lime"
      })}>`);
      {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div></button></div> <div class="flex items-center justify-between px-1 md:px-2"><span class="text-xs md:text-sm font-medium text-slate-700 truncate flex-1">${escape_html(data?.user?.email)}</span> <button class="text-xs md:text-sm text-red-600 hover:text-red-700 font-semibold transition-colors">Logout</button></div> <div class="pt-3 border-t border-slate-200">`);
      if (data?.user?.plan === "free" && store_get($$store_subs ??= {}, "$currentWorkspace", currentWorkspace)) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="space-y-2"><div class="grid grid-cols-2 gap-2 text-xs"><div class="text-slate-600"><span class="font-medium">Workspaces:</span> <span class="font-bold text-slate-900 ml-1">${escape_html(store_get($$store_subs ??= {}, "$workspaces", workspaces).length)}/1</span></div> <div class="text-slate-600"><span class="font-medium">Notes:</span> <span${attr_class("font-bold ml-1", void 0, {
          "text-slate-900": store_get($$store_subs ??= {}, "$notes", notes).filter((n) => !n.isTrashed).length < 80,
          "text-amber-700": store_get($$store_subs ??= {}, "$notes", notes).filter((n) => !n.isTrashed).length >= 80,
          "text-red-600": store_get($$store_subs ??= {}, "$notes", notes).filter((n) => !n.isTrashed).length >= 100
        })}>${escape_html(store_get($$store_subs ??= {}, "$notes", notes).filter((n) => !n.isTrashed).length)}/100</span></div></div> <a href="/pricing" class="w-full block text-center px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-lg transition-all"><svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg> Upgrade to Pro</a></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<a href="/pricing" class="w-full block text-center px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-lg transition-all"><svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg> Upgrade to Pro</a>`);
      }
      $$renderer2.push(`<!--]--></div></div></aside>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (!store_get($$store_subs ??= {}, "$sidebarOpen", sidebarOpen)) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<button class="fixed bottom-4 left-4 z-50 bg-primary text-white p-3 rounded-lg hover:bg-primary-hover transition-all" aria-label="Open sidebar"><svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><line x1="9" x2="9" y1="3" y2="21"></line></svg></button>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <main class="flex-1 flex flex-col overflow-hidden">`);
    children($$renderer2);
    $$renderer2.push(`<!----></main></div> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _layout as default
};
