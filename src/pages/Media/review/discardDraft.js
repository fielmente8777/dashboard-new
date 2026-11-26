import { API_URLS } from "../../../config/env";
import { getToken } from "../../../utils/session";

/**
 * Deletes the unsaved images of a Knowledge Base editor session.
 * `keepalive` lets the request finish while the page is closing or the
 * editor is unmounting (navigation, Back, Start over).
 */
export const discardDraft = (draftId) =>
  fetch(`${API_URLS.node}/api/v1/media/drafts/${encodeURIComponent(draftId)}/discard`, {
    method: "POST",
    keepalive: true,
    headers: { Authorization: `Bearer ${getToken()}` },
  }).catch(() => undefined); // the server also expires drafts after 24 h

/** A new id per editor session. */
export const newDraftId = () => `kb-${crypto.randomUUID()}`;
