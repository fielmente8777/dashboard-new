import { useMemo } from "react";
import { useDispatch } from "react-redux";
import { whatsappApi } from "../../../../redux/api/whatsappApi";

// Changes the loaded conversations / messages in place, without a request:
// used for what arrives over the websocket and for messages being sent.
// Each `recipe` gets the current list as an immer draft (change it, or
// return a new list).
export const useChatCache = (hid) => {
  const dispatch = useDispatch();

  return useMemo(() => {
    const patchConversations = (recipe) =>
      dispatch(whatsappApi.util.updateQueryData("getConversations", hid, recipe));

    return {
      patchConversations,

      // changes one conversation: `changes` is an object, or a function of the
      // conversation that returns one
      patchConversation: (conversationId, changes) =>
        patchConversations((conversations) => {
          const conversation = conversations.find(
            (item) => item._id === conversationId,
          );
          if (!conversation) return;
          Object.assign(
            conversation,
            typeof changes === "function" ? changes(conversation) : changes,
          );
        }),

      patchMessages: (conversationId, recipe) =>
        dispatch(
          whatsappApi.util.updateQueryData("getMessages", conversationId, recipe),
        ),
    };
  }, [dispatch, hid]);
};
