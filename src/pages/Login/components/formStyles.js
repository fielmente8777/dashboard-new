// Rings instead of borders: the global `* { border-color }` rule in index.css
// overrides Tailwind's border colour utilities.
export const inputClassName =
  "w-full h-12 px-4 rounded-lg bg-app-surface text-app-text placeholder:text-app-text-faint outline-none ring-1 ring-inset ring-(--app-border-strong) transition-shadow focus:ring-2 focus:ring-ternary aria-[invalid=true]:ring-red-500";

export const primaryButtonClassName =
  "w-full h-12 rounded-lg bg-ternary text-white font-semibold flex justify-center items-center gap-3 transition-colors hover:bg-[#e25506] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ternary disabled:opacity-70 disabled:cursor-not-allowed";

export const textLinkClassName =
  "font-semibold text-ternary hover:underline underline-offset-4";
