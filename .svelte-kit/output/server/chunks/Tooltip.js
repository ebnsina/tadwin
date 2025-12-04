import "clsx";
function Tooltip($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { children, text, color = "var(--primary-color)" } = $$props;
    $$renderer2.push(`<div class="tooltip-wrapper-js svelte-11extwn" role="tooltip">`);
    children($$renderer2);
    $$renderer2.push(`<!----> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
export {
  Tooltip as T
};
