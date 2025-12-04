import { a as attr } from "../../../../chunks/attributes.js";
import { U as escape_html } from "../../../../chunks/utils2.js";
import "@sveltejs/kit/internal";
import "../../../../chunks/exports.js";
import "../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../chunks/state.svelte.js";
import "../../../../chunks/stores.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let email = "";
    let password = "";
    let rememberMe = false;
    let loading = false;
    $$renderer2.push(`<div class="min-h-screen flex items-center justify-center bg-gray-50 px-4"><div class="max-w-md w-full"><div class="bg-white rounded-lg shadow-sm p-8"><h1 class="text-3xl font-bold text-gray-900 text-center mb-2">Welcome Back</h1> <p class="text-gray-600 text-center mb-8">Sign in to your account</p> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <form><div class="mb-4"><label for="email" class="block text-sm font-medium text-gray-700 mb-2">Email</label> <input id="email" type="email"${attr("value", email)} required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="you@example.com"/></div> <div class="mb-4"><label for="password" class="block text-sm font-medium text-gray-700 mb-2">Password</label> <input id="password" type="password"${attr("value", password)} required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="••••••••"/></div> <div class="mb-6"><label class="flex items-center"><input type="checkbox"${attr("checked", rememberMe, true)} class="w-4 h-4 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary"/> <span class="ml-2 text-sm text-gray-700">Remember me</span></label></div> <button type="submit"${attr("disabled", loading, true)} class="w-full bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors">${escape_html("Sign In")}</button></form> <p class="mt-6 text-center text-gray-600">Don't have an account? <a href="/register" class="text-primary hover:text-primary-hover font-medium">Sign up</a></p></div></div></div>`);
  });
}
export {
  _page as default
};
