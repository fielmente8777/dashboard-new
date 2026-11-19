// "Summer in Goa!" -> "summer-in-goa"
export const slugify = (text = "") =>
  text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");

// Plain text of an HTML string, for previews and excerpts.
export const stripHtml = (html = "") =>
  new DOMParser().parseFromString(html, "text/html").body.textContent || "";
