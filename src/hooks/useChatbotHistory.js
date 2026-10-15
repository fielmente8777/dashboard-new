import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useDebounce from "./useDebounce";
import {
  deleteConversation as deleteConversationApi,
  getConversations,
  renameConversation as renameConversationApi,
  setConversationPinned,
} from "../services/chatbot.service";

const byActivity = (a, b) =>
  new Date(b.lastActivityAt || b.updatedAt || 0) - new Date(a.lastActivityAt || a.updatedAt || 0);

/**
 * Conversation history list for the Eazotel AI chatbot:
 * loading, server-side title search, and pin / rename / delete with optimistic updates.
 */
export default function useChatbotHistory() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search.trim(), 300);
  const requestIdRef = useRef(0);

  const load = useCallback(async (term) => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const response = await getConversations({ search: term || undefined });
      if (requestId !== requestIdRef.current) return; // a newer search superseded this one
      setConversations(Array.isArray(response?.data) ? response.data : []);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(err?.message || "Couldn't load your conversations.");
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(debouncedSearch);
  }, [debouncedSearch, load]);

  const refresh = useCallback(() => load(debouncedSearch), [debouncedSearch, load]);

  /** Insert or update a conversation's metadata (e.g. after a message was sent). */
  const upsert = useCallback(
    (conversation) => {
      if (!conversation?._id) return;
      setConversations((previous) => {
        const exists = previous.some((c) => c._id === conversation._id);
        // While searching, only show new chats that match the current term.
        if (!exists && debouncedSearch && !String(conversation.title || "").toLowerCase().includes(debouncedSearch.toLowerCase())) {
          return previous;
        }
        return exists
          ? previous.map((c) => (c._id === conversation._id ? { ...c, ...conversation } : c))
          : [conversation, ...previous];
      });
    },
    [debouncedSearch]
  );

  const patchLocal = (id, patch) =>
    setConversations((previous) => previous.map((c) => (c._id === id ? { ...c, ...patch } : c)));

  const togglePin = useCallback(async (conversation) => {
    const pinned = !conversation.pinned;
    patchLocal(conversation._id, { pinned });
    try {
      const response = await setConversationPinned(conversation._id, pinned);
      if (response?.data) patchLocal(conversation._id, response.data);
    } catch (err) {
      patchLocal(conversation._id, { pinned: conversation.pinned });
      throw err;
    }
  }, []);

  const rename = useCallback(async (conversation, title) => {
    const clean = String(title || "").replace(/\s+/g, " ").trim();
    if (!clean || clean === conversation.title) return;
    patchLocal(conversation._id, { title: clean });
    try {
      const response = await renameConversationApi(conversation._id, clean);
      if (response?.data) patchLocal(conversation._id, response.data);
    } catch (err) {
      patchLocal(conversation._id, { title: conversation.title });
      throw err;
    }
  }, []);

  const remove = useCallback(async (conversation) => {
    try {
      await deleteConversationApi(conversation._id);
    } catch (err) {
      if (err?.status !== 404) throw err; // already gone counts as deleted
    }
    setConversations((previous) => previous.filter((c) => c._id !== conversation._id));
  }, []);

  const { pinned, recents } = useMemo(() => {
    const sorted = [...conversations].sort(byActivity);
    return { pinned: sorted.filter((c) => c.pinned), recents: sorted.filter((c) => !c.pinned) };
  }, [conversations]);

  return {
    pinned,
    recents,
    loading,
    error,
    search,
    setSearch,
    isSearching: Boolean(debouncedSearch),
    refresh,
    upsert,
    togglePin,
    rename,
    remove,
  };
}