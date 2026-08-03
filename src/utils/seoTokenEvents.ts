export const SEO_TOKENS_CHANGED = "seo_tokens_changed";

export const notifySeoTokensChanged = () => {
  window.dispatchEvent(new CustomEvent(SEO_TOKENS_CHANGED));
};
