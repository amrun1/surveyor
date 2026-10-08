// Phone vs. tablet/desktop split for anything that has to decide it in JS
// (Menu.vue's drawer vs. static sidebar, SelectInput.vue's bottom sheet vs.
// dropdown). Agrees with Tailwind's md: by convention only — if md is ever
// customized in @theme, update this too.
export const MD_BREAKPOINT_PX = 768
