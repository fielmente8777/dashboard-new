import { useMemo } from "react";
import { useDispatch } from "react-redux";
import { instagramApi } from "../../../../redux/api/instagramApi";

// Changes the loaded Instagram conversations / messages in place, without a
// request (websocket events and messages being sent). Each `recipe` gets the
// current list as an immer draft.
export const useInstagramCache = (hid) => {
  const dispatch = useDispatch();

  return useMemo(() => {
    const patchConversations = (recipe) =>
      dispatch(
        instagramApi.util.updateQueryData("getInstagramConversations", hid, recipe),
      );

    return {
      patchConversations,

      patchConversation: (conversationId, changes) =>
        patchConversations((conversations) => {
          const conversation = conversations.find(
            (item) => item._id === conversationId,
          );
          if (conversation) Object.assign(conversation, changes);
        }),

      patchMessages: (conversationId, recipe) =>
        dispatch(
          instagramApi.util.updateQueryData(
            "getInstagramMessages",
            conversationId,
            recipe,
          ),
        ),
    };
  }, [dispatch, hid]);
};
