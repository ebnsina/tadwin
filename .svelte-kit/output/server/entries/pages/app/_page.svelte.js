import { a as attr_class, d as bind_props, u as unsubscribe_stores, s as store_get, e as ensure_array_like, b as attr_style, c as stringify } from "../../../chunks/index2.js";
import { h as selectedNote, b as searchQuery, j as filteredNotes, k as isSaving, l as lastSaved, c as currentWorkspace, i as isOffline, n as notes } from "../../../chunks/stores.js";
import { a as addToSyncQueue } from "../../../chunks/sync.js";
import "marked";
import "dompurify";
import { U as escape_html } from "../../../chunks/utils2.js";
import { a as attr } from "../../../chunks/attributes.js";
function MarkdownEditor($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { value = "", onchange = (value2) => {
    } } = $$props;
    let showPreview = false;
    $$renderer2.push(`<div class="flex flex-col h-full"><div class="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200"><div class="flex items-center space-x-2"><button class="p-2 hover:bg-gray-100 rounded-lg" title="Bold"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z"></path></svg></button> <button class="p-2 hover:bg-gray-100 rounded-lg" title="Italic"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m-4 4h8M6 16h8"></path></svg></button> <button class="p-2 hover:bg-gray-100 rounded-lg" title="Heading"><span class="text-sm font-bold">H</span></button> <button class="p-2 hover:bg-gray-100 rounded-lg" title="Link"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg></button> <button class="p-2 hover:bg-gray-100 rounded-lg" title="List"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg></button> <button class="p-2 hover:bg-gray-100 rounded-lg" title="Code Block"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg></button></div> <button${attr_class("px-3 py-1 text-sm font-medium rounded-lg hover:bg-primary-bg transition-colors", void 0, {
      "bg-primary-bg": (
        // Update editor when value changes externally
        showPreview
      ),
      "text-primary": showPreview
    })}>${escape_html("Preview")}</button></div> <div class="flex-1 overflow-hidden relative"><div${attr_class("h-full overflow-y-auto px-4 py-3 prose prose-sm max-w-none absolute inset-0 bg-white", void 0, { "hidden": !showPreview })}></div> <div${attr_class("h-full overflow-y-auto absolute inset-0", void 0, { "hidden": showPreview })}></div></div></div>`);
    bind_props($$props, { value });
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let noteTitle = "";
    let noteContent = "";
    let saveTimeout;
    let isCreatingNote = false;
    let showConflictModal = false;
    let conflictServerNote = null;
    let hasUnsavedChanges = false;
    async function loadNotes() {
      if (!store_get($$store_subs ??= {}, "$currentWorkspace", currentWorkspace)) return;
      const response = await fetch(`/api/workspaces/${store_get($$store_subs ??= {}, "$currentWorkspace", currentWorkspace).id}/notes`);
      if (response.ok) {
        const data = await response.json();
        notes.set(data.notes);
      }
    }
    function handleContentChange(content) {
      noteContent = content;
      hasUnsavedChanges = true;
      debouncedSave();
    }
    function debouncedSave() {
      if (!store_get($$store_subs ??= {}, "$selectedNote", selectedNote)) return;
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(
        () => {
          saveNote();
        },
        2e3
      );
    }
    async function saveNote(manual = false) {
      if (!store_get($$store_subs ??= {}, "$selectedNote", selectedNote) || !store_get($$store_subs ??= {}, "$currentWorkspace", currentWorkspace)) return;
      isSaving.set(true);
      hasUnsavedChanges = false;
      const updatedNote = {
        ...store_get($$store_subs ??= {}, "$selectedNote", selectedNote),
        title: "Untitled",
        content: noteContent,
        lastModified: /* @__PURE__ */ new Date()
      };
      if (store_get($$store_subs ??= {}, "$isOffline", isOffline)) {
        addToSyncQueue({ action: "update", type: "note", data: updatedNote });
        isSaving.set(false);
        lastSaved.set(/* @__PURE__ */ new Date());
      } else {
        try {
          const response = await fetch(`/api/workspaces/${store_get($$store_subs ??= {}, "$currentWorkspace", currentWorkspace).id}/notes/${store_get($$store_subs ??= {}, "$selectedNote", selectedNote).id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: noteTitle || "Untitled",
              content: noteContent,
              clientRev: store_get($$store_subs ??= {}, "$selectedNote", selectedNote).clientRev
            })
          });
          if (response.ok) {
            const data = await response.json();
            selectedNote.set(data.note);
            lastSaved.set(/* @__PURE__ */ new Date());
            await loadNotes();
          } else if (response.status === 409) {
            const data = await response.json();
            conflictServerNote = data.note;
            showConflictModal = true;
          }
        } catch (error) {
          console.error("Save error:", error);
        } finally {
          isSaving.set(false);
        }
      }
    }
    function formatTimeAgo(date) {
      const seconds = Math.floor(((/* @__PURE__ */ new Date()).getTime() - new Date(date).getTime()) / 1e3);
      if (seconds < 10) return "just now";
      if (seconds < 60) return `${seconds}s ago`;
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      return new Date(date).toLocaleDateString();
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<div class="flex h-full"><div${attr_class("w-full md:w-80 border-r border-slate-200 bg-white flex flex-col", void 0, {
        "hidden": store_get($$store_subs ??= {}, "$selectedNote", selectedNote) !== null,
        "md:flex": true
      })}><div class="p-3 md:p-5 border-b border-slate-200 bg-slate-50"><div class="relative"><svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg> <input type="text"${attr("value", store_get($$store_subs ??= {}, "$searchQuery", searchQuery))} placeholder="Search notes..." class="w-full pl-10 pr-3 py-2 md:pl-12 md:pr-4 md:py-2 border-2 border-slate-200 rounded-lg md:rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all font-medium"/></div></div> <div class="p-3 md:p-5 border-b border-slate-200"><button${attr("disabled", isCreatingNote, true)} class="w-full px-3 py-1.5 md:px-4 md:py-2 bg-primary hover:bg-primary-hover text-white text-xs md:text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 md:gap-2 disabled:opacity-50"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg> New Note</button> `);
      {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]--></div> <div class="flex-1 overflow-y-auto">`);
      if (store_get($$store_subs ??= {}, "$filteredNotes", filteredNotes).length === 0) {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`<div class="p-8 text-center text-slate-500"><svg class="w-16 h-16 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg> <p class="text-sm font-medium">${escape_html(store_get($$store_subs ??= {}, "$searchQuery", searchQuery) ? "No notes found" : "No notes yet")}</p></div>`);
      } else {
        $$renderer3.push("<!--[!-->");
        $$renderer3.push(`<!--[-->`);
        const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$filteredNotes", filteredNotes));
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let note = each_array[$$index];
          $$renderer3.push(`<button${attr_class("w-full text-left px-3 py-2.5 md:px-5 md:py-4 border-b border-slate-100 hover:bg-primary-bg transition-all group", void 0, {
            "bg-primary-bg": store_get($$store_subs ??= {}, "$selectedNote", selectedNote)?.id === note.id,
            "border-l-4": store_get($$store_subs ??= {}, "$selectedNote", selectedNote)?.id === note.id,
            "border-l-primary": store_get($$store_subs ??= {}, "$selectedNote", selectedNote)?.id === note.id
          })}><div class="flex items-start justify-between"><div class="flex-1 min-w-0"><h3 class="font-bold text-slate-900 truncate flex items-center gap-1.5 md:gap-2 text-sm md:text-base">`);
          if (note.isPinned) {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<svg class="w-3.5 md:w-4 h-3.5 md:h-4 text-primary" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a.75.75 0 01.75.75v8.5a.75.75 0 01-1.5 0v-8.5A.75.75 0 0110 2z M9.25 14.5a.75.75 0 00.75.75h.01a.75.75 0 00.75-.75v-.01a.75.75 0 00-.75-.75H10a.75.75 0 00-.75.75v.01z"></path></svg>`);
          } else {
            $$renderer3.push("<!--[!-->");
          }
          $$renderer3.push(`<!--]--> ${escape_html(note.title)}</h3> <p class="text-xs md:text-sm text-slate-600 truncate mt-1 md:mt-1.5 leading-relaxed">${escape_html(note.content.slice(0, 100))}</p> <p class="text-[10px] md:text-xs text-slate-400 mt-1.5 md:mt-2 font-medium">${escape_html(formatTimeAgo(note.lastModified))}</p></div> `);
          if (note.category) {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<span class="ml-3 w-3 h-3 rounded-full shrink-0 ring-2 ring-white"${attr_style(`background-color: ${stringify(note.category.color || "#gray")}`)}></span>`);
          } else {
            $$renderer3.push("<!--[!-->");
          }
          $$renderer3.push(`<!--]--></div></button>`);
        }
        $$renderer3.push(`<!--]-->`);
      }
      $$renderer3.push(`<!--]--></div></div> <div${attr_class("flex-1 flex flex-col bg-white", void 0, {
        "hidden": store_get($$store_subs ??= {}, "$selectedNote", selectedNote) === null,
        "md:flex": store_get($$store_subs ??= {}, "$selectedNote", selectedNote) !== null
      })}>`);
      if (store_get($$store_subs ??= {}, "$selectedNote", selectedNote)) {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`<div class="md:hidden px-3 py-2 border-b border-slate-200 bg-slate-50"><button class="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 text-sm font-semibold"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg> Back to Notes</button></div> <div class="px-4 py-4 border-b border-slate-200 bg-slate-50/50"><input type="text"${attr("value", noteTitle)} placeholder="Note title" class="w-full text-2xl font-extrabold text-slate-900 border-none outline-none focus:ring-0 px-0 bg-transparent placeholder:text-slate-300"/> <div class="flex items-center gap-2 mt-3 flex-wrap"><div class="flex items-center gap-1.5 flex-wrap"><button${attr_class("px-3 py-1.5 text-xs md:text-sm font-semibold rounded-lg hover:bg-white transition-all border border-slate-200", void 0, {
          "text-primary": store_get($$store_subs ??= {}, "$selectedNote", selectedNote).isPinned,
          "bg-primary-bg": store_get($$store_subs ??= {}, "$selectedNote", selectedNote).isPinned,
          "border-primary-light": store_get($$store_subs ??= {}, "$selectedNote", selectedNote).isPinned
        })}>${escape_html(store_get($$store_subs ??= {}, "$selectedNote", selectedNote).isPinned ? "📌 Pinned" : "Pin")}</button> <button class="px-3 py-1.5 text-xs md:text-sm font-semibold rounded-lg hover:bg-white transition-all border border-slate-200">${escape_html(store_get($$store_subs ??= {}, "$selectedNote", selectedNote).isArchived ? "Unarchive" : "Archive")}</button> <button class="px-3 py-1.5 text-xs md:text-sm font-semibold rounded-lg hover:bg-red-50 hover:text-red-600 transition-all border border-slate-200">Trash</button> `);
        if (store_get($$store_subs ??= {}, "$selectedNote", selectedNote).isTrashed) {
          $$renderer3.push("<!--[-->");
          $$renderer3.push(`<button class="px-3 py-1.5 text-xs md:text-sm font-semibold rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-all">Delete Forever</button>`);
        } else {
          $$renderer3.push("<!--[!-->");
        }
        $$renderer3.push(`<!--]--></div> <div class="ml-auto flex items-center gap-2 md:gap-3"><div class="text-xs md:text-sm text-slate-500 font-medium hidden sm:block">`);
        if (store_get($$store_subs ??= {}, "$isSaving", isSaving)) {
          $$renderer3.push("<!--[-->");
          $$renderer3.push(`<span class="flex items-center gap-2"><svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Saving...</span>`);
        } else {
          $$renderer3.push("<!--[!-->");
          if (hasUnsavedChanges) {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<span class="text-amber-600 font-semibold">Unsaved changes</span>`);
          } else {
            $$renderer3.push("<!--[!-->");
            if (store_get($$store_subs ??= {}, "$lastSaved", lastSaved)) {
              $$renderer3.push("<!--[-->");
              $$renderer3.push(`<span>Saved ${escape_html(formatTimeAgo(store_get($$store_subs ??= {}, "$lastSaved", lastSaved)))}</span>`);
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]-->`);
          }
          $$renderer3.push(`<!--]-->`);
        }
        $$renderer3.push(`<!--]--></div> <button${attr("disabled", store_get($$store_subs ??= {}, "$isSaving", isSaving) || !hasUnsavedChanges, true)} class="px-3 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs md:text-sm font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"><span class="hidden sm:inline">Save Now</span> <span class="sm:hidden">Save</span></button></div></div></div> <div class="flex-1 overflow-hidden">`);
        MarkdownEditor($$renderer3, {
          onchange: handleContentChange,
          get value() {
            return noteContent;
          },
          set value($$value) {
            noteContent = $$value;
            $$settled = false;
          }
        });
        $$renderer3.push(`<!----></div>`);
      } else {
        $$renderer3.push("<!--[!-->");
        $$renderer3.push(`<div class="flex items-center justify-center h-full bg-slate-50"><div class="text-center"><svg class="w-24 h-24 mx-auto mb-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg> <p class="text-xl font-bold text-slate-700 mb-2">Select a note or create a new one</p> <p class="text-sm text-slate-500">Start writing your thoughts</p></div></div>`);
      }
      $$renderer3.push(`<!--]--></div></div> `);
      if (showConflictModal && conflictServerNote) {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`<div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 md:p-4"><div class="bg-white rounded-xl max-w-2xl w-full p-4 md:p-6"><div class="flex items-start gap-2 mb-4"><div class="p-2 md:p-3 bg-amber-100 rounded-lg md:rounded-xl"><svg class="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg></div> <div class="flex-1"><h2 class="text-lg font-extrabold text-slate-900 mb-1.5">Sync Conflict Detected</h2> <p class="text-xs md:text-base text-slate-600 leading-relaxed">This note was modified elsewhere. Choose which version to keep:</p></div></div> <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4"><div class="border-2 border-primary-light bg-primary-bg rounded-lg p-3"><h3 class="text-sm md:text-base font-bold text-slate-900 mb-1.5 md:mb-2 flex items-center gap-1.5 md:gap-2"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg> Your Local Version</h3> <div class="bg-white rounded-lg p-4 max-h-40 overflow-y-auto"><p class="text-xs md:text-sm font-bold text-slate-900 mb-1.5 md:mb-2">${escape_html(noteTitle)}</p> <p class="text-xs md:text-sm text-slate-600 whitespace-pre-wrap">${escape_html(noteContent.slice(0, 200))}${escape_html(noteContent.length > 200 ? "..." : "")}</p></div></div> <div class="border-2 border-blue-200 bg-blue-50 rounded-lg p-3"><h3 class="text-sm md:text-base font-bold text-blue-900 mb-1.5 md:mb-2 flex items-center gap-1.5 md:gap-2"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path></svg> Server Version</h3> <div class="bg-white rounded-lg p-4 max-h-40 overflow-y-auto"><p class="text-xs md:text-sm font-bold text-slate-900 mb-1.5 md:mb-2">${escape_html(conflictServerNote.title)}</p> <p class="text-xs md:text-sm text-slate-600 whitespace-pre-wrap">${escape_html(conflictServerNote.content.slice(0, 200))}${escape_html(conflictServerNote.content.length > 200 ? "..." : "")}</p></div></div></div> <div class="flex gap-2"><button class="flex-1 px-4 py-2.5 bg-blue-400 hover:bg-blue-500 text-white text-sm font-bold rounded-lg transition-all transform hover:-translate-y-0.5">Use Server Version</button> <button class="flex-1 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-lg transition-all transform hover:-translate-y-0.5">Keep My Version</button></div></div></div>`);
      } else {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]--> `);
      {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]-->`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
